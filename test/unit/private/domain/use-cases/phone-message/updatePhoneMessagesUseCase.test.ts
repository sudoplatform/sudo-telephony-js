/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { anything, capture, instance, mock, reset, when } from 'ts-mockito'
import { PhoneMessageService } from '../../../../../../src/private/domain/entities/phone-message/phoneMessageService'
import { UpdatePhoneMessagesUseCase } from '../../../../../../src/private/domain/use-cases/phone-message/updatePhoneMessagesUseCase'

describe('UpdatePhoneMessagesUseCase Test Suite', () => {
  const mockPhoneMessageService = mock<PhoneMessageService>()

  beforeEach(() => {
    reset(mockPhoneMessageService)
  })

  describe('execute', () => {
    it('updates through the service', async () => {
      const batch = { succeededIds: ['a'], failedIds: [] }
      when(mockPhoneMessageService.update(anything())).thenResolve(batch)
      const instanceUnderTest = new UpdatePhoneMessagesUseCase(
        instance(mockPhoneMessageService),
      )

      await expect(
        instanceUnderTest.execute({ ids: ['a'], seen: true }),
      ).resolves.toStrictEqual(batch)
      const [args] = capture(mockPhoneMessageService.update).first()
      expect(args).toStrictEqual({ ids: ['a'], seen: true })
    })
  })
})
