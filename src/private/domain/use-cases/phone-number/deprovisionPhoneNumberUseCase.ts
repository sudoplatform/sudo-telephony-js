/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { PhoneNumberEntity } from '../../entities/phone-number/phoneNumberEntity'
import { PhoneNumberService } from '../../entities/phone-number/phoneNumberService'

/**
 * Application business logic for releasing a phone number.
 */
export class DeprovisionPhoneNumberUseCase {
  private readonly log: Logger

  public constructor(private readonly phoneNumberService: PhoneNumberService) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(id: string): Promise<PhoneNumberEntity> {
    this.log.debug(this.constructor.name, { id })
    return await this.phoneNumberService.deprovision(id)
  }
}
