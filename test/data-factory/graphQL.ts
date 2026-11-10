/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  OnPhoneMessageEventSubscription,
  PhoneNumberFragment,
  PhoneNumberSearchFragment,
  SealedPhoneMessageFragment,
  TelephonyConfigurationDataFragment,
} from '../../src/gen/graphqlTypes'

export class GraphQLDataFactory {
  private static readonly commonProps = {
    owner: 'testOwner',
    version: 1,
    createdAtEpochMs: 1.0,
    updatedAtEpochMs: 2.0,
  }

  static readonly configurationData: TelephonyConfigurationDataFragment = {
    sudoOwnershipProofRequired: true,
    phoneNumberSearchDefaultLimit: 10,
    phoneNumberSearchMaxLimit: 20,
    phoneNumberSearchLifetimeMs: 900000,
    listDefaultLimit: 20,
    listMaxLimit: 100,
    deletePhoneMessagesLimit: 100,
    updatePhoneMessagesLimit: 100,
  }

  static readonly phoneNumberSearch: PhoneNumberSearchFragment = {
    ...GraphQLDataFactory.commonProps,
    id: 'testSearchId',
    countryCode: 'US',
    areaCode: '415',
    results: [
      {
        phoneNumber: '+14155550100',
        countryCode: 'US',
        numberType: 'LOCAL',
        locality: 'San Francisco',
        region: 'CA',
      },
    ],
    expiresAtEpochMs: 3.0,
  }

  static readonly phoneNumber: PhoneNumberFragment = {
    ...GraphQLDataFactory.commonProps,
    id: 'testPhoneNumberId',
    owners: [{ id: 'testSudoId', issuer: 'sudoplatform.sudoservice' }],
    identityId: 'testIdentityId',
    keyRingId: 'testKeyRingId',
    keyIds: ['testKeyId'],
    phoneNumber: '+14155550100',
    countryCode: 'US',
    numberType: 'LOCAL',
    areaCode: '415',
    state: 'PROVISIONING',
    failureReason: null,
    gracePeriodEndsAtEpochMs: null,
    clientRefId: 'testClientRefId',
  }

  static readonly sealedPhoneMessage: SealedPhoneMessageFragment = {
    ...GraphQLDataFactory.commonProps,
    id: 'testPhoneMessageId',
    owners: [{ id: 'testSudoId', issuer: 'sudoplatform.sudoservice' }],
    phoneNumberId: 'testPhoneNumberId',
    conversationId: 'testConversationId',
    type: 'SMS',
    direction: 'INBOUND',
    localPhoneNumber: '+14155550100',
    remotePhoneNumber: 'sealedRemotePhoneNumber',
    body: 'sealedBody',
    segmentCount: 1,
    mediaOmitted: false,
    seen: false,
    receivedAtEpochMs: 0.5,
  }

  static readonly phoneMessageEvent: NonNullable<
    OnPhoneMessageEventSubscription['onPhoneMessageEvent']
  > = {
    id: 'testPhoneMessageId',
    phoneNumberId: 'testPhoneNumberId',
    conversationId: 'testConversationId',
    type: 'SMS',
    direction: 'INBOUND',
    changeType: 'RECEIVED',
    seen: false,
    owner: 'testOwner',
    owners: [{ id: 'testSudoId', issuer: 'sudoplatform.sudoservice' }],
    version: 1,
    updatedAtEpochMs: 2.0,
  }
}
