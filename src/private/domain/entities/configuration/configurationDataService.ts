/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConfigurationDataEntity } from './configurationDataEntity'

/**
 * Core entity representation of a configuration data service used in business logic.
 * Used to retrieve the telephony service configuration.
 *
 * @interface ConfigurationDataService
 */
export interface ConfigurationDataService {
  /**
   * Retrieve the telephony service configuration.
   *
   * @returns {ConfigurationDataEntity} The configuration data.
   */
  getConfigurationData(): Promise<ConfigurationDataEntity>
}
