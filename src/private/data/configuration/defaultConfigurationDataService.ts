/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConfigurationDataEntity } from '../../domain/entities/configuration/configurationDataEntity'
import { ConfigurationDataService } from '../../domain/entities/configuration/configurationDataService'
import { ApiClient } from '../common/apiClient'
import { ConfigurationDataTransformer } from './transformer/configurationDataTransformer'

export class DefaultConfigurationDataService implements ConfigurationDataService {
  private readonly configurationDataTransformer: ConfigurationDataTransformer

  constructor(private readonly appSync: ApiClient) {
    this.configurationDataTransformer = new ConfigurationDataTransformer()
  }

  async getConfigurationData(): Promise<ConfigurationDataEntity> {
    const result = await this.appSync.getTelephonyConfig()
    return this.configurationDataTransformer.fromGraphQLToEntity(result)
  }
}
