/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { PhoneNumberService } from '../../entities/phone-number/phoneNumberService'

/**
 * Application business logic for unsubscribing from phone number change events.
 */
export class UnsubscribeFromPhoneNumbersUseCase {
  private readonly log: Logger

  public constructor(private readonly phoneNumberService: PhoneNumberService) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  execute(subscriptionId: string): void {
    this.log.debug(this.constructor.name, { subscriptionId })
    this.phoneNumberService.unsubscribe(subscriptionId)
  }
}
