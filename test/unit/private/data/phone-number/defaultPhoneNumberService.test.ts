/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { PublicKeyFormat } from '@sudoplatform/sudo-common'
import {
  anything,
  capture,
  instance,
  mock,
  reset,
  verify,
  when,
} from 'ts-mockito'
import Observable from 'zen-observable'
import { OnPhoneNumberUpdateSubscription } from '../../../../../src/gen/graphqlTypes'
import { ApiClient } from '../../../../../src/private/data/common/apiClient'
import { SubscriptionResult } from '../../../../../src/private/data/common/baseSubscriptionManager'
import { DefaultPhoneNumberService } from '../../../../../src/private/data/phone-number/defaultPhoneNumberService'
import {
  ConnectionState,
  PhoneNumberSubscriber,
} from '../../../../../src/public'
import { APIDataFactory } from '../../../../data-factory/api'
import { EntityDataFactory } from '../../../../data-factory/entity'
import { GraphQLDataFactory } from '../../../../data-factory/graphQL'

describe('DefaultPhoneNumberService Test Suite', () => {
  const mockAppSync = mock<ApiClient>()
  let instanceUnderTest: DefaultPhoneNumberService

  const key = {
    keyId: 'testKeyId',
    algorithm: 'RSAEncryptionOAEPAESGCM',
    keyFormat: PublicKeyFormat.SPKI,
    publicKey: 'cHVibGljS2V5',
  }

  beforeEach(() => {
    reset(mockAppSync)
    instanceUnderTest = new DefaultPhoneNumberService(instance(mockAppSync))
  })

  describe('provision', () => {
    beforeEach(() => {
      when(mockAppSync.provisionPhoneNumber(anything())).thenResolve(
        GraphQLDataFactory.phoneNumber,
      )
    })

    it('sends the key and a single ownership proof', async () => {
      const result = await instanceUnderTest.provision({
        searchId: 'testSearchId',
        phoneNumber: '+14155550100',
        key,
        ownershipProofToken: 'proof',
        clientRefId: 'ref',
      })

      expect(result).toStrictEqual(EntityDataFactory.phoneNumber)
      const [inputArgs] = capture(mockAppSync.provisionPhoneNumber).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>({
        searchId: 'testSearchId',
        phoneNumber: '+14155550100',
        key: {
          keyId: 'testKeyId',
          algorithm: 'RSAEncryptionOAEPAESGCM',
          keyFormat: 'SPKI',
          publicKey: 'cHVibGljS2V5',
        },
        ownershipProofTokens: ['proof'],
        clientRefId: 'ref',
      })
    })

    it('omits ownershipProofTokens when no proof is given', async () => {
      await instanceUnderTest.provision({
        searchId: 'testSearchId',
        phoneNumber: '+14155550100',
        key: { ...key, keyFormat: PublicKeyFormat.RSAPublicKey },
      })

      const [inputArgs] = capture(mockAppSync.provisionPhoneNumber).first()
      expect(inputArgs.ownershipProofTokens).toBeUndefined()
      expect(inputArgs.key.keyFormat).toBe('RSA_PUBLIC_KEY')
    })
  })

  describe('deprovision', () => {
    it('calls appSync and returns the transformed number', async () => {
      when(mockAppSync.deprovisionPhoneNumber(anything())).thenResolve(
        GraphQLDataFactory.phoneNumber,
      )

      await expect(instanceUnderTest.deprovision('id')).resolves.toStrictEqual(
        EntityDataFactory.phoneNumber,
      )
      verify(mockAppSync.deprovisionPhoneNumber('id')).once()
    })
  })

  describe('get', () => {
    it('returns the transformed number', async () => {
      when(mockAppSync.getPhoneNumber(anything())).thenResolve(
        GraphQLDataFactory.phoneNumber,
      )

      await expect(instanceUnderTest.get('id')).resolves.toStrictEqual(
        EntityDataFactory.phoneNumber,
      )
      verify(mockAppSync.getPhoneNumber('id')).once()
    })

    it('returns undefined when appSync returns undefined', async () => {
      when(mockAppSync.getPhoneNumber(anything())).thenResolve(undefined)

      await expect(instanceUnderTest.get('id')).resolves.toBeUndefined()
    })
  })

  describe('list', () => {
    it('calls appSync and returns the transformed page', async () => {
      when(mockAppSync.listPhoneNumbers(anything())).thenResolve({
        items: [GraphQLDataFactory.phoneNumber],
        nextToken: 'nextToken',
      })

      const result = await instanceUnderTest.list({
        limit: 1,
        nextToken: 'token',
      })

      expect(result).toStrictEqual({
        phoneNumbers: [EntityDataFactory.phoneNumber],
        nextToken: 'nextToken',
      })
      const [inputArgs] = capture(mockAppSync.listPhoneNumbers).first()
      expect(inputArgs).toStrictEqual({ limit: 1, nextToken: 'token' })
    })

    it('maps a null nextToken to undefined', async () => {
      when(mockAppSync.listPhoneNumbers(anything())).thenResolve({
        items: [],
        nextToken: null,
      })

      await expect(instanceUnderTest.list({})).resolves.toStrictEqual({
        phoneNumbers: [],
        nextToken: undefined,
      })
    })
  })

  describe('listForSudoId', () => {
    it('calls appSync and returns the transformed page', async () => {
      when(mockAppSync.listPhoneNumbersForSudoId(anything())).thenResolve({
        items: [GraphQLDataFactory.phoneNumber],
        nextToken: undefined,
      })

      const result = await instanceUnderTest.listForSudoId({
        sudoId: 'testSudoId',
        limit: 1,
      })

      expect(result).toStrictEqual({
        phoneNumbers: [EntityDataFactory.phoneNumber],
        nextToken: undefined,
      })
      const [inputArgs] = capture(mockAppSync.listPhoneNumbersForSudoId).first()
      expect(inputArgs).toStrictEqual({
        sudoId: 'testSudoId',
        limit: 1,
        nextToken: undefined,
      })
    })
  })

  describe('subscribe', () => {
    let observer:
      | ZenObservable.SubscriptionObserver<
          SubscriptionResult<OnPhoneNumberUpdateSubscription>
        >
      | undefined
    let subscriber: PhoneNumberSubscriber

    beforeEach(() => {
      observer = undefined
      subscriber = {
        phoneNumberUpdated: vi.fn(),
        connectionStatusChanged: vi.fn(),
      }
      when(mockAppSync.onPhoneNumberUpdate(anything())).thenResolve(
        new Observable((o) => {
          observer = o
        }),
      )
    })

    it('connects once for the owner and reports the connection', async () => {
      await instanceUnderTest.subscribe({
        subscriptionId: 'sub',
        owner: 'testOwner',
        subscriber,
      })

      verify(mockAppSync.onPhoneNumberUpdate('testOwner')).once()
      expect(subscriber.connectionStatusChanged).toHaveBeenCalledWith(
        ConnectionState.Connected,
      )
    })

    it('delivers updates as public phone numbers', async () => {
      await instanceUnderTest.subscribe({
        subscriptionId: 'sub',
        owner: 'testOwner',
        subscriber,
      })

      observer?.next({
        data: { onPhoneNumberUpdate: GraphQLDataFactory.phoneNumber },
      })

      expect(subscriber.phoneNumberUpdated).toHaveBeenCalledWith(
        APIDataFactory.phoneNumber,
      )
    })

    it('ignores an update without data', async () => {
      await instanceUnderTest.subscribe({
        subscriptionId: 'sub',
        owner: 'testOwner',
        subscriber,
      })

      observer?.next({ data: { onPhoneNumberUpdate: null } })

      expect(subscriber.phoneNumberUpdated).not.toHaveBeenCalled()
    })

    it('tells a subscriber joining an open subscription that it is connected', async () => {
      const late: PhoneNumberSubscriber = {
        phoneNumberUpdated: vi.fn(),
        connectionStatusChanged: vi.fn(),
      }
      await instanceUnderTest.subscribe({
        subscriptionId: 'sub',
        owner: 'testOwner',
        subscriber,
      })

      await instanceUnderTest.subscribe({
        subscriptionId: 'late',
        owner: 'testOwner',
        subscriber: late,
      })

      verify(mockAppSync.onPhoneNumberUpdate(anything())).once()
      expect(late.connectionStatusChanged).toHaveBeenCalledWith(
        ConnectionState.Connected,
      )
    })

    it.each(['error', 'complete'] as const)(
      'reports a disconnection on %s',
      async (event) => {
        await instanceUnderTest.subscribe({
          subscriptionId: 'sub',
          owner: 'testOwner',
          subscriber,
        })

        if (event === 'error') {
          observer?.error(new Error('closed'))
        } else {
          observer?.complete()
        }

        expect(subscriber.connectionStatusChanged).toHaveBeenLastCalledWith(
          ConnectionState.Disconnected,
        )
      },
    )

    it('removes the subscriber when the connection cannot be made', async () => {
      when(mockAppSync.onPhoneNumberUpdate(anything())).thenReject(
        new Error('failed'),
      )

      await expect(
        instanceUnderTest.subscribe({
          subscriptionId: 'sub',
          owner: 'testOwner',
          subscriber,
        }),
      ).rejects.toThrow('failed')

      // A later subscribe connects again rather than treating the failed
      // attempt as an open subscription.
      when(mockAppSync.onPhoneNumberUpdate(anything())).thenResolve(
        new Observable(() => undefined),
      )
      await instanceUnderTest.subscribe({
        subscriptionId: 'sub',
        owner: 'testOwner',
        subscriber,
      })
      verify(mockAppSync.onPhoneNumberUpdate(anything())).twice()
    })

    it('stops delivery after unsubscribing', async () => {
      await instanceUnderTest.subscribe({
        subscriptionId: 'sub',
        owner: 'testOwner',
        subscriber,
      })

      instanceUnderTest.unsubscribe('sub')
      observer?.next({
        data: { onPhoneNumberUpdate: GraphQLDataFactory.phoneNumber },
      })

      expect(subscriber.phoneNumberUpdated).not.toHaveBeenCalled()
    })
  })
})
