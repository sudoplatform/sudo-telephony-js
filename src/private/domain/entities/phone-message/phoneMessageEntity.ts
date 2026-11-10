/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { OwnerEntity } from '../common/ownerEntity'

/**
 * Enumeration that defines the kind of a phone message.
 *
 * @property SMS: A text message.
 * @property UNKNOWN: The service reported a kind this version of the SDK does not recognise.
 *
 * @enum
 */
export enum PhoneMessageTypeEntity {
  Sms = 'SMS',
  Unknown = 'UNKNOWN',
}

/**
 * Enumeration that defines whether a phone message was received or sent.
 *
 * @property INBOUND: Received on the user's number from the other party.
 * @property UNKNOWN: The service reported a direction this version of the SDK does not
 *  recognise.
 *
 * @enum
 */
export enum PhoneMessageDirectionEntity {
  Inbound = 'INBOUND',
  Unknown = 'UNKNOWN',
}

/**
 * Enumeration that defines the change a phone message event is reporting.
 *
 * @property RECEIVED: A new message arrived.
 * @property UPDATED: A message changed.
 * @property DELETED: A message was deleted.
 * @property UNKNOWN: The service reported a change this version of the SDK does not
 *  recognise.
 *
 * @enum
 */
export enum PhoneMessageChangeTypeEntity {
  Received = 'RECEIVED',
  Updated = 'UPDATED',
  Deleted = 'DELETED',
  Unknown = 'UNKNOWN',
}

/**
 * Enumeration that defines the order in which a list is returned.
 *
 * @property ASC: Oldest first.
 * @property DESC: Newest first.
 *
 * @enum
 */
export enum SortOrderEntity {
  Asc = 'ASC',
  Desc = 'DESC',
}

/**
 * Core entity representation of the fields of a phone message that are never sealed.
 *
 * @interface PartialPhoneMessageEntity
 * @property {string} id Unique identifier associated with the phone message.
 * @property {string} owner Unique identifier of the user who owns the phone message.
 * @property {OwnerEntity[]} owners Owners taken from the ownership proofs.
 * @property {string} phoneNumberId Unique identifier of the phone number that sent or received
 *  the message.
 * @property {string} conversationId Unique identifier of the conversation.
 * @property {PhoneMessageTypeEntity} type The kind of message.
 * @property {PhoneMessageDirectionEntity} direction Whether the message was received or sent.
 * @property {string} localPhoneNumber The user's number in E.164 format.
 * @property {number} segmentCount The number of SMS segments the message was carried in.
 * @property {boolean} mediaOmitted True for an inbound message whose media was dropped.
 * @property {boolean} seen Whether the user has marked the message as read.
 * @property {Date} receivedAt Date for when the service received the message.
 * @property {number} version Version of this entity. Increments on update.
 * @property {Date} createdAt Date for when the phone message was created.
 * @property {Date} updatedAt Date for when the phone message was last updated.
 */
export interface PartialPhoneMessageEntity {
  id: string
  owner: string
  owners: OwnerEntity[]
  phoneNumberId: string
  conversationId: string
  type: PhoneMessageTypeEntity
  direction: PhoneMessageDirectionEntity
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
 * Core entity representation of a phone message as returned by the service, with its
 * `remotePhoneNumber` and `body` still sealed.
 *
 * @interface SealedPhoneMessageEntity
 * @property {string} remotePhoneNumber The sealed other party's number. Undefined where the
 *  number was withheld.
 * @property {string} body The sealed message text.
 */
export interface SealedPhoneMessageEntity extends PartialPhoneMessageEntity {
  remotePhoneNumber?: string
  body: string
}

/**
 * Core entity representation of a phone message business rule, with its sealed fields
 * made readable.
 *
 * @interface PhoneMessageEntity
 * @property {string} remotePhoneNumber The other party's number. Undefined where the number
 *  was withheld.
 * @property {string} body The message text.
 */
export interface PhoneMessageEntity extends PartialPhoneMessageEntity {
  remotePhoneNumber?: string
  body: string
}

/**
 * Core entity representation of a notification that a phone message changed.
 *
 * @interface PhoneMessageEventEntity
 * @property {string} id Unique identifier of the phone message.
 * @property {string} phoneNumberId Unique identifier of the message's phone number.
 * @property {string} conversationId Unique identifier of the message's conversation.
 * @property {PhoneMessageTypeEntity} type The kind of message.
 * @property {PhoneMessageDirectionEntity} direction Whether the message was received or sent.
 * @property {PhoneMessageChangeTypeEntity} changeType The change being reported.
 * @property {boolean} seen Whether the user has marked the message as read.
 * @property {string} owner Unique identifier of the user who owns the message.
 * @property {OwnerEntity[]} owners Owners taken from the ownership proofs.
 * @property {number} version Version of the message after the change.
 * @property {Date} updatedAt Date for when the message was last updated.
 */
export interface PhoneMessageEventEntity {
  id: string
  phoneNumberId: string
  conversationId: string
  type: PhoneMessageTypeEntity
  direction: PhoneMessageDirectionEntity
  changeType: PhoneMessageChangeTypeEntity
  seen: boolean
  owner: string
  owners: OwnerEntity[]
  version: number
  updatedAt: Date
}

/**
 * Core entity representation of the outcome of a batch operation on phone messages.
 *
 * @interface PhoneMessageBatchResultEntity
 * @property {string[]} succeededIds Unique identifiers of the messages the operation applied to.
 * @property {string[]} failedIds Unique identifiers of the messages that were not found or do
 *  not belong to the caller.
 */
export interface PhoneMessageBatchResultEntity {
  succeededIds: string[]
  failedIds: string[]
}
