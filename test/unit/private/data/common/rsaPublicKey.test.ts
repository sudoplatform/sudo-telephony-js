/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DecodeError,
  DefaultSudoKeyManager,
  SudoKeyManager,
} from '@sudoplatform/sudo-common'
import { WebSudoCryptoProvider } from '@sudoplatform/sudo-web-crypto-provider'
import { rsaPublicKeyFromRSAPrivateKey } from '../../../../../src/private/data/common/rsaPublicKey'

describe('rsaPublicKeyFromRSAPrivateKey Test Suite', () => {
  let keyManager: SudoKeyManager

  beforeEach(() => {
    keyManager = new DefaultSudoKeyManager(
      new WebSudoCryptoProvider(
        'SudoTelephonyClient',
        'com.sudoplatform.appservicename',
      ),
    )
  })

  it.each([2048, 4096])(
    'derives the public key of a %i-bit key pair',
    async (rsaKeySize) => {
      keyManager = new DefaultSudoKeyManager(
        new WebSudoCryptoProvider(
          'SudoTelephonyClient',
          'com.sudoplatform.appservicename',
          undefined,
          rsaKeySize,
        ),
      )
      await keyManager.generateKeyPair('keyId')
      const privateKey =
        await keyManager.exportPrivateKeyAsRSAPrivateKey('keyId')
      const expected = await keyManager.exportPublicKeyAsRSAPublicKey('keyId')

      const derived = rsaPublicKeyFromRSAPrivateKey(privateKey!)

      expect(new Uint8Array(derived)).toStrictEqual(new Uint8Array(expected!))
    },
  )

  it.each([
    ['empty data', []],
    ['a non-sequence', [0x02, 0x01, 0x00]],
    ['a truncated sequence', [0x30, 0x10, 0x02, 0x01, 0x00]],
    ['a sequence of one integer', [0x30, 0x03, 0x02, 0x01, 0x00]],
    [
      'a sequence that does not start with integers',
      [0x30, 0x09, 0x02, 0x01, 0x00, 0x04, 0x01, 0x01, 0x02, 0x01, 0x03],
    ],
  ])('rejects %s', (_, bytes) => {
    expect(() =>
      rsaPublicKeyFromRSAPrivateKey(new Uint8Array(bytes).buffer),
    ).toThrow(DecodeError)
  })
})
