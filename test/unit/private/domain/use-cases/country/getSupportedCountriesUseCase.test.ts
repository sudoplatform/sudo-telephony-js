/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset, verify, when } from 'ts-mockito'
import { CountryService } from '../../../../../../src/private/domain/entities/country/countryService'
import { GetSupportedCountriesUseCase } from '../../../../../../src/private/domain/use-cases/country/getSupportedCountriesUseCase'

describe('GetSupportedCountriesUseCase Test Suite', () => {
  const mockCountryService = mock<CountryService>()
  let instanceUnderTest: GetSupportedCountriesUseCase

  beforeEach(() => {
    reset(mockCountryService)
    instanceUnderTest = new GetSupportedCountriesUseCase(
      instance(mockCountryService),
    )
  })

  describe('execute', () => {
    it('returns the countries from the service', async () => {
      when(mockCountryService.getSupportedCountries()).thenResolve(['US'])

      await expect(instanceUnderTest.execute()).resolves.toStrictEqual(['US'])
      verify(mockCountryService.getSupportedCountries()).once()
    })
  })
})
