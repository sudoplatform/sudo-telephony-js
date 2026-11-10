/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { PhoneMessageBatchResultEntity } from '../../entities/phone-message/phoneMessageEntity'
import { PhoneMessageService } from '../../entities/phone-message/phoneMessageService'

/**
 * Application business logic for deleting a batch of the caller's phone messages.
 */
export class DeletePhoneMessagesUseCase {
  private readonly log: Logger

  public constructor(
    private readonly phoneMessageService: PhoneMessageService,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(ids: string[]): Promise<PhoneMessageBatchResultEntity> {
    this.log.debug(this.constructor.name, { count: ids.length })
    return await this.phoneMessageService.delete(ids)
  }
}
