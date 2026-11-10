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
import { PhoneNumberSearchService } from '../../../../../../src/private/domain/entities/phone-number-search/phoneNumberSearchService'
import { SearchAvailablePhoneNumbersUseCase } from '../../../../../../src/private/domain/use-cases/phone-number-search/searchAvailablePhoneNumbersUseCase'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('SearchAvailablePhoneNumbersUseCase Test Suite', () => {
  const mockPhoneNumberSearchService = mock<PhoneNumberSearchService>()
  let instanceUnderTest: SearchAvailablePhoneNumbersUseCase

  beforeEach(() => {
    reset(mockPhoneNumberSearchService)
    instanceUnderTest = new SearchAvailablePhoneNumbersUseCase(
      instance(mockPhoneNumberSearchService),
    )
  })

  describe('execute', () => {
    it('passes the criteria to the service and returns its result', async () => {
      when(mockPhoneNumberSearchService.search(anything())).thenResolve(
        EntityDataFactory.phoneNumberSearch,
      )

      const result = await instanceUnderTest.execute({
        countryCode: 'US',
        areaCode: '415',
        limit: 5,
      })

      expect(result).toStrictEqual(EntityDataFactory.phoneNumberSearch)
      const [inputArgs] = capture(mockPhoneNumberSearchService.search).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>({
        countryCode: 'US',
        areaCode: '415',
        limit: 5,
      })
      verify(mockPhoneNumberSearchService.search(anything())).once()
    })
  })
})
