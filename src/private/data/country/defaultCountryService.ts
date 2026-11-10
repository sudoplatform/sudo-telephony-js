/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { CountryService } from '../../domain/entities/country/countryService'
import { ApiClient } from '../common/apiClient'

export class DefaultCountryService implements CountryService {
  constructor(private readonly appSync: ApiClient) {}

  async getSupportedCountries(): Promise<string[]> {
    return await this.appSync.getSupportedCountries()
  }
}
