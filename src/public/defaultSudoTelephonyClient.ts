/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DefaultLogger,
  DefaultSudoKeyManager,
  ListOperationResultStatus,
  ListOutput,
  Logger,
  SudoKeyManager,
} from '@sudoplatform/sudo-common'
import { SudoUserClient } from '@sudoplatform/sudo-user'
import { WebSudoCryptoProvider } from '@sudoplatform/sudo-web-crypto-provider'
import { ApiClient } from '../private/data/common/apiClient'
import { DefaultDeviceKeyWorker } from '../private/data/common/deviceKeyWorker'
import { PrivateSudoTelephonyClientOptions } from '../private/data/common/privateSudoTelephonyClientOptions'
import { DefaultConfigurationDataService } from '../private/data/configuration/defaultConfigurationDataService'
import { ConfigurationDataTransformer } from '../private/data/configuration/transformer/configurationDataTransformer'
import { DefaultCountryService } from '../private/data/country/defaultCountryService'
import { DefaultPhoneMessageService } from '../private/data/phone-message/defaultPhoneMessageService'
import { DefaultPhoneMessageUnsealer } from '../private/data/phone-message/defaultPhoneMessageUnsealer'
import { SortOrderTransformer } from '../private/data/phone-message/transformer/phoneMessageEnumTransformers'
import { PhoneMessageTransformer } from '../private/data/phone-message/transformer/phoneMessageTransformer'
import { DefaultPhoneNumberSearchService } from '../private/data/phone-number-search/defaultPhoneNumberSearchService'
import { PhoneNumberSearchTransformer } from '../private/data/phone-number-search/transformer/phoneNumberSearchTransformer'
import { DefaultPhoneNumberService } from '../private/data/phone-number/defaultPhoneNumberService'
import { PhoneNumberTransformer } from '../private/data/phone-number/transformer/phoneNumberTransformer'
import { ListPhoneNumbersOutput } from '../private/domain/entities/phone-number/phoneNumberService'
import { GetConfigurationDataUseCase } from '../private/domain/use-cases/configuration/getConfigurationDataUseCase'
import { GetSupportedCountriesUseCase } from '../private/domain/use-cases/country/getSupportedCountriesUseCase'
import { ExportKeysUseCase } from '../private/domain/use-cases/key/exportKeysUseCase'
import { ImportKeysUseCase } from '../private/domain/use-cases/key/importKeysUseCase'
import { ResetUseCase } from '../private/domain/use-cases/key/resetUseCase'
import { DeletePhoneMessagesUseCase } from '../private/domain/use-cases/phone-message/deletePhoneMessagesUseCase'
import { GetPhoneMessageUseCase } from '../private/domain/use-cases/phone-message/getPhoneMessageUseCase'
import { ListPhoneMessagesForConversationIdUseCase } from '../private/domain/use-cases/phone-message/listPhoneMessagesForConversationIdUseCase'
import { ListPhoneMessagesForPhoneNumberIdUseCase } from '../private/domain/use-cases/phone-message/listPhoneMessagesForPhoneNumberIdUseCase'
import { ListPhoneMessagesUseCaseOutput } from '../private/domain/use-cases/phone-message/listPhoneMessagesOutput'
import { SubscribeToPhoneMessagesUseCase } from '../private/domain/use-cases/phone-message/subscribeToPhoneMessagesUseCase'
import { UnsubscribeFromPhoneMessagesUseCase } from '../private/domain/use-cases/phone-message/unsubscribeFromPhoneMessagesUseCase'
import { UpdatePhoneMessagesUseCase } from '../private/domain/use-cases/phone-message/updatePhoneMessagesUseCase'
import { SearchAvailablePhoneNumbersUseCase } from '../private/domain/use-cases/phone-number-search/searchAvailablePhoneNumbersUseCase'
import { DeprovisionPhoneNumberUseCase } from '../private/domain/use-cases/phone-number/deprovisionPhoneNumberUseCase'
import { GetPhoneNumberUseCase } from '../private/domain/use-cases/phone-number/getPhoneNumberUseCase'
import { ListPhoneNumbersForSudoIdUseCase } from '../private/domain/use-cases/phone-number/listPhoneNumbersForSudoIdUseCase'
import { ListPhoneNumbersUseCase } from '../private/domain/use-cases/phone-number/listPhoneNumbersUseCase'
import { ProvisionPhoneNumberUseCase } from '../private/domain/use-cases/phone-number/provisionPhoneNumberUseCase'
import { SubscribeToPhoneNumbersUseCase } from '../private/domain/use-cases/phone-number/subscribeToPhoneNumbersUseCase'
import { UnsubscribeFromPhoneNumbersUseCase } from '../private/domain/use-cases/phone-number/unsubscribeFromPhoneNumbersUseCase'
import {
  DeletePhoneMessagesInput,
  ListPhoneMessagesForConversationIdInput,
  ListPhoneMessagesForPhoneNumberIdInput,
  ListPhoneNumbersForSudoIdInput,
  ListPhoneNumbersInput,
  ProvisionPhoneNumberInput,
  SearchAvailablePhoneNumbersInput,
  UpdatePhoneMessagesInput,
} from './inputs'
import {
  SudoTelephonyClient,
  SudoTelephonyClientOptions,
} from './sudoTelephonyClient'
import {
  ConfigurationData,
  ListPhoneMessagesResult,
  PhoneMessage,
  PhoneMessageBatchResult,
  PhoneMessageSubscriber,
  PhoneNumber,
  PhoneNumberSearch,
  PhoneNumberSubscriber,
} from './typings'

export class DefaultSudoTelephonyClient implements SudoTelephonyClient {
  private readonly apiClient: ApiClient
  private readonly userClient: SudoUserClient
  private readonly keyManager: SudoKeyManager
  private readonly deviceKeyWorker: DefaultDeviceKeyWorker
  private readonly countryService: DefaultCountryService
  private readonly configurationDataService: DefaultConfigurationDataService
  private readonly phoneNumberSearchService: DefaultPhoneNumberSearchService
  private readonly phoneNumberService: DefaultPhoneNumberService
  private readonly phoneMessageService: DefaultPhoneMessageService
  private readonly phoneMessageUnsealer: DefaultPhoneMessageUnsealer
  private readonly configurationDataTransformer: ConfigurationDataTransformer
  private readonly phoneNumberSearchTransformer: PhoneNumberSearchTransformer
  private readonly phoneNumberTransformer: PhoneNumberTransformer
  private readonly phoneMessageTransformer: PhoneMessageTransformer
  private readonly sortOrderTransformer: SortOrderTransformer
  private readonly log: Logger

  public constructor(opts: SudoTelephonyClientOptions) {
    this.log = new DefaultLogger(this.constructor.name)

    const privateOptions = opts as PrivateSudoTelephonyClientOptions

    this.apiClient = privateOptions.apiClient ?? new ApiClient()
    this.userClient = opts.sudoUserClient
    this.keyManager =
      privateOptions.sudoKeyManager ??
      new DefaultSudoKeyManager(
        opts.sudoCryptoProvider ??
          new WebSudoCryptoProvider(
            'SudoTelephonyClient',
            'com.sudoplatform.appservicename',
          ),
      )
    this.deviceKeyWorker = new DefaultDeviceKeyWorker(this.keyManager)

    this.countryService = new DefaultCountryService(this.apiClient)
    this.configurationDataService = new DefaultConfigurationDataService(
      this.apiClient,
    )
    this.phoneNumberSearchService = new DefaultPhoneNumberSearchService(
      this.apiClient,
    )
    this.phoneNumberService = new DefaultPhoneNumberService(this.apiClient)
    this.phoneMessageService = new DefaultPhoneMessageService(this.apiClient)
    this.phoneMessageUnsealer = new DefaultPhoneMessageUnsealer(
      this.phoneNumberService,
      this.deviceKeyWorker,
    )

    this.configurationDataTransformer = new ConfigurationDataTransformer()
    this.phoneNumberSearchTransformer = new PhoneNumberSearchTransformer()
    this.phoneNumberTransformer = new PhoneNumberTransformer()
    this.phoneMessageTransformer = new PhoneMessageTransformer()
    this.sortOrderTransformer = new SortOrderTransformer()
  }

  // MARK: Configuration

  public async getSupportedCountries(): Promise<string[]> {
    this.log.debug(this.getSupportedCountries.name)
    const useCase = new GetSupportedCountriesUseCase(this.countryService)
    return await useCase.execute()
  }

  public async getConfigurationData(): Promise<ConfigurationData> {
    this.log.debug(this.getConfigurationData.name)
    const useCase = new GetConfigurationDataUseCase(
      this.configurationDataService,
    )
    const result = await useCase.execute()
    return this.configurationDataTransformer.fromEntityToAPI(result)
  }

  // MARK: Phone numbers

  public async searchAvailablePhoneNumbers(
    input: SearchAvailablePhoneNumbersInput,
  ): Promise<PhoneNumberSearch> {
    this.log.debug(this.searchAvailablePhoneNumbers.name, { input })
    const useCase = new SearchAvailablePhoneNumbersUseCase(
      this.phoneNumberSearchService,
    )
    const result = await useCase.execute({
      countryCode: input.countryCode,
      areaCode: input.areaCode,
      limit: input.limit,
    })
    return this.phoneNumberSearchTransformer.fromEntityToAPI(result)
  }

  public async provisionPhoneNumber(
    input: ProvisionPhoneNumberInput,
  ): Promise<PhoneNumber> {
    this.log.debug(this.provisionPhoneNumber.name, {
      searchId: input.searchId,
      clientRefId: input.clientRefId,
    })
    const useCase = new ProvisionPhoneNumberUseCase(
      this.phoneNumberService,
      this.deviceKeyWorker,
    )
    const result = await useCase.execute({
      searchId: input.searchId,
      phoneNumber: input.phoneNumber,
      ownershipProofToken: input.ownershipProofToken,
      clientRefId: input.clientRefId,
    })
    return this.phoneNumberTransformer.fromEntityToAPI(result)
  }

  public async deprovisionPhoneNumber(id: string): Promise<PhoneNumber> {
    this.log.debug(this.deprovisionPhoneNumber.name, { id })
    const useCase = new DeprovisionPhoneNumberUseCase(this.phoneNumberService)
    const result = await useCase.execute(id)
    return this.phoneNumberTransformer.fromEntityToAPI(result)
  }

  public async getPhoneNumber(id: string): Promise<PhoneNumber | undefined> {
    this.log.debug(this.getPhoneNumber.name, { id })
    const useCase = new GetPhoneNumberUseCase(this.phoneNumberService)
    const result = await useCase.execute(id)
    return result
      ? this.phoneNumberTransformer.fromEntityToAPI(result)
      : undefined
  }

  public async listPhoneNumbers(
    input?: ListPhoneNumbersInput,
  ): Promise<ListOutput<PhoneNumber>> {
    this.log.debug(this.listPhoneNumbers.name, { input })
    const useCase = new ListPhoneNumbersUseCase(this.phoneNumberService)
    const result = await useCase.execute({
      limit: input?.limit,
      nextToken: input?.nextToken,
    })
    return this.toListOutput(result)
  }

  public async listPhoneNumbersForSudoId(
    input: ListPhoneNumbersForSudoIdInput,
  ): Promise<ListOutput<PhoneNumber>> {
    this.log.debug(this.listPhoneNumbersForSudoId.name, { input })
    const useCase = new ListPhoneNumbersForSudoIdUseCase(
      this.phoneNumberService,
    )
    const result = await useCase.execute({
      sudoId: input.sudoId,
      limit: input.limit,
      nextToken: input.nextToken,
    })
    return this.toListOutput(result)
  }

  // MARK: Subscriptions

  public async subscribeToPhoneNumbers(
    subscriptionId: string,
    subscriber: PhoneNumberSubscriber,
  ): Promise<void> {
    this.log.debug(this.subscribeToPhoneNumbers.name, { subscriptionId })
    const useCase = new SubscribeToPhoneNumbersUseCase(
      this.phoneNumberService,
      this.userClient,
    )
    await useCase.execute({ subscriptionId, subscriber })
  }

  public unsubscribeFromPhoneNumbers(subscriptionId: string): void {
    this.log.debug(this.unsubscribeFromPhoneNumbers.name, { subscriptionId })
    const useCase = new UnsubscribeFromPhoneNumbersUseCase(
      this.phoneNumberService,
    )
    useCase.execute(subscriptionId)
  }

  // MARK: Phone messages

  public async getPhoneMessage(id: string): Promise<PhoneMessage | undefined> {
    this.log.debug(this.getPhoneMessage.name, { id })
    const useCase = new GetPhoneMessageUseCase(
      this.phoneMessageService,
      this.phoneMessageUnsealer,
    )
    const result = await useCase.execute(id)
    return result
      ? this.phoneMessageTransformer.fromEntityToAPI(result)
      : undefined
  }

  public async listPhoneMessagesForPhoneNumberId(
    input: ListPhoneMessagesForPhoneNumberIdInput,
  ): Promise<ListPhoneMessagesResult> {
    this.log.debug(this.listPhoneMessagesForPhoneNumberId.name, { input })
    const useCase = new ListPhoneMessagesForPhoneNumberIdUseCase(
      this.phoneMessageService,
      this.phoneMessageUnsealer,
    )
    const result = await useCase.execute({
      phoneNumberId: input.phoneNumberId,
      sortOrder: input.sortOrder
        ? this.sortOrderTransformer.fromAPIToEntity(input.sortOrder)
        : undefined,
      limit: input.limit,
      nextToken: input.nextToken,
    })
    return this.toListPhoneMessagesResult(result)
  }

  public async listPhoneMessagesForConversationId(
    input: ListPhoneMessagesForConversationIdInput,
  ): Promise<ListPhoneMessagesResult> {
    this.log.debug(this.listPhoneMessagesForConversationId.name, { input })
    const useCase = new ListPhoneMessagesForConversationIdUseCase(
      this.phoneMessageService,
      this.phoneMessageUnsealer,
    )
    const result = await useCase.execute({
      conversationId: input.conversationId,
      sortOrder: input.sortOrder
        ? this.sortOrderTransformer.fromAPIToEntity(input.sortOrder)
        : undefined,
      limit: input.limit,
      nextToken: input.nextToken,
    })
    return this.toListPhoneMessagesResult(result)
  }

  public async deletePhoneMessages(
    input: DeletePhoneMessagesInput,
  ): Promise<PhoneMessageBatchResult> {
    this.log.debug(this.deletePhoneMessages.name, { count: input.ids.length })
    const useCase = new DeletePhoneMessagesUseCase(this.phoneMessageService)
    return await useCase.execute(input.ids)
  }

  public async updatePhoneMessages(
    input: UpdatePhoneMessagesInput,
  ): Promise<PhoneMessageBatchResult> {
    this.log.debug(this.updatePhoneMessages.name, {
      count: input.ids.length,
      seen: input.seen,
    })
    const useCase = new UpdatePhoneMessagesUseCase(this.phoneMessageService)
    return await useCase.execute({ ids: input.ids, seen: input.seen })
  }

  public async subscribeToPhoneMessages(
    subscriptionId: string,
    subscriber: PhoneMessageSubscriber,
  ): Promise<void> {
    this.log.debug(this.subscribeToPhoneMessages.name, { subscriptionId })
    const useCase = new SubscribeToPhoneMessagesUseCase(
      this.phoneMessageService,
      this.userClient,
    )
    await useCase.execute({ subscriptionId, subscriber })
  }

  public unsubscribeFromPhoneMessages(subscriptionId: string): void {
    this.log.debug(this.unsubscribeFromPhoneMessages.name, { subscriptionId })
    const useCase = new UnsubscribeFromPhoneMessagesUseCase(
      this.phoneMessageService,
    )
    useCase.execute(subscriptionId)
  }

  // MARK: Keys

  public async exportKeys(): Promise<ArrayBuffer> {
    this.log.debug(this.exportKeys.name)
    const useCase = new ExportKeysUseCase(this.deviceKeyWorker)
    return await useCase.execute()
  }

  public async importKeys(archiveData: ArrayBuffer): Promise<void> {
    this.log.debug(this.importKeys.name)
    const useCase = new ImportKeysUseCase(this.deviceKeyWorker)
    await useCase.execute(archiveData)
  }

  public async reset(): Promise<void> {
    this.log.debug(this.reset.name)
    const useCase = new ResetUseCase(this.deviceKeyWorker)
    await useCase.execute()
  }

  // MARK: Helpers

  private toListPhoneMessagesResult(
    result: ListPhoneMessagesUseCaseOutput,
  ): ListPhoneMessagesResult {
    const items = result.phoneMessages.map((message) =>
      this.phoneMessageTransformer.fromEntityToAPI(message),
    )
    if (result.failed.length === 0) {
      return {
        status: ListOperationResultStatus.Success,
        items,
        nextToken: result.nextToken,
      }
    }
    return {
      status: ListOperationResultStatus.Partial,
      items,
      failed: result.failed.map((failed) => ({
        item: this.phoneMessageTransformer.fromPartialEntityToAPI(failed.item),
        cause: failed.cause,
      })),
      nextToken: result.nextToken,
    }
  }

  private toListOutput(
    result: ListPhoneNumbersOutput,
  ): ListOutput<PhoneNumber> {
    return {
      items: result.phoneNumbers.map((phoneNumber) =>
        this.phoneNumberTransformer.fromEntityToAPI(phoneNumber),
      ),
      nextToken: result.nextToken,
    }
  }
}
