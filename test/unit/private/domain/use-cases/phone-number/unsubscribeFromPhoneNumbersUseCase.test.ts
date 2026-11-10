/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset, verify } from 'ts-mockito'
import { PhoneNumberService } from '../../../../../../src/private/domain/entities/phone-number/phoneNumberService'
import { UnsubscribeFromPhoneNumbersUseCase } from '../../../../../../src/private/domain/use-cases/phone-number/unsubscribeFromPhoneNumbersUseCase'

describe('UnsubscribeFromPhoneNumbersUseCase Test Suite', () => {
  const mockPhoneNumberService = mock<PhoneNumberService>()

  beforeEach(() => {
    reset(mockPhoneNumberService)
  })

  describe('execute', () => {
    it('unsubscribes one subscriber when given an ID', () => {
      const instanceUnderTest = new UnsubscribeFromPhoneNumbersUseCase(
        instance(mockPhoneNumberService),
      )

      instanceUnderTest.execute('sub')

      verify(mockPhoneNumberService.unsubscribe('sub')).once()
    })
  })
})
