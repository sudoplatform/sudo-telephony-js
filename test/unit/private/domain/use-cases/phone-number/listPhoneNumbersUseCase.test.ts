/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { anything, capture, instance, mock, reset, when } from 'ts-mockito'
import { PhoneNumberService } from '../../../../../../src/private/domain/entities/phone-number/phoneNumberService'
import { ListPhoneNumbersUseCase } from '../../../../../../src/private/domain/use-cases/phone-number/listPhoneNumbersUseCase'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('ListPhoneNumbersUseCase Test Suite', () => {
  const mockPhoneNumberService = mock<PhoneNumberService>()

  beforeEach(() => {
    reset(mockPhoneNumberService)
  })

  describe('execute', () => {
    it('passes paging to the service and returns its page', async () => {
      const page = {
        phoneNumbers: [EntityDataFactory.phoneNumber],
        nextToken: 'next',
      }
      when(mockPhoneNumberService.list(anything())).thenResolve(page)
      const instanceUnderTest = new ListPhoneNumbersUseCase(
        instance(mockPhoneNumberService),
      )

      await expect(
        instanceUnderTest.execute({ limit: 1, nextToken: 'token' }),
      ).resolves.toStrictEqual(page)
      const [inputArgs] = capture(mockPhoneNumberService.list).first()
      expect(inputArgs).toStrictEqual({ limit: 1, nextToken: 'token' })
    })
  })
})
