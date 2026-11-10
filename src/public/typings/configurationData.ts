/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The Sudo Platform SDK representation of the telephony service configuration data.
 *
 * Describes how the telephony service deployment is configured, so that a client can follow its rules
 * without hard-coding them.
 *
 * @interface ConfigurationData
 * @property {boolean} sudoOwnershipProofRequired Flag indicating whether provisioning a phone number requires a
 *  Sudo ownership proof. When `false`, a number provisioned without a proof belongs to the user only.
 * @property {number} phoneNumberSearchDefaultLimit The number of results a phone number search returns when no
 *  limit is set.
 * @property {number} phoneNumberSearchMaxLimit The largest limit a phone number search accepts.
 * @property {number} phoneNumberSearchLifetimeMs How long, in milliseconds, a phone number search can be used to
 *  provision a number after it is created.
 * @property {number} listDefaultLimit The page size of the list methods when no limit is set.
 * @property {number} listMaxLimit The largest page the list methods return.
 * @property {number} deletePhoneMessagesLimit The number of phone messages that can be deleted at a time.
 * @property {number} updatePhoneMessagesLimit The number of phone messages that can be updated at a time.
 */
export interface ConfigurationData {
  sudoOwnershipProofRequired: boolean
  phoneNumberSearchDefaultLimit: number
  phoneNumberSearchMaxLimit: number
  phoneNumberSearchLifetimeMs: number
  listDefaultLimit: number
  listMaxLimit: number
  deletePhoneMessagesLimit: number
  updatePhoneMessagesLimit: number
}
