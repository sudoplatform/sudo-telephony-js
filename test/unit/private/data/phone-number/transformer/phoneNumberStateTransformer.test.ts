/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { PhoneNumberStateTransformer } from '../../../../../../src/private/data/phone-number/transformer/phoneNumberStateTransformer'
import { PhoneNumberStateEntity } from '../../../../../../src/private/domain/entities/phone-number/phoneNumberEntity'
import { PhoneNumberState } from '../../../../../../src/public'

describe('PhoneNumberStateTransformer Test Suite', () => {
  const instanceUnderTest = new PhoneNumberStateTransformer()

  describe('fromGraphQLToEntity', () => {
    it.each`
      input             | expected
      ${'PROVISIONING'} | ${PhoneNumberStateEntity.Provisioning}
      ${'ACTIVE'}       | ${PhoneNumberStateEntity.Active}
      ${'SUSPENDED'}    | ${PhoneNumberStateEntity.Suspended}
      ${'RELEASED'}     | ${PhoneNumberStateEntity.Released}
      ${'FAILED'}       | ${PhoneNumberStateEntity.Failed}
    `(
      'transforms from graphQL $input to entity $expected successfully',
      ({ input, expected }) => {
        expect(instanceUnderTest.fromGraphQLToEntity(input)).toStrictEqual(
          expected,
        )
      },
    )

    it('returns fallback for unknown enum value', () => {
      expect(
        instanceUnderTest.fromGraphQLToEntity('UNKNOWN_FUTURE_VALUE' as any),
      ).toBe(PhoneNumberStateEntity.Unknown)
    })
  })

  describe('fromEntityToAPI', () => {
    it.each`
      input                                  | expected
      ${PhoneNumberStateEntity.Provisioning} | ${PhoneNumberState.Provisioning}
      ${PhoneNumberStateEntity.Active}       | ${PhoneNumberState.Active}
      ${PhoneNumberStateEntity.Suspended}    | ${PhoneNumberState.Suspended}
      ${PhoneNumberStateEntity.Released}     | ${PhoneNumberState.Released}
      ${PhoneNumberStateEntity.Failed}       | ${PhoneNumberState.Failed}
      ${PhoneNumberStateEntity.Unknown}      | ${PhoneNumberState.Unknown}
    `(
      'transforms from entity $input to API $expected successfully',
      ({ input, expected }) => {
        expect(instanceUnderTest.fromEntityToAPI(input)).toStrictEqual(expected)
      },
    )
  })
})
