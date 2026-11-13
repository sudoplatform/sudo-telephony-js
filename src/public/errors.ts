/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { PhoneNumber } from './typings/phoneNumber'

class TelephonyError extends Error {
  constructor(msg?: string) {
    super(msg)
    this.name = this.constructor.name
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export class InvalidArgumentError extends TelephonyError {
  constructor(msg?: string) {
    super(msg)
  }
}

export class TelephonyServiceConfigNotFoundError extends TelephonyError {
  constructor(msg?: string) {
    super(msg)
  }
}

export class SupportedCountriesUnavailableError extends TelephonyError {
  constructor(msg?: string) {
    super(msg)
  }
}

export class UnsupportedCountryError extends TelephonyError {
  constructor(msg?: string) {
    super(msg)
  }
}

export class InvalidAreaCodeError extends TelephonyError {
  constructor(msg?: string) {
    super(msg)
  }
}

export class PhoneNumberSearchExpiredError extends TelephonyError {
  constructor(msg?: string) {
    super(msg)
  }
}

export class PhoneNumberNotInSearchError extends TelephonyError {
  constructor(msg?: string) {
    super(msg)
  }
}

export class PhoneNumberUnavailableError extends TelephonyError {
  constructor(msg?: string) {
    super(msg)
  }
}

export class PhoneNumberNotFoundError extends TelephonyError {
  constructor(msg?: string) {
    super(msg)
  }
}

export class InvalidPhoneNumberStateError extends TelephonyError {
  constructor(msg?: string) {
    super(msg)
  }
}

/**
 * The client's configuration doesn't support the operation, for example
 * `createSingletonKeysIfAbsent` on a client without `enforceSingletonKeyPair`.
 */
export class InvalidConfigError extends TelephonyError {
  constructor(msg?: string) {
    super(msg)
  }
}

/**
 * The client enforces a singleton key pair, but this device doesn't have it. Call
 * `createSingletonKeysIfAbsent` to create it, or import a key archive that contains it,
 * for example on a second device, before provisioning.
 */
export class SingletonKeyPairNotFoundError extends TelephonyError {
  constructor(msg?: string) {
    super(msg)
  }
}

/**
 * The phone number was deprovisioned, but this device couldn't remove its key pair.
 *
 * The number is released, so treat it as gone: `deprovisioned` is the released number, as
 * a successful deprovision would have returned it. The key pair stays on the device.
 * Removing a key that is already absent succeeds, so this means the key store itself
 * failed, and other key operations are likely to fail too.
 */
export class KeyPairRemovalFailedError extends TelephonyError {
  public readonly deprovisioned: PhoneNumber
  public readonly cause?: unknown

  constructor(deprovisioned: PhoneNumber, cause?: unknown, msg?: string) {
    super(
      msg ??
        "The phone number was released, but its key couldn't be removed from this device.",
    )
    this.deprovisioned = deprovisioned
    this.cause = cause
  }
}

export class KeyNotFoundError extends TelephonyError {
  constructor(msg?: string) {
    super(msg)
  }
}

export class UnsealingFailedError extends TelephonyError {
  public readonly cause?: unknown

  constructor(msg?: string, cause?: unknown) {
    super(msg)
    this.cause = cause
  }
}
