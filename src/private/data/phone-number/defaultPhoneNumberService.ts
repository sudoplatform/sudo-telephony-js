/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  OnPhoneNumberUpdateSubscription,
  PhoneNumberConnection,
} from '../../../gen/graphqlTypes'
import {
  ConnectionState,
  PhoneNumberSubscriber,
} from '../../../public/typings/subscription'
import { PhoneNumberEntity } from '../../domain/entities/phone-number/phoneNumberEntity'
import {
  ListPhoneNumbersForSudoIdInput,
  ListPhoneNumbersInput,
  ListPhoneNumbersOutput,
  PhoneNumberService,
  ProvisionPhoneNumberInput,
  SubscribeToPhoneNumbersInput,
} from '../../domain/entities/phone-number/phoneNumberService'
import { ApiClient } from '../common/apiClient'
import { SubscriptionResult } from '../common/baseSubscriptionManager'
import { PhoneNumberSubscriptionManager } from './phoneNumberSubscriptionManager'
import { KeyFormatTransformer } from './transformer/keyFormatTransformer'
import { PhoneNumberTransformer } from './transformer/phoneNumberTransformer'

export class DefaultPhoneNumberService implements PhoneNumberService {
  private readonly phoneNumberTransformer: PhoneNumberTransformer
  private readonly keyFormatTransformer: KeyFormatTransformer
  private readonly subscriptionManager: PhoneNumberSubscriptionManager<
    OnPhoneNumberUpdateSubscription,
    PhoneNumberSubscriber
  >

  constructor(private readonly appSync: ApiClient) {
    this.phoneNumberTransformer = new PhoneNumberTransformer()
    this.keyFormatTransformer = new KeyFormatTransformer()
    this.subscriptionManager = new PhoneNumberSubscriptionManager<
      OnPhoneNumberUpdateSubscription,
      PhoneNumberSubscriber
    >()
  }

  async provision(
    input: ProvisionPhoneNumberInput,
  ): Promise<PhoneNumberEntity> {
    const result = await this.appSync.provisionPhoneNumber({
      searchId: input.searchId,
      phoneNumber: input.phoneNumber,
      key: {
        keyId: input.key.keyId,
        algorithm: input.key.algorithm,
        keyFormat: this.keyFormatTransformer.fromEntityToGraphQL(
          input.key.keyFormat,
        ),
        publicKey: input.key.publicKey,
      },
      // The service requires exactly one proof when any is supplied, so an
      // absent token is omitted rather than sent as an empty list.
      ownershipProofTokens: input.ownershipProofToken
        ? [input.ownershipProofToken]
        : undefined,
      clientRefId: input.clientRefId,
    })
    return this.phoneNumberTransformer.fromGraphQLToEntity(result)
  }

  async deprovision(id: string): Promise<PhoneNumberEntity> {
    const result = await this.appSync.deprovisionPhoneNumber(id)
    return this.phoneNumberTransformer.fromGraphQLToEntity(result)
  }

  async get(id: string): Promise<PhoneNumberEntity | undefined> {
    const result = await this.appSync.getPhoneNumber(id)
    if (!result) {
      return undefined
    }
    return this.phoneNumberTransformer.fromGraphQLToEntity(result)
  }

  async list(input: ListPhoneNumbersInput): Promise<ListPhoneNumbersOutput> {
    const result = await this.appSync.listPhoneNumbers({
      limit: input.limit,
      nextToken: input.nextToken,
    })
    return this.toListOutput(result)
  }

  async listForSudoId(
    input: ListPhoneNumbersForSudoIdInput,
  ): Promise<ListPhoneNumbersOutput> {
    const result = await this.appSync.listPhoneNumbersForSudoId({
      sudoId: input.sudoId,
      limit: input.limit,
      nextToken: input.nextToken,
    })
    return this.toListOutput(result)
  }

  async subscribe(input: SubscribeToPhoneNumbersInput): Promise<void> {
    this.subscriptionManager.subscribe(input.subscriptionId, input.subscriber)

    if (this.subscriptionManager.getWatcher()) {
      // The service announces the connection only once per web socket, so a
      // subscriber joining an open subscription is told about it here.
      input.subscriber.connectionStatusChanged(ConnectionState.Connected)
      return
    }

    try {
      this.subscriptionManager.setWatcher(
        await this.appSync.onPhoneNumberUpdate(input.owner),
      )
    } catch (err) {
      this.subscriptionManager.unsubscribe(input.subscriptionId)
      throw err
    }
    this.subscriptionManager.setSubscription(this.setupUpdateSubscription())
    this.subscriptionManager.connectionStatusChanged(ConnectionState.Connected)
  }

  unsubscribe(subscriptionId: string): void {
    this.subscriptionManager.unsubscribe(subscriptionId)
  }

  private toListOutput(result: PhoneNumberConnection): ListPhoneNumbersOutput {
    return {
      phoneNumbers: result.items.map((item) =>
        this.phoneNumberTransformer.fromGraphQLToEntity(item),
      ),
      nextToken: result.nextToken ?? undefined,
    }
  }

  private setupUpdateSubscription(): ZenObservable.Subscription | undefined {
    return this.subscriptionManager.getWatcher()?.subscribe({
      complete: () => {
        this.subscriptionManager.connectionStatusChanged(
          ConnectionState.Disconnected,
        )
      },
      error: () => {
        this.subscriptionManager.connectionStatusChanged(
          ConnectionState.Disconnected,
        )
      },
      next: (result: SubscriptionResult<OnPhoneNumberUpdateSubscription>) => {
        const data = result.data?.onPhoneNumberUpdate
        if (data) {
          const entity = this.phoneNumberTransformer.fromGraphQLToEntity(data)
          this.subscriptionManager.phoneNumberUpdated(
            this.phoneNumberTransformer.fromEntityToAPI(entity),
          )
        }
      },
    })
  }
}
