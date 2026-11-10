/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ConfigurationData,
  PartialPhoneMessage,
  PhoneMessage,
  PhoneMessageChangeType,
  PhoneMessageDirection,
  PhoneMessageEvent,
  PhoneMessageType,
  PhoneNumber,
  PhoneNumberSearch,
  PhoneNumberState,
  PhoneNumberType,
} from '../../src/public'

export class APIDataFactory {
  private static readonly commonProps = {
    owner: 'testOwner',
    version: 1,
    createdAt: new Date(1.0),
    updatedAt: new Date(2.0),
  }

  static readonly configurationData: ConfigurationData = {
    sudoOwnershipProofRequired: true,
    phoneNumberSearchDefaultLimit: 10,
    phoneNumberSearchMaxLimit: 20,
    phoneNumberSearchLifetimeMs: 900000,
    listDefaultLimit: 20,
    listMaxLimit: 100,
    deletePhoneMessagesLimit: 100,
    updatePhoneMessagesLimit: 100,
  }

  static readonly phoneNumberSearch: PhoneNumberSearch = {
    ...APIDataFactory.commonProps,
    id: 'testSearchId',
    countryCode: 'US',
    areaCode: '415',
    results: [
      {
        phoneNumber: '+14155550100',
        countryCode: 'US',
        numberType: PhoneNumberType.Local,
        locality: 'San Francisco',
        region: 'CA',
      },
    ],
    expiresAt: new Date(3.0),
  }

  static readonly phoneNumber: PhoneNumber = {
    ...APIDataFactory.commonProps,
    id: 'testPhoneNumberId',
    owners: [{ id: 'testSudoId', issuer: 'sudoplatform.sudoservice' }],
    sudoId: 'testSudoId',
    identityId: 'testIdentityId',
    keyRingId: 'testKeyRingId',
    keyIds: ['testKeyId'],
    phoneNumber: '+14155550100',
    countryCode: 'US',
    numberType: PhoneNumberType.Local,
    areaCode: '415',
    state: PhoneNumberState.Provisioning,
    failureReason: undefined,
    gracePeriodEndsAt: undefined,
    clientRefId: 'testClientRefId',
  }

  static readonly partialPhoneMessage: PartialPhoneMessage = {
    ...APIDataFactory.commonProps,
    id: 'testPhoneMessageId',
    owners: [{ id: 'testSudoId', issuer: 'sudoplatform.sudoservice' }],
    sudoId: 'testSudoId',
    phoneNumberId: 'testPhoneNumberId',
    conversationId: 'testConversationId',
    type: PhoneMessageType.Sms,
    direction: PhoneMessageDirection.Inbound,
    localPhoneNumber: '+14155550100',
    segmentCount: 1,
    mediaOmitted: false,
    seen: false,
    receivedAt: new Date(0.5),
  }

  static readonly phoneMessage: PhoneMessage = {
    ...APIDataFactory.partialPhoneMessage,
    remotePhoneNumber: '+14155550199',
    body: 'Hello',
  }

  static readonly phoneMessageEvent: PhoneMessageEvent = {
    id: 'testPhoneMessageId',
    phoneNumberId: 'testPhoneNumberId',
    conversationId: 'testConversationId',
    type: PhoneMessageType.Sms,
    direction: PhoneMessageDirection.Inbound,
    changeType: PhoneMessageChangeType.Received,
    seen: false,
    owner: 'testOwner',
    owners: [{ id: 'testSudoId', issuer: 'sudoplatform.sudoservice' }],
    sudoId: 'testSudoId',
    version: 1,
    updatedAt: new Date(2.0),
  }
}
