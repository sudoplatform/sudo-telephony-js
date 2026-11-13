/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset, verify, when } from 'ts-mockito'
import { DeviceKeyWorker } from '../../../../../../src/private/data/common/deviceKeyWorker'
import { CreateSingletonKeysIfAbsentUseCase } from '../../../../../../src/private/domain/use-cases/key/createSingletonKeysIfAbsentUseCase'
import { InvalidConfigError } from '../../../../../../src/public/errors'

describe('CreateSingletonKeysIfAbsentUseCase Test Suite', () => {
  const mockDeviceKeyWorker = mock<DeviceKeyWorker>()

  beforeEach(() => {
    reset(mockDeviceKeyWorker)
  })

  describe('execute', () => {
    it('returns the key result when the client enforces a singleton key pair', async () => {
      when(mockDeviceKeyWorker.createSingletonKeyPairIfAbsent()).thenResolve({
        created: true,
        keyId: 'singletonKeyId',
      })
      const instanceUnderTest = new CreateSingletonKeysIfAbsentUseCase(
        instance(mockDeviceKeyWorker),
        true,
      )

      await expect(instanceUnderTest.execute()).resolves.toStrictEqual({
        keyPair: { created: true, keyId: 'singletonKeyId' },
      })
      verify(mockDeviceKeyWorker.createSingletonKeyPairIfAbsent()).once()
    })

    it('throws InvalidConfigError without touching keys otherwise', async () => {
      const instanceUnderTest = new CreateSingletonKeysIfAbsentUseCase(
        instance(mockDeviceKeyWorker),
        false,
      )

      await expect(instanceUnderTest.execute()).rejects.toThrow(
        InvalidConfigError,
      )
      verify(mockDeviceKeyWorker.createSingletonKeyPairIfAbsent()).never()
    })
  })
})
