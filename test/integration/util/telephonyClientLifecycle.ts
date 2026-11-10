/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultApiClientManager } from '@sudoplatform/sudo-api-client'
import {
  DefaultConfigurationManager,
  DefaultLogger,
  DefaultSudoKeyManager,
  SudoKeyManager,
} from '@sudoplatform/sudo-common'
import { DefaultSudoEntitlementsClient } from '@sudoplatform/sudo-entitlements'
import { DefaultSudoEntitlementsAdminClient } from '@sudoplatform/sudo-entitlements-admin'
import {
  DefaultSudoProfilesClient,
  FetchOption,
  SudoProfilesClient,
} from '@sudoplatform/sudo-profiles'
import {
  DefaultSudoUserClient,
  SudoUserClient,
  TESTAuthenticationProvider,
} from '@sudoplatform/sudo-user'
import { WebSudoCryptoProvider } from '@sudoplatform/sudo-web-crypto-provider'
import * as fs from 'fs'
import { v4 } from 'uuid'
import { ApiClient } from '../../../src/private/data/common/apiClient'
import { PrivateSudoTelephonyClientOptions } from '../../../src/private/data/common/privateSudoTelephonyClientOptions'
import {
  DefaultSudoTelephonyClient,
  SudoTelephonyClient,
} from '../../../src/public'
import { EntitlementsBuilder } from './entitlements'

const configFile = 'config/sudoplatformconfig.json'
const registerKeyFile = 'config/register_key.private'
const registerKeyIdFile = 'config/register_key.id'
const adminApiKeyFile = 'config/admin_api_key.secret'

const readAdminApiKey = (): string | undefined =>
  fs.existsSync(adminApiKeyFile)
    ? fs.readFileSync(adminApiKeyFile).toString().trim()
    : process.env.ADMIN_API_KEY?.trim()

export function setupSudoPlatformConfig(log: DefaultLogger): void {
  try {
    DefaultConfigurationManager.getInstance().setConfig(
      fs.readFileSync(configFile).toString(),
    )
  } catch (err) {
    log.error(`${setupSudoPlatformConfig.name} FAILED`)
    throw err
  }
}

/**
 * Creates a key manager with its own in-memory store, standing in for the key store of
 * one device.
 */
export const newTelephonyKeyManager = (): SudoKeyManager =>
  new DefaultSudoKeyManager(
    new WebSudoCryptoProvider(
      'SudoTelephonyClient',
      'com.sudoplatform.appservicename',
    ),
  )

export interface SetupTelephonyClientOutput {
  telephonyClient: SudoTelephonyClient
  userClient: SudoUserClient
  profilesClient: SudoProfilesClient
  apiClient: ApiClient
  keyManager: SudoKeyManager
  owner: string
}

/**
 * Registers and signs in a new TEST user, applies the telephony entitlements
 * and builds a telephony client for it.
 */
export const setupTelephonyClient = async (
  log: DefaultLogger,
): Promise<SetupTelephonyClientOutput> => {
  const adminApiKey = readAdminApiKey()
  if (!adminApiKey) {
    throw new Error('ADMIN_API_KEY must be set')
  }
  setupSudoPlatformConfig(log)

  const userClient = new DefaultSudoUserClient({
    logger: log,
    sudoKeyManager: new DefaultSudoKeyManager(
      new WebSudoCryptoProvider(
        'SudoUserClient',
        'com.sudoplatform.appservicename',
      ),
    ),
  })
  await userClient.registerWithAuthenticationProvider(
    new TESTAuthenticationProvider(
      'telephony-js-test',
      fs.readFileSync(registerKeyFile).toString(),
      fs.readFileSync(registerKeyIdFile).toString().trim(),
    ),
    `telephony-JS-SDK-${v4()}`,
  )
  await userClient.signInWithKey()
  const owner = await userClient.getSubject()
  if (!owner) {
    throw new Error('Unable to resolve owner after sign in')
  }

  const apiClientManager =
    DefaultApiClientManager.getInstance().setAuthClient(userClient)

  await new EntitlementsBuilder()
    .setEntitlementsClient(new DefaultSudoEntitlementsClient(userClient))
    .setEntitlementsAdminClient(
      new DefaultSudoEntitlementsAdminClient(adminApiKey),
    )
    .setLogger(log)
    .apply()

  const profilesClient = new DefaultSudoProfilesClient({
    sudoUserClient: userClient,
    keyManager: new DefaultSudoKeyManager(
      new WebSudoCryptoProvider(
        'SudoProfileClient',
        'com.sudoplatform.appservicename',
      ),
    ),
  })
  await profilesClient.pushSymmetricKey(
    'telephonyIntegrationTest',
    '01234567890123456789',
  )
  // Hydrate the cache so later Sudo operations see the user's Sudos.
  await profilesClient.listSudos(FetchOption.RemoteOnly)

  const apiClient = new ApiClient(apiClientManager)
  const keyManager = newTelephonyKeyManager()
  const options: PrivateSudoTelephonyClientOptions = {
    sudoUserClient: userClient,
    apiClient,
    sudoKeyManager: keyManager,
  }
  const telephonyClient = new DefaultSudoTelephonyClient(options)

  return {
    telephonyClient,
    userClient,
    profilesClient,
    apiClient,
    keyManager,
    owner,
  }
}

/**
 * Deregisters the test user. Errors are logged rather than thrown so that
 * cleanup does not hide a test failure.
 */
export const teardownTelephonyClient = async (
  setup: SetupTelephonyClientOutput | undefined,
  log: DefaultLogger,
): Promise<void> => {
  if (!setup) {
    return
  }
  try {
    await setup.userClient.deregister()
    await setup.userClient.reset()
  } catch (err) {
    log.error('teardown failed', { err })
  }
}
