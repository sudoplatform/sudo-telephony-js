/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiClientManager } from '@sudoplatform/sudo-api-client'
import {
  FatalError,
  NotAuthorizedError,
  RequestFailedError,
  UnknownGraphQLError,
} from '@sudoplatform/sudo-common'
import { GraphQLClient } from '@sudoplatform/sudo-user'
import { anything, capture, instance, mock, reset, when } from 'ts-mockito'
import Observable from 'zen-observable'
import {
  DeletePhoneMessagesDocument,
  DeprovisionPhoneNumberDocument,
  GetPhoneMessageDocument,
  GetPhoneNumberDocument,
  GetSupportedCountriesForTelephonyDocument,
  GetTelephonyConfigDocument,
  ListPhoneMessagesForConversationIdDocument,
  ListPhoneMessagesForPhoneNumberIdDocument,
  ListPhoneNumbersDocument,
  ListPhoneNumbersForSudoIdDocument,
  OnPhoneMessageEventDocument,
  OnPhoneNumberUpdateDocument,
  ProvisionPhoneNumberDocument,
  SearchAvailablePhoneNumbersDocument,
  UpdatePhoneMessagesDocument,
} from '../../../../../src/gen/graphqlTypes'
import { ApiClient } from '../../../../../src/private/data/common/apiClient'
import {
  InvalidPhoneNumberStateError,
  PhoneNumberNotFoundError,
} from '../../../../../src/public/errors'

describe('ApiClient Test Suite', () => {
  const mockApiClientManager = mock<ApiClientManager>()
  const mockClient = mock<GraphQLClient>()
  let instanceUnderTest: ApiClient

  beforeEach(() => {
    reset(mockApiClientManager)
    reset(mockClient)
    when(mockApiClientManager.getClient(anything())).thenReturn(
      instance(mockClient),
    )
    instanceUnderTest = new ApiClient(instance(mockApiClientManager))
  })

  it('gets its GraphQL client for the telephonyService namespace', () => {
    const [options] = capture(mockApiClientManager.getClient).first()
    expect(options).toStrictEqual({ configNamespace: 'telephonyService' })
  })

  // MARK: Operations

  const marker = { marker: 'result' }

  describe('queries', () => {
    it.each([
      {
        name: 'getSupportedCountries',
        call: (c: ApiClient) => c.getSupportedCountries(),
        document: GetSupportedCountriesForTelephonyDocument,
        variables: {},
        field: 'getSupportedCountriesForTelephony',
      },
      {
        name: 'getTelephonyConfig',
        call: (c: ApiClient) => c.getTelephonyConfig(),
        document: GetTelephonyConfigDocument,
        variables: {},
        field: 'getTelephonyConfig',
      },
      {
        name: 'searchAvailablePhoneNumbers',
        call: (c: ApiClient) =>
          c.searchAvailablePhoneNumbers({ countryCode: 'US', areaCode: '415' }),
        document: SearchAvailablePhoneNumbersDocument,
        variables: { input: { countryCode: 'US', areaCode: '415' } },
        field: 'searchAvailablePhoneNumbers',
      },
      {
        name: 'getPhoneNumber',
        call: (c: ApiClient) => c.getPhoneNumber('id'),
        document: GetPhoneNumberDocument,
        variables: { id: 'id' },
        field: 'getPhoneNumber',
      },
      {
        name: 'listPhoneNumbers',
        call: (c: ApiClient) => c.listPhoneNumbers({ limit: 1 }),
        document: ListPhoneNumbersDocument,
        variables: { input: { limit: 1 } },
        field: 'listPhoneNumbers',
      },
      {
        name: 'listPhoneNumbersForSudoId',
        call: (c: ApiClient) => c.listPhoneNumbersForSudoId({ sudoId: 'sudo' }),
        document: ListPhoneNumbersForSudoIdDocument,
        variables: { input: { sudoId: 'sudo' } },
        field: 'listPhoneNumbersForSudoId',
      },
      {
        name: 'getPhoneMessage',
        call: (c: ApiClient) => c.getPhoneMessage('id'),
        document: GetPhoneMessageDocument,
        variables: { id: 'id' },
        field: 'getPhoneMessage',
      },
      {
        name: 'listPhoneMessagesForPhoneNumberId',
        call: (c: ApiClient) =>
          c.listPhoneMessagesForPhoneNumberId({ phoneNumberId: 'pn' }),
        document: ListPhoneMessagesForPhoneNumberIdDocument,
        variables: { input: { phoneNumberId: 'pn' } },
        field: 'listPhoneMessagesForPhoneNumberId',
      },
      {
        name: 'listPhoneMessagesForConversationId',
        call: (c: ApiClient) =>
          c.listPhoneMessagesForConversationId({ conversationId: 'c' }),
        document: ListPhoneMessagesForConversationIdDocument,
        variables: { input: { conversationId: 'c' } },
        field: 'listPhoneMessagesForConversationId',
      },
    ])(
      '$name sends its document and returns the result',
      async ({ call, document, variables, field }) => {
        when(mockClient.query(anything())).thenResolve({
          data: { [field]: marker },
        })

        await expect(call(instanceUnderTest)).resolves.toBe(marker)

        const [args] = capture(mockClient.query<unknown>).first()
        expect(args).toStrictEqual({ query: document, variables })
      },
    )

    it.each([
      ['getPhoneNumber', (c: ApiClient) => c.getPhoneNumber('id')],
      ['getPhoneMessage', (c: ApiClient) => c.getPhoneMessage('id')],
    ])(
      '%s returns undefined when the service returns null',
      async (field, call) => {
        when(mockClient.query(anything())).thenResolve({
          data: { [field]: null },
        })

        await expect(call(instanceUnderTest)).resolves.toBeUndefined()
      },
    )
  })

  describe('mutations', () => {
    it.each([
      {
        name: 'provisionPhoneNumber',
        call: (c: ApiClient) =>
          c.provisionPhoneNumber({
            searchId: 's',
            phoneNumber: '+14155550100',
            key: {
              keyId: 'k',
              algorithm: 'RSAEncryptionOAEPAESGCM',
              publicKey: 'pk',
            },
          }),
        document: ProvisionPhoneNumberDocument,
        variables: {
          input: {
            searchId: 's',
            phoneNumber: '+14155550100',
            key: {
              keyId: 'k',
              algorithm: 'RSAEncryptionOAEPAESGCM',
              publicKey: 'pk',
            },
          },
        },
        field: 'provisionPhoneNumber',
      },
      {
        name: 'deprovisionPhoneNumber',
        call: (c: ApiClient) => c.deprovisionPhoneNumber('id'),
        document: DeprovisionPhoneNumberDocument,
        variables: { id: 'id' },
        field: 'deprovisionPhoneNumber',
      },
      {
        name: 'deletePhoneMessages',
        call: (c: ApiClient) => c.deletePhoneMessages({ ids: ['a'] }),
        document: DeletePhoneMessagesDocument,
        variables: { input: { ids: ['a'] } },
        field: 'deletePhoneMessages',
      },
      {
        name: 'updatePhoneMessages',
        call: (c: ApiClient) =>
          c.updatePhoneMessages({ ids: ['a'], seen: true }),
        document: UpdatePhoneMessagesDocument,
        variables: { input: { ids: ['a'], seen: true } },
        field: 'updatePhoneMessages',
      },
    ])(
      '$name sends its document and returns the result',
      async ({ call, document, variables, field }) => {
        when(mockClient.mutate(anything())).thenResolve({
          data: { [field]: marker },
        })

        await expect(call(instanceUnderTest)).resolves.toBe(marker)

        const [args] = capture(mockClient.mutate<unknown>).first()
        expect(args).toStrictEqual({ mutation: document, variables })
      },
    )
  })

  describe('subscriptions', () => {
    const observable = new Observable(() => undefined)

    it.each([
      {
        name: 'onPhoneNumberUpdate',
        call: (c: ApiClient) => c.onPhoneNumberUpdate('owner'),
        document: OnPhoneNumberUpdateDocument,
      },
      {
        name: 'onPhoneMessageEvent',
        call: (c: ApiClient) => c.onPhoneMessageEvent('owner'),
        document: OnPhoneMessageEventDocument,
      },
    ])('$name subscribes for the owner', async ({ call, document }) => {
      when(mockClient.subscribe(anything())).thenResolve(observable as any)

      await expect(call(instanceUnderTest)).resolves.toBe(observable)

      const [args] = capture(mockClient.subscribe<unknown>).first()
      expect(args).toStrictEqual({
        subscription: document,
        variables: { owner: 'owner' },
      })
    })
  })

  // MARK: Error handling

  describe('error handling', () => {
    it('maps the first error in a query result', async () => {
      when(mockClient.query(anything())).thenResolve({
        data: undefined,
        errors: [
          {
            errorType: 'sudoplatform.telephony.InvalidPhoneNumberState',
            message: 'bad state',
          } as any,
        ],
      })

      await expect(instanceUnderTest.getPhoneNumber('id')).rejects.toThrow(
        InvalidPhoneNumberStateError,
      )
    })

    it('maps the first error in a mutation result', async () => {
      when(mockClient.mutate(anything())).thenResolve({
        data: undefined,
        errors: [
          {
            errorType: 'sudoplatform.telephony.PhoneNumberNotFound',
            message: 'not found',
          } as any,
        ],
      })

      await expect(
        instanceUnderTest.deprovisionPhoneNumber('id'),
      ).rejects.toThrow(PhoneNumberNotFoundError)
    })

    it('maps a thrown error carrying graphQLErrors', async () => {
      when(mockClient.query(anything())).thenReject(
        Object.assign(new Error('failed'), {
          graphQLErrors: [
            {
              errorType: 'sudoplatform.telephony.PhoneNumberNotFound',
              message: 'not found',
            },
          ],
        }),
      )

      await expect(instanceUnderTest.getPhoneNumber('id')).rejects.toThrow(
        PhoneNumberNotFoundError,
      )
    })

    it('maps a thrown error carrying an errorType', async () => {
      when(mockClient.mutate(anything())).thenReject(
        Object.assign(new Error('failed'), {
          errorType: 'sudoplatform.telephony.PhoneNumberNotFound',
        }),
      )

      await expect(
        instanceUnderTest.deprovisionPhoneNumber('id'),
      ).rejects.toThrow(PhoneNumberNotFoundError)
    })

    it.each([
      [401, NotAuthorizedError],
      [500, RequestFailedError],
    ])(
      'maps a network error with status %d to %o',
      async (statusCode, expected) => {
        when(mockClient.query(anything())).thenReject(
          Object.assign(new Error('network'), {
            originalError: Object.assign(new Error('inner'), {
              _response: { statusCode },
            }),
          }),
        )

        await expect(instanceUnderTest.getSupportedCountries()).rejects.toThrow(
          expected,
        )
      },
    )

    it('wraps an unrecognised thrown error in UnknownGraphQLError', async () => {
      when(mockClient.query(anything())).thenReject(new Error('boom'))

      await expect(instanceUnderTest.getTelephonyConfig()).rejects.toThrow(
        UnknownGraphQLError,
      )
    })

    it('throws FatalError when a query returns no data', async () => {
      when(mockClient.query(anything())).thenResolve({ data: undefined })

      await expect(instanceUnderTest.getTelephonyConfig()).rejects.toThrow(
        new FatalError('getTelephonyConfig did not return any result'),
      )
    })

    it('throws FatalError when a mutation returns no data', async () => {
      when(mockClient.mutate(anything())).thenResolve({ data: undefined })

      await expect(
        instanceUnderTest.deletePhoneMessages({ ids: ['a'] }),
      ).rejects.toThrow(
        new FatalError('deletePhoneMessages did not return any result'),
      )
    })
  })
})
