/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset, verify } from 'ts-mockito'
import { DeviceKeyWorker } from '../../../../../../src/private/data/common/deviceKeyWorker'
import { ImportKeysUseCase } from '../../../../../../src/private/domain/use-cases/key/importKeysUseCase'

describe('ImportKeysUseCase Test Suite', () => {
  const mockDeviceKeyWorker = mock<DeviceKeyWorker>()

  beforeEach(() => {
    reset(mockDeviceKeyWorker)
  })

  describe('execute', () => {
    it('imports the archive through the key worker', async () => {
      const archive = new ArrayBuffer(4)

      await new ImportKeysUseCase(instance(mockDeviceKeyWorker)).execute(
        archive,
      )

      verify(mockDeviceKeyWorker.importKeys(archive)).once()
    })
  })
})
