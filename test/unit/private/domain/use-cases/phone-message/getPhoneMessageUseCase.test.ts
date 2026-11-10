/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { anything, instance, mock, reset, verify, when } from 'ts-mockito'
import { PhoneMessageService } from '../../../../../../src/private/domain/entities/phone-message/phoneMessageService'
import { PhoneMessageUnsealer } from '../../../../../../src/private/domain/entities/phone-message/phoneMessageUnsealer'
import { GetPhoneMessageUseCase } from '../../../../../../src/private/domain/use-cases/phone-message/getPhoneMessageUseCase'
import { UnsealingFailedError } from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('GetPhoneMessageUseCase Test Suite', () => {
  const mockPhoneMessageService = mock<PhoneMessageService>()
  const mockUnsealer = mock<PhoneMessageUnsealer>()
  let instanceUnderTest: GetPhoneMessageUseCase

  beforeEach(() => {
    reset(mockPhoneMessageService)
    reset(mockUnsealer)
    instanceUnderTest = new GetPhoneMessageUseCase(
      instance(mockPhoneMessageService),
      instance(mockUnsealer),
    )
  })

  describe('execute', () => {
    it('unseals the message with its phone number', async () => {
      when(mockPhoneMessageService.get(anything())).thenResolve(
        EntityDataFactory.sealedPhoneMessage,
      )
      when(mockUnsealer.unseal(anything(), anything())).thenResolve({
        unsealed: [EntityDataFactory.phoneMessage],
        failed: [],
      })

      await expect(instanceUnderTest.execute('id')).resolves.toStrictEqual(
        EntityDataFactory.phoneMessage,
      )
      verify(mockUnsealer.unseal('testPhoneNumberId', anything())).once()
    })

    it('returns undefined without unsealing when the message is not found', async () => {
      when(mockPhoneMessageService.get(anything())).thenResolve(undefined)

      await expect(instanceUnderTest.execute('id')).resolves.toBeUndefined()
      verify(mockUnsealer.unseal(anything(), anything())).never()
    })

    it('throws the cause when the message cannot be unsealed', async () => {
      const cause = new UnsealingFailedError('failed')
      when(mockPhoneMessageService.get(anything())).thenResolve(
        EntityDataFactory.sealedPhoneMessage,
      )
      when(mockUnsealer.unseal(anything(), anything())).thenResolve({
        unsealed: [],
        failed: [{ item: EntityDataFactory.partialPhoneMessage, cause }],
      })

      await expect(instanceUnderTest.execute('id')).rejects.toBe(cause)
    })
  })
})
