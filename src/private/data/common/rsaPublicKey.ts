/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DecodeError } from '@sudoplatform/sudo-common'

const DER_SEQUENCE = 0x30
const DER_INTEGER = 0x02

interface DerElement {
  tag: number
  /** Offset of the first byte of the element, including its tag. */
  start: number
  /** Offset of the first byte of the element's contents. */
  contentStart: number
  /** Offset just past the element's last byte. */
  end: number
}

const readElement = (bytes: Uint8Array, offset: number): DerElement => {
  if (offset + 2 > bytes.length) {
    throw new DecodeError('DER element is truncated')
  }
  const tag = bytes[offset]
  const firstLengthByte = bytes[offset + 1]
  let length = firstLengthByte
  let headerLength = 2
  if (firstLengthByte & 0x80) {
    const lengthByteCount = firstLengthByte & 0x7f
    if (lengthByteCount === 0 || lengthByteCount > 4) {
      throw new DecodeError('DER element has an unsupported length encoding')
    }
    if (offset + 2 + lengthByteCount > bytes.length) {
      throw new DecodeError('DER element length is truncated')
    }
    length = 0
    for (let i = 0; i < lengthByteCount; i++) {
      length = length * 256 + bytes[offset + 2 + i]
    }
    headerLength += lengthByteCount
  }
  const contentStart = offset + headerLength
  const end = contentStart + length
  if (end > bytes.length) {
    throw new DecodeError('DER element runs past the end of the data')
  }
  return { tag, start: offset, contentStart, end }
}

const encodeLength = (length: number): number[] => {
  if (length < 0x80) {
    return [length]
  }
  const bytes: number[] = []
  for (
    let remaining = length;
    remaining > 0;
    remaining = Math.floor(remaining / 256)
  ) {
    bytes.unshift(remaining & 0xff)
  }
  return [0x80 | bytes.length, ...bytes]
}

/**
 * Derives the PKCS#1 `RSAPublicKey` of a PKCS#1 `RSAPrivateKey`.
 *
 * An `RSAPrivateKey` is `SEQUENCE { version, modulus, publicExponent, ... }` and an
 * `RSAPublicKey` is `SEQUENCE { modulus, publicExponent }`, so the public key is built from
 * the private key's second and third elements, copied as they are.
 *
 * @param {ArrayBuffer} rsaPrivateKey The DER encoded PKCS#1 private key.
 * @returns {ArrayBuffer} The DER encoded PKCS#1 public key.
 * @throws {DecodeError} If `rsaPrivateKey` is not a DER encoded `RSAPrivateKey`.
 */
export const rsaPublicKeyFromRSAPrivateKey = (
  rsaPrivateKey: ArrayBuffer,
): ArrayBuffer => {
  const bytes = new Uint8Array(rsaPrivateKey)
  const sequence = readElement(bytes, 0)
  if (sequence.tag !== DER_SEQUENCE) {
    throw new DecodeError('RSA private key is not a DER sequence')
  }
  const version = readElement(bytes, sequence.contentStart)
  const modulus = readElement(bytes, version.end)
  const publicExponent = readElement(bytes, modulus.end)
  for (const element of [version, modulus, publicExponent]) {
    if (element.tag !== DER_INTEGER || element.end > sequence.end) {
      throw new DecodeError(
        'RSA private key does not start with three integers',
      )
    }
  }
  const contents = bytes.slice(modulus.start, publicExponent.end)
  return new Uint8Array([
    DER_SEQUENCE,
    ...encodeLength(contents.length),
    ...contents,
  ]).buffer
}
