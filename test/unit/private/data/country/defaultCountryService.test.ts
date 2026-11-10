/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset, verify, when } from 'ts-mockito'
import { ApiClient } from '../../../../../src/private/data/common/apiClient'
import { DefaultCountryService } from '../../../../../src/private/data/country/defaultCountryService'

describe('DefaultCountryService Test Suite', () => {
  const mockAppSync = mock<ApiClient>()
  let instanceUnderTest: DefaultCountryService

  beforeEach(() => {
    reset(mockAppSync)
    instanceUnderTest = new DefaultCountryService(instance(mockAppSync))
  })

  describe('getSupportedCountries', () => {
    it('returns the countries from appSync', async () => {
      when(mockAppSync.getSupportedCountries()).thenResolve(['US', 'CA'])

      await expect(
        instanceUnderTest.getSupportedCountries(),
      ).resolves.toStrictEqual(['US', 'CA'])
      verify(mockAppSync.getSupportedCountries()).once()
    })

    it('throws when appSync throws', async () => {
      when(mockAppSync.getSupportedCountries()).thenReject(new Error('failed'))

      await expect(instanceUnderTest.getSupportedCountries()).rejects.toThrow(
        'failed',
      )
    })
  })
})
