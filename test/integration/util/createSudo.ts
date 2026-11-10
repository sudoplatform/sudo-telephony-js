/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sudo, SudoProfilesClient } from '@sudoplatform/sudo-profiles'
import waitForExpect from 'wait-for-expect'

export const createSudo = async (
  profilesClient: SudoProfilesClient,
): Promise<Sudo> => {
  let sudo: Sudo | undefined
  // Retried to give entitlements time to become consistent.
  await waitForExpect(
    async () => {
      // Created without claims: a claim would be encrypted with the test
      // symmetric key, which is not a valid AES key length.
      sudo = await profilesClient.createSudo(new Sudo())
      expect(sudo.id).toBeTruthy()
    },
    5000,
    500,
  )
  if (!sudo?.id) {
    throw new Error('Failed to create sudo with id')
  }
  return sudo
}
