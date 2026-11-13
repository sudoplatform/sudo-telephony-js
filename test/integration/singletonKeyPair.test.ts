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
  InvalidConfigError,
  PhoneNumberState,
  SingletonKeyPairNotFoundError,
  SudoTelephonyClient,
} from '../../src/public'
import { PhoneNumberTestHelper } from './util/phoneNumbers'
import {
  SetupTelephonyClientOutput,
  setupTelephonyClient,
  teardownTelephonyClient,
} from './util/telephonyClientLifecycle'

describe('Key pair per phone number Test Suite', () => {
  const log = new DefaultLogger('KeyPairPerNumberIntegrationTests')
  let setup: SetupTelephonyClientOutput | undefined
  let instanceUnderTest: SudoTelephonyClient
  let keyWorker: DefaultDeviceKeyWorker
  let helper: PhoneNumberTestHelper

  beforeAll(async () => {
    setup = await setupTelephonyClient(log, { enforceSingletonKeyPair: false })
    instanceUnderTest = setup.telephonyClient
    keyWorker = new DefaultDeviceKeyWorker(setup.keyManager)
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

  it('rejects createSingletonKeysIfAbsent', async () => {
    await expect(
      instanceUnderTest.createSingletonKeysIfAbsent(),
    ).rejects.toThrow(InvalidConfigError)
  })

  it('gives each number its own key pair and removes it on deprovision', async () => {
    const { number: first } = await helper.provisionANumber()
    const { number: second } = await helper.provisionANumber()
    const [firstKeyId] = first.keyIds
    const [secondKeyId] = second.keyIds

    expect(firstKeyId).not.toBe(secondKeyId)
    await expect(keyWorker.privateKeyExists(firstKeyId)).resolves.toBe(true)

    await helper.awaitState(first.id, (s) => s === PhoneNumberState.Active)
    await instanceUnderTest.deprovisionPhoneNumber(first.id)

    await expect(keyWorker.privateKeyExists(firstKeyId)).resolves.toBe(false)
    await expect(keyWorker.privateKeyExists(secondKeyId)).resolves.toBe(true)
  })
})

describe('Singleton key pair Test Suite', () => {
  const log = new DefaultLogger('SingletonKeyPairIntegrationTests')
  let setup: SetupTelephonyClientOutput | undefined
  let instanceUnderTest: SudoTelephonyClient
  let keyWorker: DefaultDeviceKeyWorker
  let helper: PhoneNumberTestHelper

  beforeAll(async () => {
    setup = await setupTelephonyClient(log, { enforceSingletonKeyPair: true })
    instanceUnderTest = setup.telephonyClient
    keyWorker = new DefaultDeviceKeyWorker(setup.keyManager)
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

  it('fails to provision until the singleton is created, which reports created once', async () => {
    await expect(helper.provisionANumber()).rejects.toThrow(
      SingletonKeyPairNotFoundError,
    )

    const first = await instanceUnderTest.createSingletonKeysIfAbsent()
    const second = await instanceUnderTest.createSingletonKeysIfAbsent()

    expect(first.keyPair.created).toBe(true)
    expect(second.keyPair).toStrictEqual({
      created: false,
      keyId: first.keyPair.keyId,
    })
    await expect(keyWorker.privateKeyExists(first.keyPair.keyId)).resolves.toBe(
      true,
    )
  })

  it('provisions every number with the singleton key pair and keeps it on deprovision', async () => {
    const { keyPair } = await instanceUnderTest.createSingletonKeysIfAbsent()

    const { number: first } = await helper.provisionANumber()
    const { number: second } = await helper.provisionANumber()

    expect(first.keyIds).toStrictEqual([keyPair.keyId])
    expect(second.keyIds).toStrictEqual([keyPair.keyId])

    await helper.awaitState(first.id, (s) => s === PhoneNumberState.Active)
    await instanceUnderTest.deprovisionPhoneNumber(first.id)

    await expect(keyWorker.privateKeyExists(keyPair.keyId)).resolves.toBe(true)
  })

  it('keeps the singleton key pair when a client without the flag deprovisions', async () => {
    const {
      keyPair: { keyId },
    } = await instanceUnderTest.createSingletonKeysIfAbsent()
    const singleton = { id: keyId }
    const { number } = await helper.provisionANumber()
    // The same device and user, now configured without the flag.
    const options: PrivateSudoTelephonyClientOptions = {
      sudoUserClient: setup!.userClient,
      apiClient: setup!.apiClient,
      sudoKeyManager: setup!.keyManager,
      sudoTelephonyClientConfig: { enforceSingletonKeyPair: false },
    }
    const clientWithoutFlag = new DefaultSudoTelephonyClient(options)

    await helper.awaitState(number.id, (s) => s === PhoneNumberState.Active)
    const released = await clientWithoutFlag.deprovisionPhoneNumber(number.id)

    expect(released.keyIds).toStrictEqual([singleton.id])
    await expect(keyWorker.privateKeyExists(singleton.id)).resolves.toBe(true)
  })
})
