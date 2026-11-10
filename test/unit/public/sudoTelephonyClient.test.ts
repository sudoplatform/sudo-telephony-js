/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ListOperationResultStatus,
  SudoKeyManager,
} from '@sudoplatform/sudo-common'
import { SudoUserClient } from '@sudoplatform/sudo-user'
import {
  anything,
  capture,
  instance,
  mock,
  reset,
  verify,
  when,
} from 'ts-mockito'
import { ApiClient } from '../../../src/private/data/common/apiClient'
import { PrivateSudoTelephonyClientOptions } from '../../../src/private/data/common/privateSudoTelephonyClientOptions'
import { DefaultConfigurationDataService } from '../../../src/private/data/configuration/defaultConfigurationDataService'
import { DefaultCountryService } from '../../../src/private/data/country/defaultCountryService'
import { DefaultPhoneNumberSearchService } from '../../../src/private/data/phone-number-search/defaultPhoneNumberSearchService'
import { DefaultPhoneNumberService } from '../../../src/private/data/phone-number/defaultPhoneNumberService'
import { GetPhoneMessageUseCase } from '../../../src/private/domain/use-cases/phone-message/getPhoneMessageUseCase'
import { ListPhoneMessagesForPhoneNumberIdUseCase } from '../../../src/private/domain/use-cases/phone-message/listPhoneMessagesForPhoneNumberIdUseCase'
import { ListPhoneMessagesForConversationIdUseCase } from '../../../src/private/domain/use-cases/phone-message/listPhoneMessagesForConversationIdUseCase'
import { DeletePhoneMessagesUseCase } from '../../../src/private/domain/use-cases/phone-message/deletePhoneMessagesUseCase'
import { UpdatePhoneMessagesUseCase } from '../../../src/private/domain/use-cases/phone-message/updatePhoneMessagesUseCase'
import { SubscribeToPhoneMessagesUseCase } from '../../../src/private/domain/use-cases/phone-message/subscribeToPhoneMessagesUseCase'
import { UnsubscribeFromPhoneMessagesUseCase } from '../../../src/private/domain/use-cases/phone-message/unsubscribeFromPhoneMessagesUseCase'
import { ExportKeysUseCase } from '../../../src/private/domain/use-cases/key/exportKeysUseCase'
import { ImportKeysUseCase } from '../../../src/private/domain/use-cases/key/importKeysUseCase'
import { ResetUseCase } from '../../../src/private/domain/use-cases/key/resetUseCase'
import { DefaultPhoneMessageService } from '../../../src/private/data/phone-message/defaultPhoneMessageService'
import { GetConfigurationDataUseCase } from '../../../src/private/domain/use-cases/configuration/getConfigurationDataUseCase'
import { GetSupportedCountriesUseCase } from '../../../src/private/domain/use-cases/country/getSupportedCountriesUseCase'
import { SearchAvailablePhoneNumbersUseCase } from '../../../src/private/domain/use-cases/phone-number-search/searchAvailablePhoneNumbersUseCase'
import { DeprovisionPhoneNumberUseCase } from '../../../src/private/domain/use-cases/phone-number/deprovisionPhoneNumberUseCase'
import { GetPhoneNumberUseCase } from '../../../src/private/domain/use-cases/phone-number/getPhoneNumberUseCase'
import { ListPhoneNumbersForSudoIdUseCase } from '../../../src/private/domain/use-cases/phone-number/listPhoneNumbersForSudoIdUseCase'
import { ListPhoneNumbersUseCase } from '../../../src/private/domain/use-cases/phone-number/listPhoneNumbersUseCase'
import { ProvisionPhoneNumberUseCase } from '../../../src/private/domain/use-cases/phone-number/provisionPhoneNumberUseCase'
import { SubscribeToPhoneNumbersUseCase } from '../../../src/private/domain/use-cases/phone-number/subscribeToPhoneNumbersUseCase'
import { UnsubscribeFromPhoneNumbersUseCase } from '../../../src/private/domain/use-cases/phone-number/unsubscribeFromPhoneNumbersUseCase'
import {
  DefaultSudoTelephonyClient,
  PhoneMessageSubscriber,
  SortOrder,
  UnsealingFailedError,
  OWNERSHIP_PROOF_AUDIENCE,
  PhoneNumberSubscriber,
} from '../../../src/public'
import { APIDataFactory } from '../../data-factory/api'
import { EntityDataFactory } from '../../data-factory/entity'

// MARK: Service mocks

vi.mock('../../../src/private/data/common/apiClient')
vi.mock(
  '../../../src/private/domain/use-cases/phone-message/getPhoneMessageUseCase',
)
vi.mock(
  '../../../src/private/domain/use-cases/phone-message/listPhoneMessagesForPhoneNumberIdUseCase',
)
vi.mock(
  '../../../src/private/domain/use-cases/phone-message/listPhoneMessagesForConversationIdUseCase',
)
vi.mock(
  '../../../src/private/domain/use-cases/phone-message/deletePhoneMessagesUseCase',
)
vi.mock(
  '../../../src/private/domain/use-cases/phone-message/updatePhoneMessagesUseCase',
)
vi.mock(
  '../../../src/private/domain/use-cases/phone-message/subscribeToPhoneMessagesUseCase',
)
vi.mock(
  '../../../src/private/domain/use-cases/phone-message/unsubscribeFromPhoneMessagesUseCase',
)
vi.mock('../../../src/private/domain/use-cases/key/exportKeysUseCase')
vi.mock('../../../src/private/domain/use-cases/key/importKeysUseCase')
vi.mock('../../../src/private/domain/use-cases/key/resetUseCase')
vi.mock('../../../src/private/data/phone-message/defaultPhoneMessageService')
vi.mock('../../../src/private/data/country/defaultCountryService')
vi.mock(
  '../../../src/private/data/configuration/defaultConfigurationDataService',
)
vi.mock(
  '../../../src/private/data/phone-number-search/defaultPhoneNumberSearchService',
)
vi.mock('../../../src/private/data/phone-number/defaultPhoneNumberService')

// MARK: Use case mocks

vi.mock(
  '../../../src/private/domain/use-cases/country/getSupportedCountriesUseCase',
)
vi.mock(
  '../../../src/private/domain/use-cases/configuration/getConfigurationDataUseCase',
)
vi.mock(
  '../../../src/private/domain/use-cases/phone-number-search/searchAvailablePhoneNumbersUseCase',
)
vi.mock(
  '../../../src/private/domain/use-cases/phone-number/provisionPhoneNumberUseCase',
)
vi.mock(
  '../../../src/private/domain/use-cases/phone-number/deprovisionPhoneNumberUseCase',
)
vi.mock(
  '../../../src/private/domain/use-cases/phone-number/getPhoneNumberUseCase',
)
vi.mock(
  '../../../src/private/domain/use-cases/phone-number/listPhoneNumbersUseCase',
)
vi.mock(
  '../../../src/private/domain/use-cases/phone-number/listPhoneNumbersForSudoIdUseCase',
)
vi.mock(
  '../../../src/private/domain/use-cases/phone-number/subscribeToPhoneNumbersUseCase',
)
vi.mock(
  '../../../src/private/domain/use-cases/phone-number/unsubscribeFromPhoneNumbersUseCase',
)

describe('SudoTelephonyClient Test Suite', () => {
  const mockUserClient = mock<SudoUserClient>()
  const mockKeyManager = mock<SudoKeyManager>()
  const mockApiClient = mock<ApiClient>()

  const mockGetSupportedCountriesUseCase = mock<GetSupportedCountriesUseCase>()
  const mockGetConfigurationDataUseCase = mock<GetConfigurationDataUseCase>()
  const mockSearchAvailablePhoneNumbersUseCase =
    mock<SearchAvailablePhoneNumbersUseCase>()
  const mockProvisionPhoneNumberUseCase = mock<ProvisionPhoneNumberUseCase>()
  const mockDeprovisionPhoneNumberUseCase =
    mock<DeprovisionPhoneNumberUseCase>()
  const mockGetPhoneNumberUseCase = mock<GetPhoneNumberUseCase>()
  const mockListPhoneNumbersUseCase = mock<ListPhoneNumbersUseCase>()
  const mockListPhoneNumbersForSudoIdUseCase =
    mock<ListPhoneNumbersForSudoIdUseCase>()
  const mockSubscribeToPhoneNumbersUseCase =
    mock<SubscribeToPhoneNumbersUseCase>()
  const mockUnsubscribeFromPhoneNumbersUseCase =
    mock<UnsubscribeFromPhoneNumbersUseCase>()

  const mockGetPhoneMessageUseCase = mock<GetPhoneMessageUseCase>()
  const mockListPhoneMessagesForPhoneNumberIdUseCase =
    mock<ListPhoneMessagesForPhoneNumberIdUseCase>()
  const mockListPhoneMessagesForConversationIdUseCase =
    mock<ListPhoneMessagesForConversationIdUseCase>()
  const mockDeletePhoneMessagesUseCase = mock<DeletePhoneMessagesUseCase>()
  const mockUpdatePhoneMessagesUseCase = mock<UpdatePhoneMessagesUseCase>()
  const mockSubscribeToPhoneMessagesUseCase =
    mock<SubscribeToPhoneMessagesUseCase>()
  const mockUnsubscribeFromPhoneMessagesUseCase =
    mock<UnsubscribeFromPhoneMessagesUseCase>()
  const mockExportKeysUseCase = mock<ExportKeysUseCase>()
  const mockImportKeysUseCase = mock<ImportKeysUseCase>()
  const mockResetUseCase = mock<ResetUseCase>()

  const useCaseMocks: [unknown, object][] = [
    [GetPhoneMessageUseCase, mockGetPhoneMessageUseCase],
    [
      ListPhoneMessagesForPhoneNumberIdUseCase,
      mockListPhoneMessagesForPhoneNumberIdUseCase,
    ],
    [
      ListPhoneMessagesForConversationIdUseCase,
      mockListPhoneMessagesForConversationIdUseCase,
    ],
    [DeletePhoneMessagesUseCase, mockDeletePhoneMessagesUseCase],
    [UpdatePhoneMessagesUseCase, mockUpdatePhoneMessagesUseCase],
    [SubscribeToPhoneMessagesUseCase, mockSubscribeToPhoneMessagesUseCase],
    [
      UnsubscribeFromPhoneMessagesUseCase,
      mockUnsubscribeFromPhoneMessagesUseCase,
    ],
    [ExportKeysUseCase, mockExportKeysUseCase],
    [ImportKeysUseCase, mockImportKeysUseCase],
    [ResetUseCase, mockResetUseCase],
    [GetSupportedCountriesUseCase, mockGetSupportedCountriesUseCase],
    [GetConfigurationDataUseCase, mockGetConfigurationDataUseCase],
    [
      SearchAvailablePhoneNumbersUseCase,
      mockSearchAvailablePhoneNumbersUseCase,
    ],
    [ProvisionPhoneNumberUseCase, mockProvisionPhoneNumberUseCase],
    [DeprovisionPhoneNumberUseCase, mockDeprovisionPhoneNumberUseCase],
    [GetPhoneNumberUseCase, mockGetPhoneNumberUseCase],
    [ListPhoneNumbersUseCase, mockListPhoneNumbersUseCase],
    [ListPhoneNumbersForSudoIdUseCase, mockListPhoneNumbersForSudoIdUseCase],
    [SubscribeToPhoneNumbersUseCase, mockSubscribeToPhoneNumbersUseCase],
    [
      UnsubscribeFromPhoneNumbersUseCase,
      mockUnsubscribeFromPhoneNumbersUseCase,
    ],
  ]

  let instanceUnderTest: DefaultSudoTelephonyClient
  let apiClient: ApiClient

  beforeEach(() => {
    reset(mockUserClient)
    reset(mockKeyManager)
    reset(mockApiClient)
    for (const [useCaseClass, useCaseMock] of useCaseMocks) {
      reset(useCaseMock)
      vi.mocked(useCaseClass as any).mockClear()
      vi.mocked(useCaseClass as any).mockImplementation(function () {
        return instance(useCaseMock)
      })
    }
    vi.mocked(ApiClient).mockClear()
    vi.mocked(DefaultCountryService).mockClear()
    vi.mocked(DefaultConfigurationDataService).mockClear()
    vi.mocked(DefaultPhoneNumberSearchService).mockClear()
    vi.mocked(DefaultPhoneNumberService).mockClear()
    vi.mocked(DefaultPhoneMessageService).mockClear()

    apiClient = instance(mockApiClient)
    const options: PrivateSudoTelephonyClientOptions = {
      sudoUserClient: instance(mockUserClient),
      sudoKeyManager: instance(mockKeyManager),
      apiClient,
    }
    instanceUnderTest = new DefaultSudoTelephonyClient(options)
  })

  it('exports the ownership proof audience', () => {
    expect(OWNERSHIP_PROOF_AUDIENCE).toBe('sudoplatform.telephony.phone-number')
  })

  it('creates every service with the injected API client', () => {
    for (const service of [
      DefaultCountryService,
      DefaultConfigurationDataService,
      DefaultPhoneNumberSearchService,
      DefaultPhoneNumberService,
      DefaultPhoneMessageService,
    ]) {
      expect(vi.mocked(service).mock.calls[0][0]).toBe(apiClient)
    }
    expect(vi.mocked(ApiClient)).not.toHaveBeenCalled()
  })

  // MARK: Configuration

  describe('getSupportedCountries', () => {
    it('returns the countries from the use case', async () => {
      when(mockGetSupportedCountriesUseCase.execute()).thenResolve(['US'])

      await expect(
        instanceUnderTest.getSupportedCountries(),
      ).resolves.toStrictEqual(['US'])
      expect(vi.mocked(GetSupportedCountriesUseCase)).toHaveBeenCalledTimes(1)
    })
  })

  describe('getConfigurationData', () => {
    it('returns the transformed configuration', async () => {
      when(mockGetConfigurationDataUseCase.execute()).thenResolve(
        EntityDataFactory.configurationData,
      )

      await expect(
        instanceUnderTest.getConfigurationData(),
      ).resolves.toStrictEqual(APIDataFactory.configurationData)
    })
  })

  // MARK: Phone numbers

  describe('searchAvailablePhoneNumbers', () => {
    it('passes the criteria and returns the transformed search', async () => {
      when(
        mockSearchAvailablePhoneNumbersUseCase.execute(anything()),
      ).thenResolve(EntityDataFactory.phoneNumberSearch)

      await expect(
        instanceUnderTest.searchAvailablePhoneNumbers({
          countryCode: 'US',
          areaCode: '415',
          limit: 5,
        }),
      ).resolves.toStrictEqual(APIDataFactory.phoneNumberSearch)
      const [args] = capture(
        mockSearchAvailablePhoneNumbersUseCase.execute,
      ).first()
      expect(args).toStrictEqual({
        countryCode: 'US',
        areaCode: '415',
        limit: 5,
      })
    })
  })

  describe('provisionPhoneNumber', () => {
    it('passes the input and returns the transformed number', async () => {
      when(mockProvisionPhoneNumberUseCase.execute(anything())).thenResolve(
        EntityDataFactory.phoneNumber,
      )

      await expect(
        instanceUnderTest.provisionPhoneNumber({
          searchId: 'testSearchId',
          phoneNumber: '+14155550100',
          ownershipProofToken: 'proof',
          clientRefId: 'ref',
        }),
      ).resolves.toStrictEqual(APIDataFactory.phoneNumber)
      const [args] = capture(mockProvisionPhoneNumberUseCase.execute).first()
      expect(args).toStrictEqual({
        searchId: 'testSearchId',
        phoneNumber: '+14155550100',
        ownershipProofToken: 'proof',
        clientRefId: 'ref',
      })
    })
  })

  describe('deprovisionPhoneNumber', () => {
    it('returns the transformed number', async () => {
      when(mockDeprovisionPhoneNumberUseCase.execute(anything())).thenResolve(
        EntityDataFactory.phoneNumber,
      )

      await expect(
        instanceUnderTest.deprovisionPhoneNumber('id'),
      ).resolves.toStrictEqual(APIDataFactory.phoneNumber)
      verify(mockDeprovisionPhoneNumberUseCase.execute('id')).once()
    })
  })

  describe('getPhoneNumber', () => {
    it('returns the transformed number', async () => {
      when(mockGetPhoneNumberUseCase.execute(anything())).thenResolve(
        EntityDataFactory.phoneNumber,
      )

      await expect(
        instanceUnderTest.getPhoneNumber('id'),
      ).resolves.toStrictEqual(APIDataFactory.phoneNumber)
      verify(mockGetPhoneNumberUseCase.execute('id')).once()
    })

    it('returns undefined when the number is not found', async () => {
      when(mockGetPhoneNumberUseCase.execute(anything())).thenResolve(undefined)

      await expect(
        instanceUnderTest.getPhoneNumber('id'),
      ).resolves.toBeUndefined()
    })
  })

  describe('listPhoneNumbers', () => {
    it('passes paging and returns the transformed page', async () => {
      when(mockListPhoneNumbersUseCase.execute(anything())).thenResolve({
        phoneNumbers: [EntityDataFactory.phoneNumber],
        nextToken: 'next',
      })

      await expect(
        instanceUnderTest.listPhoneNumbers({ limit: 1, nextToken: 'token' }),
      ).resolves.toStrictEqual({
        items: [APIDataFactory.phoneNumber],
        nextToken: 'next',
      })
      const [args] = capture(mockListPhoneNumbersUseCase.execute).first()
      expect(args).toStrictEqual({ limit: 1, nextToken: 'token' })
    })

    it('accepts no input', async () => {
      when(mockListPhoneNumbersUseCase.execute(anything())).thenResolve({
        phoneNumbers: [],
      })

      await expect(instanceUnderTest.listPhoneNumbers()).resolves.toStrictEqual(
        { items: [], nextToken: undefined },
      )
      const [args] = capture(mockListPhoneNumbersUseCase.execute).first()
      expect(args).toStrictEqual({ limit: undefined, nextToken: undefined })
    })
  })

  describe('listPhoneNumbersForSudoId', () => {
    it('passes the Sudo and paging and returns the transformed page', async () => {
      when(
        mockListPhoneNumbersForSudoIdUseCase.execute(anything()),
      ).thenResolve({ phoneNumbers: [EntityDataFactory.phoneNumber] })

      await expect(
        instanceUnderTest.listPhoneNumbersForSudoId({ sudoId: 'sudo' }),
      ).resolves.toStrictEqual({
        items: [APIDataFactory.phoneNumber],
        nextToken: undefined,
      })
      const [args] = capture(
        mockListPhoneNumbersForSudoIdUseCase.execute,
      ).first()
      expect(args).toStrictEqual({
        sudoId: 'sudo',
        limit: undefined,
        nextToken: undefined,
      })
    })
  })

  // MARK: Subscriptions

  describe('subscriptions', () => {
    const subscriber: PhoneNumberSubscriber = {
      phoneNumberUpdated: vi.fn(),
      connectionStatusChanged: vi.fn(),
    }

    it('subscribeToPhoneNumbers passes the subscription to the use case', async () => {
      when(mockSubscribeToPhoneNumbersUseCase.execute(anything())).thenResolve()

      await instanceUnderTest.subscribeToPhoneNumbers('sub', subscriber)

      const [args] = capture(mockSubscribeToPhoneNumbersUseCase.execute).first()
      expect(args).toStrictEqual({ subscriptionId: 'sub', subscriber })
    })

    it('unsubscribeFromPhoneNumbers unsubscribes that ID', () => {
      instanceUnderTest.unsubscribeFromPhoneNumbers('sub')

      verify(mockUnsubscribeFromPhoneNumbersUseCase.execute('sub')).once()
    })
  })

  // MARK: Phone messages

  describe('getPhoneMessage', () => {
    it('returns the transformed message', async () => {
      when(mockGetPhoneMessageUseCase.execute(anything())).thenResolve(
        EntityDataFactory.phoneMessage,
      )

      await expect(
        instanceUnderTest.getPhoneMessage('id'),
      ).resolves.toStrictEqual(APIDataFactory.phoneMessage)
      verify(mockGetPhoneMessageUseCase.execute('id')).once()
    })

    it('returns undefined when the message is not found', async () => {
      when(mockGetPhoneMessageUseCase.execute(anything())).thenResolve(
        undefined,
      )

      await expect(
        instanceUnderTest.getPhoneMessage('id'),
      ).resolves.toBeUndefined()
    })
  })

  describe('listPhoneMessagesForPhoneNumberId', () => {
    it('returns a success result when every message was unsealed', async () => {
      when(
        mockListPhoneMessagesForPhoneNumberIdUseCase.execute(anything()),
      ).thenResolve({
        phoneMessages: [EntityDataFactory.phoneMessage],
        failed: [],
        nextToken: 'next',
      })

      await expect(
        instanceUnderTest.listPhoneMessagesForPhoneNumberId({
          phoneNumberId: 'pn',
          sortOrder: SortOrder.Asc,
          limit: 1,
          nextToken: 'token',
        }),
      ).resolves.toStrictEqual({
        status: ListOperationResultStatus.Success,
        items: [APIDataFactory.phoneMessage],
        nextToken: 'next',
      })
      const [args] = capture(
        mockListPhoneMessagesForPhoneNumberIdUseCase.execute,
      ).first()
      expect(args).toStrictEqual({
        phoneNumberId: 'pn',
        sortOrder: 'ASC',
        limit: 1,
        nextToken: 'token',
      })
    })

    it('returns a partial result when a message could not be unsealed', async () => {
      const cause = new UnsealingFailedError('failed')
      when(
        mockListPhoneMessagesForPhoneNumberIdUseCase.execute(anything()),
      ).thenResolve({
        phoneMessages: [EntityDataFactory.phoneMessage],
        failed: [{ item: EntityDataFactory.partialPhoneMessage, cause }],
        nextToken: undefined,
      })

      await expect(
        instanceUnderTest.listPhoneMessagesForPhoneNumberId({
          phoneNumberId: 'pn',
        }),
      ).resolves.toStrictEqual({
        status: ListOperationResultStatus.Partial,
        items: [APIDataFactory.phoneMessage],
        failed: [{ item: APIDataFactory.partialPhoneMessage, cause }],
        nextToken: undefined,
      })
    })
  })

  describe('listPhoneMessagesForConversationId', () => {
    it('passes the input and returns the result', async () => {
      when(
        mockListPhoneMessagesForConversationIdUseCase.execute(anything()),
      ).thenResolve({ phoneMessages: [], failed: [], nextToken: undefined })

      await expect(
        instanceUnderTest.listPhoneMessagesForConversationId({
          conversationId: 'conv',
        }),
      ).resolves.toStrictEqual({
        status: ListOperationResultStatus.Success,
        items: [],
        nextToken: undefined,
      })
      const [args] = capture(
        mockListPhoneMessagesForConversationIdUseCase.execute,
      ).first()
      expect(args).toStrictEqual({
        conversationId: 'conv',
        sortOrder: undefined,
        limit: undefined,
        nextToken: undefined,
      })
    })
  })

  describe('deletePhoneMessages', () => {
    it('returns the batch result', async () => {
      const batch = { succeededIds: ['a'], failedIds: ['b'] }
      when(mockDeletePhoneMessagesUseCase.execute(anything())).thenResolve(
        batch,
      )

      await expect(
        instanceUnderTest.deletePhoneMessages({ ids: ['a', 'b'] }),
      ).resolves.toStrictEqual(batch)
      const [args] = capture(mockDeletePhoneMessagesUseCase.execute).first()
      expect(args).toStrictEqual(['a', 'b'])
    })
  })

  describe('updatePhoneMessages', () => {
    it('returns the batch result', async () => {
      const batch = { succeededIds: ['a'], failedIds: [] }
      when(mockUpdatePhoneMessagesUseCase.execute(anything())).thenResolve(
        batch,
      )

      await expect(
        instanceUnderTest.updatePhoneMessages({ ids: ['a'], seen: true }),
      ).resolves.toStrictEqual(batch)
      const [args] = capture(mockUpdatePhoneMessagesUseCase.execute).first()
      expect(args).toStrictEqual({ ids: ['a'], seen: true })
    })
  })

  describe('phone message subscriptions', () => {
    const subscriber: PhoneMessageSubscriber = {
      phoneMessageEvent: vi.fn(),
      connectionStatusChanged: vi.fn(),
    }

    it('subscribeToPhoneMessages passes the subscription to the use case', async () => {
      when(
        mockSubscribeToPhoneMessagesUseCase.execute(anything()),
      ).thenResolve()

      await instanceUnderTest.subscribeToPhoneMessages('sub', subscriber)

      const [args] = capture(
        mockSubscribeToPhoneMessagesUseCase.execute,
      ).first()
      expect(args).toStrictEqual({ subscriptionId: 'sub', subscriber })
    })

    it('unsubscribeFromPhoneMessages unsubscribes that ID', () => {
      instanceUnderTest.unsubscribeFromPhoneMessages('sub')

      verify(mockUnsubscribeFromPhoneMessagesUseCase.execute('sub')).once()
    })
  })

  // MARK: Keys

  describe('keys', () => {
    it('exportKeys returns the archive', async () => {
      const archive = new ArrayBuffer(4)
      when(mockExportKeysUseCase.execute()).thenResolve(archive)

      await expect(instanceUnderTest.exportKeys()).resolves.toBe(archive)
    })

    it('importKeys passes the archive to the use case', async () => {
      const archive = new ArrayBuffer(4)

      await instanceUnderTest.importKeys(archive)

      verify(mockImportKeysUseCase.execute(archive)).once()
    })

    it('reset runs the reset use case', async () => {
      await instanceUnderTest.reset()

      verify(mockResetUseCase.execute()).once()
    })
  })
})
