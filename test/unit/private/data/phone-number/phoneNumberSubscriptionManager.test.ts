/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { OnPhoneNumberUpdateSubscription } from '../../../../../src/gen/graphqlTypes'
import { PhoneNumberSubscriptionManager } from '../../../../../src/private/data/phone-number/phoneNumberSubscriptionManager'
import {
  ConnectionState,
  PhoneNumberSubscriber,
} from '../../../../../src/public'
import { APIDataFactory } from '../../../../data-factory/api'

describe('PhoneNumberSubscriptionManager Test Suite', () => {
  let instanceUnderTest: PhoneNumberSubscriptionManager<
    OnPhoneNumberUpdateSubscription,
    PhoneNumberSubscriber
  >
  let subscriber1: PhoneNumberSubscriber
  let subscriber2: PhoneNumberSubscriber

  beforeEach(() => {
    instanceUnderTest = new PhoneNumberSubscriptionManager()
    subscriber1 = {
      phoneNumberUpdated: vi.fn(),
      connectionStatusChanged: vi.fn(),
    }
    subscriber2 = {
      phoneNumberUpdated: vi.fn(),
      connectionStatusChanged: vi.fn(),
    }
    instanceUnderTest.subscribe('id1', subscriber1)
    instanceUnderTest.subscribe('id2', subscriber2)
  })

  it('delivers a phone number update to every subscriber', () => {
    instanceUnderTest.phoneNumberUpdated(APIDataFactory.phoneNumber)

    expect(subscriber1.phoneNumberUpdated).toHaveBeenCalledWith(
      APIDataFactory.phoneNumber,
    )
    expect(subscriber2.phoneNumberUpdated).toHaveBeenCalledWith(
      APIDataFactory.phoneNumber,
    )
  })

  it('does not deliver to an unsubscribed subscriber', () => {
    instanceUnderTest.unsubscribe('id1')

    instanceUnderTest.phoneNumberUpdated(APIDataFactory.phoneNumber)

    expect(subscriber1.phoneNumberUpdated).not.toHaveBeenCalled()
    expect(subscriber2.phoneNumberUpdated).toHaveBeenCalledTimes(1)
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
