/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  OnPhoneMessageEventSubscription,
  PhoneMessageConnection,
} from '../../../gen/graphqlTypes'
import {
  ConnectionState,
  PhoneMessageSubscriber,
} from '../../../public/typings/subscription'
import {
  PhoneMessageBatchResultEntity,
  SealedPhoneMessageEntity,
} from '../../domain/entities/phone-message/phoneMessageEntity'
import {
  ListPhoneMessagesForConversationIdInput,
  ListPhoneMessagesForPhoneNumberIdInput,
  ListPhoneMessagesOutput,
  PhoneMessageService,
  SubscribeToPhoneMessagesInput,
  UpdatePhoneMessagesInput,
} from '../../domain/entities/phone-message/phoneMessageService'
import { ApiClient } from '../common/apiClient'
import { SubscriptionResult } from '../common/baseSubscriptionManager'
import { PhoneMessageSubscriptionManager } from './phoneMessageSubscriptionManager'
import { SortOrderTransformer } from './transformer/phoneMessageEnumTransformers'
import { PhoneMessageEventTransformer } from './transformer/phoneMessageEventTransformer'
import { PhoneMessageTransformer } from './transformer/phoneMessageTransformer'

export class DefaultPhoneMessageService implements PhoneMessageService {
  private readonly phoneMessageTransformer: PhoneMessageTransformer
  private readonly phoneMessageEventTransformer: PhoneMessageEventTransformer
  private readonly sortOrderTransformer: SortOrderTransformer
  private readonly subscriptionManager: PhoneMessageSubscriptionManager<
    OnPhoneMessageEventSubscription,
    PhoneMessageSubscriber
  >

  constructor(private readonly appSync: ApiClient) {
    this.phoneMessageTransformer = new PhoneMessageTransformer()
    this.phoneMessageEventTransformer = new PhoneMessageEventTransformer()
    this.sortOrderTransformer = new SortOrderTransformer()
    this.subscriptionManager = new PhoneMessageSubscriptionManager<
      OnPhoneMessageEventSubscription,
      PhoneMessageSubscriber
    >()
  }

  async get(id: string): Promise<SealedPhoneMessageEntity | undefined> {
    const result = await this.appSync.getPhoneMessage(id)
    if (!result) {
      return undefined
    }
    return this.phoneMessageTransformer.fromGraphQLToSealedEntity(result)
  }

  async listForPhoneNumberId(
    input: ListPhoneMessagesForPhoneNumberIdInput,
  ): Promise<ListPhoneMessagesOutput> {
    const result = await this.appSync.listPhoneMessagesForPhoneNumberId({
      phoneNumberId: input.phoneNumberId,
      sortOrder: input.sortOrder
        ? this.sortOrderTransformer.fromEntityToGraphQL(input.sortOrder)
        : undefined,
      limit: input.limit,
      nextToken: input.nextToken,
    })
    return this.toListOutput(result)
  }

  async listForConversationId(
    input: ListPhoneMessagesForConversationIdInput,
  ): Promise<ListPhoneMessagesOutput> {
    const result = await this.appSync.listPhoneMessagesForConversationId({
      conversationId: input.conversationId,
      sortOrder: input.sortOrder
        ? this.sortOrderTransformer.fromEntityToGraphQL(input.sortOrder)
        : undefined,
      limit: input.limit,
      nextToken: input.nextToken,
    })
    return this.toListOutput(result)
  }

  async delete(ids: string[]): Promise<PhoneMessageBatchResultEntity> {
    const result = await this.appSync.deletePhoneMessages({ ids })
    return {
      succeededIds: [...result.succeededIds],
      failedIds: [...result.failedIds],
    }
  }

  async update(
    input: UpdatePhoneMessagesInput,
  ): Promise<PhoneMessageBatchResultEntity> {
    const result = await this.appSync.updatePhoneMessages({
      ids: input.ids,
      seen: input.seen,
    })
    return {
      succeededIds: [...result.succeededIds],
      failedIds: [...result.failedIds],
    }
  }

  async subscribe(input: SubscribeToPhoneMessagesInput): Promise<void> {
    this.subscriptionManager.subscribe(input.subscriptionId, input.subscriber)

    if (this.subscriptionManager.getWatcher()) {
      // The service announces the connection only once per web socket, so a
      // subscriber joining an open subscription is told about it here.
      input.subscriber.connectionStatusChanged(ConnectionState.Connected)
      return
    }

    try {
      this.subscriptionManager.setWatcher(
        await this.appSync.onPhoneMessageEvent(input.owner),
      )
    } catch (err) {
      this.subscriptionManager.unsubscribe(input.subscriptionId)
      throw err
    }
    this.subscriptionManager.setSubscription(this.setupEventSubscription())
    this.subscriptionManager.connectionStatusChanged(ConnectionState.Connected)
  }

  unsubscribe(subscriptionId: string): void {
    this.subscriptionManager.unsubscribe(subscriptionId)
  }

  private toListOutput(
    result: PhoneMessageConnection,
  ): ListPhoneMessagesOutput {
    return {
      phoneMessages: result.items.map((item) =>
        this.phoneMessageTransformer.fromGraphQLToSealedEntity(item),
      ),
      nextToken: result.nextToken ?? undefined,
    }
  }

  private setupEventSubscription(): ZenObservable.Subscription | undefined {
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
      next: (result: SubscriptionResult<OnPhoneMessageEventSubscription>) => {
        const data = result.data?.onPhoneMessageEvent
        if (data) {
          const entity =
            this.phoneMessageEventTransformer.fromGraphQLToEntity(data)
          this.subscriptionManager.phoneMessageEvent(
            this.phoneMessageEventTransformer.fromEntityToAPI(entity),
          )
        }
      },
    })
  }
}
