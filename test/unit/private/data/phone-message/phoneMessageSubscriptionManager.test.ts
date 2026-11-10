/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { OnPhoneMessageEventSubscription } from '../../../../../src/gen/graphqlTypes'
import { PhoneMessageSubscriptionManager } from '../../../../../src/private/data/phone-message/phoneMessageSubscriptionManager'
import {
  ConnectionState,
  PhoneMessageSubscriber,
} from '../../../../../src/public'
import { APIDataFactory } from '../../../../data-factory/api'

describe('PhoneMessageSubscriptionManager Test Suite', () => {
  let instanceUnderTest: PhoneMessageSubscriptionManager<
    OnPhoneMessageEventSubscription,
    PhoneMessageSubscriber
  >
  let subscriber1: PhoneMessageSubscriber
  let subscriber2: PhoneMessageSubscriber

  beforeEach(() => {
    instanceUnderTest = new PhoneMessageSubscriptionManager()
    subscriber1 = {
      phoneMessageEvent: vi.fn(),
      connectionStatusChanged: vi.fn(),
    }
    subscriber2 = {
      phoneMessageEvent: vi.fn(),
      connectionStatusChanged: vi.fn(),
    }
    instanceUnderTest.subscribe('id1', subscriber1)
    instanceUnderTest.subscribe('id2', subscriber2)
  })

  it('delivers an event to every subscriber', () => {
    instanceUnderTest.phoneMessageEvent(APIDataFactory.phoneMessageEvent)

    expect(subscriber1.phoneMessageEvent).toHaveBeenCalledWith(
      APIDataFactory.phoneMessageEvent,
    )
    expect(subscriber2.phoneMessageEvent).toHaveBeenCalledWith(
      APIDataFactory.phoneMessageEvent,
    )
  })

  it('does not deliver to an unsubscribed subscriber', () => {
    instanceUnderTest.unsubscribe('id1')

    instanceUnderTest.phoneMessageEvent(APIDataFactory.phoneMessageEvent)

    expect(subscriber1.phoneMessageEvent).not.toHaveBeenCalled()
    expect(subscriber2.phoneMessageEvent).toHaveBeenCalledTimes(1)
  })

  it('passes connection changes to every subscriber', () => {
    instanceUnderTest.connectionStatusChanged(ConnectionState.Connected)

    expect(subscriber1.connectionStatusChanged).toHaveBeenCalledWith(
      ConnectionState.Connected,
    )
    expect(subscriber2.connectionStatusChanged).toHaveBeenCalledWith(
      ConnectionState.Connected,
    )
  })
})
