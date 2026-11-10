/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { SudoEntitlementsClient } from '@sudoplatform/sudo-entitlements'
import {
  Entitlement,
  SudoEntitlementsAdminClient,
} from '@sudoplatform/sudo-entitlements-admin'

export class EntitlementsBuilder {
  private entitlementsClient?: SudoEntitlementsClient
  private entitlementsAdminClient?: SudoEntitlementsAdminClient
  private entitlements: Entitlement[] = [
    { name: 'sudoplatform.telephony.serviceUserEntitled', value: 1 },
    { name: 'sudoplatform.telephony.phoneNumberMaxPerUser', value: 2 },
    { name: 'sudoplatform.telephony.phoneNumberMaxPerSudo', value: 1 },
    { name: 'sudoplatform.sudo.max', value: 10 },
  ]
  private log: Logger = new DefaultLogger(this.constructor.name)

  setEntitlementsClient(
    entitlementsClient: SudoEntitlementsClient,
  ): EntitlementsBuilder {
    this.entitlementsClient = entitlementsClient
    return this
  }

  setEntitlementsAdminClient(
    entitlementsAdminClient: SudoEntitlementsAdminClient,
  ): EntitlementsBuilder {
    this.entitlementsAdminClient = entitlementsAdminClient
    return this
  }

  setEntitlement(entitlement: Entitlement): EntitlementsBuilder {
    const existing = this.entitlements.find((e) => e.name === entitlement.name)
    if (existing) {
      existing.value = entitlement.value
    } else {
      this.entitlements.push(entitlement)
    }
    return this
  }

  setLogger(log: Logger): EntitlementsBuilder {
    this.log = log
    return this
  }

  async apply(): Promise<void> {
    if (!this.entitlementsClient) {
      throw 'Entitlements client not set'
    }
    if (!this.entitlementsAdminClient) {
      throw 'Entitlements admin client not set'
    }
    const externalId = await this.entitlementsClient.getExternalId()
    this.log.info('Applying entitlements', { externalId })
    await this.entitlementsAdminClient.applyEntitlementsToUser(
      externalId,
      this.entitlements,
    )
    await this.entitlementsClient.redeemEntitlements()
  }
}
