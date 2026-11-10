/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultConfigurationManager } from '@sudoplatform/sudo-common'
import {
  TelephonyServiceConfig,
  getTelephonyServiceConfig,
} from '../../../../../src/private/data/common/config'
import { TelephonyServiceConfigNotFoundError } from '../../../../../src/public/errors'

describe('Config Test Suite', () => {
  const telephonyServiceConfig: TelephonyServiceConfig = {
    apiUrl: 'api-url',
    region: 'region',
  }

  describe('getTelephonyServiceConfig', () => {
    it('throws a TelephonyServiceConfigNotFoundError if config has no telephonyService stanza', () => {
      DefaultConfigurationManager.getInstance().setConfig(JSON.stringify({}))

      expect(() => getTelephonyServiceConfig()).toThrow(
        TelephonyServiceConfigNotFoundError,
      )
    })

    it('returns config if telephonyService stanza is present', () => {
      DefaultConfigurationManager.getInstance().setConfig(
        JSON.stringify({ telephonyService: telephonyServiceConfig }),
      )

      expect(getTelephonyServiceConfig()).toStrictEqual(telephonyServiceConfig)
    })
  })
})
