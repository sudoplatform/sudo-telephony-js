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
import { PhoneMessageSubscriber } from '../../../../public/typings/subscription'
import { PhoneMessageService } from '../../entities/phone-message/phoneMessageService'

/**
 * Input for `SubscribeToPhoneMessagesUseCase`.
 *
 * @interface SubscribeToPhoneMessagesUseCaseInput
 * @property {string} subscriptionId A unique identifier for this subscription.
 * @property {PhoneMessageSubscriber} subscriber The subscriber to receive events.
 */
export interface SubscribeToPhoneMessagesUseCaseInput {
  subscriptionId: string
  subscriber: PhoneMessageSubscriber
}

/**
 * Application business logic for subscribing to phone message events.
 */
export class SubscribeToPhoneMessagesUseCase {
  private readonly log: Logger

  public constructor(
    private readonly phoneMessageService: PhoneMessageService,
    private readonly sudoUserClient: SudoUserClient,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: SubscribeToPhoneMessagesUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      subscriptionId: input.subscriptionId,
    })
    const owner = await this.sudoUserClient.getSubject()
    if (!owner) {
      throw new NotSignedInError()
    }
    await this.phoneMessageService.subscribe({
      subscriptionId: input.subscriptionId,
      owner,
      subscriber: input.subscriber,
    })
  }
}
