/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { anything, capture, instance, mock, reset, when } from 'ts-mockito'
import { PhoneNumberService } from '../../../../../../src/private/domain/entities/phone-number/phoneNumberService'
import { ListPhoneNumbersForSudoIdUseCase } from '../../../../../../src/private/domain/use-cases/phone-number/listPhoneNumbersForSudoIdUseCase'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('ListPhoneNumbersForSudoIdUseCase Test Suite', () => {
  const mockPhoneNumberService = mock<PhoneNumberService>()

  beforeEach(() => {
    reset(mockPhoneNumberService)
  })

  describe('execute', () => {
    it('passes the Sudo and paging to the service and returns its page', async () => {
      const page = { phoneNumbers: [EntityDataFactory.phoneNumber] }
      when(mockPhoneNumberService.listForSudoId(anything())).thenResolve(page)
      const instanceUnderTest = new ListPhoneNumbersForSudoIdUseCase(
        instance(mockPhoneNumberService),
      )

      await expect(
        instanceUnderTest.execute({ sudoId: 'sudo', limit: 1 }),
      ).resolves.toStrictEqual(page)
      const [inputArgs] = capture(mockPhoneNumberService.listForSudoId).first()
      expect(inputArgs).toStrictEqual({
        sudoId: 'sudo',
        limit: 1,
        nextToken: undefined,
      })
    })
  })
})
