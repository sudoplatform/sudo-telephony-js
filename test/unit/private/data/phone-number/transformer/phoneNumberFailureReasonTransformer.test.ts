/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { PhoneNumberFailureReasonTransformer } from '../../../../../../src/private/data/phone-number/transformer/phoneNumberFailureReasonTransformer'
import { PhoneNumberFailureReasonEntity } from '../../../../../../src/private/domain/entities/phone-number/phoneNumberEntity'
import { PhoneNumberFailureReason } from '../../../../../../src/public'

describe('PhoneNumberFailureReasonTransformer Test Suite', () => {
  const instanceUnderTest = new PhoneNumberFailureReasonTransformer()

  describe('fromGraphQLToEntity', () => {
    it.each`
      input                   | expected
      ${'NUMBER_UNAVAILABLE'} | ${PhoneNumberFailureReasonEntity.NumberUnavailable}
      ${'CARRIER_ERROR'}      | ${PhoneNumberFailureReasonEntity.CarrierError}
      ${'OWNER_DELETED'}      | ${PhoneNumberFailureReasonEntity.OwnerDeleted}
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
      ).toBe(PhoneNumberFailureReasonEntity.Unknown)
    })
  })

  describe('fromEntityToAPI', () => {
    it.each`
      input                                               | expected
      ${PhoneNumberFailureReasonEntity.NumberUnavailable} | ${PhoneNumberFailureReason.NumberUnavailable}
      ${PhoneNumberFailureReasonEntity.CarrierError}      | ${PhoneNumberFailureReason.CarrierError}
      ${PhoneNumberFailureReasonEntity.OwnerDeleted}      | ${PhoneNumberFailureReason.OwnerDeleted}
      ${PhoneNumberFailureReasonEntity.Unknown}           | ${PhoneNumberFailureReason.Unknown}
    `(
      'transforms from entity $input to API $expected successfully',
      ({ input, expected }) => {
        expect(instanceUnderTest.fromEntityToAPI(input)).toStrictEqual(expected)
      },
    )
  })
})
