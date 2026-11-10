/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { SealedPhoneMessage as SealedPhoneMessageGraphQL } from '../../../../gen/graphqlTypes'
import {
  PartialPhoneMessage,
  PhoneMessage,
} from '../../../../public/typings/phoneMessage'
import {
  PartialPhoneMessageEntity,
  PhoneMessageEntity,
  SealedPhoneMessageEntity,
} from '../../../domain/entities/phone-message/phoneMessageEntity'
import { OwnerTransformer } from '../../common/transformer/ownerTransformer'
import {
  PhoneMessageDirectionTransformer,
  PhoneMessageTypeTransformer,
} from './phoneMessageEnumTransformers'

export class PhoneMessageTransformer {
  private readonly ownerTransformer = new OwnerTransformer()
  private readonly typeTransformer = new PhoneMessageTypeTransformer()
  private readonly directionTransformer = new PhoneMessageDirectionTransformer()

  fromGraphQLToSealedEntity(
    data: SealedPhoneMessageGraphQL,
  ): SealedPhoneMessageEntity {
    return {
      id: data.id,
      owner: data.owner,
      owners: data.owners.map((owner) =>
        this.ownerTransformer.fromGraphQLToEntity(owner),
      ),
      phoneNumberId: data.phoneNumberId,
      conversationId: data.conversationId,
      type: this.typeTransformer.fromGraphQLToEntity(data.type),
      direction: this.directionTransformer.fromGraphQLToEntity(data.direction),
      localPhoneNumber: data.localPhoneNumber,
      remotePhoneNumber: data.remotePhoneNumber ?? undefined,
      body: data.body,
      segmentCount: data.segmentCount,
      mediaOmitted: data.mediaOmitted,
      seen: data.seen,
      receivedAt: new Date(data.receivedAtEpochMs),
      version: data.version,
      createdAt: new Date(data.createdAtEpochMs),
      updatedAt: new Date(data.updatedAtEpochMs),
    }
  }

  /**
   * Builds the readable message from a sealed one and its unsealed field values.
   */
  fromSealedToEntity(
    sealed: SealedPhoneMessageEntity,
    unsealed: { remotePhoneNumber?: string; body: string },
  ): PhoneMessageEntity {
    return {
      ...this.fromSealedToPartialEntity(sealed),
      remotePhoneNumber: unsealed.remotePhoneNumber,
      body: unsealed.body,
    }
  }

  /**
   * Drops the sealed fields of a message that could not be unsealed.
   */
  fromSealedToPartialEntity(
    sealed: SealedPhoneMessageEntity,
  ): PartialPhoneMessageEntity {
    return {
      id: sealed.id,
      owner: sealed.owner,
      owners: sealed.owners,
      phoneNumberId: sealed.phoneNumberId,
      conversationId: sealed.conversationId,
      type: sealed.type,
      direction: sealed.direction,
      localPhoneNumber: sealed.localPhoneNumber,
      segmentCount: sealed.segmentCount,
      mediaOmitted: sealed.mediaOmitted,
      seen: sealed.seen,
      receivedAt: sealed.receivedAt,
      version: sealed.version,
      createdAt: sealed.createdAt,
      updatedAt: sealed.updatedAt,
    }
  }

  fromEntityToAPI(entity: PhoneMessageEntity): PhoneMessage {
    return {
      ...this.fromPartialEntityToAPI(entity),
      remotePhoneNumber: entity.remotePhoneNumber,
      body: entity.body,
    }
  }

  fromPartialEntityToAPI(
    entity: PartialPhoneMessageEntity,
  ): PartialPhoneMessage {
    return {
      id: entity.id,
      owner: entity.owner,
      owners: entity.owners.map((owner) =>
        this.ownerTransformer.fromEntityToAPI(owner),
      ),
      sudoId: this.ownerTransformer.sudoIdFrom(entity.owners),
      phoneNumberId: entity.phoneNumberId,
      conversationId: entity.conversationId,
      type: this.typeTransformer.fromEntityToAPI(entity.type),
      direction: this.directionTransformer.fromEntityToAPI(entity.direction),
      localPhoneNumber: entity.localPhoneNumber,
      segmentCount: entity.segmentCount,
      mediaOmitted: entity.mediaOmitted,
      seen: entity.seen,
      receivedAt: entity.receivedAt,
      version: entity.version,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
  }
}
