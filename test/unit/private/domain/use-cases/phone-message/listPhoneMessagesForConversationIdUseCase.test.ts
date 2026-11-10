/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  anything,
  capture,
  instance,
  mock,
  reset,
  verify,
  when,
} from 'ts-mockito'
import { PhoneMessageService } from '../../../../../../src/private/domain/entities/phone-message/phoneMessageService'
import { PhoneMessageUnsealer } from '../../../../../../src/private/domain/entities/phone-message/phoneMessageUnsealer'
import { ListPhoneMessagesForConversationIdUseCase } from '../../../../../../src/private/domain/use-cases/phone-message/listPhoneMessagesForConversationIdUseCase'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('ListPhoneMessagesForConversationIdUseCase Test Suite', () => {
  const mockPhoneMessageService = mock<PhoneMessageService>()
  const mockUnsealer = mock<PhoneMessageUnsealer>()
  let instanceUnderTest: ListPhoneMessagesForConversationIdUseCase

  beforeEach(() => {
    reset(mockPhoneMessageService)
    reset(mockUnsealer)
    instanceUnderTest = new ListPhoneMessagesForConversationIdUseCase(
      instance(mockPhoneMessageService),
      instance(mockUnsealer),
    )
  })

  describe('execute', () => {
    it('unseals the page with the phone number of its first message', async () => {
      when(
        mockPhoneMessageService.listForConversationId(anything()),
      ).thenResolve({
        phoneMessages: [EntityDataFactory.sealedPhoneMessage],
        nextToken: 'next',
      })
      when(mockUnsealer.unseal(anything(), anything())).thenResolve({
        unsealed: [EntityDataFactory.phoneMessage],
        failed: [],
      })

      const result = await instanceUnderTest.execute({ conversationId: 'conv' })

      expect(result).toStrictEqual({
        phoneMessages: [EntityDataFactory.phoneMessage],
        failed: [],
        nextToken: 'next',
      })
      const [listArgs] = capture(
        mockPhoneMessageService.listForConversationId,
      ).first()
      expect(listArgs).toStrictEqual({
        conversationId: 'conv',
        sortOrder: undefined,
        limit: undefined,
        nextToken: undefined,
      })
      verify(mockUnsealer.unseal('testPhoneNumberId', anything())).once()
    })

    it('returns an empty page without unsealing', async () => {
      when(
        mockPhoneMessageService.listForConversationId(anything()),
      ).thenResolve({
        phoneMessages: [],
        nextToken: undefined,
      })

      await expect(
        instanceUnderTest.execute({ conversationId: 'conv' }),
      ).resolves.toStrictEqual({
        phoneMessages: [],
        failed: [],
        nextToken: undefined,
      })
      verify(mockUnsealer.unseal(anything(), anything())).never()
    })
  })
})
