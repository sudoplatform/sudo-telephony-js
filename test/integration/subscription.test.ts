/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger } from '@sudoplatform/sudo-common'
import { v4 } from 'uuid'
import waitForExpect from 'wait-for-expect'
import {
  ConnectionState,
  PhoneMessageEvent,
  PhoneMessageSubscriber,
  PhoneNumber,
  PhoneNumberState,
  PhoneNumberSubscriber,
  SudoTelephonyClient,
} from '../../src/public'
import { PhoneNumberTestHelper } from './util/phoneNumbers'
import {
  SetupTelephonyClientOutput,
  setupTelephonyClient,
  teardownTelephonyClient,
} from './util/telephonyClientLifecycle'

class RecordingPhoneNumberSubscriber implements PhoneNumberSubscriber {
  readonly updates: PhoneNumber[] = []
  readonly states: ConnectionState[] = []

  phoneNumberUpdated(phoneNumber: PhoneNumber): void {
    this.updates.push(phoneNumber)
  }

  connectionStatusChanged(state: ConnectionState): void {
    this.states.push(state)
  }
}

class RecordingPhoneMessageSubscriber implements PhoneMessageSubscriber {
  readonly events: PhoneMessageEvent[] = []
  readonly states: ConnectionState[] = []

  phoneMessageEvent(event: PhoneMessageEvent): void {
    this.events.push(event)
  }

  connectionStatusChanged(state: ConnectionState): void {
    this.states.push(state)
  }
}

describe('PhoneNumber Subscription Test Suite', () => {
  const log = new DefaultLogger('SubscriptionIntegrationTests')
  const updateTimeoutMs = 90_000
  const subscriptionId = 'phone-number-subscription'
  let setup: SetupTelephonyClientOutput | undefined
  let instanceUnderTest: SudoTelephonyClient
  let helper: PhoneNumberTestHelper
  let subscriber: RecordingPhoneNumberSubscriber

  beforeAll(async () => {
    setup = await setupTelephonyClient(log)
    instanceUnderTest = setup.telephonyClient
    helper = new PhoneNumberTestHelper(
      instanceUnderTest,
      setup.profilesClient,
      log,
    )
    subscriber = new RecordingPhoneNumberSubscriber()
    await instanceUnderTest.subscribeToPhoneNumbers(subscriptionId, subscriber)
  })

  afterEach(async () => {
    await helper.cleanUp()
  })

  afterAll(async () => {
    instanceUnderTest?.unsubscribeFromPhoneNumbers(subscriptionId)
    await teardownTelephonyClient(setup, log)
  })

  it('reports the connection opening', () => {
    expect(subscriber.states).toContain(ConnectionState.Connected)
  })

  it('reports the phone message connection opening', async () => {
    // A test cannot cause an inbound SMS, so only the connection is observable here.
    const messageSubscriber = new RecordingPhoneMessageSubscriber()
    await instanceUnderTest.subscribeToPhoneMessages(
      'phone-message-subscription',
      messageSubscriber,
    )

    expect(messageSubscriber.states).toContain(ConnectionState.Connected)
    instanceUnderTest.unsubscribeFromPhoneMessages('phone-message-subscription')
  })

  it('delivers the number becoming active', async () => {
    const { number } = await helper.provisionANumber()
    expect(number.state).toBe(PhoneNumberState.Provisioning)

    // Wait for the update that reports the terminal state, not the first one.
    await waitForExpect(
      () => {
        const update = subscriber.updates.find(
          (u) => u.id === number.id && u.state === PhoneNumberState.Active,
        )
        expect(update?.phoneNumber).toBe(number.phoneNumber)
        expect(update?.version).toBeGreaterThan(number.version)
      },
      updateTimeoutMs,
      1000,
    )
  })

  it('delivers to a subscriber joining an open subscription', async () => {
    const late = new RecordingPhoneNumberSubscriber()
    await instanceUnderTest.subscribeToPhoneNumbers('late-subscriber', late)
    // The service announces the connection once per web socket, so the SDK
    // must report it to a late subscriber itself.
    expect(late.states).toContain(ConnectionState.Connected)

    const { number } = await helper.provisionANumber()

    await waitForExpect(
      () => {
        expect(subscriber.updates.some((u) => u.id === number.id)).toBe(true)
        expect(late.updates.some((u) => u.id === number.id)).toBe(true)
      },
      updateTimeoutMs,
      1000,
    )
    instanceUnderTest.unsubscribeFromPhoneNumbers('late-subscriber')
  })

  it('stops delivery to an unsubscribed subscriber', async () => {
    const transient = new RecordingPhoneNumberSubscriber()
    const id = `transient-${v4()}`
    await instanceUnderTest.subscribeToPhoneNumbers(id, transient)
    instanceUnderTest.unsubscribeFromPhoneNumbers(id)

    const { number } = await helper.provisionANumber()

    // The class-wide subscriber keeps the subscription open, so delivery
    // continues for it while the unsubscribed one hears nothing more.
    await waitForExpect(
      () => {
        expect(subscriber.updates.some((u) => u.id === number.id)).toBe(true)
      },
      updateTimeoutMs,
      1000,
    )
    expect(transient.updates.some((u) => u.id === number.id)).toBe(false)
  })
})
