/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { PhoneNumberSearchEntity } from '../../entities/phone-number-search/phoneNumberSearchEntity'
import { PhoneNumberSearchService } from '../../entities/phone-number-search/phoneNumberSearchService'

/**
 * Input for `SearchAvailablePhoneNumbersUseCase`.
 *
 * @interface SearchAvailablePhoneNumbersUseCaseInput
 * @property {string} countryCode ISO 3166-1 alpha-2 country code to search.
 * @property {string} areaCode Three-digit area code to search.
 * @property {number} limit Maximum number of results. When undefined the service applies its
 *  own default.
 */
export interface SearchAvailablePhoneNumbersUseCaseInput {
  countryCode: string
  areaCode?: string
  limit?: number
}

/**
 * Application business logic for searching the phone numbers available to provision.
 */
export class SearchAvailablePhoneNumbersUseCase {
  private readonly log: Logger

  public constructor(
    private readonly phoneNumberSearchService: PhoneNumberSearchService,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(
    input: SearchAvailablePhoneNumbersUseCaseInput,
  ): Promise<PhoneNumberSearchEntity> {
    this.log.debug(this.constructor.name, { input })
    return await this.phoneNumberSearchService.search({
      countryCode: input.countryCode,
      areaCode: input.areaCode,
      limit: input.limit,
    })
  }
}
