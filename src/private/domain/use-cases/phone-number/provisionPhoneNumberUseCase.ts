/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { isDefinitiveRejection } from '../../../data/common/definitiveRejection'
import {
  DeviceKey,
  DeviceKeyWorker,
} from '../../../data/common/deviceKeyWorker'
import { SingletonKeyPairNotFoundError } from '../../../../public/errors'
import { removeKeyPairs } from '../../../util/removeKeyPairs'
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
 * Gets the key pair that seals the number's messages before handing the request to the
 * service, so the private key is stored on the device and only the public key is registered.
 *
 * With `enforceSingletonKeyPair`, every number uses the singleton key pair, which must
 * already exist and is never removed. Otherwise a new key pair is generated per number, and
 * removed again only when the service definitively refuses the request.
 */
export class ProvisionPhoneNumberUseCase {
  private readonly log: Logger

  public constructor(
    private readonly phoneNumberService: PhoneNumberService,
    private readonly deviceKeyWorker: DeviceKeyWorker,
    private readonly enforceSingletonKeyPair: boolean,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(
    input: ProvisionPhoneNumberUseCaseInput,
  ): Promise<PhoneNumberEntity> {
    this.log.debug(this.constructor.name, {
      searchId: input.searchId,
      clientRefId: input.clientRefId,
      enforceSingletonKeyPair: this.enforceSingletonKeyPair,
    })
    const key = this.enforceSingletonKeyPair
      ? await this.requireSingletonKeyPair()
      : await this.deviceKeyWorker.generateKeyPair()
    try {
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
    } catch (err) {
      if (!this.enforceSingletonKeyPair && isDefinitiveRejection(err)) {
        // Best effort: the provisioning error is the one to report.
        const failures = await removeKeyPairs(this.deviceKeyWorker, [key.id])
        for (const failure of failures) {
          this.log.warn(
            'could not remove the key pair of a rejected provision; it stays on this device',
            { keyId: failure.keyId, err: failure.error },
          )
        }
      }
      throw err
    }
  }

  /**
   * The singleton key pair, which `createSingletonKeysIfAbsent` creates. Provisioning never
   * creates it, so the app always knows when the device's key material changes.
   */
  private async requireSingletonKeyPair(): Promise<DeviceKey> {
    const key = await this.deviceKeyWorker.getSingletonKeyPair()
    if (!key) {
      throw new SingletonKeyPairNotFoundError()
    }
    return key
  }
}
