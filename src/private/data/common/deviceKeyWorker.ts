/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Base64,
  DecodeError,
  DefaultLogger,
  DefaultSudoKeyArchive,
  EncryptionAlgorithm,
  FatalError,
  KeyArchiveKeyType,
  Logger,
  PublicKeyFormat,
  SudoKeyManager,
} from '@sudoplatform/sudo-common'
import { v4 } from 'uuid'
import { InvalidArgumentError } from '../../../public/errors'

/**
 * The only algorithm the SDK asks the service to seal messages with: an
 * RSA-OAEP wrapped AES-256 key, then AES-GCM ciphertext.
 */
export const SEALING_ALGORITHM = 'RSAEncryptionOAEPAESGCM'

/** Size of the RSA-OAEP encrypted AES key at the start of a sealed value. */
const RSA_BLOCK_SIZE = 256
/** Size of the AES-GCM nonce that follows the encrypted key. */
const AES_GCM_IV_SIZE = 12
/** Size of the AES-GCM authentication tag at the end of the ciphertext. */
const AES_GCM_TAG_SIZE = 16
const MINIMUM_SEALED_SIZE = RSA_BLOCK_SIZE + AES_GCM_IV_SIZE + AES_GCM_TAG_SIZE

/**
 * The public half of a key pair held on this device.
 *
 * @interface DeviceKey
 * @property {string} id Unique identifier of the key pair.
 * @property {string} algorithm The algorithm the service must seal with.
 * @property {string} data The Base64 encoded public key.
 * @property {PublicKeyFormat} format The encoding of `data`.
 */
export interface DeviceKey {
  id: string
  algorithm: string
  data: string
  format: PublicKeyFormat
}

export interface DeviceKeyWorker {
  /**
   * Generate a new key pair and keep it on the device.
   *
   * @returns {DeviceKey} The public half of the new key pair.
   */
  generateKeyPair(): Promise<DeviceKey>

  /**
   * Whether this device holds the private key of a key pair.
   *
   * @param {string} keyId The unique identifier of the key pair.
   * @returns {boolean} True if the private key is held on this device.
   */
  privateKeyExists(keyId: string): Promise<boolean>

  /**
   * Unseal a value the service sealed with `SEALING_ALGORITHM`.
   *
   * @param {string} keyId The unique identifier of the key pair whose public key sealed the value.
   * @param {string} sealed The Base64 encoded sealed value.
   * @returns {string} The unsealed UTF-8 string.
   */
  unsealString(keyId: string, sealed: string): Promise<string>

  /**
   * Export the private keys held on this device as an archive.
   *
   * @returns {ArrayBuffer} The key archive.
   */
  exportKeys(): Promise<ArrayBuffer>

  /**
   * Replace the keys held on this device with those in an archive.
   *
   * @param {ArrayBuffer} archiveData The key archive, as returned by `exportKeys`.
   */
  importKeys(archiveData: ArrayBuffer): Promise<void>

  /**
   * Remove every key held on this device.
   */
  removeAllKeys(): Promise<void>
}

export class DefaultDeviceKeyWorker implements DeviceKeyWorker {
  private readonly log: Logger

  constructor(private readonly keyManager: SudoKeyManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async generateKeyPair(): Promise<DeviceKey> {
    const keyPairId = v4()
    await this.keyManager.generateKeyPair(keyPairId)
    const publicKey = await this.keyManager.getPublicKey(keyPairId)
    if (!publicKey) {
      this.log.error('generated key pair has no public key', { keyPairId })
      throw new FatalError('Could not generate public key pair')
    }
    return {
      id: keyPairId,
      algorithm: SEALING_ALGORITHM,
      data: Base64.encode(publicKey.keyData),
      format: publicKey.keyFormat,
    }
  }

  async privateKeyExists(keyId: string): Promise<boolean> {
    return await this.keyManager.doesPrivateKeyExist(keyId)
  }

  async unsealString(keyId: string, sealed: string): Promise<string> {
    const sealedBytes = new Uint8Array(Base64.decode(sealed))
    if (sealedBytes.byteLength < MINIMUM_SEALED_SIZE) {
      throw new DecodeError(
        `Sealed value is ${sealedBytes.byteLength} bytes, which cannot hold an encrypted key, a nonce and a tag`,
      )
    }
    const encryptedCipherKey = sealedBytes.slice(0, RSA_BLOCK_SIZE)
    const iv = sealedBytes.slice(
      RSA_BLOCK_SIZE,
      RSA_BLOCK_SIZE + AES_GCM_IV_SIZE,
    )
    const encryptedData = sealedBytes.slice(RSA_BLOCK_SIZE + AES_GCM_IV_SIZE)

    const cipherKey = await this.keyManager.decryptWithPrivateKey(
      keyId,
      encryptedCipherKey.buffer,
      { algorithm: EncryptionAlgorithm.RsaOaepSha1 },
    )
    if (!cipherKey) {
      throw new DecodeError('Could not extract AES key from sealed value')
    }
    let unsealed: ArrayBuffer
    try {
      // The ciphertext carries the authentication tag at its end, as Web Crypto expects.
      unsealed = await this.keyManager.decryptWithSymmetricKey(
        cipherKey,
        encryptedData.buffer,
        { iv: iv.buffer, algorithm: EncryptionAlgorithm.AesGcmNoPadding },
      )
    } finally {
      // Zero out our copy of the cipher key.
      new Uint8Array(cipherKey).fill(0)
    }
    return new TextDecoder('utf-8', { fatal: true }).decode(unsealed)
  }

  async exportKeys(): Promise<ArrayBuffer> {
    // Only private keys are needed to unseal, so public keys are left out.
    const keyArchive = new DefaultSudoKeyArchive(this.keyManager, {
      excludedKeyTypes: new Set([KeyArchiveKeyType.PublicKey]),
    })
    await keyArchive.loadKeys()
    return await keyArchive.archive(undefined)
  }

  async importKeys(archiveData: ArrayBuffer): Promise<void> {
    if (archiveData.byteLength === 0) {
      throw new InvalidArgumentError('The key archive is empty')
    }
    const unarchiver = new DefaultSudoKeyArchive(this.keyManager, {
      archiveData,
    })
    // Read the archive before removing anything, so an unreadable archive leaves the
    // existing keys in place.
    await unarchiver.unarchive(undefined)

    // Snapshot every existing key, so that a failure while saving the imported keys
    // can be rolled back rather than leaving the device without its keys.
    const snapshot = await this.snapshotKeys()

    await this.keyManager.removeAllKeys()
    try {
      await unarchiver.saveKeys()
    } catch (err) {
      this.log.error('failed to save imported keys, restoring previous keys', {
        err,
      })
      await this.restoreKeys(snapshot)
      throw err
    }
  }

  async removeAllKeys(): Promise<void> {
    await this.keyManager.removeAllKeys()
  }

  /**
   * Archives every key held on the device, of every type, in memory.
   */
  private async snapshotKeys(): Promise<ArrayBuffer> {
    const snapshot = new DefaultSudoKeyArchive(this.keyManager)
    await snapshot.loadKeys()
    return await snapshot.archive(undefined)
  }

  /**
   * Replaces whatever keys are on the device with those in a snapshot. A failure is
   * logged rather than thrown, so the caller can report the error that caused the
   * restore.
   */
  private async restoreKeys(snapshot: ArrayBuffer): Promise<void> {
    try {
      await this.keyManager.removeAllKeys()
      const restorer = new DefaultSudoKeyArchive(this.keyManager, {
        archiveData: snapshot,
      })
      await restorer.unarchive(undefined)
      await restorer.saveKeys()
    } catch (err) {
      this.log.error('failed to restore previous keys after a failed import', {
        err,
      })
    }
  }
}
