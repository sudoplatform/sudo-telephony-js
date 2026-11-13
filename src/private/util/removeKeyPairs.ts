/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DeviceKeyWorker } from '../data/common/deviceKeyWorker'

/**
 * A key pair that could not be removed.
 *
 * @interface KeyPairRemovalFailure
 * @property {string} keyId Unique identifier of the key pair.
 * @property {unknown} error Why it could not be removed.
 */
export interface KeyPairRemovalFailure {
  keyId: string
  error: unknown
}

/**
 * Removes key pairs from the device, attempting every one even if some fail. The singleton
 * key pair is never removed.
 *
 * @param {DeviceKeyWorker} deviceKeyWorker The worker holding the device's keys.
 * @param {string[]} keyIds The unique identifiers of the key pairs to remove.
 * @returns {KeyPairRemovalFailure[]} The key pairs that could not be removed, in the order
 *  of `keyIds`. Empty if every removal succeeded.
 */
export const removeKeyPairs = async (
  deviceKeyWorker: DeviceKeyWorker,
  keyIds: string[],
): Promise<KeyPairRemovalFailure[]> => {
  const results = await Promise.allSettled(
    keyIds.map((keyId) => deviceKeyWorker.removeKeyPair(keyId)),
  )
  return results.flatMap((result, index) =>
    result.status === 'rejected'
      ? [{ keyId: keyIds[index], error: result.reason }]
      : [],
  )
}
