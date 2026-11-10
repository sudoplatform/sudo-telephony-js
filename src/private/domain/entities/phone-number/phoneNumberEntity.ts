/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { OwnerEntity } from '../common/ownerEntity'
import { PhoneNumberTypeEntity } from '../phone-number-search/phoneNumberSearchEntity'

/**
 * Enumeration that defines the lifecycle state of a phone number.
 *
 * @property PROVISIONING: The order for the number is in progress with the telephony provider.
 * @property ACTIVE: The number is active and can receive messages.
 * @property SUSPENDED: The user's entitlements no longer cover the number.
 * @property RELEASED: The number has been returned to the telephony provider.
 * @property FAILED: Provisioning failed.
 * @property UNKNOWN: The service reported a state this version of the SDK does not recognise.
 *
 * @enum
 */
export enum PhoneNumberStateEntity {
  Provisioning = 'PROVISIONING',
  Active = 'ACTIVE',
  Suspended = 'SUSPENDED',
  Released = 'RELEASED',
  Failed = 'FAILED',
  Unknown = 'UNKNOWN',
}

/**
 * Enumeration that defines the reason provisioning a phone number failed.
 *
 * @property NUMBER_UNAVAILABLE: The number is no longer available.
 * @property CARRIER_ERROR: The telephony provider or carrier rejected the order.
 * @property OWNER_DELETED: The Sudo or user that owned the number was deleted before its order
 *  was placed.
 * @property UNKNOWN: The service reported a reason this version of the SDK does not recognise.
 *
 * @enum
 */
export enum PhoneNumberFailureReasonEntity {
  NumberUnavailable = 'NUMBER_UNAVAILABLE',
  CarrierError = 'CARRIER_ERROR',
  OwnerDeleted = 'OWNER_DELETED',
  Unknown = 'UNKNOWN',
}

/**
 * Core entity representation of a provisioned phone number business rule.
 *
 * @interface PhoneNumberEntity
 * @property {string} id Unique identifier associated with the phone number.
 * @property {string} owner Unique identifier of the user who owns the phone number.
 * @property {OwnerEntity[]} owners Owners taken from the ownership proofs.
 * @property {string} identityId Identity ID of the user who owns the phone number.
 * @property {string} keyRingId Unique identifier of the key ring whose keys seal the number's
 *  messages.
 * @property {string[]} keyIds Unique identifiers of the keys in the key ring.
 * @property {string} phoneNumber The number in E.164 format.
 * @property {string} countryCode ISO 3166-1 alpha-2 country code of the number.
 * @property {PhoneNumberTypeEntity} numberType The kind of number.
 * @property {string} areaCode Area code of the number.
 * @property {PhoneNumberStateEntity} state Lifecycle state of the number.
 * @property {PhoneNumberFailureReasonEntity} failureReason Why provisioning failed.
 * @property {Date} gracePeriodEndsAt Date for when a suspended number will be released.
 * @property {string} clientRefId Client-supplied reference passed when provisioning.
 * @property {number} version Version of this entity. Increments on update.
 * @property {Date} createdAt Date for when the phone number was created.
 * @property {Date} updatedAt Date for when the phone number was last updated.
 */
export interface PhoneNumberEntity {
  id: string
  owner: string
  owners: OwnerEntity[]
  identityId: string
  keyRingId: string
  keyIds: string[]
  phoneNumber: string
  countryCode: string
  numberType: PhoneNumberTypeEntity
  areaCode?: string
  state: PhoneNumberStateEntity
  failureReason?: PhoneNumberFailureReasonEntity
  gracePeriodEndsAt?: Date
  clientRefId?: string
  version: number
  createdAt: Date
  updatedAt: Date
}
