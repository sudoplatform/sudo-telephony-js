/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

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
