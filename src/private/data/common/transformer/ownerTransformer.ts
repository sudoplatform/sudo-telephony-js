/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Owner } from '@sudoplatform/sudo-common'
import { OwnerEntity } from '../../../domain/entities/common/ownerEntity'

/**
 * Issuer of the ownership proofs that tie a resource to a Sudo.
 */
export const SUDO_SERVICE_ISSUER = 'sudoplatform.sudoservice'

export class OwnerTransformer {
  fromGraphQLToEntity(data: { id: string; issuer: string }): OwnerEntity {
    return { id: data.id, issuer: data.issuer }
  }

  fromEntityToAPI(entity: OwnerEntity): Owner {
    return { id: entity.id, issuer: entity.issuer }
  }

  /**
   * Returns the ID of the Sudo among the owners, or `undefined` when none of
   * them is a Sudo.
   */
  sudoIdFrom(owners: OwnerEntity[]): string | undefined {
    return owners.find((owner) => owner.issuer === SUDO_SERVICE_ISSUER)?.id
  }
}
