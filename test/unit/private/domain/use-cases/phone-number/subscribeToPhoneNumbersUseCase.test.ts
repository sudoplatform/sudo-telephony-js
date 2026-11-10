/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { NotSignedInError } from '@sudoplatform/sudo-common'
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
import { PhoneNumberService } from '../../../../../../src/private/domain/entities/phone-number/phoneNumberService'
import { SubscribeToPhoneNumbersUseCase } from '../../../../../../src/private/domain/use-cases/phone-number/subscribeToPhoneNumbersUseCase'
import { PhoneNumberSubscriber } from '../../../../../../src/public'

describe('SubscribeToPhoneNumbersUseCase Test Suite', () => {
  const mockPhoneNumberService = mock<PhoneNumberService>()
  const mockUserClient = mock<SudoUserClient>()
  const subscriber: PhoneNumberSubscriber = {
    phoneNumberUpdated: vi.fn(),
    connectionStatusChanged: vi.fn(),
  }
  let instanceUnderTest: SubscribeToPhoneNumbersUseCase

  beforeEach(() => {
    reset(mockPhoneNumberService)
    reset(mockUserClient)
    instanceUnderTest = new SubscribeToPhoneNumbersUseCase(
      instance(mockPhoneNumberService),
      instance(mockUserClient),
    )
  })

  describe('execute', () => {
    it('subscribes for the signed in user', async () => {
      when(mockUserClient.getSubject()).thenResolve('testOwner')
      when(mockPhoneNumberService.subscribe(anything())).thenResolve()

      await instanceUnderTest.execute({ subscriptionId: 'sub', subscriber })

      const [inputArgs] = capture(mockPhoneNumberService.subscribe).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>({
        subscriptionId: 'sub',
        owner: 'testOwner',
        subscriber,
      })
    })

    it('throws NotSignedInError when the user is not signed in', async () => {
      when(mockUserClient.getSubject()).thenResolve(undefined)

      await expect(
        instanceUnderTest.execute({ subscriptionId: 'sub', subscriber }),
      ).rejects.toThrow(NotSignedInError)
      verify(mockPhoneNumberService.subscribe(anything())).never()
    })
  })
})
