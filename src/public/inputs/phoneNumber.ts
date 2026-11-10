/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Pagination } from './common'

/**
 * Input for `SudoTelephonyClient.searchAvailablePhoneNumbers`.
 *
 * @interface SearchAvailablePhoneNumbersInput
 * @property {string} countryCode ISO 3166-1 alpha-2 country code to search. Must be one of the codes returned by
 *  {@link SudoTelephonyClient.getSupportedCountries}.
 * @property {string} areaCode Three-digit area code to search. Currently required: a request without one is
 *  rejected, and so is an area code that is not in use in `countryCode`.
 * @property {number} limit Maximum number of results. When omitted the service returns up to 10. A limit above
 *  20 is rejected.
 */
export interface SearchAvailablePhoneNumbersInput {
  countryCode: string
  areaCode?: string
  limit?: number
}

/**
 * Input for `SudoTelephonyClient.provisionPhoneNumber`.
 *
 * The SDK generates the key pair that seals the number's messages, registers the public key with the service,
 * and keeps the private key on the device, so no key material is supplied here.
 *
 * @interface ProvisionPhoneNumberInput
 * @property {string} searchId The identifier of one of the caller's searches that has not expired, as returned by
 *  {@link SudoTelephonyClient.searchAvailablePhoneNumbers}.
 * @property {string} phoneNumber The number to provision, in E.164 format. Must be one of that search's results.
 * @property {string} ownershipProofToken The signed ownership proof of the Sudo to be associated with the
 *  provisioned phone number. The ownership proof must contain an audience of {@link OWNERSHIP_PROOF_AUDIENCE}.
 *  Required only when {@link ConfigurationData.sudoOwnershipProofRequired} is `true`; without it the number
 *  belongs to the user only.
 * @property {string} clientRefId Client-supplied reference, returned unchanged on the phone number. Repeating a
 *  request with the same value returns the number the first request provisioned rather than provisioning another.
 */
export interface ProvisionPhoneNumberInput {
  searchId: string
  phoneNumber: string
  ownershipProofToken?: string
  clientRefId?: string
}

/**
 * Input for `SudoTelephonyClient.listPhoneNumbers`.
 *
 * @interface ListPhoneNumbersInput
 */
export type ListPhoneNumbersInput = Pagination

/**
 * Input for `SudoTelephonyClient.listPhoneNumbersForSudoId`.
 *
 * @interface ListPhoneNumbersForSudoIdInput
 * @property {string} sudoId The identifier of the Sudo that owns the phone numbers. A Sudo of another user lists
 *  nothing.
 */
export interface ListPhoneNumbersForSudoIdInput extends Pagination {
  sudoId: string
}
