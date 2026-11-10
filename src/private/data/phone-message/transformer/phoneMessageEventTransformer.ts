/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { OnPhoneMessageEventSubscription } from '../../../../gen/graphqlTypes'
import { PhoneMessageEvent } from '../../../../public/typings/phoneMessageEvent'
import { PhoneMessageEventEntity } from '../../../domain/entities/phone-message/phoneMessageEntity'
import { OwnerTransformer } from '../../common/transformer/ownerTransformer'
import {
  PhoneMessageChangeTypeTransformer,
  PhoneMessageDirectionTransformer,
  PhoneMessageTypeTransformer,
} from './phoneMessageEnumTransformers'

export type PhoneMessageEventGraphQL = NonNullable<
  OnPhoneMessageEventSubscription['onPhoneMessageEvent']
>

export class PhoneMessageEventTransformer {
  private readonly ownerTransformer = new OwnerTransformer()
  private readonly typeTransformer = new PhoneMessageTypeTransformer()
  private readonly directionTransformer = new PhoneMessageDirectionTransformer()
  private readonly changeTypeTransformer =
    new PhoneMessageChangeTypeTransformer()

  fromGraphQLToEntity(data: PhoneMessageEventGraphQL): PhoneMessageEventEntity {
    return {
      id: data.id,
      phoneNumberId: data.phoneNumberId,
      conversationId: data.conversationId,
      type: this.typeTransformer.fromGraphQLToEntity(data.type),
      direction: this.directionTransformer.fromGraphQLToEntity(data.direction),
      changeType: this.changeTypeTransformer.fromGraphQLToEntity(
        data.changeType,
      ),
      seen: data.seen,
      owner: data.owner,
      owners: data.owners.map((owner) =>
        this.ownerTransformer.fromGraphQLToEntity(owner),
      ),
      version: data.version,
      updatedAt: new Date(data.updatedAtEpochMs),
    }
  }

  fromEntityToAPI(entity: PhoneMessageEventEntity): PhoneMessageEvent {
    return {
      id: entity.id,
      phoneNumberId: entity.phoneNumberId,
      conversationId: entity.conversationId,
      type: this.typeTransformer.fromEntityToAPI(entity.type),
      direction: this.directionTransformer.fromEntityToAPI(entity.direction),
      changeType: this.changeTypeTransformer.fromEntityToAPI(entity.changeType),
      seen: entity.seen,
      owner: entity.owner,
      owners: entity.owners.map((owner) =>
        this.ownerTransformer.fromEntityToAPI(owner),
      ),
      sudoId: this.ownerTransformer.sudoIdFrom(entity.owners),
      version: entity.version,
      updatedAt: entity.updatedAt,
    }
  }
}
