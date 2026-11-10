/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DefaultLogger,
  Logger,
  NotSignedInError,
} from '@sudoplatform/sudo-common'
import { SudoUserClient } from '@sudoplatform/sudo-user'
import { PhoneNumberSubscriber } from '../../../../public/typings/subscription'
import { PhoneNumberService } from '../../entities/phone-number/phoneNumberService'

/**
 * Input for `SubscribeToPhoneNumbersUseCase`.
 *
 * @interface SubscribeToPhoneNumbersUseCaseInput
 * @property {string} subscriptionId A unique identifier for this subscription.
 * @property {PhoneNumberSubscriber} subscriber The subscriber to receive events.
 */
export interface SubscribeToPhoneNumbersUseCaseInput {
  subscriptionId: string
  subscriber: PhoneNumberSubscriber
}

/**
 * Application business logic for subscribing to phone number change events.
 */
export class SubscribeToPhoneNumbersUseCase {
  private readonly log: Logger

  public constructor(
    private readonly phoneNumberService: PhoneNumberService,
    private readonly sudoUserClient: SudoUserClient,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: SubscribeToPhoneNumbersUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      subscriptionId: input.subscriptionId,
    })
    const owner = await this.sudoUserClient.getSubject()
    if (!owner) {
      throw new NotSignedInError()
    }
    await this.phoneNumberService.subscribe({
      subscriptionId: input.subscriptionId,
      owner,
      subscriber: input.subscriber,
    })
  }
}
