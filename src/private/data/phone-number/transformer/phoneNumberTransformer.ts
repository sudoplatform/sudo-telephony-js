/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { PhoneNumber as PhoneNumberGraphQL } from '../../../../gen/graphqlTypes'
import { PhoneNumber } from '../../../../public/typings/phoneNumber'
import { PhoneNumberEntity } from '../../../domain/entities/phone-number/phoneNumberEntity'
import { OwnerTransformer } from '../../common/transformer/ownerTransformer'
import { PhoneNumberTypeTransformer } from '../../phone-number-search/transformer/phoneNumberTypeTransformer'
import { PhoneNumberFailureReasonTransformer } from './phoneNumberFailureReasonTransformer'
import { PhoneNumberStateTransformer } from './phoneNumberStateTransformer'

export class PhoneNumberTransformer {
  private readonly ownerTransformer = new OwnerTransformer()
  private readonly phoneNumberTypeTransformer = new PhoneNumberTypeTransformer()
  private readonly stateTransformer = new PhoneNumberStateTransformer()
  private readonly failureReasonTransformer =
    new PhoneNumberFailureReasonTransformer()

  fromGraphQLToEntity(data: PhoneNumberGraphQL): PhoneNumberEntity {
    return {
      id: data.id,
      owner: data.owner,
      owners: data.owners.map((owner) =>
        this.ownerTransformer.fromGraphQLToEntity(owner),
      ),
      identityId: data.identityId,
      keyRingId: data.keyRingId,
      keyIds: [...data.keyIds],
      phoneNumber: data.phoneNumber,
      countryCode: data.countryCode,
      numberType: this.phoneNumberTypeTransformer.fromGraphQLToEntity(
        data.numberType,
      ),
      areaCode: data.areaCode ?? undefined,
      state: this.stateTransformer.fromGraphQLToEntity(data.state),
      failureReason: data.failureReason
        ? this.failureReasonTransformer.fromGraphQLToEntity(data.failureReason)
        : undefined,
      gracePeriodEndsAt:
        data.gracePeriodEndsAtEpochMs != null
          ? new Date(data.gracePeriodEndsAtEpochMs)
          : undefined,
      clientRefId: data.clientRefId ?? undefined,
      version: data.version,
      createdAt: new Date(data.createdAtEpochMs),
      updatedAt: new Date(data.updatedAtEpochMs),
    }
  }

  fromEntityToAPI(entity: PhoneNumberEntity): PhoneNumber {
    return {
      id: entity.id,
      owner: entity.owner,
      owners: entity.owners.map((owner) =>
        this.ownerTransformer.fromEntityToAPI(owner),
      ),
      sudoId: this.ownerTransformer.sudoIdFrom(entity.owners),
      identityId: entity.identityId,
      keyRingId: entity.keyRingId,
      keyIds: [...entity.keyIds],
      phoneNumber: entity.phoneNumber,
      countryCode: entity.countryCode,
      numberType: this.phoneNumberTypeTransformer.fromEntityToAPI(
        entity.numberType,
      ),
      areaCode: entity.areaCode,
      state: this.stateTransformer.fromEntityToAPI(entity.state),
      failureReason: entity.failureReason
        ? this.failureReasonTransformer.fromEntityToAPI(entity.failureReason)
        : undefined,
      gracePeriodEndsAt: entity.gracePeriodEndsAt,
      clientRefId: entity.clientRefId,
      version: entity.version,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
  }
}
