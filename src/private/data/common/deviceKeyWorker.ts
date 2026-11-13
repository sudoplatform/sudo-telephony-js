/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Base64,
  Buffer as BufferUtil,
  DecodeError,
  DefaultLogger,
  DefaultSudoKeyArchive,
  EncryptionAlgorithm,
  FatalError,
  KeyArchiveKeyType,
  Logger,
  PublicKey,
  PublicKeyFormat,
  SudoKeyManager,
} from '@sudoplatform/sudo-common'
import { Mutex } from 'async-mutex'
import { v4 } from 'uuid'
import { InvalidArgumentError } from '../../../public/errors'
import { rsaPublicKeyFromRSAPrivateKey } from './rsaPublicKey'

/**
 * The only algorithm the SDK asks the service to seal messages with: an
 * RSA-OAEP wrapped AES-256 key, then AES-GCM ciphertext.
 */
export const SEALING_ALGORITHM = 'RSAEncryptionOAEPAESGCM'

/**
 * Name of the password entry holding the ID of the singleton key pair. It is stored as a
 * password so that key export and import carry it with the private key.
 */
export const SINGLETON_PUBLIC_KEY_ID = 'singleton-key-id'

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

/**
 * The outcome of `createSingletonKeyPairIfAbsent`.
 *
 * @interface SingletonKeyPairResult
 * @property {boolean} created Whether the key pair had to be created.
 * @property {string} keyId Unique identifier of the singleton key pair.
 */
export interface SingletonKeyPairResult {
  created: boolean
  keyId: string
}

export interface DeviceKeyWorker {
  /**
   * Generate a new key pair and keep it on the device.
   *
   * @returns {DeviceKey} The public half of the new key pair.
   */
  generateKeyPair(): Promise<DeviceKey>

  /**
   * Get the key pair shared by every phone number provisioned while the client enforces a
   * singleton key pair. Never creates it; see `createSingletonKeyPairIfAbsent`.
   *
   * @returns {DeviceKey | undefined} The public half of the singleton key pair, or
   *  `undefined` if no singleton is recorded or its private key isn't on this device.
   * @throws {FatalError} If the device holds the singleton's private key without its public
   *  key. `importKeys` restores the public key, so that means the key store is inconsistent.
   */
  getSingletonKeyPair(): Promise<DeviceKey | undefined>

  /**
   * Create the singleton key pair if this device doesn't have it.
   *
   * The key pair's ID is recorded in the key store, so `exportKeys` and `importKeys` carry it
   * and `removeAllKeys` clears it. If the recorded key pair's private key is missing, a new
   * singleton replaces it, and the replacement is logged as an error.
   *
   * @returns {SingletonKeyPairResult} Whether the key pair was created, and its ID.
   * @throws {FatalError} If the device holds the singleton's private key without its public
   *  key.
   */
  createSingletonKeyPairIfAbsent(): Promise<SingletonKeyPairResult>

  /**
   * Remove a key pair from the device. The singleton key pair is never removed, so the
   * call does nothing for it. Removing a key pair that doesn't exist succeeds.
   *
   * @param {string} keyId The unique identifier of the key pair.
   */
  removeKeyPair(keyId: string): Promise<void>

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
  /**
   * Guards every read-modify-write of the singleton key pair's record, so concurrent calls
   * can't each create a singleton or remove one another is recording.
   */
  private readonly singletonLock = new Mutex()

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
    return this.toDeviceKey(keyPairId, publicKey)
  }

  async getSingletonKeyPair(): Promise<DeviceKey | undefined> {
    return await this.singletonLock.runExclusive(() =>
      this.existingSingletonKeyPair(),
    )
  }

  async createSingletonKeyPairIfAbsent(): Promise<SingletonKeyPairResult> {
    return await this.singletonLock.runExclusive(async () => {
      const existing = await this.existingSingletonKeyPair()
      if (existing) {
        return { created: false, keyId: existing.id }
      }
      // No singleton yet, or its private key is missing: start a new one. Generate before
      // recording the ID, so a failed generation never leaves the record naming a key that
      // doesn't exist.
      const missingKeyId = await this.getSingletonKeyPairId()
      const key = await this.generateKeyPair()
      try {
        await this.recordSingletonKeyPairId(key.id)
      } catch (err) {
        await this.keyManager.deleteKeyPair(key.id).catch(() => undefined)
        throw err
      }
      if (missingKeyId) {
        // Numbers sealed to the missing key can't be read here until a key archive
        // containing it is imported.
        this.log.error(
          'singleton key pair has no private key on this device, replaced it',
          { missingKeyId, replacementKeyId: key.id },
        )
      } else {
        this.log.info('created the singleton key pair', { keyId: key.id })
      }
      return { created: true, keyId: key.id }
    })
  }

  async removeKeyPair(keyId: string): Promise<void> {
    await this.singletonLock.runExclusive(async () => {
      if (keyId === (await this.getSingletonKeyPairId())) {
        this.log.info('not removing the singleton key pair', { keyId })
        return
      }
      await this.keyManager.deleteKeyPair(keyId)
    })
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

    // Import replaces the singleton key pair's record along with every key.
    await this.singletonLock.runExclusive(async () => {
      // Snapshot every existing key, so that a failure while saving the imported keys
      // can be rolled back rather than leaving the device without its keys.
      const snapshot = await this.snapshotKeys()

      await this.keyManager.removeAllKeys()
      try {
        await unarchiver.saveKeys()
        await this.restoreSingletonPublicKey()
      } catch (err) {
        this.log.error(
          'failed to save imported keys, restoring previous keys',
          {
            err,
          },
        )
        await this.restoreKeys(snapshot)
        throw err
      }
    })
  }

  async removeAllKeys(): Promise<void> {
    await this.keyManager.removeAllKeys()
  }

  private toDeviceKey(keyId: string, publicKey: PublicKey): DeviceKey {
    return {
      id: keyId,
      algorithm: SEALING_ALGORITHM,
      data: Base64.encode(publicKey.keyData),
      format: publicKey.keyFormat,
    }
  }

  private async getSingletonKeyPairId(): Promise<string | undefined> {
    const stored = await this.keyManager.getPassword(SINGLETON_PUBLIC_KEY_ID)
    if (!stored || stored.byteLength === 0) {
      return undefined
    }
    return BufferUtil.toString(stored)
  }

  private async recordSingletonKeyPairId(keyId: string): Promise<void> {
    await this.keyManager.deletePassword(SINGLETON_PUBLIC_KEY_ID)
    await this.keyManager.addPassword(
      BufferUtil.fromString(keyId),
      SINGLETON_PUBLIC_KEY_ID,
    )
  }

  /**
   * The singleton key pair, or `undefined` if none is recorded or its private key isn't on
   * this device. Call while holding the singleton lock.
   */
  private async existingSingletonKeyPair(): Promise<DeviceKey | undefined> {
    const keyId = await this.getSingletonKeyPairId()
    if (!keyId) {
      return undefined
    }
    const publicKey = await this.keyManager.getPublicKey(keyId)
    if (publicKey) {
      return this.toDeviceKey(keyId, publicKey)
    }
    // Import restores the public key, so a private key without one means the key store is
    // inconsistent. Treating it as missing would replace the key and split numbers across
    // two "singleton" keys, so fail instead.
    if (await this.keyManager.doesPrivateKeyExist(keyId)) {
      throw new FatalError(
        `Singleton key pair ${keyId} has a private key but no public key`,
      )
    }
    return undefined
  }

  /**
   * Stores the singleton key pair's public key again after an import. `exportKeys` leaves
   * public keys out of the archive, so an import restores only the private key. Provisioning
   * registers the public key, so it is derived from the private key here, once.
   */
  private async restoreSingletonPublicKey(): Promise<void> {
    const keyId = await this.getSingletonKeyPairId()
    if (!keyId || (await this.keyManager.getPublicKey(keyId))) {
      return
    }
    const privateKey =
      await this.keyManager.exportPrivateKeyAsRSAPrivateKey(keyId)
    if (!privateKey) {
      return
    }
    await this.keyManager.importPublicKeyFromRSAPublicKey(
      keyId,
      rsaPublicKeyFromRSAPrivateKey(privateKey),
    )
    this.log.info(
      'restored the public key of the singleton key pair from its private key',
      { keyId },
    )
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
