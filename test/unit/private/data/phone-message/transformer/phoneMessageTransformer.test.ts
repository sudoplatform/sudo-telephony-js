/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { PhoneMessageTransformer } from '../../../../../../src/private/data/phone-message/transformer/phoneMessageTransformer'
import { APIDataFactory } from '../../../../../data-factory/api'
import { EntityDataFactory } from '../../../../../data-factory/entity'
import { GraphQLDataFactory } from '../../../../../data-factory/graphQL'

describe('PhoneMessageTransformer Test Suite', () => {
  const instanceUnderTest = new PhoneMessageTransformer()

  describe('fromGraphQLToSealedEntity', () => {
    it('transforms a sealed message successfully', () => {
      expect(
        instanceUnderTest.fromGraphQLToSealedEntity(
          GraphQLDataFactory.sealedPhoneMessage,
        ),
      ).toStrictEqual(EntityDataFactory.sealedPhoneMessage)
    })

    it('maps a withheld remote number to undefined', () => {
      const result = instanceUnderTest.fromGraphQLToSealedEntity({
        ...GraphQLDataFactory.sealedPhoneMessage,
        remotePhoneNumber: null,
      })

      expect(result.remotePhoneNumber).toBeUndefined()
    })
  })

  describe('fromSealedToEntity', () => {
    it('replaces the sealed fields with the unsealed values', () => {
      expect(
        instanceUnderTest.fromSealedToEntity(
          EntityDataFactory.sealedPhoneMessage,
          {
            remotePhoneNumber: '+14155550199',
            body: 'Hello',
          },
        ),
      ).toStrictEqual(EntityDataFactory.phoneMessage)
    })
  })

  describe('fromSealedToPartialEntity', () => {
    it('drops the sealed fields', () => {
      expect(
        instanceUnderTest.fromSealedToPartialEntity(
          EntityDataFactory.sealedPhoneMessage,
        ),
      ).toStrictEqual(EntityDataFactory.partialPhoneMessage)
    })
  })

  describe('fromEntityToAPI', () => {
    it('transforms a message successfully', () => {
      expect(
        instanceUnderTest.fromEntityToAPI(EntityDataFactory.phoneMessage),
      ).toStrictEqual(APIDataFactory.phoneMessage)
    })

    it('leaves sudoId undefined when no owner is a Sudo', () => {
      expect(
        instanceUnderTest.fromEntityToAPI({
          ...EntityDataFactory.phoneMessage,
          owners: [],
        }).sudoId,
      ).toBeUndefined()
    })
  })

  describe('fromPartialEntityToAPI', () => {
    it('transforms a partial message successfully', () => {
      expect(
        instanceUnderTest.fromPartialEntityToAPI(
          EntityDataFactory.partialPhoneMessage,
        ),
      ).toStrictEqual(APIDataFactory.partialPhoneMessage)
    })
  })
})
