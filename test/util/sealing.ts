/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Base64,
  EncryptionAlgorithm,
  SudoKeyManager,
} from '@sudoplatform/sudo-common'

/**
 * Seals a value the way the telephony service does with `RSAEncryptionOAEPAESGCM`:
 * an RSA-OAEP (SHA-1) encrypted random AES-256 key, a 12-byte nonce, then the AES-GCM
 * ciphertext with its 16-byte tag, all Base64 encoded.
 */
export const sealString = async (
  keyManager: SudoKeyManager,
  keyId: string,
  plainText: string,
): Promise<string> => {
  const aesKey = crypto.getRandomValues(new Uint8Array(32))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encryptedKey = await keyManager.encryptWithPublicKey(
    keyId,
    aesKey.buffer,
    { algorithm: EncryptionAlgorithm.RsaOaepSha1 },
  )
  const encryptedData = await keyManager.encryptWithSymmetricKey(
    aesKey.buffer,
    new TextEncoder().encode(plainText).buffer,
    { iv: iv.buffer, algorithm: EncryptionAlgorithm.AesGcmNoPadding },
  )
  const sealed = new Uint8Array(
    encryptedKey.byteLength + iv.byteLength + encryptedData.byteLength,
  )
  sealed.set(new Uint8Array(encryptedKey), 0)
  sealed.set(iv, encryptedKey.byteLength)
  sealed.set(
    new Uint8Array(encryptedData),
    encryptedKey.byteLength + iv.byteLength,
  )
  return Base64.encode(sealed.buffer)
}
