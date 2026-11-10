/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultConfigurationManager } from '@sudoplatform/sudo-common'
import * as t from 'io-ts'
import { TelephonyServiceConfigNotFoundError } from '../../../public/errors'

/**
 * The name of the Sudo Platform configuration section for the telephony service.
 */
export const TELEPHONY_SERVICE_CONFIG_NAMESPACE = 'telephonyService'

const TelephonyServiceConfigCodec = t.type({
  apiUrl: t.string,
  region: t.string,
})

export type TelephonyServiceConfig = t.TypeOf<
  typeof TelephonyServiceConfigCodec
>

export const getTelephonyServiceConfig = (): TelephonyServiceConfig => {
  if (
    !DefaultConfigurationManager.getInstance().getConfigSet(
      TELEPHONY_SERVICE_CONFIG_NAMESPACE,
    )
  ) {
    throw new TelephonyServiceConfigNotFoundError()
  }
  return DefaultConfigurationManager.getInstance().bindConfigSet<TelephonyServiceConfig>(
    TelephonyServiceConfigCodec,
    TELEPHONY_SERVICE_CONFIG_NAMESPACE,
  )
}
