/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { anything, instance, mock, reset, verify, when } from 'ts-mockito'
import { PhoneNumberService } from '../../../../../../src/private/domain/entities/phone-number/phoneNumberService'
import { DeprovisionPhoneNumberUseCase } from '../../../../../../src/private/domain/use-cases/phone-number/deprovisionPhoneNumberUseCase'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('DeprovisionPhoneNumberUseCase Test Suite', () => {
  const mockPhoneNumberService = mock<PhoneNumberService>()

  beforeEach(() => {
    reset(mockPhoneNumberService)
  })

  describe('execute', () => {
    it('deprovisions through the service', async () => {
      when(mockPhoneNumberService.deprovision(anything())).thenResolve(
        EntityDataFactory.phoneNumber,
      )
      const instanceUnderTest = new DeprovisionPhoneNumberUseCase(
        instance(mockPhoneNumberService),
      )

      await expect(instanceUnderTest.execute('id')).resolves.toStrictEqual(
        EntityDataFactory.phoneNumber,
      )
      verify(mockPhoneNumberService.deprovision('id')).once()
    })
  })
})
