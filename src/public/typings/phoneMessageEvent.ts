/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Owner } from '@sudoplatform/sudo-common'
import { PhoneMessageDirection, PhoneMessageType } from './phoneMessage'

/**
 * The Sudo Platform SDK representation of the change a {@link PhoneMessageEvent} is reporting.
 *
 * @enum PhoneMessageChangeType
 */
export enum PhoneMessageChangeType {
  /** A new message arrived. */
  Received = 'RECEIVED',
  /** A message changed, for example its seen state. */
  Updated = 'UPDATED',
  /** A message was deleted. */
  Deleted = 'DELETED',
  /** The service reported a change this version of the SDK does not recognise. */
  Unknown = 'UNKNOWN',
}

/**
 * The Sudo Platform SDK representation of a notification that one of the caller's phone messages was
 * received, updated or deleted.
 *
 * The event carries no message content, only the change and enough identity to act on it. Fetch the message
 * with {@link SudoTelephonyClient.getPhoneMessage} to read its text.
 *
 * @interface PhoneMessageEvent
 * @property {string} id Unique identifier of the phone message.
 * @property {string} phoneNumberId Identifier of the phone number that sent or received the message.
 * @property {string} conversationId Identifier of the conversation the message belongs to.
 * @property {PhoneMessageType} type The kind of message.
 * @property {PhoneMessageDirection} direction Whether the message was received or sent.
 * @property {PhoneMessageChangeType} changeType The change being reported.
 * @property {boolean} seen Flag indicating whether the user has marked the message as read.
 * @property {string} owner Identifier of the user that owns the message.
 * @property {Owner[]} owners Owners taken from the ownership proofs, which tie the message's phone number to
 *  a Sudo.
 * @property {string} sudoId Identifier of the Sudo that owns the message's phone number. Undefined when it
 *  belongs only to the user.
 * @property {number} version Version of the message after the change.
 * @property {Date} updatedAt Date when the message was last updated.
 */
export interface PhoneMessageEvent {
  id: string
  phoneNumberId: string
  conversationId: string
  type: PhoneMessageType
  direction: PhoneMessageDirection
  changeType: PhoneMessageChangeType
  seen: boolean
  owner: string
  owners: Owner[]
  sudoId?: string
  version: number
  updatedAt: Date
}
