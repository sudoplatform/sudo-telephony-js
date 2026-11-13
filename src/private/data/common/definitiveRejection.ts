/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AccountLockedError,
  IllegalArgumentError,
  InsufficientEntitlementsError,
  InvalidTokenError,
  LimitExceededError,
  NoEntitlementsError,
  NotAuthorizedError,
  NotRegisteredError,
  NotSignedInError,
  VersionMismatchError,
} from '@sudoplatform/sudo-common'
import {
  InvalidAreaCodeError,
  InvalidArgumentError,
  InvalidPhoneNumberStateError,
  PhoneNumberNotFoundError,
  PhoneNumberNotInSearchError,
  PhoneNumberSearchExpiredError,
  PhoneNumberUnavailableError,
  UnsupportedCountryError,
} from '../../../public/errors'

/**
 * Errors that the service, or the client before sending, raises when it refuses a
 * request. `NotRegisteredError` is how the SDK reports the service's
 * `IdentityContextMissing`.
 */
const DEFINITIVE_REJECTIONS = [
  InvalidArgumentError,
  IllegalArgumentError,
  NotSignedInError,
  NotAuthorizedError,
  NotRegisteredError,
  InsufficientEntitlementsError,
  NoEntitlementsError,
  InvalidTokenError,
  LimitExceededError,
  AccountLockedError,
  VersionMismatchError,
  UnsupportedCountryError,
  InvalidAreaCodeError,
  PhoneNumberSearchExpiredError,
  PhoneNumberNotInSearchError,
  PhoneNumberUnavailableError,
  PhoneNumberNotFoundError,
  InvalidPhoneNumberStateError,
]

/**
 * Whether an error proves the service did not carry out the request.
 *
 * Anything that could follow a request the service accepted doesn't qualify: a transport
 * failure (`RequestFailedError`), an unclassified or internal service error
 * (`UnknownGraphQLError`, `ServiceError`), or a response the SDK couldn't read
 * (`FatalError`). Callers keep state such as a provisioning key in those cases, rather
 * than discard it for a number that may exist.
 *
 * @param {unknown} error The error a service call threw.
 * @returns {boolean} True if the service definitely refused the request.
 */
export const isDefinitiveRejection = (error: unknown): boolean =>
  DEFINITIVE_REJECTIONS.some((errorClass) => error instanceof errorClass)
