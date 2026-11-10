/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DefaultLogger,
  Logger,
  NotRegisteredError,
  ServiceError,
  mapGraphQLToClientError,
} from '@sudoplatform/sudo-common'
import { GraphQLError } from 'graphql'
import {
  InvalidAreaCodeError,
  InvalidArgumentError,
  InvalidPhoneNumberStateError,
  PhoneNumberNotFoundError,
  PhoneNumberNotInSearchError,
  PhoneNumberSearchExpiredError,
  PhoneNumberUnavailableError,
  SupportedCountriesUnavailableError,
  UnsupportedCountryError,
} from '../../../../public/errors'

export class ErrorTransformer {
  private readonly log: Logger

  constructor() {
    this.log = new DefaultLogger(this.constructor.name)
  }

  toClientError(
    error:
      { errorType: string; errorInfo?: string; message: string } | GraphQLError,
  ): Error {
    this.log.debug('GraphQL call failed', { error })
    const errorType = 'errorType' in error ? error.errorType : error.message
    switch (errorType) {
      case 'sudoplatform.telephony.IdentityContextMissing':
        return new NotRegisteredError(error.message)
      case 'sudoplatform.telephony.SupportedCountriesUnavailable':
        return new SupportedCountriesUnavailableError(error.message)
      case 'sudoplatform.telephony.UnsupportedCountry':
        return new UnsupportedCountryError(error.message)
      case 'sudoplatform.telephony.InvalidAreaCode':
        return new InvalidAreaCodeError(error.message)
      case 'sudoplatform.telephony.PhoneNumberSearchExpired':
        return new PhoneNumberSearchExpiredError(error.message)
      case 'sudoplatform.telephony.PhoneNumberNotInSearch':
        return new PhoneNumberNotInSearchError(error.message)
      case 'sudoplatform.telephony.PhoneNumberUnavailable':
        return new PhoneNumberUnavailableError(error.message)
      case 'sudoplatform.telephony.PhoneNumberNotFound':
        return new PhoneNumberNotFoundError(error.message)
      case 'sudoplatform.telephony.InvalidPhoneNumberState':
        return new InvalidPhoneNumberStateError(error.message)
      case 'sudoplatform.InvalidArgumentError':
        return new InvalidArgumentError(error.message)
      case 'sudoplatform.ServiceError':
        return new ServiceError(error.message)
      default:
        return mapGraphQLToClientError(error)
    }
  }
}
