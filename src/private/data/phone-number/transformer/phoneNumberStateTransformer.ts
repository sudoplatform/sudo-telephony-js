/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { PhoneNumberState as PhoneNumberStateGraphQL } from '../../../../gen/graphqlTypes'
import { PhoneNumberState } from '../../../../public/typings/phoneNumber'
import { PhoneNumberStateEntity } from '../../../domain/entities/phone-number/phoneNumberEntity'

export class PhoneNumberStateTransformer {
  fromGraphQLToEntity(data: PhoneNumberStateGraphQL): PhoneNumberStateEntity {
    switch (data) {
      case 'PROVISIONING':
        return PhoneNumberStateEntity.Provisioning
      case 'ACTIVE':
        return PhoneNumberStateEntity.Active
      case 'SUSPENDED':
        return PhoneNumberStateEntity.Suspended
      case 'RELEASED':
        return PhoneNumberStateEntity.Released
      case 'FAILED':
        return PhoneNumberStateEntity.Failed
      default:
        return PhoneNumberStateEntity.Unknown
    }
  }

  fromEntityToAPI(entity: PhoneNumberStateEntity): PhoneNumberState {
    switch (entity) {
      case PhoneNumberStateEntity.Provisioning:
        return PhoneNumberState.Provisioning
      case PhoneNumberStateEntity.Active:
        return PhoneNumberState.Active
      case PhoneNumberStateEntity.Suspended:
        return PhoneNumberState.Suspended
      case PhoneNumberStateEntity.Released:
        return PhoneNumberState.Released
      case PhoneNumberStateEntity.Failed:
        return PhoneNumberState.Failed
      default:
        return PhoneNumberState.Unknown
    }
  }
}
