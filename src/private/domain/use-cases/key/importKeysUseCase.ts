/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { DeviceKeyWorker } from '../../../data/common/deviceKeyWorker'

/**
 * Application business logic for replacing the keys held on this device with those in
 * an archive.
 */
export class ImportKeysUseCase {
  private readonly log: Logger

  public constructor(private readonly deviceKeyWorker: DeviceKeyWorker) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(archiveData: ArrayBuffer): Promise<void> {
    this.log.debug(this.constructor.name)
    await this.deviceKeyWorker.importKeys(archiveData)
  }
}
