/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { DeviceKeyWorker } from '../../../data/common/deviceKeyWorker'
import { removeKeyPairs } from '../../../util/removeKeyPairs'
import { DeprovisionedKeyPairRemovalError } from '../../entities/phone-number/deprovisionedKeyPairRemovalError'
import { PhoneNumberEntity } from '../../entities/phone-number/phoneNumberEntity'
import { PhoneNumberService } from '../../entities/phone-number/phoneNumberService'

/**
 * Application business logic for releasing a phone number.
 *
 * Without `enforceSingletonKeyPair`, the number's key pairs are removed from the device once
 * the service has released it. Every key is attempted; if any can't be removed, a
 * `DeprovisionedKeyPairRemovalError` carrying the released number is thrown, so the caller
 * learns the key store failed without being told the number still exists. The singleton key
 * pair is never removed.
 */
export class DeprovisionPhoneNumberUseCase {
  private readonly log: Logger

  public constructor(
    private readonly phoneNumberService: PhoneNumberService,
    private readonly deviceKeyWorker: DeviceKeyWorker,
    private readonly enforceSingletonKeyPair: boolean,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(id: string): Promise<PhoneNumberEntity> {
    this.log.debug(this.constructor.name, {
      id,
      enforceSingletonKeyPair: this.enforceSingletonKeyPair,
    })
    const result = await this.phoneNumberService.deprovision(id)
    if (!this.enforceSingletonKeyPair) {
      const failures = await removeKeyPairs(this.deviceKeyWorker, result.keyIds)
      for (const failure of failures) {
        this.log.error(
          'could not remove the key pair of a deprovisioned phone number; it stays on this device',
          { id, keyId: failure.keyId, err: failure.error },
        )
      }
      if (failures.length > 0) {
        throw new DeprovisionedKeyPairRemovalError(result, failures[0].error)
      }
    }
    return result
  }
}
