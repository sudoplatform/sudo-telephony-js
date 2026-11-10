/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, LimitExceededError } from '@sudoplatform/sudo-common'
import { v4 } from 'uuid'
import { SudoTelephonyClient } from '../../src/public'
import {
  SetupTelephonyClientOutput,
  setupTelephonyClient,
  teardownTelephonyClient,
} from './util/telephonyClientLifecycle'

describe('PhoneMessageBatch Test Suite', () => {
  const log = new DefaultLogger('PhoneMessageBatchIntegrationTests')
  const maxBatchSize = 100
  const messageIds = (count: number) =>
    Array.from({ length: count }, () => `tel-msg-${v4()}`)
  let setup: SetupTelephonyClientOutput | undefined
  let instanceUnderTest: SudoTelephonyClient

  beforeAll(async () => {
    setup = await setupTelephonyClient(log)
    instanceUnderTest = setup.telephonyClient
  })

  afterAll(async () => {
    await teardownTelephonyClient(setup, log)
  })

  it('accounts for every requested ID when deleting', async () => {
    const ids = messageIds(3)

    const result = await instanceUnderTest.deletePhoneMessages({ ids })

    // Whichever bucket the service chooses, every ID must be accounted for exactly once.
    expect([...result.succeededIds, ...result.failedIds].sort()).toStrictEqual(
      [...ids].sort(),
    )
  })

  it('reports unknown IDs as failed rather than throwing when updating', async () => {
    const ids = messageIds(2)

    const result = await instanceUnderTest.updatePhoneMessages({
      ids,
      seen: true,
    })

    expect(result.succeededIds).toStrictEqual([])
    expect([...result.failedIds].sort()).toStrictEqual([...ids].sort())
  })

  it('accepts an empty batch', async () => {
    await expect(
      instanceUnderTest.deletePhoneMessages({ ids: [] }),
    ).resolves.toStrictEqual({ succeededIds: [], failedIds: [] })
    await expect(
      instanceUnderTest.updatePhoneMessages({ ids: [], seen: true }),
    ).resolves.toStrictEqual({ succeededIds: [], failedIds: [] })
  })

  it('accepts the maximum batch size', async () => {
    const result = await instanceUnderTest.deletePhoneMessages({
      ids: messageIds(maxBatchSize),
    })

    expect(result.succeededIds.length + result.failedIds.length).toBe(
      maxBatchSize,
    )
  })

  it('rejects a delete batch above the maximum', async () => {
    await expect(
      instanceUnderTest.deletePhoneMessages({
        ids: messageIds(maxBatchSize + 1),
      }),
    ).rejects.toThrow(LimitExceededError)
  })

  it('rejects an update batch above the maximum', async () => {
    await expect(
      instanceUnderTest.updatePhoneMessages({
        ids: messageIds(maxBatchSize + 1),
        seen: true,
      }),
    ).rejects.toThrow(LimitExceededError)
  })
})
