/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Core entity representation of the telephony service configuration.
 *
 * @interface ConfigurationDataEntity
 * @property {boolean} sudoOwnershipProofRequired Whether provisioning requires a Sudo
 *  ownership proof.
 * @property {number} phoneNumberSearchDefaultLimit Results a search returns when no limit is set.
 * @property {number} phoneNumberSearchMaxLimit The largest limit a search accepts.
 * @property {number} phoneNumberSearchLifetimeMs How long, in milliseconds, a search can be used
 *  to provision.
 * @property {number} listDefaultLimit Page size of the list queries when no limit is set.
 * @property {number} listMaxLimit The largest page the list queries return.
 * @property {number} deletePhoneMessagesLimit The most messages one delete may name.
 * @property {number} updatePhoneMessagesLimit The most messages one update may name.
 */
export interface ConfigurationDataEntity {
  sudoOwnershipProofRequired: boolean
  phoneNumberSearchDefaultLimit: number
  phoneNumberSearchMaxLimit: number
  phoneNumberSearchLifetimeMs: number
  listDefaultLimit: number
  listMaxLimit: number
  deletePhoneMessagesLimit: number
  updatePhoneMessagesLimit: number
}
