/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { PhoneMessageService } from '../../entities/phone-message/phoneMessageService'

/**
 * Application business logic for unsubscribing from phone message events.
 */
export class UnsubscribeFromPhoneMessagesUseCase {
  private readonly log: Logger

  public constructor(
    private readonly phoneMessageService: PhoneMessageService,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  execute(subscriptionId: string): void {
    this.log.debug(this.constructor.name, { subscriptionId })
    this.phoneMessageService.unsubscribe(subscriptionId)
  }
}
