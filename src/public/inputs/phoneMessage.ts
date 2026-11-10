/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { SortOrder } from '../typings/phoneMessage'
import { Pagination } from './common'

/**
 * Input for `SudoTelephonyClient.listPhoneMessagesForPhoneNumberId`.
 *
 * @interface ListPhoneMessagesForPhoneNumberIdInput
 * @property {string} phoneNumberId The identifier of the phone number whose messages to list.
 * @property {SortOrder} sortOrder Order of the messages. When omitted the service returns newest first.
 */
export interface ListPhoneMessagesForPhoneNumberIdInput extends Pagination {
  phoneNumberId: string
  sortOrder?: SortOrder
}

/**
 * Input for `SudoTelephonyClient.listPhoneMessagesForConversationId`.
 *
 * @interface ListPhoneMessagesForConversationIdInput
 * @property {string} conversationId The identifier of the conversation whose messages to list.
 * @property {SortOrder} sortOrder Order of the messages. When omitted the service returns newest first.
 */
export interface ListPhoneMessagesForConversationIdInput extends Pagination {
  conversationId: string
  sortOrder?: SortOrder
}

/**
 * Input for `SudoTelephonyClient.deletePhoneMessages`.
 *
 * @interface DeletePhoneMessagesInput
 * @property {string[]} ids A list of one or more identifiers of the phone messages to be deleted. There is a
 *  limit of 100 phone message ids per API request. Exceeding this will cause an error to be thrown.
 */
export interface DeletePhoneMessagesInput {
  ids: string[]
}

/**
 * Input for `SudoTelephonyClient.updatePhoneMessages`.
 *
 * @interface UpdatePhoneMessagesInput
 * @property {string[]} ids A list of one or more identifiers of the phone messages to be updated. There is a
 *  limit of 100 phone message ids per API request. Exceeding this will cause an error to be thrown.
 * @property {boolean} seen The read state to set on every message in `ids`.
 */
export interface UpdatePhoneMessagesInput {
  ids: string[]
  seen: boolean
}
