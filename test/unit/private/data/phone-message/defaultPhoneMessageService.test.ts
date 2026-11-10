/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

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
import { OnPhoneMessageEventSubscription } from '../../../../../src/gen/graphqlTypes'
import { ApiClient } from '../../../../../src/private/data/common/apiClient'
import { SubscriptionResult } from '../../../../../src/private/data/common/baseSubscriptionManager'
import { DefaultPhoneMessageService } from '../../../../../src/private/data/phone-message/defaultPhoneMessageService'
import { SortOrderEntity } from '../../../../../src/private/domain/entities/phone-message/phoneMessageEntity'
import {
  ConnectionState,
  PhoneMessageSubscriber,
} from '../../../../../src/public'
import { APIDataFactory } from '../../../../data-factory/api'
import { EntityDataFactory } from '../../../../data-factory/entity'
import { GraphQLDataFactory } from '../../../../data-factory/graphQL'

describe('DefaultPhoneMessageService Test Suite', () => {
  const mockAppSync = mock<ApiClient>()
  let instanceUnderTest: DefaultPhoneMessageService

  beforeEach(() => {
    reset(mockAppSync)
    instanceUnderTest = new DefaultPhoneMessageService(instance(mockAppSync))
  })

  describe('get', () => {
    it('returns the transformed sealed message', async () => {
      when(mockAppSync.getPhoneMessage(anything())).thenResolve(
        GraphQLDataFactory.sealedPhoneMessage,
      )

      await expect(instanceUnderTest.get('id')).resolves.toStrictEqual(
        EntityDataFactory.sealedPhoneMessage,
      )
      verify(mockAppSync.getPhoneMessage('id')).once()
    })

    it('returns undefined when appSync returns undefined', async () => {
      when(mockAppSync.getPhoneMessage(anything())).thenResolve(undefined)

      await expect(instanceUnderTest.get('id')).resolves.toBeUndefined()
    })
  })

  describe('listForPhoneNumberId', () => {
    it('passes the input and returns the transformed page', async () => {
      when(
        mockAppSync.listPhoneMessagesForPhoneNumberId(anything()),
      ).thenResolve({
        items: [GraphQLDataFactory.sealedPhoneMessage],
        nextToken: 'next',
      })

      const result = await instanceUnderTest.listForPhoneNumberId({
        phoneNumberId: 'pn',
        sortOrder: SortOrderEntity.Asc,
        limit: 1,
        nextToken: 'token',
      })

      expect(result).toStrictEqual({
        phoneMessages: [EntityDataFactory.sealedPhoneMessage],
        nextToken: 'next',
      })
      const [args] = capture(
        mockAppSync.listPhoneMessagesForPhoneNumberId,
      ).first()
      expect(args).toStrictEqual({
        phoneNumberId: 'pn',
        sortOrder: 'ASC',
        limit: 1,
        nextToken: 'token',
      })
    })

    it('leaves the sort order unset when none is given', async () => {
      when(
        mockAppSync.listPhoneMessagesForPhoneNumberId(anything()),
      ).thenResolve({ items: [], nextToken: null })

      await expect(
        instanceUnderTest.listForPhoneNumberId({ phoneNumberId: 'pn' }),
      ).resolves.toStrictEqual({ phoneMessages: [], nextToken: undefined })
      const [args] = capture(
        mockAppSync.listPhoneMessagesForPhoneNumberId,
      ).first()
      expect(args.sortOrder).toBeUndefined()
    })
  })

  describe('listForConversationId', () => {
    it('passes the input and returns the transformed page', async () => {
      when(
        mockAppSync.listPhoneMessagesForConversationId(anything()),
      ).thenResolve({
        items: [GraphQLDataFactory.sealedPhoneMessage],
        nextToken: undefined,
      })

      const result = await instanceUnderTest.listForConversationId({
        conversationId: 'conv',
        sortOrder: SortOrderEntity.Desc,
      })

      expect(result).toStrictEqual({
        phoneMessages: [EntityDataFactory.sealedPhoneMessage],
        nextToken: undefined,
      })
      const [args] = capture(
        mockAppSync.listPhoneMessagesForConversationId,
      ).first()
      expect(args).toStrictEqual({
        conversationId: 'conv',
        sortOrder: 'DESC',
        limit: undefined,
        nextToken: undefined,
      })
    })
  })

  describe('delete', () => {
    it('passes the IDs and returns the batch result', async () => {
      when(mockAppSync.deletePhoneMessages(anything())).thenResolve({
        succeededIds: ['a'],
        failedIds: ['b'],
      })

      await expect(instanceUnderTest.delete(['a', 'b'])).resolves.toStrictEqual(
        { succeededIds: ['a'], failedIds: ['b'] },
      )
      const [args] = capture(mockAppSync.deletePhoneMessages).first()
      expect(args).toStrictEqual({ ids: ['a', 'b'] })
    })
  })

  describe('update', () => {
    it('passes the IDs and seen state and returns the batch result', async () => {
      when(mockAppSync.updatePhoneMessages(anything())).thenResolve({
        succeededIds: ['a'],
        failedIds: [],
      })

      await expect(
        instanceUnderTest.update({ ids: ['a'], seen: true }),
      ).resolves.toStrictEqual({ succeededIds: ['a'], failedIds: [] })
      const [args] = capture(mockAppSync.updatePhoneMessages).first()
      expect(args).toStrictEqual({ ids: ['a'], seen: true })
    })
  })

  describe('subscribe', () => {
    let observer:
      | ZenObservable.SubscriptionObserver<
          SubscriptionResult<OnPhoneMessageEventSubscription>
        >
      | undefined
    let subscriber: PhoneMessageSubscriber

    beforeEach(() => {
      observer = undefined
      subscriber = {
        phoneMessageEvent: vi.fn(),
        connectionStatusChanged: vi.fn(),
      }
      when(mockAppSync.onPhoneMessageEvent(anything())).thenResolve(
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

      verify(mockAppSync.onPhoneMessageEvent('testOwner')).once()
      expect(subscriber.connectionStatusChanged).toHaveBeenCalledWith(
        ConnectionState.Connected,
      )
    })

    it('delivers events as public phone message events', async () => {
      await instanceUnderTest.subscribe({
        subscriptionId: 'sub',
        owner: 'testOwner',
        subscriber,
      })

      observer?.next({
        data: { onPhoneMessageEvent: GraphQLDataFactory.phoneMessageEvent },
      })

      expect(subscriber.phoneMessageEvent).toHaveBeenCalledWith(
        APIDataFactory.phoneMessageEvent,
      )
    })

    it('ignores an event without data', async () => {
      await instanceUnderTest.subscribe({
        subscriptionId: 'sub',
        owner: 'testOwner',
        subscriber,
      })

      observer?.next({ data: { onPhoneMessageEvent: null } })

      expect(subscriber.phoneMessageEvent).not.toHaveBeenCalled()
    })

    it('tells a subscriber joining an open subscription that it is connected', async () => {
      const late: PhoneMessageSubscriber = {
        phoneMessageEvent: vi.fn(),
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

      verify(mockAppSync.onPhoneMessageEvent(anything())).once()
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
      when(mockAppSync.onPhoneMessageEvent(anything())).thenReject(
        new Error('failed'),
      )

      await expect(
        instanceUnderTest.subscribe({
          subscriptionId: 'sub',
          owner: 'testOwner',
          subscriber,
        }),
      ).rejects.toThrow('failed')

      when(mockAppSync.onPhoneMessageEvent(anything())).thenResolve(
        new Observable(() => undefined),
      )
      await instanceUnderTest.subscribe({
        subscriptionId: 'sub',
        owner: 'testOwner',
        subscriber,
      })
      verify(mockAppSync.onPhoneMessageEvent(anything())).twice()
    })

    it('stops delivery after unsubscribing', async () => {
      await instanceUnderTest.subscribe({
        subscriptionId: 'sub',
        owner: 'testOwner',
        subscriber,
      })

      instanceUnderTest.unsubscribe('sub')
      observer?.next({
        data: { onPhoneMessageEvent: GraphQLDataFactory.phoneMessageEvent },
      })

      expect(subscriber.phoneMessageEvent).not.toHaveBeenCalled()
    })
  })
})
