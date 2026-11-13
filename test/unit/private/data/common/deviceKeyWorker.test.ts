/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Base64,
  DecodeError,
  DefaultSudoKeyManager,
  FatalError,
  PublicKeyFormat,
  SudoKeyManager,
} from '@sudoplatform/sudo-common'
import { WebSudoCryptoProvider } from '@sudoplatform/sudo-web-crypto-provider'
import {
  anything,
  capture,
  instance,
  mock,
  reset,
  verify,
  when,
} from 'ts-mockito'
import {
  DefaultDeviceKeyWorker,
  SINGLETON_PUBLIC_KEY_ID,
} from '../../../../../src/private/data/common/deviceKeyWorker'
import { InvalidArgumentError } from '../../../../../src/public/errors'
import { sealString } from '../../../../util/sealing'

describe('DefaultDeviceKeyWorker Test Suite', () => {
  describe('with a mock key manager', () => {
    const mockKeyManager = mock<SudoKeyManager>()
    let instanceUnderTest: DefaultDeviceKeyWorker

    beforeEach(() => {
      reset(mockKeyManager)
      instanceUnderTest = new DefaultDeviceKeyWorker(instance(mockKeyManager))
    })

    describe('generateKeyPair', () => {
      it('generates a key pair and returns its public half', async () => {
        const keyData = new TextEncoder().encode('publicKey').buffer
        when(mockKeyManager.generateKeyPair(anything())).thenResolve()
        when(mockKeyManager.getPublicKey(anything())).thenResolve({
          keyData,
          keyFormat: PublicKeyFormat.SPKI,
        })

        const result = await instanceUnderTest.generateKeyPair()

        const [generatedId] = capture(mockKeyManager.generateKeyPair).first()
        const [fetchedId] = capture(mockKeyManager.getPublicKey).first()
        expect(fetchedId).toBe(generatedId)
        expect(result).toStrictEqual({
          id: generatedId,
          algorithm: 'RSAEncryptionOAEPAESGCM',
          data: Base64.encode(keyData),
          format: PublicKeyFormat.SPKI,
        })
      })

      it('generates a new key ID each time', async () => {
        when(mockKeyManager.getPublicKey(anything())).thenResolve({
          keyData: new ArrayBuffer(1),
          keyFormat: PublicKeyFormat.RSAPublicKey,
        })

        const first = await instanceUnderTest.generateKeyPair()
        const second = await instanceUnderTest.generateKeyPair()

        expect(first.id).not.toBe(second.id)
        verify(mockKeyManager.generateKeyPair(anything())).twice()
      })

      it('throws FatalError when the public key is missing', async () => {
        when(mockKeyManager.getPublicKey(anything())).thenResolve(undefined)

        await expect(instanceUnderTest.generateKeyPair()).rejects.toThrow(
          FatalError,
        )
      })
    })

    describe('privateKeyExists', () => {
      it.each([true, false])(
        'returns %s from the key manager',
        async (exists) => {
          when(mockKeyManager.doesPrivateKeyExist('keyId')).thenResolve(exists)

          await expect(
            instanceUnderTest.privateKeyExists('keyId'),
          ).resolves.toBe(exists)
        },
      )
    })

    describe('removeAllKeys', () => {
      it('removes every key from the key manager', async () => {
        await instanceUnderTest.removeAllKeys()

        verify(mockKeyManager.removeAllKeys()).once()
      })
    })
  })

  describe('with a real key manager', () => {
    // Each provider has its own in-memory store. They share a namespace, as two
    // devices running the SDK do, because a key archive matches keys by namespace.
    const newKeyManager = () =>
      new DefaultSudoKeyManager(
        new WebSudoCryptoProvider(
          'SudoTelephonyClient',
          'com.sudoplatform.appservicename',
        ),
      )
    let keyManager: SudoKeyManager
    let instanceUnderTest: DefaultDeviceKeyWorker

    beforeEach(() => {
      keyManager = newKeyManager()
      instanceUnderTest = new DefaultDeviceKeyWorker(keyManager)
    })

    describe('unsealString', () => {
      it('unseals a value sealed in the service format', async () => {
        const { id } = await instanceUnderTest.generateKeyPair()
        const sealed = await sealString(keyManager, id, 'Hello, 世界')

        await expect(instanceUnderTest.unsealString(id, sealed)).resolves.toBe(
          'Hello, 世界',
        )
      })

      it('unseals an empty value', async () => {
        const { id } = await instanceUnderTest.generateKeyPair()
        const sealed = await sealString(keyManager, id, '')

        await expect(instanceUnderTest.unsealString(id, sealed)).resolves.toBe(
          '',
        )
      })

      it('rejects a value too short to hold a key, nonce and tag', async () => {
        const { id } = await instanceUnderTest.generateKeyPair()

        await expect(
          instanceUnderTest.unsealString(
            id,
            Base64.encode(new ArrayBuffer(283)),
          ),
        ).rejects.toThrow(DecodeError)
      })

      it('fails with a key that did not seal the value', async () => {
        const sealing = await instanceUnderTest.generateKeyPair()
        const other = await instanceUnderTest.generateKeyPair()
        const sealed = await sealString(keyManager, sealing.id, 'secret')

        await expect(
          instanceUnderTest.unsealString(other.id, sealed),
        ).rejects.toThrow()
      })

      it('fails when the ciphertext has been altered', async () => {
        const { id } = await instanceUnderTest.generateKeyPair()
        const sealed = new Uint8Array(
          Base64.decode(await sealString(keyManager, id, 'secret')),
        )
        sealed[sealed.length - 1] ^= 0xff

        await expect(
          instanceUnderTest.unsealString(id, Base64.encode(sealed.buffer)),
        ).rejects.toThrow()
      })
    })

    describe('exportKeys and importKeys', () => {
      it('makes sealed values readable on another key store', async () => {
        const { id } = await instanceUnderTest.generateKeyPair()
        const sealed = await sealString(keyManager, id, 'moved')
        const target = new DefaultDeviceKeyWorker(newKeyManager())
        await expect(target.privateKeyExists(id)).resolves.toBe(false)

        await target.importKeys(await instanceUnderTest.exportKeys())

        await expect(target.privateKeyExists(id)).resolves.toBe(true)
        await expect(target.unsealString(id, sealed)).resolves.toBe('moved')
      })

      it('replaces rather than merges the existing keys', async () => {
        const sourceKey = await instanceUnderTest.generateKeyPair()
        const target = new DefaultDeviceKeyWorker(newKeyManager())
        const targetOwnKey = await target.generateKeyPair()

        await target.importKeys(await instanceUnderTest.exportKeys())

        await expect(target.privateKeyExists(sourceKey.id)).resolves.toBe(true)
        await expect(target.privateKeyExists(targetOwnKey.id)).resolves.toBe(
          false,
        )
      })

      it('carries every key in the archive', async () => {
        const first = await instanceUnderTest.generateKeyPair()
        const second = await instanceUnderTest.generateKeyPair()
        const target = new DefaultDeviceKeyWorker(newKeyManager())

        await target.importKeys(await instanceUnderTest.exportKeys())

        await expect(target.privateKeyExists(first.id)).resolves.toBe(true)
        await expect(target.privateKeyExists(second.id)).resolves.toBe(true)
      })

      it('excludes public keys from the archive', async () => {
        const { id } = await instanceUnderTest.generateKeyPair()
        const target = newKeyManager()

        await new DefaultDeviceKeyWorker(target).importKeys(
          await instanceUnderTest.exportKeys(),
        )

        await expect(target.getPublicKey(id)).resolves.toBeUndefined()
      })

      it('rejects an empty archive', async () => {
        await expect(
          instanceUnderTest.importKeys(new ArrayBuffer(0)),
        ).rejects.toThrow(InvalidArgumentError)
      })

      it('restores the existing keys when saving the imported keys fails', async () => {
        const sourceKey = await instanceUnderTest.generateKeyPair()
        const targetKeyManager = newKeyManager()
        const target = new DefaultDeviceKeyWorker(targetKeyManager)
        const targetOwnKey = await target.generateKeyPair()
        const sealed = await sealString(
          targetKeyManager,
          targetOwnKey.id,
          'kept',
        )
        const archive = await instanceUnderTest.exportKeys()
        vi.spyOn(targetKeyManager, 'addPrivateKey').mockRejectedValueOnce(
          new Error('storage full'),
        )

        await expect(target.importKeys(archive)).rejects.toThrow('storage full')

        // The device is left as it was: its own key is back and still unseals, and
        // nothing from the archive was kept.
        await expect(target.privateKeyExists(targetOwnKey.id)).resolves.toBe(
          true,
        )
        await expect(
          target.unsealString(targetOwnKey.id, sealed),
        ).resolves.toBe('kept')
        await expect(target.privateKeyExists(sourceKey.id)).resolves.toBe(false)
      })

      it('keeps the existing keys when the archive cannot be read', async () => {
        const { id } = await instanceUnderTest.generateKeyPair()

        await expect(
          instanceUnderTest.importKeys(
            new TextEncoder().encode('this is not a key archive').buffer,
          ),
        ).rejects.toThrow()

        await expect(instanceUnderTest.privateKeyExists(id)).resolves.toBe(true)
      })
    })

    describe('getSingletonKeyPair', () => {
      it('returns undefined and creates nothing when there is no singleton', async () => {
        const generate = vi.spyOn(keyManager, 'generateKeyPair')

        await expect(
          instanceUnderTest.getSingletonKeyPair(),
        ).resolves.toBeUndefined()

        expect(generate).not.toHaveBeenCalled()
        await expect(
          keyManager.getPassword(SINGLETON_PUBLIC_KEY_ID),
        ).resolves.toBeUndefined()
      })

      it('returns the singleton once it has been created', async () => {
        const { keyId } =
          await instanceUnderTest.createSingletonKeyPairIfAbsent()

        const key = await instanceUnderTest.getSingletonKeyPair()

        expect(key?.id).toBe(keyId)
        expect(key?.algorithm).toBe('RSAEncryptionOAEPAESGCM')
      })

      it('returns undefined when the singleton private key is missing', async () => {
        const { keyId } =
          await instanceUnderTest.createSingletonKeyPairIfAbsent()
        await keyManager.deleteKeyPair(keyId)

        await expect(
          instanceUnderTest.getSingletonKeyPair(),
        ).resolves.toBeUndefined()
      })

      it('throws FatalError for a private key without its public key', async () => {
        const { keyId } =
          await instanceUnderTest.createSingletonKeyPairIfAbsent()
        await keyManager.deletePublicKey(keyId)

        await expect(instanceUnderTest.getSingletonKeyPair()).rejects.toThrow(
          FatalError,
        )
      })
    })

    describe('createSingletonKeyPairIfAbsent', () => {
      it('creates the singleton, then reports it exists with the same key', async () => {
        const first = await instanceUnderTest.createSingletonKeyPairIfAbsent()
        const second = await instanceUnderTest.createSingletonKeyPairIfAbsent()

        expect(first.created).toBe(true)
        expect(second).toStrictEqual({ created: false, keyId: first.keyId })
        await expect(
          instanceUnderTest.privateKeyExists(first.keyId),
        ).resolves.toBe(true)
        const storedId = await keyManager.getPassword(SINGLETON_PUBLIC_KEY_ID)
        expect(new TextDecoder().decode(storedId)).toBe(first.keyId)
      })

      it('is distinct from generated key pairs', async () => {
        const generated = await instanceUnderTest.generateKeyPair()

        const { keyId } =
          await instanceUnderTest.createSingletonKeyPairIfAbsent()

        expect(keyId).not.toBe(generated.id)
      })

      it('creates one key pair for concurrent first calls', async () => {
        const results = await Promise.all([
          instanceUnderTest.createSingletonKeyPairIfAbsent(),
          instanceUnderTest.createSingletonKeyPairIfAbsent(),
          instanceUnderTest.createSingletonKeyPairIfAbsent(),
        ])

        expect(new Set(results.map((result) => result.keyId)).size).toBe(1)
        expect(results.filter((result) => result.created)).toHaveLength(1)
      })

      it('replaces a singleton whose private key is missing', async () => {
        const lost = await instanceUnderTest.createSingletonKeyPairIfAbsent()
        await keyManager.deleteKeyPair(lost.keyId)

        const replacement =
          await instanceUnderTest.createSingletonKeyPairIfAbsent()

        expect(replacement.created).toBe(true)
        expect(replacement.keyId).not.toBe(lost.keyId)
        await expect(
          instanceUnderTest.getSingletonKeyPair(),
        ).resolves.toMatchObject({ id: replacement.keyId })
      })

      it('fails for a private key without its public key, without replacing it', async () => {
        const { keyId } =
          await instanceUnderTest.createSingletonKeyPairIfAbsent()
        await keyManager.deletePublicKey(keyId)

        await expect(
          instanceUnderTest.createSingletonKeyPairIfAbsent(),
        ).rejects.toThrow(FatalError)
        const storedId = await keyManager.getPassword(SINGLETON_PUBLIC_KEY_ID)
        expect(new TextDecoder().decode(storedId)).toBe(keyId)
      })

      it('does not record an ID when key generation fails', async () => {
        vi.spyOn(keyManager, 'generateKeyPair').mockRejectedValueOnce(
          new Error('generation failed'),
        )

        await expect(
          instanceUnderTest.createSingletonKeyPairIfAbsent(),
        ).rejects.toThrow('generation failed')
        await expect(
          keyManager.getPassword(SINGLETON_PUBLIC_KEY_ID),
        ).resolves.toBeUndefined()
      })

      it('starts a fresh singleton after removeAllKeys', async () => {
        const before = await instanceUnderTest.createSingletonKeyPairIfAbsent()

        await instanceUnderTest.removeAllKeys()

        const after = await instanceUnderTest.createSingletonKeyPairIfAbsent()
        expect(after.created).toBe(true)
        expect(after.keyId).not.toBe(before.keyId)
      })
    })

    describe('importKeys with a singleton', () => {
      it("restores the singleton's public key so it can be used on another device", async () => {
        const { keyId } =
          await instanceUnderTest.createSingletonKeyPairIfAbsent()
        const original = await instanceUnderTest.getSingletonKeyPair()
        const sealed = await sealString(keyManager, keyId, 'shared')
        const targetKeyManager = newKeyManager()
        const target = new DefaultDeviceKeyWorker(targetKeyManager)

        await target.importKeys(await instanceUnderTest.exportKeys())

        await expect(target.getSingletonKeyPair()).resolves.toStrictEqual(
          original,
        )
        await expect(
          target.createSingletonKeyPairIfAbsent(),
        ).resolves.toStrictEqual({ created: false, keyId })
        await expect(target.unsealString(keyId, sealed)).resolves.toBe('shared')
      })

      it('restores no public key when the archive has no singleton', async () => {
        const { id } = await instanceUnderTest.generateKeyPair()
        const targetKeyManager = newKeyManager()
        const target = new DefaultDeviceKeyWorker(targetKeyManager)

        await target.importKeys(await instanceUnderTest.exportKeys())

        await expect(target.getSingletonKeyPair()).resolves.toBeUndefined()
        await expect(targetKeyManager.getPublicKey(id)).resolves.toBeUndefined()
      })
    })

    describe('removeKeyPair', () => {
      it('removes both halves of a key pair', async () => {
        const { id } = await instanceUnderTest.generateKeyPair()

        await instanceUnderTest.removeKeyPair(id)

        await expect(instanceUnderTest.privateKeyExists(id)).resolves.toBe(
          false,
        )
        await expect(keyManager.getPublicKey(id)).resolves.toBeUndefined()
      })

      it('never removes the singleton key pair', async () => {
        const { keyId } =
          await instanceUnderTest.createSingletonKeyPairIfAbsent()

        await instanceUnderTest.removeKeyPair(keyId)

        await expect(instanceUnderTest.privateKeyExists(keyId)).resolves.toBe(
          true,
        )
        await expect(
          instanceUnderTest.getSingletonKeyPair(),
        ).resolves.toMatchObject({ id: keyId })
      })

      it('does nothing for a key that is not on the device', async () => {
        await expect(
          instanceUnderTest.removeKeyPair('missingKeyId'),
        ).resolves.toBeUndefined()
      })
    })
  })
})
