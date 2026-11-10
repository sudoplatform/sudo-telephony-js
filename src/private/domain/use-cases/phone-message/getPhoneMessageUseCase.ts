/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { PhoneMessageEntity } from '../../entities/phone-message/phoneMessageEntity'
import { PhoneMessageService } from '../../entities/phone-message/phoneMessageService'
import { PhoneMessageUnsealer } from '../../entities/phone-message/phoneMessageUnsealer'

/**
 * Application business logic for retrieving one of the caller's phone messages and making
 * it readable.
 */
export class GetPhoneMessageUseCase {
  private readonly log: Logger

  public constructor(
    private readonly phoneMessageService: PhoneMessageService,
    private readonly unsealer: PhoneMessageUnsealer,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(id: string): Promise<PhoneMessageEntity | undefined> {
    this.log.debug(this.constructor.name, { id })
    const sealed = await this.phoneMessageService.get(id)
    if (!sealed) {
      return undefined
    }
    const result = await this.unsealer.unseal(sealed.phoneNumberId, [sealed])
    if (result.failed.length > 0) {
      throw result.failed[0].cause
    }
    return result.unsealed[0]
  }
}
