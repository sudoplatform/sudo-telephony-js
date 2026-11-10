/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The Sudo Platform SDK representation of the kind of a phone number.
 *
 * @enum PhoneNumberType
 */
export enum PhoneNumberType {
  /** A geographic number tied to an area code. */
  Local = 'LOCAL',
  /** The service reported a kind this version of the SDK does not recognise. */
  Unknown = 'UNKNOWN',
}

/**
 * The Sudo Platform SDK representation of a phone number the telephony service is offering to provision.
 *
 * The carrier does not reserve an offered number, so it can be taken by someone else before it is provisioned.
 *
 * @interface AvailablePhoneNumber
 * @property {string} phoneNumber The number in E.164 format, for example `+14155550123`.
 * @property {string} countryCode ISO 3166-1 alpha-2 country code of the number, for example `US`.
 * @property {PhoneNumberType} numberType The kind of number.
 * @property {string} locality City or rate centre of the number, if the carrier reports one.
 * @property {string} region State or province code of the number, for example `NY` or `ON`.
 */
export interface AvailablePhoneNumber {
  phoneNumber: string
  countryCode: string
  numberType: PhoneNumberType
  locality?: string
  region?: string
}

/**
 * The Sudo Platform SDK representation of the result of a search for available phone numbers.
 *
 * The service keeps the search so that provisioning can check the requested number came from it. Pass `id` as
 * the search ID when provisioning one of the `results` with {@link SudoTelephonyClient.provisionPhoneNumber}.
 *
 * @interface PhoneNumberSearch
 * @property {string} id Unique identifier of the search.
 * @property {string} countryCode ISO 3166-1 alpha-2 country code that was searched.
 * @property {string} areaCode Area code that was searched. Undefined for a country-wide search.
 * @property {AvailablePhoneNumber[]} results The available numbers, without duplicates and at most the
 *  requested limit.
 * @property {Date} expiresAt Date when provisioning from this search is refused. The carrier does not reserve
 *  the numbers, so one can be taken by someone else sooner.
 * @property {string} owner Identifier of the user that made the search.
 * @property {number} version Version of this entity, increments on update.
 * @property {Date} createdAt Date when the search was created.
 * @property {Date} updatedAt Date when the search was last updated.
 */
export interface PhoneNumberSearch {
  id: string
  countryCode: string
  areaCode?: string
  results: AvailablePhoneNumber[]
  expiresAt: Date
  owner: string
  version: number
  createdAt: Date
  updatedAt: Date
}
