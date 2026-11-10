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
import { DefaultDeviceKeyWorker } from '../../../../../src/private/data/common/deviceKeyWorker'
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
  })
})
