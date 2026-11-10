/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { PhoneNumberTransformer } from '../../../../../../src/private/data/phone-number/transformer/phoneNumberTransformer'
import {
  PhoneNumberFailureReasonEntity,
  PhoneNumberStateEntity,
} from '../../../../../../src/private/domain/entities/phone-number/phoneNumberEntity'
import {
  PhoneNumberFailureReason,
  PhoneNumberState,
} from '../../../../../../src/public'
import { APIDataFactory } from '../../../../../data-factory/api'
import { EntityDataFactory } from '../../../../../data-factory/entity'
import { GraphQLDataFactory } from '../../../../../data-factory/graphQL'

describe('PhoneNumberTransformer Test Suite', () => {
  const instanceUnderTest = new PhoneNumberTransformer()

  describe('fromGraphQLToEntity', () => {
    it('transforms a phone number successfully', () => {
      expect(
        instanceUnderTest.fromGraphQLToEntity(GraphQLDataFactory.phoneNumber),
      ).toStrictEqual(EntityDataFactory.phoneNumber)
    })

    it('transforms the optional fields of a failed or suspended number', () => {
      const result = instanceUnderTest.fromGraphQLToEntity({
        ...GraphQLDataFactory.phoneNumber,
        state: 'FAILED',
        failureReason: 'OWNER_DELETED',
        gracePeriodEndsAtEpochMs: 4.0,
      })

      expect(result.state).toBe(PhoneNumberStateEntity.Failed)
      expect(result.failureReason).toBe(
        PhoneNumberFailureReasonEntity.OwnerDeleted,
      )
      expect(result.gracePeriodEndsAt).toStrictEqual(new Date(4.0))
    })

    it('maps nulls to undefined', () => {
      const result = instanceUnderTest.fromGraphQLToEntity({
        ...GraphQLDataFactory.phoneNumber,
        areaCode: null,
        clientRefId: null,
      })

      expect(result.areaCode).toBeUndefined()
      expect(result.clientRefId).toBeUndefined()
    })
  })

  describe('fromEntityToAPI', () => {
    it('transforms a phone number successfully', () => {
      expect(
        instanceUnderTest.fromEntityToAPI(EntityDataFactory.phoneNumber),
      ).toStrictEqual(APIDataFactory.phoneNumber)
    })

    it('transforms the optional fields of a failed number', () => {
      const result = instanceUnderTest.fromEntityToAPI({
        ...EntityDataFactory.phoneNumber,
        state: PhoneNumberStateEntity.Failed,
        failureReason: PhoneNumberFailureReasonEntity.CarrierError,
      })

      expect(result.state).toBe(PhoneNumberState.Failed)
      expect(result.failureReason).toBe(PhoneNumberFailureReason.CarrierError)
    })

    it('sets sudoId from the first Sudo service owner', () => {
      const result = instanceUnderTest.fromEntityToAPI({
        ...EntityDataFactory.phoneNumber,
        owners: [
          { id: 'otherId', issuer: 'some.other.issuer' },
          { id: 'sudoId', issuer: 'sudoplatform.sudoservice' },
        ],
      })

      expect(result.sudoId).toBe('sudoId')
    })

    it('leaves sudoId undefined when no owner is a Sudo', () => {
      const result = instanceUnderTest.fromEntityToAPI({
        ...EntityDataFactory.phoneNumber,
        owners: [],
      })

      expect(result.sudoId).toBeUndefined()
    })
  })
})
