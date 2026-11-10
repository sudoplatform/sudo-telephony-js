/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { GraphQLOptions } from '@aws-amplify/api-graphql'
import {
  ApiClientManager,
  DefaultApiClientManager,
} from '@sudoplatform/sudo-api-client'
import {
  DefaultLogger,
  FatalError,
  GraphQLNetworkError,
  Logger,
  UnknownGraphQLError,
  isGraphQLNetworkError,
  mapNetworkErrorToClientError,
} from '@sudoplatform/sudo-common'
import { GraphQLClient } from '@sudoplatform/sudo-user'
import Observable from 'zen-observable'
import {
  DeletePhoneMessagesDocument,
  DeletePhoneMessagesInput,
  DeletePhoneMessagesMutation,
  DeletePhoneMessagesMutationVariables,
  DeprovisionPhoneNumberDocument,
  DeprovisionPhoneNumberMutation,
  DeprovisionPhoneNumberMutationVariables,
  GetPhoneMessageDocument,
  GetPhoneMessageQuery,
  GetPhoneMessageQueryVariables,
  GetPhoneNumberDocument,
  GetPhoneNumberQuery,
  GetPhoneNumberQueryVariables,
  GetSupportedCountriesForTelephonyDocument,
  GetSupportedCountriesForTelephonyQuery,
  GetSupportedCountriesForTelephonyQueryVariables,
  GetTelephonyConfigDocument,
  GetTelephonyConfigQuery,
  GetTelephonyConfigQueryVariables,
  ListPhoneMessagesForConversationIdDocument,
  ListPhoneMessagesForConversationIdInput,
  ListPhoneMessagesForConversationIdQuery,
  ListPhoneMessagesForConversationIdQueryVariables,
  ListPhoneMessagesForPhoneNumberIdDocument,
  ListPhoneMessagesForPhoneNumberIdInput,
  ListPhoneMessagesForPhoneNumberIdQuery,
  ListPhoneMessagesForPhoneNumberIdQueryVariables,
  ListPhoneNumbersDocument,
  ListPhoneNumbersForSudoIdDocument,
  ListPhoneNumbersForSudoIdInput,
  ListPhoneNumbersForSudoIdQuery,
  ListPhoneNumbersForSudoIdQueryVariables,
  ListPhoneNumbersInput,
  ListPhoneNumbersQuery,
  ListPhoneNumbersQueryVariables,
  OnPhoneMessageEventDocument,
  OnPhoneMessageEventSubscription,
  OnPhoneMessageEventSubscriptionVariables,
  OnPhoneNumberUpdateDocument,
  OnPhoneNumberUpdateSubscription,
  OnPhoneNumberUpdateSubscriptionVariables,
  PhoneMessageBatchResult,
  PhoneMessageConnection,
  PhoneNumberConnection,
  PhoneNumberFragment,
  PhoneNumberSearchFragment,
  ProvisionPhoneNumberDocument,
  ProvisionPhoneNumberInput,
  ProvisionPhoneNumberMutation,
  ProvisionPhoneNumberMutationVariables,
  SealedPhoneMessageFragment,
  SearchAvailablePhoneNumbersDocument,
  SearchAvailablePhoneNumbersInput,
  SearchAvailablePhoneNumbersQuery,
  SearchAvailablePhoneNumbersQueryVariables,
  TelephonyConfigurationDataFragment,
  UpdatePhoneMessagesDocument,
  UpdatePhoneMessagesInput,
  UpdatePhoneMessagesMutation,
  UpdatePhoneMessagesMutationVariables,
} from '../../../gen/graphqlTypes'
import { SubscriptionResult } from './baseSubscriptionManager'
import { TELEPHONY_SERVICE_CONFIG_NAMESPACE } from './config'
import { ErrorTransformer } from './transformer/errorTransformer'

export class ApiClient {
  private readonly log: Logger
  private readonly client: GraphQLClient

  private readonly graphqlErrorTransformer: ErrorTransformer

  public constructor(apiClientManager?: ApiClientManager) {
    this.log = new DefaultLogger(this.constructor.name)
    this.graphqlErrorTransformer = new ErrorTransformer()
    const clientManager =
      apiClientManager ?? DefaultApiClientManager.getInstance()
    this.client = clientManager.getClient({
      configNamespace: TELEPHONY_SERVICE_CONFIG_NAMESPACE,
    })
  }

  // MARK: Configuration

  public async getSupportedCountries(): Promise<string[]> {
    const data =
      await this.performQuery<GetSupportedCountriesForTelephonyQuery>({
        query: GetSupportedCountriesForTelephonyDocument,
        variables: {} as GetSupportedCountriesForTelephonyQueryVariables,
        calleeName: this.getSupportedCountries.name,
      })
    return data.getSupportedCountriesForTelephony
  }

  public async getTelephonyConfig(): Promise<TelephonyConfigurationDataFragment> {
    const data = await this.performQuery<GetTelephonyConfigQuery>({
      query: GetTelephonyConfigDocument,
      variables: {} as GetTelephonyConfigQueryVariables,
      calleeName: this.getTelephonyConfig.name,
    })
    return data.getTelephonyConfig
  }

  // MARK: Phone numbers

  public async searchAvailablePhoneNumbers(
    input: SearchAvailablePhoneNumbersInput,
  ): Promise<PhoneNumberSearchFragment> {
    const data = await this.performQuery<SearchAvailablePhoneNumbersQuery>({
      query: SearchAvailablePhoneNumbersDocument,
      variables: { input } as SearchAvailablePhoneNumbersQueryVariables,
      calleeName: this.searchAvailablePhoneNumbers.name,
    })
    return data.searchAvailablePhoneNumbers
  }

  public async provisionPhoneNumber(
    input: ProvisionPhoneNumberInput,
  ): Promise<PhoneNumberFragment> {
    const data = await this.performMutation<ProvisionPhoneNumberMutation>({
      mutation: ProvisionPhoneNumberDocument,
      variables: { input } as ProvisionPhoneNumberMutationVariables,
      calleeName: this.provisionPhoneNumber.name,
    })
    return data.provisionPhoneNumber
  }

  public async deprovisionPhoneNumber(
    id: string,
  ): Promise<PhoneNumberFragment> {
    const data = await this.performMutation<DeprovisionPhoneNumberMutation>({
      mutation: DeprovisionPhoneNumberDocument,
      variables: { id } as DeprovisionPhoneNumberMutationVariables,
      calleeName: this.deprovisionPhoneNumber.name,
    })
    return data.deprovisionPhoneNumber
  }

  public async getPhoneNumber(
    id: string,
  ): Promise<PhoneNumberFragment | undefined> {
    const data = await this.performQuery<GetPhoneNumberQuery>({
      query: GetPhoneNumberDocument,
      variables: { id } as GetPhoneNumberQueryVariables,
      calleeName: this.getPhoneNumber.name,
    })
    return data.getPhoneNumber ?? undefined
  }

  public async listPhoneNumbers(
    input?: ListPhoneNumbersInput,
  ): Promise<PhoneNumberConnection> {
    const data = await this.performQuery<ListPhoneNumbersQuery>({
      query: ListPhoneNumbersDocument,
      variables: { input } as ListPhoneNumbersQueryVariables,
      calleeName: this.listPhoneNumbers.name,
    })
    return data.listPhoneNumbers
  }

  public async listPhoneNumbersForSudoId(
    input: ListPhoneNumbersForSudoIdInput,
  ): Promise<PhoneNumberConnection> {
    const data = await this.performQuery<ListPhoneNumbersForSudoIdQuery>({
      query: ListPhoneNumbersForSudoIdDocument,
      variables: { input } as ListPhoneNumbersForSudoIdQueryVariables,
      calleeName: this.listPhoneNumbersForSudoId.name,
    })
    return data.listPhoneNumbersForSudoId
  }

  // MARK: Phone messages

  public async getPhoneMessage(
    id: string,
  ): Promise<SealedPhoneMessageFragment | undefined> {
    const data = await this.performQuery<GetPhoneMessageQuery>({
      query: GetPhoneMessageDocument,
      variables: { id } as GetPhoneMessageQueryVariables,
      calleeName: this.getPhoneMessage.name,
    })
    return data.getPhoneMessage ?? undefined
  }

  public async listPhoneMessagesForPhoneNumberId(
    input: ListPhoneMessagesForPhoneNumberIdInput,
  ): Promise<PhoneMessageConnection> {
    const data =
      await this.performQuery<ListPhoneMessagesForPhoneNumberIdQuery>({
        query: ListPhoneMessagesForPhoneNumberIdDocument,
        variables: {
          input,
        } as ListPhoneMessagesForPhoneNumberIdQueryVariables,
        calleeName: this.listPhoneMessagesForPhoneNumberId.name,
      })
    return data.listPhoneMessagesForPhoneNumberId
  }

  public async listPhoneMessagesForConversationId(
    input: ListPhoneMessagesForConversationIdInput,
  ): Promise<PhoneMessageConnection> {
    const data =
      await this.performQuery<ListPhoneMessagesForConversationIdQuery>({
        query: ListPhoneMessagesForConversationIdDocument,
        variables: {
          input,
        } as ListPhoneMessagesForConversationIdQueryVariables,
        calleeName: this.listPhoneMessagesForConversationId.name,
      })
    return data.listPhoneMessagesForConversationId
  }

  public async deletePhoneMessages(
    input: DeletePhoneMessagesInput,
  ): Promise<PhoneMessageBatchResult> {
    const data = await this.performMutation<DeletePhoneMessagesMutation>({
      mutation: DeletePhoneMessagesDocument,
      variables: { input } as DeletePhoneMessagesMutationVariables,
      calleeName: this.deletePhoneMessages.name,
    })
    return data.deletePhoneMessages
  }

  public async updatePhoneMessages(
    input: UpdatePhoneMessagesInput,
  ): Promise<PhoneMessageBatchResult> {
    const data = await this.performMutation<UpdatePhoneMessagesMutation>({
      mutation: UpdatePhoneMessagesDocument,
      variables: { input } as UpdatePhoneMessagesMutationVariables,
      calleeName: this.updatePhoneMessages.name,
    })
    return data.updatePhoneMessages
  }

  // MARK: Subscriptions

  public onPhoneNumberUpdate(
    owner: string,
  ): Promise<Observable<SubscriptionResult<OnPhoneNumberUpdateSubscription>>> {
    return this.performSubscription<OnPhoneNumberUpdateSubscription>({
      subscription: OnPhoneNumberUpdateDocument,
      variables: { owner } as OnPhoneNumberUpdateSubscriptionVariables,
      calleeName: this.onPhoneNumberUpdate.name,
    })
  }

  public onPhoneMessageEvent(
    owner: string,
  ): Promise<Observable<SubscriptionResult<OnPhoneMessageEventSubscription>>> {
    return this.performSubscription<OnPhoneMessageEventSubscription>({
      subscription: OnPhoneMessageEventDocument,
      variables: { owner } as OnPhoneMessageEventSubscriptionVariables,
      calleeName: this.onPhoneMessageEvent.name,
    })
  }

  // MARK: Helpers

  private async performQuery<Q>({
    variables,
    query,
    calleeName,
  }: GraphQLOptions & { calleeName?: string }): Promise<Q> {
    let result
    try {
      result = await this.client.query<Q>({
        variables,
        query,
      })
    } catch (err) {
      if (isGraphQLNetworkError(err as Error)) {
        throw mapNetworkErrorToClientError(err as GraphQLNetworkError)
      }
      throw this.mapGraphQLCallError(err as Error)
    }

    const error = result.errors?.[0]
    if (error) {
      this.log.debug('appsync query failed with error', { error })
      throw this.graphqlErrorTransformer.toClientError(error)
    }
    if (result.data) {
      return result.data
    } else {
      throw new FatalError(
        `${calleeName ?? '<no callee>'} did not return any result`,
      )
    }
  }

  private async performMutation<M>({
    mutation,
    variables,
    calleeName,
  }: Omit<GraphQLOptions, 'query'> & {
    mutation: GraphQLOptions['query']
    calleeName?: string
  }): Promise<M> {
    let result
    try {
      result = await this.client.mutate<M>({
        mutation,
        variables,
      })
    } catch (err) {
      if (isGraphQLNetworkError(err as Error)) {
        throw mapNetworkErrorToClientError(err as GraphQLNetworkError)
      }
      throw this.mapGraphQLCallError(err as Error)
    }
    const error = result.errors?.[0]
    if (error) {
      this.log.debug('appSync mutation failed with error', { error })
      throw this.graphqlErrorTransformer.toClientError(error)
    }
    if (result.data) {
      return result.data
    } else {
      throw new FatalError(
        `${calleeName ?? '<no callee>'} did not return any result`,
      )
    }
  }

  private performSubscription<S>({
    subscription,
    variables,
    calleeName,
  }: Omit<GraphQLOptions, 'query'> & {
    subscription: GraphQLOptions['query']
    calleeName?: string
  }): Promise<Observable<SubscriptionResult<S>>> {
    try {
      return this.client.subscribe<S>({
        subscription,
        variables,
      })
    } catch (err) {
      if (isGraphQLNetworkError(err as Error)) {
        throw mapNetworkErrorToClientError(err as GraphQLNetworkError)
      }
      this.log.debug('appSync subscription failed with error', {
        error: err as Error,
        calleeName,
      })
      throw this.mapGraphQLCallError(err as Error)
    }
  }

  mapGraphQLCallError = (err: Error): Error => {
    if ('graphQLErrors' in err && Array.isArray(err.graphQLErrors)) {
      const error = err.graphQLErrors[0] as {
        errorType: string
        message: string
        name: string
      }
      if (error) {
        this.log.debug('appSync operation failed with error', { err })
        return this.graphqlErrorTransformer.toClientError(error)
      }
    }
    if ('errorType' in err) {
      this.log.debug('appSync operation failed with error', { err })
      return this.graphqlErrorTransformer.toClientError(
        err as { errorType: string; message: string; errorInfo?: string },
      )
    }
    return new UnknownGraphQLError(err)
  }
}
