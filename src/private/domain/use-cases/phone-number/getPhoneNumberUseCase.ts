/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { PhoneNumberEntity } from '../../entities/phone-number/phoneNumberEntity'
import { PhoneNumberService } from '../../entities/phone-number/phoneNumberService'

/**
 * Application business logic for retrieving one of the caller's phone numbers.
 */
export class GetPhoneNumberUseCase {
  private readonly log: Logger

  public constructor(private readonly phoneNumberService: PhoneNumberService) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(id: string): Promise<PhoneNumberEntity | undefined> {
    this.log.debug(this.constructor.name, { id })
    return await this.phoneNumberService.get(id)
  }
}
