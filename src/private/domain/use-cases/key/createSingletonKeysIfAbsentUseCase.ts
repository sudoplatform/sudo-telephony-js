/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import {
  DeviceKeyWorker,
  SingletonKeyPairResult,
} from '../../../data/common/deviceKeyWorker'
import { InvalidConfigError } from '../../../../public/errors'

/**
 * Output of `CreateSingletonKeysIfAbsentUseCase`.
 *
 * @interface CreateSingletonKeysIfAbsentUseCaseOutput
 * @property {SingletonKeyPairResult} keyPair Whether the singleton key pair was created, and
 *  its ID.
 */
export interface CreateSingletonKeysIfAbsentUseCaseOutput {
  keyPair: SingletonKeyPairResult
}

/**
 * Application business logic for creating the singleton key pair if this device doesn't
 * have it.
 */
export class CreateSingletonKeysIfAbsentUseCase {
  private readonly log: Logger

  public constructor(
    private readonly deviceKeyWorker: DeviceKeyWorker,
    private readonly enforceSingletonKeyPair: boolean,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  /**
   * @throws {InvalidConfigError} If the client doesn't enforce a singleton key pair, since
   *  each number then gets its own key when it is provisioned.
   */
  async execute(): Promise<CreateSingletonKeysIfAbsentUseCaseOutput> {
    this.log.debug(this.constructor.name)
    if (!this.enforceSingletonKeyPair) {
      throw new InvalidConfigError(
        'createSingletonKeysIfAbsent requires enforceSingletonKeyPair',
      )
    }
    return {
      keyPair: await this.deviceKeyWorker.createSingletonKeyPairIfAbsent(),
    }
  }
}
