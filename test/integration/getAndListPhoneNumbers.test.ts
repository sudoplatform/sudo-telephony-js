/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger } from '@sudoplatform/sudo-common'
import { v4 } from 'uuid'
import {
  InvalidArgumentError,
  PhoneNumberState,
  SudoTelephonyClient,
} from '../../src/public'
import { PhoneNumberTestHelper } from './util/phoneNumbers'
import {
  SetupTelephonyClientOutput,
  setupTelephonyClient,
  teardownTelephonyClient,
} from './util/telephonyClientLifecycle'

describe('GetAndListPhoneNumbers Test Suite', () => {
  const log = new DefaultLogger('GetAndListPhoneNumbersIntegrationTests')
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

  describe('getPhoneNumber', () => {
    it('returns the provisioned number', async () => {
      const { number } = await helper.provisionANumber()

      const fetched = await instanceUnderTest.getPhoneNumber(number.id)

      expect(fetched?.id).toBe(number.id)
      expect(fetched?.phoneNumber).toBe(number.phoneNumber)
      expect(fetched?.countryCode).toBe(number.countryCode)
      expect(fetched?.owner).toBe(number.owner)
      expect(fetched?.keyRingId).toBe(number.keyRingId)
      expect(fetched?.keyIds).toStrictEqual(number.keyIds)
    })

    it('reports the number leaving provisioning', async () => {
      const { number } = await helper.provisionANumber()
      expect(number.state).toBe(PhoneNumberState.Provisioning)

      const settled = await helper.awaitState(
        number.id,
        (state) => state !== PhoneNumberState.Provisioning,
      )

      expect(settled.state).toBe(PhoneNumberState.Active)
      expect(settled.failureReason).toBeUndefined()
      expect(settled.version).toBeGreaterThan(number.version)
    })

    it('returns undefined for an unknown number', async () => {
      await expect(
        instanceUnderTest.getPhoneNumber(`tel-pn-${v4()}`),
      ).resolves.toBeUndefined()
    })

    it('still returns a released number', async () => {
      const { number } = await helper.provisionANumber()
      await helper.awaitState(
        number.id,
        (state) => state !== PhoneNumberState.Provisioning,
      )
      await instanceUnderTest.deprovisionPhoneNumber(number.id)

      const fetched = await instanceUnderTest.getPhoneNumber(number.id)

      expect(fetched?.state).toBe(PhoneNumberState.Released)
    })
  })

  describe('listPhoneNumbers', () => {
    it('includes the provisioned number', async () => {
      const { number } = await helper.provisionANumber()

      const page = await instanceUnderTest.listPhoneNumbers()

      expect(page.items.some((n) => n.id === number.id)).toBe(true)
    })

    it('honours the requested limit and pages', async () => {
      await helper.provisionANumber()
      await helper.provisionANumber()

      const firstPage = await instanceUnderTest.listPhoneNumbers({ limit: 1 })
      expect(firstPage.items).toHaveLength(1)
      expect(firstPage.nextToken).toBeTruthy()

      const secondPage = await instanceUnderTest.listPhoneNumbers({
        limit: 1,
        nextToken: firstPage.nextToken,
      })
      expect(secondPage.items).toHaveLength(1)
      // Paging advances rather than repeating the first item.
      expect(secondPage.items[0].id).not.toBe(firstPage.items[0].id)
    })

    it('does not include a released number', async () => {
      const { number } = await helper.provisionANumber()
      await helper.awaitState(
        number.id,
        (state) => state !== PhoneNumberState.Provisioning,
      )
      await instanceUnderTest.deprovisionPhoneNumber(number.id)

      const page = await instanceUnderTest.listPhoneNumbers()

      expect(page.items.some((n) => n.id === number.id)).toBe(false)
    })

    it('rejects a token the service cannot decode', async () => {
      await expect(
        instanceUnderTest.listPhoneNumbers({ nextToken: 'not-a-token' }),
      ).rejects.toThrow(InvalidArgumentError)
    })
  })

  describe('listPhoneNumbersForSudoId', () => {
    it('returns an empty page for a Sudo with no numbers', async () => {
      const page = await instanceUnderTest.listPhoneNumbersForSudoId({
        sudoId: v4(),
      })

      expect(page.items).toStrictEqual([])
      expect(page.nextToken).toBeUndefined()
    })

    it('rejects an empty Sudo ID', async () => {
      await expect(
        instanceUnderTest.listPhoneNumbersForSudoId({ sudoId: '' }),
      ).rejects.toThrow(InvalidArgumentError)
    })
  })
})
