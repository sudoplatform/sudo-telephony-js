/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger } from '@sudoplatform/sudo-common'
import { v4 } from 'uuid'
import {
  PhoneNumberNotInSearchError,
  PhoneNumberSearchExpiredError,
  PhoneNumberState,
  PhoneNumberType,
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

describe('ProvisionPhoneNumber Test Suite', () => {
  const log = new DefaultLogger('ProvisionPhoneNumberIntegrationTests')
  const numberNotInAnySearch = `+1${areaCode}5550199`
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

  it('returns a number being provisioned', async () => {
    const { number } = await helper.provisionANumber()

    expect(number.id).toBeTruthy()
    expect(number.phoneNumber.startsWith(`+1${areaCode}`)).toBe(true)
    expect(number.countryCode).toBe(countryCode)
    expect(number.numberType).toBe(PhoneNumberType.Local)
    expect(number.owner).toBe(setup?.owner)
    expect(number.identityId).toBeTruthy()
    expect(number.version).toBe(1)
    // Provisioning is asynchronous, so the number starts out being ordered.
    expect(number.state).toBe(PhoneNumberState.Provisioning)
    expect(number.failureReason).toBeUndefined()
  })

  it('registers the key used to seal messages', async () => {
    const { number } = await helper.provisionANumber()

    expect(number.keyRingId).toBeTruthy()
    expect(number.keyIds.length).toBeGreaterThan(0)
  })

  it('returns the clientRefId unchanged', async () => {
    const clientRefId = v4()

    const { number } = await helper.provisionANumber({ clientRefId })

    expect(number.clientRefId).toBe(clientRefId)
  })

  it('is idempotent for the same clientRefId', async () => {
    const clientRefId = v4()
    const first = await helper.provisionANumber({ clientRefId })

    // Repeating the request returns the number the first one provisioned.
    const second = await instanceUnderTest.provisionPhoneNumber({
      searchId: first.searchId,
      phoneNumber: first.number.phoneNumber,
      clientRefId,
      ownershipProofToken: first.ownershipProofToken,
    })

    expect(second.id).toBe(first.number.id)
    expect(second.phoneNumber).toBe(first.number.phoneNumber)
  })

  it('rejects a number that is not in the search', async () => {
    const search = await instanceUnderTest.searchAvailablePhoneNumbers({
      countryCode,
      areaCode,
    })
    // The probe number must not be one the search offered.
    expect(
      search.results.some((r) => r.phoneNumber === numberNotInAnySearch),
    ).toBe(false)

    await expect(
      instanceUnderTest.provisionPhoneNumber({
        searchId: search.id,
        phoneNumber: numberNotInAnySearch,
        ownershipProofToken: await helper.newOwnershipProof(),
      }),
    ).rejects.toThrow(PhoneNumberNotInSearchError)
  })

  it('rejects an unknown search', async () => {
    await expect(
      instanceUnderTest.provisionPhoneNumber({
        searchId: `tel-pns-${v4()}`,
        phoneNumber: numberNotInAnySearch,
        ownershipProofToken: await helper.newOwnershipProof(),
      }),
    ).rejects.toThrow(PhoneNumberSearchExpiredError)
  })
})
