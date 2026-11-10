/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import {
  KeyNotFoundError,
  PhoneNumberNotFoundError,
  UnsealingFailedError,
} from '../../../public/errors'
import {
  PhoneMessageEntity,
  SealedPhoneMessageEntity,
} from '../../domain/entities/phone-message/phoneMessageEntity'
import {
  FailedPhoneMessage,
  PhoneMessageUnsealer,
  UnsealedPhoneMessages,
} from '../../domain/entities/phone-message/phoneMessageUnsealer'
import { PhoneNumberService } from '../../domain/entities/phone-number/phoneNumberService'
import { DeviceKeyWorker } from '../common/deviceKeyWorker'
import { PhoneMessageTransformer } from './transformer/phoneMessageTransformer'

/**
 * Unseals phone messages with the key registered for their phone number.
 *
 * The service seals a message with the public keys of the key ring it registered when the
 * number was provisioned, and the GraphQL message carries no key identifier, so the phone
 * number's key IDs are read and whichever of them this device holds the private half of
 * is used.
 */
export class DefaultPhoneMessageUnsealer implements PhoneMessageUnsealer {
  private readonly log: Logger
  private readonly phoneMessageTransformer: PhoneMessageTransformer

  constructor(
    private readonly phoneNumberService: PhoneNumberService,
    private readonly deviceKeyWorker: DeviceKeyWorker,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
    this.phoneMessageTransformer = new PhoneMessageTransformer()
  }

  async unseal(
    phoneNumberId: string,
    sealed: SealedPhoneMessageEntity[],
  ): Promise<UnsealedPhoneMessages> {
    if (sealed.length === 0) {
      return { unsealed: [], failed: [] }
    }
    // Resolved once for the page rather than once per message.
    const keyId = await this.resolveKeyId(phoneNumberId)
    const unsealed: PhoneMessageEntity[] = []
    const failed: FailedPhoneMessage[] = []
    for (const message of sealed) {
      try {
        unsealed.push(await this.unsealOne(message, keyId))
      } catch (err) {
        this.log.error('failed to unseal message', { id: message.id, err })
        failed.push({
          item: this.phoneMessageTransformer.fromSealedToPartialEntity(message),
          cause: new UnsealingFailedError(
            `Could not unseal message ${message.id}`,
            err,
          ),
        })
      }
    }
    return { unsealed, failed }
  }

  private async resolveKeyId(phoneNumberId: string): Promise<string> {
    const phoneNumber = await this.phoneNumberService.get(phoneNumberId)
    if (!phoneNumber) {
      throw new PhoneNumberNotFoundError('Phone number not found')
    }
    for (const keyId of phoneNumber.keyIds) {
      if (await this.deviceKeyWorker.privateKeyExists(keyId)) {
        return keyId
      }
    }
    throw new KeyNotFoundError(
      'The key that sealed this message is not held on this device',
    )
  }

  private async unsealOne(
    sealed: SealedPhoneMessageEntity,
    keyId: string,
  ): Promise<PhoneMessageEntity> {
    return this.phoneMessageTransformer.fromSealedToEntity(sealed, {
      // A withheld number is absent rather than sealed, so it stays undefined.
      remotePhoneNumber:
        sealed.remotePhoneNumber !== undefined
          ? await this.deviceKeyWorker.unsealString(
              keyId,
              sealed.remotePhoneNumber,
            )
          : undefined,
      body: await this.deviceKeyWorker.unsealString(keyId, sealed.body),
    })
  }
}
