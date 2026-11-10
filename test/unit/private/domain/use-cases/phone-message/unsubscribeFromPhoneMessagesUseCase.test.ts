/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset, verify } from 'ts-mockito'
import { PhoneMessageService } from '../../../../../../src/private/domain/entities/phone-message/phoneMessageService'
import { UnsubscribeFromPhoneMessagesUseCase } from '../../../../../../src/private/domain/use-cases/phone-message/unsubscribeFromPhoneMessagesUseCase'

describe('UnsubscribeFromPhoneMessagesUseCase Test Suite', () => {
  const mockPhoneMessageService = mock<PhoneMessageService>()

  beforeEach(() => {
    reset(mockPhoneMessageService)
  })

  describe('execute', () => {
    it('unsubscribes that subscription', () => {
      new UnsubscribeFromPhoneMessagesUseCase(
        instance(mockPhoneMessageService),
      ).execute('sub')

      verify(mockPhoneMessageService.unsubscribe('sub')).once()
    })
  })
})
