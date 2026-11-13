/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The outcome of creating one key if it was absent.
 *
 * @interface CreateKeyIfAbsentResult
 * @property {boolean} created Whether the key had to be created. `true` means the device's
 *  key material changed, so a key backup made before the call doesn't contain it.
 * @property {string} keyId The key's identifier.
 */
export interface CreateKeyIfAbsentResult {
  created: boolean
  keyId: string
}

/**
 * Result of {@link SudoTelephonyClient.createSingletonKeysIfAbsent}.
 *
 * @interface CreateSingletonKeysIfAbsentResult
 * @property {CreateKeyIfAbsentResult} keyPair The singleton key pair every phone number is
 *  sealed to.
 */
export interface CreateSingletonKeysIfAbsentResult {
  keyPair: CreateKeyIfAbsentResult
}
