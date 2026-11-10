/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Core entity representation of the owner of a resource, taken from an ownership proof.
 *
 * @interface OwnerEntity
 * @property {string} id Unique identifier of the owner, for example a Sudo ID.
 * @property {string} issuer Issuer of the ownership proof, for example
 *  `sudoplatform.sudoservice`.
 */
export interface OwnerEntity {
  id: string
  issuer: string
}
