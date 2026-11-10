/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { SudoKeyManager } from '@sudoplatform/sudo-common'
import { internal as SudoUserInternal } from '@sudoplatform/sudo-user'
import { SudoTelephonyClientOptions } from '../../../public/sudoTelephonyClient'
import { ApiClient } from './apiClient'
import { TelephonyServiceConfig } from './config'

/**
 * Private DefaultSudoTelephonyClient options for supporting unit and
 * integration testing.
 */
export type PrivateSudoTelephonyClientOptions = {
  apiClient?: ApiClient
  sudoKeyManager?: SudoKeyManager
  identityServiceConfig?: SudoUserInternal.IdentityServiceConfig
  telephonyServiceConfig?: TelephonyServiceConfig
} & SudoTelephonyClientOptions
