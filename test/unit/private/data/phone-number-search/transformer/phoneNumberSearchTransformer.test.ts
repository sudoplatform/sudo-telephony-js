/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { PhoneNumberSearchTransformer } from '../../../../../../src/private/data/phone-number-search/transformer/phoneNumberSearchTransformer'
import { APIDataFactory } from '../../../../../data-factory/api'
import { EntityDataFactory } from '../../../../../data-factory/entity'
import { GraphQLDataFactory } from '../../../../../data-factory/graphQL'

describe('PhoneNumberSearchTransformer Test Suite', () => {
  const instanceUnderTest = new PhoneNumberSearchTransformer()

  describe('fromGraphQLToEntity', () => {
    it('transforms a search successfully', () => {
      expect(
        instanceUnderTest.fromGraphQLToEntity(
          GraphQLDataFactory.phoneNumberSearch,
        ),
      ).toStrictEqual(EntityDataFactory.phoneNumberSearch)
    })

    it('maps nulls to undefined', () => {
      const result = instanceUnderTest.fromGraphQLToEntity({
        ...GraphQLDataFactory.phoneNumberSearch,
        areaCode: null,
        results: [
          {
            ...GraphQLDataFactory.phoneNumberSearch.results[0],
            locality: null,
            region: null,
          },
        ],
      })

      expect(result.areaCode).toBeUndefined()
      expect(result.results[0].locality).toBeUndefined()
      expect(result.results[0].region).toBeUndefined()
    })
  })

  describe('fromEntityToAPI', () => {
    it('transforms a search successfully', () => {
      expect(
        instanceUnderTest.fromEntityToAPI(EntityDataFactory.phoneNumberSearch),
      ).toStrictEqual(APIDataFactory.phoneNumberSearch)
    })
  })
})
