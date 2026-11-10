/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { PhoneMessageEvent } from './phoneMessageEvent'
import { PhoneNumber } from './phoneNumber'

/**
 * The Sudo Platform SDK representation of the connection state of a subscription.
 *
 * @enum ConnectionState
 */
export enum ConnectionState {
  /** Connected and receiving updates. */
  Connected = 'CONNECTED',
  /**
   * Disconnected and won't receive any updates. When disconnected all subscribers will be unsubscribed so
   * the consumer must re-subscribe.
   */
  Disconnected = 'DISCONNECTED',
}

/**
 * Subscriber for notifications about changes to the caller's {@link PhoneNumber}s.
 *
 * This is how a caller learns that a number being provisioned became {@link PhoneNumberState.Active} or
 * {@link PhoneNumberState.Failed}.
 *
 * @interface PhoneNumberSubscriber
 */
export interface PhoneNumberSubscriber {
  /**
   * Notifies the subscriber of an updated `PhoneNumber`.
   *
   * @param phoneNumber The phone number as it now stands.
   */
  phoneNumberUpdated(phoneNumber: PhoneNumber): void

  /**
   * Notifies the subscriber that the subscription connection state has changed.
   *
   * The subscriber is not notified of changes until the state becomes {@link ConnectionState.Connected}, and
   * stops receiving them when it becomes {@link ConnectionState.Disconnected}.
   *
   * @param state The connection state.
   */
  connectionStatusChanged(state: ConnectionState): void
}

/**
 * Subscriber for notifications about the caller's phone messages being received, updated or deleted.
 *
 * @interface PhoneMessageSubscriber
 */
export interface PhoneMessageSubscriber {
  /**
   * Notifies the subscriber of a `PhoneMessageEvent`.
   *
   * The event carries no message content; fetch the message with {@link SudoTelephonyClient.getPhoneMessage}
   * to read its text.
   *
   * @param event The change being reported.
   */
  phoneMessageEvent(event: PhoneMessageEvent): void

  /**
   * Notifies the subscriber that the subscription connection state has changed.
   *
   * The subscriber is not notified of events until the state becomes {@link ConnectionState.Connected}, and
   * stops receiving them when it becomes {@link ConnectionState.Disconnected}.
   *
   * @param state The connection state.
   */
  connectionStatusChanged(state: ConnectionState): void
}
