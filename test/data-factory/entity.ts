/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PartialPhoneMessageEntity,
  PhoneMessageChangeTypeEntity,
  PhoneMessageDirectionEntity,
  PhoneMessageEntity,
  PhoneMessageEventEntity,
  PhoneMessageTypeEntity,
  SealedPhoneMessageEntity,
} from '../../src/private/domain/entities/phone-message/phoneMessageEntity'
import { ConfigurationDataEntity } from '../../src/private/domain/entities/configuration/configurationDataEntity'
import {
  PhoneNumberEntity,
  PhoneNumberStateEntity,
} from '../../src/private/domain/entities/phone-number/phoneNumberEntity'
import {
  PhoneNumberSearchEntity,
  PhoneNumberTypeEntity,
} from '../../src/private/domain/entities/phone-number-search/phoneNumberSearchEntity'

export class EntityDataFactory {
  private static readonly commonProps = {
    owner: 'testOwner',
    version: 1,
    createdAt: new Date(1.0),
    updatedAt: new Date(2.0),
  }

  static readonly configurationData: ConfigurationDataEntity = {
    sudoOwnershipProofRequired: true,
    phoneNumberSearchDefaultLimit: 10,
    phoneNumberSearchMaxLimit: 20,
    phoneNumberSearchLifetimeMs: 900000,
    listDefaultLimit: 20,
    listMaxLimit: 100,
    deletePhoneMessagesLimit: 100,
    updatePhoneMessagesLimit: 100,
  }

  static readonly phoneNumberSearch: PhoneNumberSearchEntity = {
    ...EntityDataFactory.commonProps,
    id: 'testSearchId',
    countryCode: 'US',
    areaCode: '415',
    results: [
      {
        phoneNumber: '+14155550100',
        countryCode: 'US',
        numberType: PhoneNumberTypeEntity.Local,
        locality: 'San Francisco',
        region: 'CA',
      },
    ],
    expiresAt: new Date(3.0),
  }

  static readonly phoneNumber: PhoneNumberEntity = {
    ...EntityDataFactory.commonProps,
    id: 'testPhoneNumberId',
    owners: [{ id: 'testSudoId', issuer: 'sudoplatform.sudoservice' }],
    identityId: 'testIdentityId',
    keyRingId: 'testKeyRingId',
    keyIds: ['testKeyId'],
    phoneNumber: '+14155550100',
    countryCode: 'US',
    numberType: PhoneNumberTypeEntity.Local,
    areaCode: '415',
    state: PhoneNumberStateEntity.Provisioning,
    failureReason: undefined,
    gracePeriodEndsAt: undefined,
    clientRefId: 'testClientRefId',
  }

  static readonly partialPhoneMessage: PartialPhoneMessageEntity = {
    ...EntityDataFactory.commonProps,
    id: 'testPhoneMessageId',
    owners: [{ id: 'testSudoId', issuer: 'sudoplatform.sudoservice' }],
    phoneNumberId: 'testPhoneNumberId',
    conversationId: 'testConversationId',
    type: PhoneMessageTypeEntity.Sms,
    direction: PhoneMessageDirectionEntity.Inbound,
    localPhoneNumber: '+14155550100',
    segmentCount: 1,
    mediaOmitted: false,
    seen: false,
    receivedAt: new Date(0.5),
  }

  static readonly sealedPhoneMessage: SealedPhoneMessageEntity = {
    ...EntityDataFactory.partialPhoneMessage,
    remotePhoneNumber: 'sealedRemotePhoneNumber',
    body: 'sealedBody',
  }

  static readonly phoneMessage: PhoneMessageEntity = {
    ...EntityDataFactory.partialPhoneMessage,
    remotePhoneNumber: '+14155550199',
    body: 'Hello',
  }

  static readonly phoneMessageEvent: PhoneMessageEventEntity = {
    id: 'testPhoneMessageId',
    phoneNumberId: 'testPhoneNumberId',
    conversationId: 'testConversationId',
    type: PhoneMessageTypeEntity.Sms,
    direction: PhoneMessageDirectionEntity.Inbound,
    changeType: PhoneMessageChangeTypeEntity.Received,
    seen: false,
    owner: 'testOwner',
    owners: [{ id: 'testSudoId', issuer: 'sudoplatform.sudoservice' }],
    version: 1,
    updatedAt: new Date(2.0),
  }
}
