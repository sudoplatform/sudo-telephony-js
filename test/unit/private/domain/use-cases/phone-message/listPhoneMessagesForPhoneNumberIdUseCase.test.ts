/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { anything, capture, instance, mock, reset, when } from 'ts-mockito'
import { SortOrderEntity } from '../../../../../../src/private/domain/entities/phone-message/phoneMessageEntity'
import { PhoneMessageService } from '../../../../../../src/private/domain/entities/phone-message/phoneMessageService'
import { PhoneMessageUnsealer } from '../../../../../../src/private/domain/entities/phone-message/phoneMessageUnsealer'
import { ListPhoneMessagesForPhoneNumberIdUseCase } from '../../../../../../src/private/domain/use-cases/phone-message/listPhoneMessagesForPhoneNumberIdUseCase'
import { UnsealingFailedError } from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('ListPhoneMessagesForPhoneNumberIdUseCase Test Suite', () => {
  const mockPhoneMessageService = mock<PhoneMessageService>()
  const mockUnsealer = mock<PhoneMessageUnsealer>()
  let instanceUnderTest: ListPhoneMessagesForPhoneNumberIdUseCase

  beforeEach(() => {
    reset(mockPhoneMessageService)
    reset(mockUnsealer)
    instanceUnderTest = new ListPhoneMessagesForPhoneNumberIdUseCase(
      instance(mockPhoneMessageService),
      instance(mockUnsealer),
    )
    when(mockPhoneMessageService.listForPhoneNumberId(anything())).thenResolve({
      phoneMessages: [EntityDataFactory.sealedPhoneMessage],
      nextToken: 'next',
    })
  })

  describe('execute', () => {
    it('lists and unseals the page with the phone number', async () => {
      const failed = [
        {
          item: EntityDataFactory.partialPhoneMessage,
          cause: new UnsealingFailedError(),
        },
      ]
      when(mockUnsealer.unseal(anything(), anything())).thenResolve({
        unsealed: [EntityDataFactory.phoneMessage],
        failed,
      })

      const result = await instanceUnderTest.execute({
        phoneNumberId: 'pn',
        sortOrder: SortOrderEntity.Asc,
        limit: 1,
        nextToken: 'token',
      })

      expect(result).toStrictEqual({
        phoneMessages: [EntityDataFactory.phoneMessage],
        failed,
        nextToken: 'next',
      })
      const [listArgs] = capture(
        mockPhoneMessageService.listForPhoneNumberId,
      ).first()
      expect(listArgs).toStrictEqual({
        phoneNumberId: 'pn',
        sortOrder: SortOrderEntity.Asc,
        limit: 1,
        nextToken: 'token',
      })
      const [phoneNumberId, sealed] = capture(mockUnsealer.unseal).first()
      expect(phoneNumberId).toBe('pn')
      expect(sealed).toStrictEqual([EntityDataFactory.sealedPhoneMessage])
    })
  })
})
