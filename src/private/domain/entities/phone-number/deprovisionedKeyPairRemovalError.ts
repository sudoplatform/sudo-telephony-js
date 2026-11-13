/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { PhoneNumberEntity } from './phoneNumberEntity'

/**
 * Thrown when a phone number was released but its key pairs could not all be removed from
 * the device. The public client turns it into `KeyPairRemovalFailedError`.
 */
export class DeprovisionedKeyPairRemovalError extends Error {
  constructor(
    public readonly deprovisioned: PhoneNumberEntity,
    public readonly cause: unknown,
  ) {
    super('Phone number released, but its key pair could not be removed')
    this.name = this.constructor.name
  }
}
