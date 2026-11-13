/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { RequestFailedError } from '@sudoplatform/sudo-common'
import { anything, instance, mock, reset, verify, when } from 'ts-mockito'
import { DeviceKeyWorker } from '../../../../../../src/private/data/common/deviceKeyWorker'
import { PhoneNumberService } from '../../../../../../src/private/domain/entities/phone-number/phoneNumberService'
import { DeprovisionPhoneNumberUseCase } from '../../../../../../src/private/domain/use-cases/phone-number/deprovisionPhoneNumberUseCase'
import { DeprovisionedKeyPairRemovalError } from '../../../../../../src/private/domain/entities/phone-number/deprovisionedKeyPairRemovalError'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('DeprovisionPhoneNumberUseCase Test Suite', () => {
  const mockPhoneNumberService = mock<PhoneNumberService>()
  const mockDeviceKeyWorker = mock<DeviceKeyWorker>()

  const released = {
    ...EntityDataFactory.phoneNumber,
    keyIds: ['keyId1', 'keyId2'],
  }

  const newUseCase = (enforceSingletonKeyPair: boolean) =>
    new DeprovisionPhoneNumberUseCase(
      instance(mockPhoneNumberService),
      instance(mockDeviceKeyWorker),
      enforceSingletonKeyPair,
    )

  beforeEach(() => {
    reset(mockPhoneNumberService)
    reset(mockDeviceKeyWorker)
    when(mockPhoneNumberService.deprovision(anything())).thenResolve(released)
    when(mockDeviceKeyWorker.removeKeyPair(anything())).thenResolve()
  })

  describe('execute with a key pair per number', () => {
    it('deprovisions through the service and removes the number keys', async () => {
      await expect(newUseCase(false).execute('id')).resolves.toStrictEqual(
        released,
      )

      verify(mockPhoneNumberService.deprovision('id')).once()
      verify(mockDeviceKeyWorker.removeKeyPair('keyId1')).once()
      verify(mockDeviceKeyWorker.removeKeyPair('keyId2')).once()
    })

    it('throws an error carrying the released number when a key cannot be removed', async () => {
      const error = new Error('remove failed')
      when(mockDeviceKeyWorker.removeKeyPair('keyId1')).thenReject(error)

      const thrown = await newUseCase(false)
        .execute('id')
        .catch((err: unknown) => err)

      expect(thrown).toBeInstanceOf(DeprovisionedKeyPairRemovalError)
      expect((thrown as DeprovisionedKeyPairRemovalError).deprovisioned).toBe(
        released,
      )
      expect((thrown as DeprovisionedKeyPairRemovalError).cause).toBe(error)
      // Every key is attempted before the failure is reported.
      verify(mockDeviceKeyWorker.removeKeyPair('keyId2')).once()
    })

    it('keeps the keys when the service call fails', async () => {
      when(mockPhoneNumberService.deprovision(anything())).thenReject(
        new RequestFailedError(),
      )

      await expect(newUseCase(false).execute('id')).rejects.toThrow(
        RequestFailedError,
      )
      verify(mockDeviceKeyWorker.removeKeyPair(anything())).never()
    })
  })

  describe('execute with a singleton key pair', () => {
    it('deprovisions through the service without removing keys', async () => {
      await expect(newUseCase(true).execute('id')).resolves.toStrictEqual(
        released,
      )

      verify(mockPhoneNumberService.deprovision('id')).once()
      verify(mockDeviceKeyWorker.removeKeyPair(anything())).never()
    })
  })
})
