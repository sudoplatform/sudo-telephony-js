/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PhoneMessageChangeTypeTransformer,
  PhoneMessageDirectionTransformer,
  PhoneMessageTypeTransformer,
  SortOrderTransformer,
} from '../../../../../../src/private/data/phone-message/transformer/phoneMessageEnumTransformers'
import {
  PhoneMessageChangeTypeEntity,
  PhoneMessageDirectionEntity,
  PhoneMessageTypeEntity,
  SortOrderEntity,
} from '../../../../../../src/private/domain/entities/phone-message/phoneMessageEntity'
import {
  PhoneMessageChangeType,
  PhoneMessageDirection,
  PhoneMessageType,
  SortOrder,
} from '../../../../../../src/public'

describe('PhoneMessageTypeTransformer Test Suite', () => {
  const instanceUnderTest = new PhoneMessageTypeTransformer()

  it('transforms SMS from graphQL to entity', () => {
    expect(instanceUnderTest.fromGraphQLToEntity('SMS')).toBe(
      PhoneMessageTypeEntity.Sms,
    )
  })

  it('returns fallback for unknown enum value', () => {
    expect(instanceUnderTest.fromGraphQLToEntity('MMS' as any)).toBe(
      PhoneMessageTypeEntity.Unknown,
    )
  })

  it.each`
    input                             | expected
    ${PhoneMessageTypeEntity.Sms}     | ${PhoneMessageType.Sms}
    ${PhoneMessageTypeEntity.Unknown} | ${PhoneMessageType.Unknown}
  `('transforms from entity $input to API $expected', ({ input, expected }) => {
    expect(instanceUnderTest.fromEntityToAPI(input)).toBe(expected)
  })
})

describe('PhoneMessageDirectionTransformer Test Suite', () => {
  const instanceUnderTest = new PhoneMessageDirectionTransformer()

  it('transforms INBOUND from graphQL to entity', () => {
    expect(instanceUnderTest.fromGraphQLToEntity('INBOUND')).toBe(
      PhoneMessageDirectionEntity.Inbound,
    )
  })

  it('returns fallback for unknown enum value', () => {
    expect(instanceUnderTest.fromGraphQLToEntity('OUTBOUND' as any)).toBe(
      PhoneMessageDirectionEntity.Unknown,
    )
  })

  it.each`
    input                                  | expected
    ${PhoneMessageDirectionEntity.Inbound} | ${PhoneMessageDirection.Inbound}
    ${PhoneMessageDirectionEntity.Unknown} | ${PhoneMessageDirection.Unknown}
  `('transforms from entity $input to API $expected', ({ input, expected }) => {
    expect(instanceUnderTest.fromEntityToAPI(input)).toBe(expected)
  })
})

describe('PhoneMessageChangeTypeTransformer Test Suite', () => {
  const instanceUnderTest = new PhoneMessageChangeTypeTransformer()

  it.each`
    input         | expected
    ${'RECEIVED'} | ${PhoneMessageChangeTypeEntity.Received}
    ${'UPDATED'}  | ${PhoneMessageChangeTypeEntity.Updated}
    ${'DELETED'}  | ${PhoneMessageChangeTypeEntity.Deleted}
  `(
    'transforms from graphQL $input to entity $expected',
    ({ input, expected }) => {
      expect(instanceUnderTest.fromGraphQLToEntity(input)).toBe(expected)
    },
  )

  it('returns fallback for unknown enum value', () => {
    expect(instanceUnderTest.fromGraphQLToEntity('ARCHIVED' as any)).toBe(
      PhoneMessageChangeTypeEntity.Unknown,
    )
  })

  it.each`
    input                                    | expected
    ${PhoneMessageChangeTypeEntity.Received} | ${PhoneMessageChangeType.Received}
    ${PhoneMessageChangeTypeEntity.Updated}  | ${PhoneMessageChangeType.Updated}
    ${PhoneMessageChangeTypeEntity.Deleted}  | ${PhoneMessageChangeType.Deleted}
    ${PhoneMessageChangeTypeEntity.Unknown}  | ${PhoneMessageChangeType.Unknown}
  `('transforms from entity $input to API $expected', ({ input, expected }) => {
    expect(instanceUnderTest.fromEntityToAPI(input)).toBe(expected)
  })
})

describe('SortOrderTransformer Test Suite', () => {
  const instanceUnderTest = new SortOrderTransformer()

  it.each`
    input             | entity                  | graphQL
    ${SortOrder.Asc}  | ${SortOrderEntity.Asc}  | ${'ASC'}
    ${SortOrder.Desc} | ${SortOrderEntity.Desc} | ${'DESC'}
  `(
    'transforms $input through entity to graphQL',
    ({ input, entity, graphQL }) => {
      expect(instanceUnderTest.fromAPIToEntity(input)).toBe(entity)
      expect(instanceUnderTest.fromEntityToGraphQL(entity)).toBe(graphQL)
    },
  )
})
