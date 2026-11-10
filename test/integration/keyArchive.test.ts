/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger } from '@sudoplatform/sudo-common'
import { DefaultDeviceKeyWorker } from '../../src/private/data/common/deviceKeyWorker'
import { PrivateSudoTelephonyClientOptions } from '../../src/private/data/common/privateSudoTelephonyClientOptions'
import {
  DefaultSudoTelephonyClient,
  InvalidArgumentError,
  SudoTelephonyClient,
} from '../../src/public'
import { sealString } from '../util/sealing'
import { PhoneNumberTestHelper } from './util/phoneNumbers'
import {
  SetupTelephonyClientOutput,
  newTelephonyKeyManager,
  setupTelephonyClient,
  teardownTelephonyClient,
} from './util/telephonyClientLifecycle'

describe('KeyArchive Test Suite', () => {
  const log = new DefaultLogger('KeyArchiveIntegrationTests')
  let setup: SetupTelephonyClientOutput
  let instanceUnderTest: SudoTelephonyClient
  let helper: PhoneNumberTestHelper

  /** A second client for the same user, with its own key store, as on another device. */
  const newDevice = () => {
    const keyManager = newTelephonyKeyManager()
    const options: PrivateSudoTelephonyClientOptions = {
      sudoUserClient: setup.userClient,
      apiClient: setup.apiClient,
      sudoKeyManager: keyManager,
    }
    return {
      client: new DefaultSudoTelephonyClient(options),
      keyWorker: new DefaultDeviceKeyWorker(keyManager),
    }
  }

  beforeAll(async () => {
    setup = await setupTelephonyClient(log)
    instanceUnderTest = setup.telephonyClient
    helper = new PhoneNumberTestHelper(
      instanceUnderTest,
      setup.profilesClient,
      log,
    )
  })

  afterEach(async () => {
    await helper.cleanUp()
  })

  afterAll(async () => {
    await teardownTelephonyClient(setup, log)
  })

  it('exports an archive holding the key registered for a provisioned number', async () => {
    const { number } = await helper.provisionANumber()
    const [keyId] = number.keyIds
    // The service lists the key the SDK generated and registered.
    await expect(
      new DefaultDeviceKeyWorker(setup.keyManager).privateKeyExists(keyId),
    ).resolves.toBe(true)

    const archive = await instanceUnderTest.exportKeys()

    expect(archive.byteLength).toBeGreaterThan(0)
  })

  it("makes a number's sealed content readable on another device", async () => {
    const { number } = await helper.provisionANumber()
    const [keyId] = number.keyIds
    const sealed = await sealString(
      setup.keyManager,
      keyId,
      'Hello from the service',
    )
    const device = newDevice()
    await expect(device.keyWorker.privateKeyExists(keyId)).resolves.toBe(false)

    await device.client.importKeys(await instanceUnderTest.exportKeys())

    await expect(device.keyWorker.unsealString(keyId, sealed)).resolves.toBe(
      'Hello from the service',
    )
  })

  it('removes the keys on reset', async () => {
    const { number } = await helper.provisionANumber()
    const [keyId] = number.keyIds
    const device = newDevice()
    await device.client.importKeys(await instanceUnderTest.exportKeys())

    await device.client.reset()

    await expect(device.keyWorker.privateKeyExists(keyId)).resolves.toBe(false)
  })

  it('rejects an empty archive', async () => {
    await expect(
      newDevice().client.importKeys(new ArrayBuffer(0)),
    ).rejects.toThrow(InvalidArgumentError)
  })
})
