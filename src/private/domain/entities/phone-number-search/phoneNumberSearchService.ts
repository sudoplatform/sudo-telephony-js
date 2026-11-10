/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { PhoneNumberSearchEntity } from './phoneNumberSearchEntity'

/**
 * Input for `PhoneNumberSearchService.search` method.
 *
 * @interface SearchAvailablePhoneNumbersInput
 * @property {string} countryCode ISO 3166-1 alpha-2 country code to search.
 * @property {string} areaCode Three-digit area code to search.
 * @property {number} limit Maximum number of results. When undefined the service applies its
 *  own default.
 */
export interface SearchAvailablePhoneNumbersInput {
  countryCode: string
  areaCode?: string
  limit?: number
}

/**
 * Core entity representation of a phone number search service used in business logic.
 * Used to search for phone numbers available to provision.
 *
 * @interface PhoneNumberSearchService
 */
export interface PhoneNumberSearchService {
  /**
   * Search for phone numbers available to provision.
   *
   * @param {SearchAvailablePhoneNumbersInput} input Parameters used to narrow the search.
   * @returns {PhoneNumberSearchEntity} The search holding the available numbers.
   */
  search(
    input: SearchAvailablePhoneNumbersInput,
  ): Promise<PhoneNumberSearchEntity>
}
