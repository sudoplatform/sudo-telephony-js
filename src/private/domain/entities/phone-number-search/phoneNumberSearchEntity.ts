/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Enumeration that defines the kind of a phone number.
 *
 * @property LOCAL: A geographic number tied to an area code.
 * @property UNKNOWN: The service reported a kind this version of the SDK does not recognise.
 *
 * @enum
 */
export enum PhoneNumberTypeEntity {
  Local = 'LOCAL',
  Unknown = 'UNKNOWN',
}

/**
 * Core entity representation of a phone number the service is offering to provision.
 *
 * @interface AvailablePhoneNumberEntity
 * @property {string} phoneNumber The number in E.164 format.
 * @property {string} countryCode ISO 3166-1 alpha-2 country code of the number.
 * @property {PhoneNumberTypeEntity} numberType The kind of number.
 * @property {string} locality City or rate centre of the number, if the carrier reports one.
 * @property {string} region State or province code of the number.
 */
export interface AvailablePhoneNumberEntity {
  phoneNumber: string
  countryCode: string
  numberType: PhoneNumberTypeEntity
  locality?: string
  region?: string
}

/**
 * Core entity representation of a search for available phone numbers business rule.
 *
 * @interface PhoneNumberSearchEntity
 * @property {string} id Unique identifier associated with the search.
 * @property {string} countryCode ISO 3166-1 alpha-2 country code that was searched.
 * @property {string} areaCode Area code that was searched. Undefined for a country-wide search.
 * @property {AvailablePhoneNumberEntity[]} results The available numbers.
 * @property {Date} expiresAt Date for when provisioning from this search is refused.
 * @property {string} owner Unique identifier of the user who made the search.
 * @property {number} version Version of this entity. Increments on update.
 * @property {Date} createdAt Date for when the search was created.
 * @property {Date} updatedAt Date for when the search was last updated.
 */
export interface PhoneNumberSearchEntity {
  id: string
  countryCode: string
  areaCode?: string
  results: AvailablePhoneNumberEntity[]
  expiresAt: Date
  owner: string
  version: number
  createdAt: Date
  updatedAt: Date
}
