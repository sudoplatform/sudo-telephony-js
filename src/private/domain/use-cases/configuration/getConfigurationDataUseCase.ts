/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { ConfigurationDataEntity } from '../../entities/configuration/configurationDataEntity'
import { ConfigurationDataService } from '../../entities/configuration/configurationDataService'

/**
 * Application business logic for retrieving the telephony service configuration.
 */
export class GetConfigurationDataUseCase {
  private readonly log: Logger

  public constructor(
    private readonly configurationDataService: ConfigurationDataService,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(): Promise<ConfigurationDataEntity> {
    this.log.debug(this.constructor.name)
    return await this.configurationDataService.getConfigurationData()
  }
}
