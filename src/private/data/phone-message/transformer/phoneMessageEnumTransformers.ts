/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PhoneMessageChangeType as PhoneMessageChangeTypeGraphQL,
  PhoneMessageDirection as PhoneMessageDirectionGraphQL,
  PhoneMessageType as PhoneMessageTypeGraphQL,
  SortOrder as SortOrderGraphQL,
} from '../../../../gen/graphqlTypes'
import {
  PhoneMessageDirection,
  PhoneMessageType,
  SortOrder,
} from '../../../../public/typings/phoneMessage'
import { PhoneMessageChangeType } from '../../../../public/typings/phoneMessageEvent'
import {
  PhoneMessageChangeTypeEntity,
  PhoneMessageDirectionEntity,
  PhoneMessageTypeEntity,
  SortOrderEntity,
} from '../../../domain/entities/phone-message/phoneMessageEntity'

export class PhoneMessageTypeTransformer {
  fromGraphQLToEntity(data: PhoneMessageTypeGraphQL): PhoneMessageTypeEntity {
    switch (data) {
      case 'SMS':
        return PhoneMessageTypeEntity.Sms
      default:
        return PhoneMessageTypeEntity.Unknown
    }
  }

  fromEntityToAPI(entity: PhoneMessageTypeEntity): PhoneMessageType {
    switch (entity) {
      case PhoneMessageTypeEntity.Sms:
        return PhoneMessageType.Sms
      default:
        return PhoneMessageType.Unknown
    }
  }
}

export class PhoneMessageDirectionTransformer {
  fromGraphQLToEntity(
    data: PhoneMessageDirectionGraphQL,
  ): PhoneMessageDirectionEntity {
    switch (data) {
      case 'INBOUND':
        return PhoneMessageDirectionEntity.Inbound
      default:
        return PhoneMessageDirectionEntity.Unknown
    }
  }

  fromEntityToAPI(entity: PhoneMessageDirectionEntity): PhoneMessageDirection {
    switch (entity) {
      case PhoneMessageDirectionEntity.Inbound:
        return PhoneMessageDirection.Inbound
      default:
        return PhoneMessageDirection.Unknown
    }
  }
}

export class PhoneMessageChangeTypeTransformer {
  fromGraphQLToEntity(
    data: PhoneMessageChangeTypeGraphQL,
  ): PhoneMessageChangeTypeEntity {
    switch (data) {
      case 'RECEIVED':
        return PhoneMessageChangeTypeEntity.Received
      case 'UPDATED':
        return PhoneMessageChangeTypeEntity.Updated
      case 'DELETED':
        return PhoneMessageChangeTypeEntity.Deleted
      default:
        return PhoneMessageChangeTypeEntity.Unknown
    }
  }

  fromEntityToAPI(
    entity: PhoneMessageChangeTypeEntity,
  ): PhoneMessageChangeType {
    switch (entity) {
      case PhoneMessageChangeTypeEntity.Received:
        return PhoneMessageChangeType.Received
      case PhoneMessageChangeTypeEntity.Updated:
        return PhoneMessageChangeType.Updated
      case PhoneMessageChangeTypeEntity.Deleted:
        return PhoneMessageChangeType.Deleted
      default:
        return PhoneMessageChangeType.Unknown
    }
  }
}

export class SortOrderTransformer {
  fromAPIToEntity(data: SortOrder): SortOrderEntity {
    switch (data) {
      case SortOrder.Asc:
        return SortOrderEntity.Asc
      case SortOrder.Desc:
        return SortOrderEntity.Desc
    }
  }

  fromEntityToGraphQL(entity: SortOrderEntity): SortOrderGraphQL {
    switch (entity) {
      case SortOrderEntity.Asc:
        return 'ASC'
      case SortOrderEntity.Desc:
        return 'DESC'
    }
  }
}
