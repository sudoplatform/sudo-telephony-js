/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Core entity representation of a country service used in business logic.
 * Used to retrieve the countries the telephony service supports.
 *
 * @interface CountryService
 */
export interface CountryService {
  /**
   * Retrieve the countries the telephony service currently supports.
   *
   * @returns {string[]} The supported ISO 3166-1 alpha-2 country codes.
   */
  getSupportedCountries(): Promise<string[]>
}
