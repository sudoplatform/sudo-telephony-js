/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { PhoneMessageBatchResultEntity } from '../../entities/phone-message/phoneMessageEntity'
import { PhoneMessageService } from '../../entities/phone-message/phoneMessageService'

/**
 * Input for `UpdatePhoneMessagesUseCase`.
 *
 * @interface UpdatePhoneMessagesUseCaseInput
 * @property {string[]} ids Unique identifiers of the messages to update.
 * @property {boolean} seen The read state to set.
 */
export interface UpdatePhoneMessagesUseCaseInput {
  ids: string[]
  seen: boolean
}

/**
 * Application business logic for changing the read state of a batch of the caller's phone
 * messages.
 */
export class UpdatePhoneMessagesUseCase {
  private readonly log: Logger

  public constructor(
    private readonly phoneMessageService: PhoneMessageService,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(
    input: UpdatePhoneMessagesUseCaseInput,
  ): Promise<PhoneMessageBatchResultEntity> {
    this.log.debug(this.constructor.name, {
      count: input.ids.length,
      seen: input.seen,
    })
    return await this.phoneMessageService.update({
      ids: input.ids,
      seen: input.seen,
    })
  }
}
