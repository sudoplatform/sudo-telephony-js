/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { CountryService } from '../../entities/country/countryService'

/**
 * Application business logic for retrieving the countries the telephony service supports.
 */
export class GetSupportedCountriesUseCase {
  private readonly log: Logger

  public constructor(private readonly countryService: CountryService) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(): Promise<string[]> {
    this.log.debug(this.constructor.name)
    return await this.countryService.getSupportedCountries()
  }
}
