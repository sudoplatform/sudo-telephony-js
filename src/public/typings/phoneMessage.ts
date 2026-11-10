/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ListOperationResult, Owner } from '@sudoplatform/sudo-common'

/**
 * The Sudo Platform SDK representation of the kind of a phone message.
 *
 * @enum PhoneMessageType
 */
export enum PhoneMessageType {
  /** A text message. */
  Sms = 'SMS',
  /** The service reported a kind this version of the SDK does not recognise. */
  Unknown = 'UNKNOWN',
}

/**
 * The Sudo Platform SDK representation of whether a phone message was received or sent.
 *
 * @enum PhoneMessageDirection
 */
export enum PhoneMessageDirection {
  /** Received on the user's number from the other party. */
  Inbound = 'INBOUND',
  /** The service reported a direction this version of the SDK does not recognise. */
  Unknown = 'UNKNOWN',
}

/**
 * The Sudo Platform SDK representation of an enumeration depicting the sort order.
 *
 * @enum SortOrder
 */
export enum SortOrder {
  /** Sort the list of results in ascending order, oldest first. */
  Asc = 'ASC',
  /** Sort the list of results in descending order, newest first. */
  Desc = 'DESC',
}

/**
 * The Sudo Platform SDK representation of a phone message whose sealed fields could not be unsealed.
 *
 * It carries every field of {@link PhoneMessage} except the sealed ones, `remotePhoneNumber` and `body`, so it
 * can still be shown, marked as seen or deleted.
 *
 * @interface PartialPhoneMessage
 * @property {string} id Unique identifier of the phone message.
 * @property {string} owner Identifier of the user that owns the phone message.
 * @property {Owner[]} owners Owners taken from the ownership proofs, which tie the message to a Sudo.
 * @property {string} sudoId Identifier of the Sudo that owns the message. Undefined when the message belongs
 *  only to the user.
 * @property {string} phoneNumberId Identifier of the phone number that sent or received the message.
 * @property {string} conversationId Identifier of the conversation, which groups every message between the
 *  phone number and the other party.
 * @property {PhoneMessageType} type The kind of message.
 * @property {PhoneMessageDirection} direction Whether the message was received or sent.
 * @property {string} localPhoneNumber The user's number in E.164 format.
 * @property {number} segmentCount The number of SMS segments the message was carried in, as reported by the
 *  telephony provider.
 * @property {boolean} mediaOmitted Flag indicating that the media of an inbound message was dropped and only
 *  its text kept.
 * @property {boolean} seen Flag indicating whether the user has marked the message as read.
 * @property {Date} receivedAt Date when the service received the message from the telephony provider.
 *  `createdAt` can be later if processing was delayed.
 * @property {number} version Version of this entity, increments on update.
 * @property {Date} createdAt Date when the phone message was created.
 * @property {Date} updatedAt Date when the phone message was last updated.
 */
export interface PartialPhoneMessage {
  id: string
  owner: string
  owners: Owner[]
  sudoId?: string
  phoneNumberId: string
  conversationId: string
  type: PhoneMessageType
  direction: PhoneMessageDirection
  localPhoneNumber: string
  segmentCount: number
  mediaOmitted: boolean
  seen: boolean
  receivedAt: Date
  version: number
  createdAt: Date
  updatedAt: Date
}

/**
 * The Sudo Platform SDK representation of the fields of a phone message that are sealed in transit and
 * unsealed by the SDK.
 *
 * @interface SealedPhoneMessageProps
 * @property {string} remotePhoneNumber The other party's number: the sender of an inbound message. E.164 or a
 *  short code. Undefined where the number was withheld.
 * @property {string} body The message text. Empty for a media-only message.
 */
export interface SealedPhoneMessageProps {
  remotePhoneNumber?: string
  body: string
}

/**
 * The Sudo Platform SDK representation of a message sent to or from one of the caller's phone numbers.
 *
 * The other party's number and the message text are sealed in transit and unsealed by the SDK with the
 * private key held on this device, so reading a message requires the device that provisioned the number, or
 * one that imported its keys with {@link SudoTelephonyClient.importKeys}.
 *
 * Carries every property of {@link PartialPhoneMessage} and {@link SealedPhoneMessageProps}.
 *
 * @interface PhoneMessage
 */
export interface PhoneMessage
  extends PartialPhoneMessage,
    SealedPhoneMessageProps {}

/**
 * The result object for the list phone messages APIs.
 *
 * - On success, contains the list of requested phone messages.
 * - On partial success, contains the list of phone messages that were fetched and unsealed successfully as
 *   well as the list of phone messages that could not be unsealed, each with an {@link UnsealingFailedError}
 *   indicating why unsealing failed. A phone message may fail to unseal if the client version is not up to
 *   date or the sealed content is damaged.
 */
export type ListPhoneMessagesResult = ListOperationResult<
  PhoneMessage,
  SealedPhoneMessageProps
>
