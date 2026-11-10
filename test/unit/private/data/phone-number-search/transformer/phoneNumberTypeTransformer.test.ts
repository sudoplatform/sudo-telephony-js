/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { PhoneNumberTypeTransformer } from '../../../../../../src/private/data/phone-number-search/transformer/phoneNumberTypeTransformer'
import { PhoneNumberTypeEntity } from '../../../../../../src/private/domain/entities/phone-number-search/phoneNumberSearchEntity'
import { PhoneNumberType } from '../../../../../../src/public'

describe('PhoneNumberTypeTransformer Test Suite', () => {
  const instanceUnderTest = new PhoneNumberTypeTransformer()

  describe('fromGraphQLToEntity', () => {
    it('transforms LOCAL successfully', () => {
      expect(instanceUnderTest.fromGraphQLToEntity('LOCAL')).toBe(
        PhoneNumberTypeEntity.Local,
      )
    })

    it('returns fallback for unknown enum value', () => {
      expect(
        instanceUnderTest.fromGraphQLToEntity('UNKNOWN_FUTURE_VALUE' as any),
      ).toBe(PhoneNumberTypeEntity.Unknown)
    })
  })

  describe('fromEntityToAPI', () => {
    it.each`
      input                            | expected
      ${PhoneNumberTypeEntity.Local}   | ${PhoneNumberType.Local}
      ${PhoneNumberTypeEntity.Unknown} | ${PhoneNumberType.Unknown}
    `(
      'transforms from entity $input to API $expected successfully',
      ({ input, expected }) => {
        expect(instanceUnderTest.fromEntityToAPI(input)).toBe(expected)
      },
    )
  })
})
