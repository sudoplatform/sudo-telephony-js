/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { PhoneMessageEventTransformer } from '../../../../../../src/private/data/phone-message/transformer/phoneMessageEventTransformer'
import { APIDataFactory } from '../../../../../data-factory/api'
import { EntityDataFactory } from '../../../../../data-factory/entity'
import { GraphQLDataFactory } from '../../../../../data-factory/graphQL'

describe('PhoneMessageEventTransformer Test Suite', () => {
  const instanceUnderTest = new PhoneMessageEventTransformer()

  it('transforms from graphQL to entity successfully', () => {
    expect(
      instanceUnderTest.fromGraphQLToEntity(
        GraphQLDataFactory.phoneMessageEvent,
      ),
    ).toStrictEqual(EntityDataFactory.phoneMessageEvent)
  })

  it('transforms from entity to API successfully', () => {
    expect(
      instanceUnderTest.fromEntityToAPI(EntityDataFactory.phoneMessageEvent),
    ).toStrictEqual(APIDataFactory.phoneMessageEvent)
  })
})
