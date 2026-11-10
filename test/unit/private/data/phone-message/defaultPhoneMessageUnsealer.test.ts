/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { anything, instance, mock, reset, verify, when } from 'ts-mockito'
import { DeviceKeyWorker } from '../../../../../src/private/data/common/deviceKeyWorker'
import { DefaultPhoneMessageUnsealer } from '../../../../../src/private/data/phone-message/defaultPhoneMessageUnsealer'
import { PhoneNumberService } from '../../../../../src/private/domain/entities/phone-number/phoneNumberService'
import {
  KeyNotFoundError,
  PhoneNumberNotFoundError,
  UnsealingFailedError,
} from '../../../../../src/public'
import { EntityDataFactory } from '../../../../data-factory/entity'

describe('DefaultPhoneMessageUnsealer Test Suite', () => {
  const mockPhoneNumberService = mock<PhoneNumberService>()
  const mockDeviceKeyWorker = mock<DeviceKeyWorker>()
  let instanceUnderTest: DefaultPhoneMessageUnsealer

  const unsealedValues: Record<string, string> = {
    sealedRemotePhoneNumber: '+14155550199',
    sealedBody: 'Hello',
  }

  beforeEach(() => {
    reset(mockPhoneNumberService)
    reset(mockDeviceKeyWorker)
    instanceUnderTest = new DefaultPhoneMessageUnsealer(
      instance(mockPhoneNumberService),
      instance(mockDeviceKeyWorker),
    )
    when(mockPhoneNumberService.get(anything())).thenResolve({
      ...EntityDataFactory.phoneNumber,
      keyIds: ['missingKey', 'heldKey'],
    })
    when(mockDeviceKeyWorker.privateKeyExists('missingKey')).thenResolve(false)
    when(mockDeviceKeyWorker.privateKeyExists('heldKey')).thenResolve(true)
    when(mockDeviceKeyWorker.unsealString('heldKey', anything())).thenCall(
      async (_keyId: string, sealed: string) => unsealedValues[sealed],
    )
  })

  describe('unseal', () => {
    it('returns nothing for an empty page without looking up the key', async () => {
      await expect(
        instanceUnderTest.unseal('testPhoneNumberId', []),
      ).resolves.toStrictEqual({ unsealed: [], failed: [] })
      verify(mockPhoneNumberService.get(anything())).never()
    })

    it('unseals with the first key held on the device', async () => {
      const result = await instanceUnderTest.unseal('testPhoneNumberId', [
        EntityDataFactory.sealedPhoneMessage,
      ])

      expect(result).toStrictEqual({
        unsealed: [EntityDataFactory.phoneMessage],
        failed: [],
      })
      verify(mockDeviceKeyWorker.unsealString('heldKey', anything())).twice()
      verify(mockDeviceKeyWorker.unsealString('missingKey', anything())).never()
    })

    it('resolves the key once for the whole page', async () => {
      await instanceUnderTest.unseal('testPhoneNumberId', [
        EntityDataFactory.sealedPhoneMessage,
        EntityDataFactory.sealedPhoneMessage,
      ])

      verify(mockPhoneNumberService.get('testPhoneNumberId')).once()
    })

    it('keeps a withheld remote number undefined', async () => {
      const result = await instanceUnderTest.unseal('testPhoneNumberId', [
        {
          ...EntityDataFactory.sealedPhoneMessage,
          remotePhoneNumber: undefined,
        },
      ])

      expect(result.unsealed[0].remotePhoneNumber).toBeUndefined()
      expect(result.unsealed[0].body).toBe('Hello')
      verify(mockDeviceKeyWorker.unsealString(anything(), anything())).once()
    })

    it('returns a message that fails to unseal as partial', async () => {
      const broken = {
        ...EntityDataFactory.sealedPhoneMessage,
        id: 'broken',
        body: 'corrupt',
      }
      when(mockDeviceKeyWorker.unsealString('heldKey', 'corrupt')).thenReject(
        new Error('bad tag'),
      )

      const result = await instanceUnderTest.unseal('testPhoneNumberId', [
        EntityDataFactory.sealedPhoneMessage,
        broken,
      ])

      expect(result.unsealed).toStrictEqual([EntityDataFactory.phoneMessage])
      expect(result.failed).toHaveLength(1)
      expect(result.failed[0].item).toStrictEqual({
        ...EntityDataFactory.partialPhoneMessage,
        id: 'broken',
      })
      expect(result.failed[0].cause).toBeInstanceOf(UnsealingFailedError)
      expect((result.failed[0].cause as UnsealingFailedError).cause).toEqual(
        new Error('bad tag'),
      )
    })

    it('throws PhoneNumberNotFoundError when the phone number does not exist', async () => {
      when(mockPhoneNumberService.get(anything())).thenResolve(undefined)

      await expect(
        instanceUnderTest.unseal('testPhoneNumberId', [
          EntityDataFactory.sealedPhoneMessage,
        ]),
      ).rejects.toThrow(PhoneNumberNotFoundError)
    })

    it('throws KeyNotFoundError when the device holds none of the keys', async () => {
      when(mockDeviceKeyWorker.privateKeyExists('heldKey')).thenResolve(false)

      await expect(
        instanceUnderTest.unseal('testPhoneNumberId', [
          EntityDataFactory.sealedPhoneMessage,
        ]),
      ).rejects.toThrow(KeyNotFoundError)
    })
  })
})
