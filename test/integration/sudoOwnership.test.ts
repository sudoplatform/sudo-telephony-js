/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, InvalidTokenError } from '@sudoplatform/sudo-common'
import { SudoTelephonyClient } from '../../src/public'
import { PhoneNumberTestHelper } from './util/phoneNumbers'
import {
  SetupTelephonyClientOutput,
  setupTelephonyClient,
  teardownTelephonyClient,
} from './util/telephonyClientLifecycle'

describe('SudoOwnership Test Suite', () => {
  const log = new DefaultLogger('SudoOwnershipIntegrationTests')
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

  afterEach(async () => {
    await helper.cleanUp()
  })

  afterAll(async () => {
    await teardownTelephonyClient(setup, log)
  })

  it('makes the Sudo whose proof is given the owner', async () => {
    const sudo = await helper.createSudo()

    const { number } = await helper.provisionANumber({
      ownershipProof: () => helper.getOwnershipProof(sudo),
    })

    expect(number.sudoId).toBe(sudo.id)
    const fetched = await instanceUnderTest.getPhoneNumber(number.id)
    expect(fetched?.sudoId).toBe(sudo.id)
  })

  it('lists only the owning Sudo numbers', async () => {
    const owningSudo = await helper.createSudo()
    const otherSudo = await helper.createSudo()
    const { number } = await helper.provisionANumber({
      ownershipProof: () => helper.getOwnershipProof(owningSudo),
    })

    const owningPage = await instanceUnderTest.listPhoneNumbersForSudoId({
      sudoId: owningSudo.id!,
    })
    const otherPage = await instanceUnderTest.listPhoneNumbersForSudoId({
      sudoId: otherSudo.id!,
    })

    expect(owningPage.items.map((n) => n.id)).toStrictEqual([number.id])
    expect(otherPage.items).toStrictEqual([])
  })

  it('follows the deployment rule when no proof is given', async () => {
    const config = await instanceUnderTest.getConfigurationData()

    if (config.sudoOwnershipProofRequired) {
      const search = await helper.searchAvailableNumbers()
      if (!search) {
        return
      }
      await expect(
        instanceUnderTest.provisionPhoneNumber({
          searchId: search.id,
          phoneNumber: search.results[0].phoneNumber,
        }),
      ).rejects.toThrow(InvalidTokenError)
    } else {
      const { number } = await helper.provisionANumber({
        ownershipProof: async () => undefined,
      })
      expect(number.sudoId).toBeUndefined()
    }
  })

  it('rejects a proof issued for another audience', async () => {
    const sudo = await helper.createSudo()
    const search = await helper.searchAvailableNumbers()
    if (!search) {
      return
    }

    await expect(
      instanceUnderTest.provisionPhoneNumber({
        searchId: search.id,
        phoneNumber: search.results[0].phoneNumber,
        ownershipProofToken: await helper.getOwnershipProof(
          sudo,
          'sudoplatform.email.email-address',
        ),
      }),
    ).rejects.toThrow(InvalidTokenError)
  })
})
