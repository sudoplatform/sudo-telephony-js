/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset, verify, when } from 'ts-mockito'
import { ConfigurationDataService } from '../../../../../../src/private/domain/entities/configuration/configurationDataService'
import { GetConfigurationDataUseCase } from '../../../../../../src/private/domain/use-cases/configuration/getConfigurationDataUseCase'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('GetConfigurationDataUseCase Test Suite', () => {
  const mockConfigurationDataService = mock<ConfigurationDataService>()
  let instanceUnderTest: GetConfigurationDataUseCase

  beforeEach(() => {
    reset(mockConfigurationDataService)
    instanceUnderTest = new GetConfigurationDataUseCase(
      instance(mockConfigurationDataService),
    )
  })

  describe('execute', () => {
    it('returns the configuration from the service', async () => {
      when(mockConfigurationDataService.getConfigurationData()).thenResolve(
        EntityDataFactory.configurationData,
      )

      await expect(instanceUnderTest.execute()).resolves.toStrictEqual(
        EntityDataFactory.configurationData,
      )
      verify(mockConfigurationDataService.getConfigurationData()).once()
    })
  })
})
