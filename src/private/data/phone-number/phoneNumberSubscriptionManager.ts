/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { OnPhoneNumberUpdateSubscription } from '../../../gen/graphqlTypes'
import { PhoneNumber } from '../../../public/typings/phoneNumber'
import {
  ConnectionState,
  PhoneNumberSubscriber,
} from '../../../public/typings/subscription'
import { BaseSubscriptionManager } from '../common/baseSubscriptionManager'

export type Subscribable = OnPhoneNumberUpdateSubscription

export class PhoneNumberSubscriptionManager<
  T extends Subscribable,
  S extends PhoneNumberSubscriber,
>
  extends BaseSubscriptionManager<T, S>
  implements PhoneNumberSubscriber
{
  /**
   * Notifies subscribers of a phone number update.
   *
   * @param phoneNumber The updated phone number.
   */
  public phoneNumberUpdated(phoneNumber: PhoneNumber): void {
    for (const subscriber of this.getSubscribers()) {
      subscriber.phoneNumberUpdated(phoneNumber)
    }
  }

  public connectionStatusChanged(state: ConnectionState): void {
    super.connectionStatusChanged(state)
  }
}
