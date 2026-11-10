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
import { PhoneMessageService } from '../../../../../../src/private/domain/entities/phone-message/phoneMessageService'
import { SubscribeToPhoneMessagesUseCase } from '../../../../../../src/private/domain/use-cases/phone-message/subscribeToPhoneMessagesUseCase'
import { PhoneMessageSubscriber } from '../../../../../../src/public'

describe('SubscribeToPhoneMessagesUseCase Test Suite', () => {
  const mockPhoneMessageService = mock<PhoneMessageService>()
  const mockUserClient = mock<SudoUserClient>()
  const subscriber: PhoneMessageSubscriber = {
    phoneMessageEvent: vi.fn(),
    connectionStatusChanged: vi.fn(),
  }
  let instanceUnderTest: SubscribeToPhoneMessagesUseCase

  beforeEach(() => {
    reset(mockPhoneMessageService)
    reset(mockUserClient)
    instanceUnderTest = new SubscribeToPhoneMessagesUseCase(
      instance(mockPhoneMessageService),
      instance(mockUserClient),
    )
  })

  describe('execute', () => {
    it('subscribes for the signed in user', async () => {
      when(mockUserClient.getSubject()).thenResolve('testOwner')
      when(mockPhoneMessageService.subscribe(anything())).thenResolve()

      await instanceUnderTest.execute({ subscriptionId: 'sub', subscriber })

      const [args] = capture(mockPhoneMessageService.subscribe).first()
      expect(args).toStrictEqual<typeof args>({
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
      verify(mockPhoneMessageService.subscribe(anything())).never()
    })
  })
})
