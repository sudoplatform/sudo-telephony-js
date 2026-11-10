/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { DeviceKeyWorker } from '../../../data/common/deviceKeyWorker'
import { PhoneNumberEntity } from '../../entities/phone-number/phoneNumberEntity'
import { PhoneNumberService } from '../../entities/phone-number/phoneNumberService'

/**
 * Input for `ProvisionPhoneNumberUseCase`.
 *
 * @interface ProvisionPhoneNumberUseCaseInput
 * @property {string} searchId Unique identifier of the search the number came from.
 * @property {string} phoneNumber The number to provision, in E.164 format.
 * @property {string} ownershipProofToken Proof that the caller owns the Sudo the number will
 *  belong to.
 * @property {string} clientRefId Client-supplied reference that makes the request
 *  idempotent.
 */
export interface ProvisionPhoneNumberUseCaseInput {
  searchId: string
  phoneNumber: string
  ownershipProofToken?: string
  clientRefId?: string
}

/**
 * Application business logic for provisioning a phone number.
 *
 * Generates the key pair that seals the number's messages before handing the request to the
 * service, so the private key is stored on the device and only the public key is registered.
 * The key is kept if the request fails, because a retry with the same
 * `clientRefId` may return a number registered with it.
 */
export class ProvisionPhoneNumberUseCase {
  private readonly log: Logger

  public constructor(
    private readonly phoneNumberService: PhoneNumberService,
    private readonly deviceKeyWorker: DeviceKeyWorker,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(
    input: ProvisionPhoneNumberUseCaseInput,
  ): Promise<PhoneNumberEntity> {
    this.log.debug(this.constructor.name, {
      searchId: input.searchId,
      clientRefId: input.clientRefId,
    })
    const key = await this.deviceKeyWorker.generateKeyPair()
    return await this.phoneNumberService.provision({
      searchId: input.searchId,
      phoneNumber: input.phoneNumber,
      key: {
        keyId: key.id,
        algorithm: key.algorithm,
        keyFormat: key.format,
        publicKey: key.data,
      },
      ownershipProofToken: input.ownershipProofToken,
      clientRefId: input.clientRefId,
    })
  }
}
