/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { anything, instance, mock, reset, verify, when } from 'ts-mockito'
import { PhoneNumberService } from '../../../../../../src/private/domain/entities/phone-number/phoneNumberService'
import { GetPhoneNumberUseCase } from '../../../../../../src/private/domain/use-cases/phone-number/getPhoneNumberUseCase'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('GetPhoneNumberUseCase Test Suite', () => {
  const mockPhoneNumberService = mock<PhoneNumberService>()

  beforeEach(() => {
    reset(mockPhoneNumberService)
  })

  describe('execute', () => {
    it('returns the number from the service', async () => {
      when(mockPhoneNumberService.get(anything())).thenResolve(
        EntityDataFactory.phoneNumber,
      )
      const instanceUnderTest = new GetPhoneNumberUseCase(
        instance(mockPhoneNumberService),
      )

      await expect(instanceUnderTest.execute('id')).resolves.toStrictEqual(
        EntityDataFactory.phoneNumber,
      )
      verify(mockPhoneNumberService.get('id')).once()
    })

    it('returns undefined when the service finds nothing', async () => {
      when(mockPhoneNumberService.get(anything())).thenResolve(undefined)
      const instanceUnderTest = new GetPhoneNumberUseCase(
        instance(mockPhoneNumberService),
      )

      await expect(instanceUnderTest.execute('id')).resolves.toBeUndefined()
    })
  })
})
