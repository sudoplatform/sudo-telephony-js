/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AvailablePhoneNumberFragment,
  PhoneNumberSearchFragment,
} from '../../../../gen/graphqlTypes'
import {
  AvailablePhoneNumber,
  PhoneNumberSearch,
} from '../../../../public/typings/phoneNumberSearch'
import {
  AvailablePhoneNumberEntity,
  PhoneNumberSearchEntity,
} from '../../../domain/entities/phone-number-search/phoneNumberSearchEntity'
import { PhoneNumberTypeTransformer } from './phoneNumberTypeTransformer'

export class PhoneNumberSearchTransformer {
  private readonly phoneNumberTypeTransformer = new PhoneNumberTypeTransformer()

  fromGraphQLToEntity(
    data: PhoneNumberSearchFragment,
  ): PhoneNumberSearchEntity {
    return {
      id: data.id,
      countryCode: data.countryCode,
      areaCode: data.areaCode ?? undefined,
      results: data.results.map((result) =>
        this.availablePhoneNumberFromGraphQLToEntity(result),
      ),
      expiresAt: new Date(data.expiresAtEpochMs),
      owner: data.owner,
      version: data.version,
      createdAt: new Date(data.createdAtEpochMs),
      updatedAt: new Date(data.updatedAtEpochMs),
    }
  }

  fromEntityToAPI(entity: PhoneNumberSearchEntity): PhoneNumberSearch {
    return {
      id: entity.id,
      countryCode: entity.countryCode,
      areaCode: entity.areaCode,
      results: entity.results.map((result) =>
        this.availablePhoneNumberFromEntityToAPI(result),
      ),
      expiresAt: entity.expiresAt,
      owner: entity.owner,
      version: entity.version,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
  }

  private availablePhoneNumberFromGraphQLToEntity(
    data: AvailablePhoneNumberFragment,
  ): AvailablePhoneNumberEntity {
    return {
      phoneNumber: data.phoneNumber,
      countryCode: data.countryCode,
      numberType: this.phoneNumberTypeTransformer.fromGraphQLToEntity(
        data.numberType,
      ),
      locality: data.locality ?? undefined,
      region: data.region ?? undefined,
    }
  }

  private availablePhoneNumberFromEntityToAPI(
    entity: AvailablePhoneNumberEntity,
  ): AvailablePhoneNumber {
    return {
      phoneNumber: entity.phoneNumber,
      countryCode: entity.countryCode,
      numberType: this.phoneNumberTypeTransformer.fromEntityToAPI(
        entity.numberType,
      ),
      locality: entity.locality,
      region: entity.region,
    }
  }
}
