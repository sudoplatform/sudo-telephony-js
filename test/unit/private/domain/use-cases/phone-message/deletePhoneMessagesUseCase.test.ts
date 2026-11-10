/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { anything, instance, mock, reset, verify, when } from 'ts-mockito'
import { PhoneMessageService } from '../../../../../../src/private/domain/entities/phone-message/phoneMessageService'
import { DeletePhoneMessagesUseCase } from '../../../../../../src/private/domain/use-cases/phone-message/deletePhoneMessagesUseCase'

describe('DeletePhoneMessagesUseCase Test Suite', () => {
  const mockPhoneMessageService = mock<PhoneMessageService>()

  beforeEach(() => {
    reset(mockPhoneMessageService)
  })

  describe('execute', () => {
    it('deletes through the service', async () => {
      const batch = { succeededIds: ['a'], failedIds: ['b'] }
      when(mockPhoneMessageService.delete(anything())).thenResolve(batch)
      const instanceUnderTest = new DeletePhoneMessagesUseCase(
        instance(mockPhoneMessageService),
      )

      await expect(
        instanceUnderTest.execute(['a', 'b']),
      ).resolves.toStrictEqual(batch)
      verify(mockPhoneMessageService.delete(anything())).once()
    })
  })
})
