/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { PhoneNumberFailureReason as PhoneNumberFailureReasonGraphQL } from '../../../../gen/graphqlTypes'
import { PhoneNumberFailureReason } from '../../../../public/typings/phoneNumber'
import { PhoneNumberFailureReasonEntity } from '../../../domain/entities/phone-number/phoneNumberEntity'

export class PhoneNumberFailureReasonTransformer {
  fromGraphQLToEntity(
    data: PhoneNumberFailureReasonGraphQL,
  ): PhoneNumberFailureReasonEntity {
    switch (data) {
      case 'NUMBER_UNAVAILABLE':
        return PhoneNumberFailureReasonEntity.NumberUnavailable
      case 'CARRIER_ERROR':
        return PhoneNumberFailureReasonEntity.CarrierError
      case 'OWNER_DELETED':
        return PhoneNumberFailureReasonEntity.OwnerDeleted
      default:
        return PhoneNumberFailureReasonEntity.Unknown
    }
  }

  fromEntityToAPI(
    entity: PhoneNumberFailureReasonEntity,
  ): PhoneNumberFailureReason {
    switch (entity) {
      case PhoneNumberFailureReasonEntity.NumberUnavailable:
        return PhoneNumberFailureReason.NumberUnavailable
      case PhoneNumberFailureReasonEntity.CarrierError:
        return PhoneNumberFailureReason.CarrierError
      case PhoneNumberFailureReasonEntity.OwnerDeleted:
        return PhoneNumberFailureReason.OwnerDeleted
      default:
        return PhoneNumberFailureReason.Unknown
    }
  }
}
