/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger } from '@sudoplatform/sudo-common'
import waitForExpect from 'wait-for-expect'
import {
  ConnectionState,
  PhoneNumber,
  PhoneNumberState,
  SudoTelephonyClient,
} from '../../src/public'
import {
  PhoneNumberTestHelper,
  areaCode,
  countryCode,
} from './util/phoneNumbers'
import {
  SetupTelephonyClientOutput,
  setupTelephonyClient,
  teardownTelephonyClient,
} from './util/telephonyClientLifecycle'

/**
 * These tests give confidence that the built SudoTelephonyClient is functional
 * without running the full suite: configuration, search, provisioning,
 * release and the phone number subscription.
 */
describe('SudoTelephonyClient Smoketest Test Suite', () => {
  const log = new DefaultLogger('SudoTelephonyClientSmokeTests')
  let setup: SetupTelephonyClientOutput | undefined
  let instanceUnderTest: SudoTelephonyClient
  let helper: PhoneNumberTestHelper

  beforeAll(async () => {
    setup = await setupTelephonyClient(log)
    instanceUnderTest = setup.telephonyClient
    helper = new PhoneNumberTestHelper(
      instanceUnderTest,
      setup.profilesClient,
      log,
    )
  })

  afterAll(async () => {
    await helper?.cleanUp()
    await teardownTelephonyClient(setup, log)
  })

  it('gets the supported countries and configuration data', async () => {
    await expect(instanceUnderTest.getSupportedCountries()).resolves.toContain(
      countryCode,
    )
    const config = await instanceUnderTest.getConfigurationData()
    expect(config.listMaxLimit).toBeGreaterThan(0)
  })

  it('searches for available phone numbers', async () => {
    const search = await instanceUnderTest.searchAvailablePhoneNumbers({
      countryCode,
      areaCode,
    })

    expect(search.id).toBeTruthy()
    expect(search.areaCode).toBe(areaCode)
  })

  it('provisions a number, watches it become active and releases it', async () => {
    const updates: PhoneNumber[] = []
    const states: ConnectionState[] = []
    await instanceUnderTest.subscribeToPhoneNumbers('smoketest', {
      phoneNumberUpdated: (phoneNumber) => updates.push(phoneNumber),
      connectionStatusChanged: (state) => states.push(state),
    })
    expect(states).toContain(ConnectionState.Connected)

    const { number } = await helper.provisionANumber()
    expect(number.state).toBe(PhoneNumberState.Provisioning)

    await waitForExpect(
      () => {
        expect(
          updates.some(
            (u) => u.id === number.id && u.state === PhoneNumberState.Active,
          ),
        ).toBe(true)
      },
      90_000,
      1000,
    )
    instanceUnderTest.unsubscribeFromPhoneNumbers('smoketest')

    const released = await instanceUnderTest.deprovisionPhoneNumber(number.id)
    expect(released.state).toBe(PhoneNumberState.Released)
  })
})
