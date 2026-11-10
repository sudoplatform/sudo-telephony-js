/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset, verify } from 'ts-mockito'
import { DeviceKeyWorker } from '../../../../../../src/private/data/common/deviceKeyWorker'
import { ResetUseCase } from '../../../../../../src/private/domain/use-cases/key/resetUseCase'

describe('ResetUseCase Test Suite', () => {
  const mockDeviceKeyWorker = mock<DeviceKeyWorker>()

  beforeEach(() => {
    reset(mockDeviceKeyWorker)
  })

  describe('execute', () => {
    it('removes every key through the key worker', async () => {
      await new ResetUseCase(instance(mockDeviceKeyWorker)).execute()

      verify(mockDeviceKeyWorker.removeAllKeys()).once()
    })
  })
})
