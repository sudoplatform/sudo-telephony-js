/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Owner } from '@sudoplatform/sudo-common'
import { PhoneNumberType } from './phoneNumberSearch'

/**
 * The Sudo Platform SDK representation of the lifecycle state of a phone number.
 *
 * @enum PhoneNumberState
 */
export enum PhoneNumberState {
  /** The order for the number is in progress with the telephony provider. */
  Provisioning = 'PROVISIONING',
  /** The number is active and can receive messages. */
  Active = 'ACTIVE',
  /**
   * The user's entitlements no longer cover the number. It keeps receiving messages until the grace period
   * ends, then it is released.
   */
  Suspended = 'SUSPENDED',
  /** The number has been returned to the telephony provider. */
  Released = 'RELEASED',
  /** Provisioning failed. See `PhoneNumber.failureReason`. */
  Failed = 'FAILED',
  /** The service reported a state this version of the SDK does not recognise. */
  Unknown = 'UNKNOWN',
}

/**
 * The Sudo Platform SDK representation of the reason provisioning a phone number failed.
 *
 * @enum PhoneNumberFailureReason
 */
export enum PhoneNumberFailureReason {
  /** The number is no longer available, for example because someone else took it after the search. */
  NumberUnavailable = 'NUMBER_UNAVAILABLE',
  /** The telephony provider or carrier rejected the order. */
  CarrierError = 'CARRIER_ERROR',
  /** The Sudo or user that owned the number was deleted before its order was placed. */
  OwnerDeleted = 'OWNER_DELETED',
  /** The service reported a reason this version of the SDK does not recognise. */
  Unknown = 'UNKNOWN',
}

/**
 * The Sudo Platform SDK representation of a phone number provisioned by the telephony service.
 *
 * Provisioning returns the number in {@link PhoneNumberState.Provisioning}. It becomes
 * {@link PhoneNumberState.Active} or {@link PhoneNumberState.Failed} once the order completes with the
 * telephony provider.
 *
 * @interface PhoneNumber
 * @property {string} id Unique identifier of the phone number.
 * @property {string} owner Identifier of the user that owns the phone number.
 * @property {Owner[]} owners Owners taken from the ownership proofs, which tie the phone number to a Sudo.
 * @property {string} sudoId Identifier of the Sudo that owns the phone number. Undefined when the number
 *  belongs only to the user.
 * @property {string} identityId Identity ID of the user that owns the phone number.
 * @property {string} keyRingId Identifier of the key ring whose keys seal the number's messages.
 * @property {string[]} keyIds Identifiers of the keys in the key ring.
 * @property {string} phoneNumber The number in E.164 format, for example `+14155550123`.
 * @property {string} countryCode ISO 3166-1 alpha-2 country code of the number.
 * @property {PhoneNumberType} numberType The kind of number.
 * @property {string} areaCode Area code of the number. Undefined where the country has no area codes.
 * @property {PhoneNumberState} state Lifecycle state of the number.
 * @property {PhoneNumberFailureReason} failureReason Why provisioning failed. Set only when `state` is
 *  {@link PhoneNumberState.Failed}.
 * @property {Date} gracePeriodEndsAt Date when the number will be released. Set only when `state` is
 *  {@link PhoneNumberState.Suspended}.
 * @property {string} clientRefId Client-supplied reference passed when provisioning, returned unchanged.
 * @property {number} version Version of this entity, increments on update.
 * @property {Date} createdAt Date when the phone number was created.
 * @property {Date} updatedAt Date when the phone number was last updated.
 */
export interface PhoneNumber {
  id: string
  owner: string
  owners: Owner[]
  sudoId?: string
  identityId: string
  keyRingId: string
  keyIds: string[]
  phoneNumber: string
  countryCode: string
  numberType: PhoneNumberType
  areaCode?: string
  state: PhoneNumberState
  failureReason?: PhoneNumberFailureReason
  gracePeriodEndsAt?: Date
  clientRefId?: string
  version: number
  createdAt: Date
  updatedAt: Date
}
