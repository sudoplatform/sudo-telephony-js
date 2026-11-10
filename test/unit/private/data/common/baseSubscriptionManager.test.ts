/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import Observable from 'zen-observable'
import {
  BaseSubscriber,
  BaseSubscriptionManager,
  SubscriptionResult,
} from '../../../../../src/private/data/common/baseSubscriptionManager'
import { ConnectionState } from '../../../../../src/public/typings/subscription'

class TestSubscriptionManager extends BaseSubscriptionManager<
  string,
  BaseSubscriber
> {
  public registeredSubscribers(): BaseSubscriber[] {
    return this.getSubscribers()
  }
}

describe('BaseSubscriptionManager Test Suite', () => {
  let instanceUnderTest: TestSubscriptionManager
  let subscriber1: BaseSubscriber
  let subscriber2: BaseSubscriber
  let zenSubscription: ZenObservable.Subscription
  const watcher = new Observable<SubscriptionResult<string>>(() => undefined)

  beforeEach(() => {
    instanceUnderTest = new TestSubscriptionManager()
    subscriber1 = { connectionStatusChanged: vi.fn() }
    subscriber2 = { connectionStatusChanged: vi.fn() }
    zenSubscription = { closed: false, unsubscribe: vi.fn() }
  })

  const connect = () => {
    instanceUnderTest.setWatcher(watcher)
    instanceUnderTest.setSubscription(zenSubscription)
  }

  describe('subscribe', () => {
    it('replaces a subscriber registered under the same ID', () => {
      instanceUnderTest.subscribe('id', subscriber1)
      instanceUnderTest.subscribe('id', subscriber2)

      expect(instanceUnderTest.registeredSubscribers()).toStrictEqual([
        subscriber2,
      ])
    })
  })

  describe('unsubscribe', () => {
    it('keeps the watcher while other subscribers remain', () => {
      instanceUnderTest.subscribe('id1', subscriber1)
      instanceUnderTest.subscribe('id2', subscriber2)
      connect()

      instanceUnderTest.unsubscribe('id1')

      expect(instanceUnderTest.registeredSubscribers()).toStrictEqual([
        subscriber2,
      ])
      expect(instanceUnderTest.getWatcher()).toBe(watcher)
      expect(zenSubscription.unsubscribe).not.toHaveBeenCalled()
    })

    it('closes the watcher when the last subscriber leaves', () => {
      instanceUnderTest.subscribe('id1', subscriber1)
      connect()

      instanceUnderTest.unsubscribe('id1')

      expect(instanceUnderTest.getWatcher()).toBeNull()
      expect(zenSubscription.unsubscribe).toHaveBeenCalledTimes(1)
    })
  })

  describe('connectionStatusChanged', () => {
    it('notifies subscribers of a connection and keeps them', () => {
      instanceUnderTest.subscribe('id1', subscriber1)
      instanceUnderTest.subscribe('id2', subscriber2)
      connect()

      instanceUnderTest.connectionStatusChanged(ConnectionState.Connected)

      expect(subscriber1.connectionStatusChanged).toHaveBeenCalledWith(
        ConnectionState.Connected,
      )
      expect(subscriber2.connectionStatusChanged).toHaveBeenCalledWith(
        ConnectionState.Connected,
      )
      expect(instanceUnderTest.registeredSubscribers()).toHaveLength(2)
      expect(instanceUnderTest.getWatcher()).toBe(watcher)
    })

    it('notifies subscribers of a disconnection and then clears them', () => {
      instanceUnderTest.subscribe('id1', subscriber1)
      connect()

      instanceUnderTest.connectionStatusChanged(ConnectionState.Disconnected)

      expect(subscriber1.connectionStatusChanged).toHaveBeenCalledWith(
        ConnectionState.Disconnected,
      )
      expect(instanceUnderTest.registeredSubscribers()).toStrictEqual([])
      expect(instanceUnderTest.getWatcher()).toBeNull()
      expect(zenSubscription.unsubscribe).toHaveBeenCalledTimes(1)
    })
  })
})
