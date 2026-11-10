/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, LimitExceededError } from '@sudoplatform/sudo-common'
import {
  InvalidAreaCodeError,
  InvalidArgumentError,
  PhoneNumberType,
  SudoTelephonyClient,
  UnsupportedCountryError,
} from '../../src/public'
import { areaCode, countryCode } from './util/phoneNumbers'
import {
  SetupTelephonyClientOutput,
  setupTelephonyClient,
  teardownTelephonyClient,
} from './util/telephonyClientLifecycle'

describe('SearchAvailablePhoneNumbers Test Suite', () => {
  const log = new DefaultLogger('SearchAvailablePhoneNumbersIntegrationTests')
  const defaultLimit = 10
  const maxLimit = 20
  const searchLifetimeMs = 15 * 60 * 1000
  const localNumberInAreaCode = new RegExp(`^\\+1${areaCode}[2-9]\\d{6}$`)
  let setup: SetupTelephonyClientOutput | undefined
  let instanceUnderTest: SudoTelephonyClient

  beforeAll(async () => {
    setup = await setupTelephonyClient(log)
    instanceUnderTest = setup.telephonyClient
  })

  afterAll(async () => {
    await teardownTelephonyClient(setup, log)
  })

  it('returns a search for the requested criteria', async () => {
    const search = await instanceUnderTest.searchAvailablePhoneNumbers({
      countryCode,
      areaCode,
    })

    expect(search.id).toMatch(/^tel-pns-/)
    expect(search.countryCode).toBe(countryCode)
    expect(search.areaCode).toBe(areaCode)
    expect(search.owner).toBe(setup?.owner)
    expect(search.version).toBe(1)
    // A service-side invariant, so it does not depend on the local clock.
    expect(search.expiresAt.getTime() - search.createdAt.getTime()).toBe(
      searchLifetimeMs,
    )
    expect(search.results.length).toBeLessThanOrEqual(defaultLimit)
  })

  it('only returns local numbers in the requested area code', async () => {
    const search = await instanceUnderTest.searchAvailablePhoneNumbers({
      countryCode,
      areaCode,
    })

    // How many numbers are available is not guaranteed, so this checks what
    // every returned number looks like rather than that any were returned.
    for (const available of search.results) {
      expect(available.countryCode).toBe(countryCode)
      expect(available.numberType).toBe(PhoneNumberType.Local)
      expect(available.phoneNumber).toMatch(localNumberInAreaCode)
    }
  })

  it('honours the requested limit', async () => {
    const search = await instanceUnderTest.searchAvailablePhoneNumbers({
      countryCode,
      areaCode,
      limit: 2,
    })

    expect(search.results.length).toBeLessThanOrEqual(2)
  })

  it('accepts the maximum limit', async () => {
    const search = await instanceUnderTest.searchAvailablePhoneNumbers({
      countryCode,
      areaCode,
      limit: maxLimit,
    })

    expect(search.results.length).toBeLessThanOrEqual(maxLimit)
  })

  it('returns numbers without duplicates', async () => {
    const search = await instanceUnderTest.searchAvailablePhoneNumbers({
      countryCode,
      areaCode,
    })

    const numbers = search.results.map((r) => r.phoneNumber)
    expect(new Set(numbers).size).toBe(numbers.length)
  })

  it('rejects an unsupported country', async () => {
    await expect(
      instanceUnderTest.searchAvailablePhoneNumbers({
        countryCode: 'ZZ',
        areaCode,
      }),
    ).rejects.toThrow(UnsupportedCountryError)
  })

  it('rejects an unknown area code', async () => {
    await expect(
      instanceUnderTest.searchAvailablePhoneNumbers({
        countryCode,
        areaCode: '000',
      }),
    ).rejects.toThrow(InvalidAreaCodeError)
  })

  it('rejects a missing area code', async () => {
    await expect(
      instanceUnderTest.searchAvailablePhoneNumbers({ countryCode }),
    ).rejects.toThrow(InvalidArgumentError)
  })

  it('rejects a limit above the maximum', async () => {
    await expect(
      instanceUnderTest.searchAvailablePhoneNumbers({
        countryCode,
        areaCode,
        limit: maxLimit + 1,
      }),
    ).rejects.toThrow(LimitExceededError)
  })
})
