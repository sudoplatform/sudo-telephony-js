/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { TelephonyConfigurationDataFragment } from '../../../../gen/graphqlTypes'
import { ConfigurationData } from '../../../../public/typings/configurationData'
import { ConfigurationDataEntity } from '../../../domain/entities/configuration/configurationDataEntity'

export class ConfigurationDataTransformer {
  fromGraphQLToEntity(
    data: TelephonyConfigurationDataFragment,
  ): ConfigurationDataEntity {
    return {
      sudoOwnershipProofRequired: data.sudoOwnershipProofRequired,
      phoneNumberSearchDefaultLimit: data.phoneNumberSearchDefaultLimit,
      phoneNumberSearchMaxLimit: data.phoneNumberSearchMaxLimit,
      phoneNumberSearchLifetimeMs: data.phoneNumberSearchLifetimeMs,
      listDefaultLimit: data.listDefaultLimit,
      listMaxLimit: data.listMaxLimit,
      deletePhoneMessagesLimit: data.deletePhoneMessagesLimit,
      updatePhoneMessagesLimit: data.updatePhoneMessagesLimit,
    }
  }

  fromEntityToAPI(entity: ConfigurationDataEntity): ConfigurationData {
    return {
      sudoOwnershipProofRequired: entity.sudoOwnershipProofRequired,
      phoneNumberSearchDefaultLimit: entity.phoneNumberSearchDefaultLimit,
      phoneNumberSearchMaxLimit: entity.phoneNumberSearchMaxLimit,
      phoneNumberSearchLifetimeMs: entity.phoneNumberSearchLifetimeMs,
      listDefaultLimit: entity.listDefaultLimit,
      listMaxLimit: entity.listMaxLimit,
      deletePhoneMessagesLimit: entity.deletePhoneMessagesLimit,
      updatePhoneMessagesLimit: entity.updatePhoneMessagesLimit,
    }
  }
}
