/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { PublicKeyFormat } from '@sudoplatform/sudo-common'
import { KeyFormatTransformer } from '../../../../../../src/private/data/phone-number/transformer/keyFormatTransformer'

describe('KeyFormatTransformer Test Suite', () => {
  const instanceUnderTest = new KeyFormatTransformer()

  describe('fromEntityToGraphQL', () => {
    it.each`
      input                           | expected
      ${PublicKeyFormat.RSAPublicKey} | ${'RSA_PUBLIC_KEY'}
      ${PublicKeyFormat.SPKI}         | ${'SPKI'}
    `('transforms $input to $expected', ({ input, expected }) => {
      expect(instanceUnderTest.fromEntityToGraphQL(input)).toBe(expected)
    })
  })
})
