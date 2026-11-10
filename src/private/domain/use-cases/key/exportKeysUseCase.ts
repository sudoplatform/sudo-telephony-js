/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { DeviceKeyWorker } from '../../../data/common/deviceKeyWorker'

/**
 * Application business logic for exporting the keys held on this device.
 */
export class ExportKeysUseCase {
  private readonly log: Logger

  public constructor(private readonly deviceKeyWorker: DeviceKeyWorker) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(): Promise<ArrayBuffer> {
    this.log.debug(this.constructor.name)
    return await this.deviceKeyWorker.exportKeys()
  }
}
