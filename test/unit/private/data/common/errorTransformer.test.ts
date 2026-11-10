/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  NotRegisteredError,
  ServiceError,
  mapGraphQLToClientError,
} from '@sudoplatform/sudo-common'
import { GraphQLError } from 'graphql'
import { ErrorTransformer } from '../../../../../src/private/data/common/transformer/errorTransformer'
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
} from '../../../../../src/public/errors'

vi.mock('@sudoplatform/sudo-common', async () => {
  const actual = await vi.importActual('@sudoplatform/sudo-common')
  return {
    ...actual,
    mapGraphQLToClientError: vi.fn().mockReturnValue(new Error('mapped')),
  }
})

describe('ErrorTransformer Test Suite', () => {
  let instanceUnderTest: ErrorTransformer

  beforeEach(() => {
    instanceUnderTest = new ErrorTransformer()
  })

  describe('toClientError', () => {
    it.each`
      errorType                                                 | expected
      ${'sudoplatform.telephony.IdentityContextMissing'}        | ${NotRegisteredError}
      ${'sudoplatform.telephony.SupportedCountriesUnavailable'} | ${SupportedCountriesUnavailableError}
      ${'sudoplatform.telephony.UnsupportedCountry'}            | ${UnsupportedCountryError}
      ${'sudoplatform.telephony.InvalidAreaCode'}               | ${InvalidAreaCodeError}
      ${'sudoplatform.telephony.PhoneNumberSearchExpired'}      | ${PhoneNumberSearchExpiredError}
      ${'sudoplatform.telephony.PhoneNumberNotInSearch'}        | ${PhoneNumberNotInSearchError}
      ${'sudoplatform.telephony.PhoneNumberUnavailable'}        | ${PhoneNumberUnavailableError}
      ${'sudoplatform.telephony.PhoneNumberNotFound'}           | ${PhoneNumberNotFoundError}
      ${'sudoplatform.telephony.InvalidPhoneNumberState'}       | ${InvalidPhoneNumberStateError}
      ${'sudoplatform.InvalidArgumentError'}                    | ${InvalidArgumentError}
      ${'sudoplatform.ServiceError'}                            | ${ServiceError}
    `(
      'maps $errorType to $expected.name',
      ({ errorType, expected }: { errorType: string; expected: unknown }) => {
        const result = instanceUnderTest.toClientError({
          errorType,
          message: 'service message',
        })

        expect(result).toBeInstanceOf(expected)
        expect(result.message).toBe('service message')
        expect(mapGraphQLToClientError).not.toHaveBeenCalled()
      },
    )

    it('falls back to mapGraphQLToClientError for other errorTypes', () => {
      const error = {
        errorType: 'sudoplatform.InsufficientEntitlementsError',
        message: 'not entitled',
      }

      const result = instanceUnderTest.toClientError(error)

      expect(mapGraphQLToClientError).toHaveBeenCalledWith(error)
      expect(result.message).toBe('mapped')
    })

    it('uses the message as errorType for a plain GraphQLError', () => {
      const graphQLError = new GraphQLError(
        'sudoplatform.telephony.PhoneNumberNotFound',
      )

      const result = instanceUnderTest.toClientError(graphQLError)

      expect(result).toBeInstanceOf(PhoneNumberNotFoundError)
    })

    it('falls back to mapGraphQLToClientError for an unknown GraphQLError', () => {
      const graphQLError = new GraphQLError('some unknown error')

      instanceUnderTest.toClientError(graphQLError)

      expect(mapGraphQLToClientError).toHaveBeenCalledWith(graphQLError)
    })
  })
})
