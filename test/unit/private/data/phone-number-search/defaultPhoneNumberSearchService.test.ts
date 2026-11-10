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
import { ApiClient } from '../../../../../src/private/data/common/apiClient'
import { DefaultPhoneNumberSearchService } from '../../../../../src/private/data/phone-number-search/defaultPhoneNumberSearchService'
import { EntityDataFactory } from '../../../../data-factory/entity'
import { GraphQLDataFactory } from '../../../../data-factory/graphQL'

describe('DefaultPhoneNumberSearchService Test Suite', () => {
  const mockAppSync = mock<ApiClient>()
  let instanceUnderTest: DefaultPhoneNumberSearchService

  beforeEach(() => {
    reset(mockAppSync)
    instanceUnderTest = new DefaultPhoneNumberSearchService(
      instance(mockAppSync),
    )
  })

  describe('search', () => {
    it('calls appSync and returns the transformed search', async () => {
      when(mockAppSync.searchAvailablePhoneNumbers(anything())).thenResolve(
        GraphQLDataFactory.phoneNumberSearch,
      )

      const result = await instanceUnderTest.search({
        countryCode: 'US',
        areaCode: '415',
        limit: 5,
      })

      expect(result).toStrictEqual(EntityDataFactory.phoneNumberSearch)
      const [inputArgs] = capture(
        mockAppSync.searchAvailablePhoneNumbers,
      ).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>({
        countryCode: 'US',
        areaCode: '415',
        limit: 5,
      })
      verify(mockAppSync.searchAvailablePhoneNumbers(anything())).once()
    })

    it('throws when appSync throws', async () => {
      when(mockAppSync.searchAvailablePhoneNumbers(anything())).thenReject(
        new Error('failed'),
      )

      await expect(
        instanceUnderTest.search({ countryCode: 'US' }),
      ).rejects.toThrow('failed')
    })
  })
})
