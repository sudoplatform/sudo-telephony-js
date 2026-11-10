/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import Observable from 'zen-observable'
import { ConnectionState } from '../../../public/typings/subscription'

/**
 * The shape of a subscription message delivered to a subscription observer's
 * `next` handler. Mirrors Amplify v6's `GraphqlSubscriptionMessage<T>`, whose
 * payload is carried under `data`.
 */
export type SubscriptionResult<T> = { data: T }

/**
 * Base interface that all subscription subscribers must implement.
 */
export interface BaseSubscriber {
  connectionStatusChanged(state: ConnectionState): void
}

/**
 * Abstract base class for subscription managers. Handles the shared
 * infrastructure of subscriber registration, watcher/subscription lifecycle,
 * connection state broadcasting, and teardown on disconnect.
 */
export abstract class BaseSubscriptionManager<T, S extends BaseSubscriber> {
  protected readonly log: Logger
  private subscribers: Record<string, S | undefined> = {}
  private subscription: ZenObservable.Subscription | undefined = undefined
  private watcher: Observable<SubscriptionResult<T>> | null = null

  public constructor() {
    this.log = new DefaultLogger(this.constructor.name)
  }

  private reset(): void {
    this.subscribers = {}
    this.subscription?.unsubscribe()
    this.watcher = null
    this.subscription = undefined
  }

  public subscribe(subscriptionId: string, subscriber: S): void {
    this.subscribers[subscriptionId] = subscriber
  }

  public unsubscribe(subscriptionId: string): void {
    delete this.subscribers[subscriptionId]

    if (Object.keys(this.subscribers).length === 0) {
      this.reset()
    }
  }

  public getWatcher(): Observable<SubscriptionResult<T>> | null {
    return this.watcher
  }

  public setWatcher(value: Observable<SubscriptionResult<T>> | null): void {
    this.watcher = value
  }

  public setSubscription(value: ZenObservable.Subscription | undefined): this {
    this.subscription = value
    return this
  }

  /**
   * Processes AppSync subscription connection status change.
   * Resets state on disconnect and notifies all subscribers.
   *
   * @param state The connection state.
   */
  public connectionStatusChanged(state: ConnectionState): void {
    const subscribersToNotify = Object.values(this.subscribers)

    if (state === ConnectionState.Disconnected) {
      this.reset()
    }

    subscribersToNotify.forEach((subscriber) => {
      if (subscriber && subscriber.connectionStatusChanged) {
        subscriber.connectionStatusChanged(state)
      }
    })
  }

  /**
   * Get all currently registered subscribers.
   */
  protected getSubscribers(): S[] {
    return Object.values(this.subscribers).filter(
      (s): s is S => s !== undefined,
    )
  }
}
