/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger } from '@sudoplatform/sudo-common'
import { SudoTelephonyClient } from '../../src/public'
import {
  SetupTelephonyClientOutput,
  setupTelephonyClient,
  teardownTelephonyClient,
} from './util/telephonyClientLifecycle'

describe('GetSupportedCountries Test Suite', () => {
  const log = new DefaultLogger('GetSupportedCountriesIntegrationTests')
  let setup: SetupTelephonyClientOutput | undefined
  let instanceUnderTest: SudoTelephonyClient

  beforeAll(async () => {
    setup = await setupTelephonyClient(log)
    instanceUnderTest = setup.telephonyClient
  })

  afterAll(async () => {
    await teardownTelephonyClient(setup, log)
  })

  it('returns ISO 3166-1 alpha-2 country codes', async () => {
    const countries = await instanceUnderTest.getSupportedCountries()

    expect(countries.length).toBeGreaterThan(0)
    for (const code of countries) {
      expect(code).toMatch(/^[A-Z]{2}$/)
    }
  })

  it('includes the United States', async () => {
    await expect(instanceUnderTest.getSupportedCountries()).resolves.toContain(
      'US',
    )
  })

  it('is stable across calls', async () => {
    const first = await instanceUnderTest.getSupportedCountries()
    const second = await instanceUnderTest.getSupportedCountries()

    expect(second).toStrictEqual(first)
  })
})
