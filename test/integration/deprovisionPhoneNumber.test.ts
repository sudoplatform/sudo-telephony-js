/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger } from '@sudoplatform/sudo-common'
import { v4 } from 'uuid'
import {
  InvalidPhoneNumberStateError,
  PhoneNumber,
  PhoneNumberNotFoundError,
  PhoneNumberState,
  SudoTelephonyClient,
} from '../../src/public'
import { PhoneNumberTestHelper } from './util/phoneNumbers'
import {
  SetupTelephonyClientOutput,
  setupTelephonyClient,
  teardownTelephonyClient,
} from './util/telephonyClientLifecycle'

describe('DeprovisionPhoneNumber Test Suite', () => {
  const log = new DefaultLogger('DeprovisionPhoneNumberIntegrationTests')
  let setup: SetupTelephonyClientOutput | undefined
  let instanceUnderTest: SudoTelephonyClient
  let helper: PhoneNumberTestHelper

  const releaseWhenActive = async (id: string): Promise<PhoneNumber> => {
    await helper.awaitState(id, (state) => state === PhoneNumberState.Active)
    return await instanceUnderTest.deprovisionPhoneNumber(id)
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

  it('releases a provisioned number', async () => {
    const { number } = await helper.provisionANumber()

    const released = await releaseWhenActive(number.id)

    expect(released.id).toBe(number.id)
    expect(released.phoneNumber).toBe(number.phoneNumber)
    expect(released.state).toBe(PhoneNumberState.Released)
    // The allowance is returned at once, so the record is updated immediately.
    expect(released.version).toBeGreaterThan(number.version)
  })

  it('is safe to repeat', async () => {
    const { number } = await helper.provisionANumber()
    const released = await releaseWhenActive(number.id)

    const again = await instanceUnderTest.deprovisionPhoneNumber(number.id)

    expect(again.id).toBe(released.id)
    expect(again.state).toBe(PhoneNumberState.Released)
  })

  it('rejects a number still being provisioned', async () => {
    const { number } = await helper.provisionANumber()
    expect(number.state).toBe(PhoneNumberState.Provisioning)

    await expect(
      instanceUnderTest.deprovisionPhoneNumber(number.id),
    ).rejects.toThrow(InvalidPhoneNumberStateError)
  })

  it('rejects an unknown number', async () => {
    await expect(
      instanceUnderTest.deprovisionPhoneNumber(`tel-pn-${v4()}`),
    ).rejects.toThrow(PhoneNumberNotFoundError)
  })
})
