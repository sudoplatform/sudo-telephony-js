/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The Sudo Platform SDK representation of the outcome of an operation applied to a batch of phone messages.
 *
 * A batch can partially succeed, so a message the service could not act on is reported in `failedIds` rather
 * than failing the whole call.
 *
 * @interface PhoneMessageBatchResult
 * @property {string[]} succeededIds List of identifiers of the phone messages the operation applied to.
 * @property {string[]} failedIds List of identifiers of the phone messages that were not found or do not
 *  belong to the caller.
 */
export interface PhoneMessageBatchResult {
  succeededIds: string[]
  failedIds: string[]
}
