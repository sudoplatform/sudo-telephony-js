/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset, verify, when } from 'ts-mockito'
import { ApiClient } from '../../../../../src/private/data/common/apiClient'
import { DefaultConfigurationDataService } from '../../../../../src/private/data/configuration/defaultConfigurationDataService'
import { EntityDataFactory } from '../../../../data-factory/entity'
import { GraphQLDataFactory } from '../../../../data-factory/graphQL'

describe('DefaultConfigurationDataService Test Suite', () => {
  const mockAppSync = mock<ApiClient>()
  let instanceUnderTest: DefaultConfigurationDataService

  beforeEach(() => {
    reset(mockAppSync)
    instanceUnderTest = new DefaultConfigurationDataService(
      instance(mockAppSync),
    )
  })

  describe('getConfigurationData', () => {
    it('returns the transformed configuration', async () => {
      when(mockAppSync.getTelephonyConfig()).thenResolve(
        GraphQLDataFactory.configurationData,
      )

      await expect(
        instanceUnderTest.getConfigurationData(),
      ).resolves.toStrictEqual(EntityDataFactory.configurationData)
      verify(mockAppSync.getTelephonyConfig()).once()
    })

    it('throws when appSync throws', async () => {
      when(mockAppSync.getTelephonyConfig()).thenReject(new Error('failed'))

      await expect(instanceUnderTest.getConfigurationData()).rejects.toThrow(
        'failed',
      )
    })
  })
})
