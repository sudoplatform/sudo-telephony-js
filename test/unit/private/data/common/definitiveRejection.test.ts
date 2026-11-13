/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AccountLockedError,
  FatalError,
  IllegalArgumentError,
  InsufficientEntitlementsError,
  InvalidTokenError,
  LimitExceededError,
  NoEntitlementsError,
  NotAuthorizedError,
  NotRegisteredError,
  NotSignedInError,
  RequestFailedError,
  ServiceError,
  UnknownGraphQLError,
  VersionMismatchError,
} from '@sudoplatform/sudo-common'
import { isDefinitiveRejection } from '../../../../../src/private/data/common/definitiveRejection'
import {
  InvalidAreaCodeError,
  InvalidArgumentError,
  InvalidPhoneNumberStateError,
  KeyNotFoundError,
  PhoneNumberNotFoundError,
  PhoneNumberNotInSearchError,
  PhoneNumberSearchExpiredError,
  PhoneNumberUnavailableError,
  SupportedCountriesUnavailableError,
  TelephonyServiceConfigNotFoundError,
  UnsealingFailedError,
  UnsupportedCountryError,
} from '../../../../../src/public/errors'

describe('isDefinitiveRejection Test Suite', () => {
  it.each([
    new InvalidArgumentError(),
    new IllegalArgumentError(),
    new NotSignedInError(),
    new NotAuthorizedError(),
    new NotRegisteredError(),
    new InsufficientEntitlementsError(),
    new NoEntitlementsError(),
    new InvalidTokenError(),
    new LimitExceededError(),
    new AccountLockedError(),
    new VersionMismatchError(),
    new UnsupportedCountryError(),
    new InvalidAreaCodeError(),
    new PhoneNumberSearchExpiredError(),
    new PhoneNumberNotInSearchError(),
    new PhoneNumberUnavailableError(),
    new PhoneNumberNotFoundError(),
    new InvalidPhoneNumberStateError(),
  ])('treats $name as a definitive rejection', (error) => {
    expect(isDefinitiveRejection(error)).toBe(true)
  })

  it.each([
    new RequestFailedError(),
    new ServiceError('internal'),
    new UnknownGraphQLError(new Error('unknown')),
    new FatalError('unreadable response'),
    new TelephonyServiceConfigNotFoundError(),
    new SupportedCountriesUnavailableError(),
    new UnsealingFailedError(),
    new KeyNotFoundError(),
    new Error('unexpected'),
  ])('does not treat $name as a definitive rejection', (error) => {
    expect(isDefinitiveRejection(error)).toBe(false)
  })

  it.each([undefined, null, 'failed', { name: 'PhoneNumberUnavailableError' }])(
    'does not treat a non-error value %o as a definitive rejection',
    (value) => {
      expect(isDefinitiveRejection(value)).toBe(false)
    },
  )
})
