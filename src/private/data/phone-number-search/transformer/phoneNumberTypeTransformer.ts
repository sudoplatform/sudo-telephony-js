/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { PhoneNumberType as PhoneNumberTypeGraphQL } from '../../../../gen/graphqlTypes'
import { PhoneNumberType } from '../../../../public/typings/phoneNumberSearch'
import { PhoneNumberTypeEntity } from '../../../domain/entities/phone-number-search/phoneNumberSearchEntity'

export class PhoneNumberTypeTransformer {
  fromGraphQLToEntity(data: PhoneNumberTypeGraphQL): PhoneNumberTypeEntity {
    switch (data) {
      case 'LOCAL':
        return PhoneNumberTypeEntity.Local
      default:
        return PhoneNumberTypeEntity.Unknown
    }
  }

  fromEntityToAPI(entity: PhoneNumberTypeEntity): PhoneNumberType {
    switch (entity) {
      case PhoneNumberTypeEntity.Local:
        return PhoneNumberType.Local
      default:
        return PhoneNumberType.Unknown
    }
  }
}
