/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset, when } from 'ts-mockito'
import { DeviceKeyWorker } from '../../../../../../src/private/data/common/deviceKeyWorker'
import { ExportKeysUseCase } from '../../../../../../src/private/domain/use-cases/key/exportKeysUseCase'

describe('ExportKeysUseCase Test Suite', () => {
  const mockDeviceKeyWorker = mock<DeviceKeyWorker>()

  beforeEach(() => {
    reset(mockDeviceKeyWorker)
  })

  describe('execute', () => {
    it('returns the archive from the key worker', async () => {
      const archive = new ArrayBuffer(4)
      when(mockDeviceKeyWorker.exportKeys()).thenResolve(archive)

      await expect(
        new ExportKeysUseCase(instance(mockDeviceKeyWorker)).execute(),
      ).resolves.toBe(archive)
    })
  })
})
