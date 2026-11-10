/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PartialPhoneMessageEntity,
  PhoneMessageEntity,
  SealedPhoneMessageEntity,
} from './phoneMessageEntity'

/**
 * A phone message that could not be unsealed, with the error that explains why.
 *
 * @interface FailedPhoneMessage
 * @property {PartialPhoneMessageEntity} item The fields of the message that are never sealed.
 * @property {Error} cause Why the message could not be unsealed.
 */
export interface FailedPhoneMessage {
  item: PartialPhoneMessageEntity
  cause: Error
}

/**
 * Output for `PhoneMessageUnsealer.unseal` method.
 *
 * @interface UnsealedPhoneMessages
 * @property {PhoneMessageEntity[]} unsealed The messages that were unsealed.
 * @property {FailedPhoneMessage[]} failed The messages that could not be unsealed.
 */
export interface UnsealedPhoneMessages {
  unsealed: PhoneMessageEntity[]
  failed: FailedPhoneMessage[]
}

/**
 * Core entity representation of a phone message unsealer used in business logic.
 * Used to make the sealed fields of a phone number's messages readable.
 *
 * @interface PhoneMessageUnsealer
 */
export interface PhoneMessageUnsealer {
  /**
   * Unseal messages that all belong to one phone number.
   *
   * The sealing key is resolved once for the phone number. A message that cannot be
   * unsealed is returned in `failed` rather than failing the whole call.
   *
   * @param {string} phoneNumberId The unique identifier of the phone number the messages
   *  belong to.
   * @param {SealedPhoneMessageEntity[]} sealed The sealed messages.
   * @returns {UnsealedPhoneMessages} The unsealed messages and the messages that failed.
   * @throws {PhoneNumberNotFoundError} If the phone number does not exist.
   * @throws {KeyNotFoundError} If this device holds none of the phone number's keys.
   */
  unseal(
    phoneNumberId: string,
    sealed: SealedPhoneMessageEntity[],
  ): Promise<UnsealedPhoneMessages>
}
