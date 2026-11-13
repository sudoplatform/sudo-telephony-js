/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { anything, instance, mock, reset, verify, when } from 'ts-mockito'
import { DeviceKeyWorker } from '../../../../src/private/data/common/deviceKeyWorker'
import { removeKeyPairs } from '../../../../src/private/util/removeKeyPairs'

describe('removeKeyPairs Test Suite', () => {
  const mockDeviceKeyWorker = mock<DeviceKeyWorker>()

  beforeEach(() => {
    reset(mockDeviceKeyWorker)
    when(mockDeviceKeyWorker.removeKeyPair(anything())).thenResolve()
  })

  it('removes every key pair and reports no failures', async () => {
    await expect(
      removeKeyPairs(instance(mockDeviceKeyWorker), ['keyId1', 'keyId2']),
    ).resolves.toStrictEqual([])

    verify(mockDeviceKeyWorker.removeKeyPair('keyId1')).once()
    verify(mockDeviceKeyWorker.removeKeyPair('keyId2')).once()
  })

  it('reports a failed removal and still removes the other key pairs', async () => {
    const error = new Error('remove failed')
    when(mockDeviceKeyWorker.removeKeyPair('keyId1')).thenReject(error)

    await expect(
      removeKeyPairs(instance(mockDeviceKeyWorker), ['keyId1', 'keyId2']),
    ).resolves.toStrictEqual([{ keyId: 'keyId1', error }])

    verify(mockDeviceKeyWorker.removeKeyPair('keyId2')).once()
  })

  it('does nothing for no key pairs', async () => {
    await expect(
      removeKeyPairs(instance(mockDeviceKeyWorker), []),
    ).resolves.toStrictEqual([])

    verify(mockDeviceKeyWorker.removeKeyPair(anything())).never()
  })
})
