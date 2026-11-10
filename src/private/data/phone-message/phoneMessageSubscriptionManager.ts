/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { OnPhoneMessageEventSubscription } from '../../../gen/graphqlTypes'
import { PhoneMessageEvent } from '../../../public/typings/phoneMessageEvent'
import {
  ConnectionState,
  PhoneMessageSubscriber,
} from '../../../public/typings/subscription'
import { BaseSubscriptionManager } from '../common/baseSubscriptionManager'

export type Subscribable = OnPhoneMessageEventSubscription

export class PhoneMessageSubscriptionManager<
  T extends Subscribable,
  S extends PhoneMessageSubscriber,
>
  extends BaseSubscriptionManager<T, S>
  implements PhoneMessageSubscriber
{
  /**
   * Notifies subscribers of a phone message event.
   *
   * @param event The phone message event.
   */
  public phoneMessageEvent(event: PhoneMessageEvent): void {
    for (const subscriber of this.getSubscribers()) {
      subscriber.phoneMessageEvent(event)
    }
  }

  public connectionStatusChanged(state: ConnectionState): void {
    super.connectionStatusChanged(state)
  }
}
