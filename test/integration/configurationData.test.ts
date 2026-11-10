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

describe('GetConfigurationData Test Suite', () => {
  const log = new DefaultLogger('GetConfigurationDataIntegrationTests')
  let setup: SetupTelephonyClientOutput | undefined
  let instanceUnderTest: SudoTelephonyClient

  beforeAll(async () => {
    setup = await setupTelephonyClient(log)
    instanceUnderTest = setup.telephonyClient
  })

  afterAll(async () => {
    await teardownTelephonyClient(setup, log)
  })

  it('returns consistent limits', async () => {
    const config = await instanceUnderTest.getConfigurationData()

    expect(typeof config.sudoOwnershipProofRequired).toBe('boolean')
    expect(config.phoneNumberSearchDefaultLimit).toBeGreaterThanOrEqual(1)
    expect(config.phoneNumberSearchDefaultLimit).toBeLessThanOrEqual(
      config.phoneNumberSearchMaxLimit,
    )
    expect(config.listDefaultLimit).toBeGreaterThanOrEqual(1)
    expect(config.listDefaultLimit).toBeLessThanOrEqual(config.listMaxLimit)
    expect(config.phoneNumberSearchLifetimeMs).toBeGreaterThan(0)
    expect(config.deletePhoneMessagesLimit).toBeGreaterThan(0)
    expect(config.updatePhoneMessagesLimit).toBeGreaterThan(0)
  })
})
