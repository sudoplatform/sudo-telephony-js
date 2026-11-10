/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConfigurationDataTransformer } from '../../../../../../src/private/data/configuration/transformer/configurationDataTransformer'
import { APIDataFactory } from '../../../../../data-factory/api'
import { EntityDataFactory } from '../../../../../data-factory/entity'
import { GraphQLDataFactory } from '../../../../../data-factory/graphQL'

describe('ConfigurationDataTransformer Test Suite', () => {
  const instanceUnderTest = new ConfigurationDataTransformer()

  it('transforms from graphQL to entity successfully', () => {
    expect(
      instanceUnderTest.fromGraphQLToEntity(
        GraphQLDataFactory.configurationData,
      ),
    ).toStrictEqual(EntityDataFactory.configurationData)
  })

  it('transforms from entity to API successfully', () => {
    expect(
      instanceUnderTest.fromEntityToAPI(EntityDataFactory.configurationData),
    ).toStrictEqual(APIDataFactory.configurationData)
  })
})
