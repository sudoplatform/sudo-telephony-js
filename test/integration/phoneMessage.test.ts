/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DefaultLogger,
  ListOperationResultStatus,
} from '@sudoplatform/sudo-common'
import { v4 } from 'uuid'
import {
  PhoneNumber,
  PhoneNumberState,
  SortOrder,
  SudoTelephonyClient,
} from '../../src/public'
import { PhoneNumberTestHelper } from './util/phoneNumbers'
import {
  SetupTelephonyClientOutput,
  setupTelephonyClient,
  teardownTelephonyClient,
} from './util/telephonyClientLifecycle'

/**
 * A test cannot cause an inbound SMS, so these cover the empty and unknown cases. Reading
 * real message content is covered by the key archive tests, which seal values locally in
 * the service's format.
 */
describe('PhoneMessage Test Suite', () => {
  const log = new DefaultLogger('PhoneMessageIntegrationTests')
  const emptySuccess = {
    status: ListOperationResultStatus.Success,
    items: [],
    nextToken: undefined,
  }
  let setup: SetupTelephonyClientOutput | undefined
  let instanceUnderTest: SudoTelephonyClient
  let helper: PhoneNumberTestHelper

  const activeNumber = async (): Promise<PhoneNumber> => {
    const { number } = await helper.provisionANumber()
    return await helper.awaitState(
      number.id,
      (state) => state === PhoneNumberState.Active,
    )
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

  it('returns an empty inbox for a new number', async () => {
    const number = await activeNumber()

    await expect(
      instanceUnderTest.listPhoneMessagesForPhoneNumberId({
        phoneNumberId: number.id,
      }),
    ).resolves.toStrictEqual(emptySuccess)
  })

  it('accepts every filter', async () => {
    const number = await activeNumber()

    await expect(
      instanceUnderTest.listPhoneMessagesForPhoneNumberId({
        phoneNumberId: number.id,
        sortOrder: SortOrder.Asc,
        limit: 10,
      }),
    ).resolves.toStrictEqual(emptySuccess)
  })

  it('returns an empty page for an unknown conversation', async () => {
    await expect(
      instanceUnderTest.listPhoneMessagesForConversationId({
        conversationId: `tel-cnv-${v4()}`,
        sortOrder: SortOrder.Asc,
        limit: 10,
      }),
    ).resolves.toStrictEqual(emptySuccess)
  })

  it('returns an empty inbox for a number the caller does not own', async () => {
    // The service filters by owner rather than rejecting the request, so a number the
    // caller does not own reads as empty and leaks nothing.
    await expect(
      instanceUnderTest.listPhoneMessagesForPhoneNumberId({
        phoneNumberId: `tel-pnm-${v4()}`,
      }),
    ).resolves.toStrictEqual(emptySuccess)
  })

  it('returns undefined for an unknown message', async () => {
    await expect(
      instanceUnderTest.getPhoneMessage(`tel-msg-${v4()}`),
    ).resolves.toBeUndefined()
  })
})
