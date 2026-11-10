/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { PublicKeyFormat } from '@sudoplatform/sudo-common'
import {
  anything,
  capture,
  instance,
  mock,
  reset,
  verify,
  when,
} from 'ts-mockito'
import { DeviceKeyWorker } from '../../../../../../src/private/data/common/deviceKeyWorker'
import { PhoneNumberService } from '../../../../../../src/private/domain/entities/phone-number/phoneNumberService'
import { ProvisionPhoneNumberUseCase } from '../../../../../../src/private/domain/use-cases/phone-number/provisionPhoneNumberUseCase'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('ProvisionPhoneNumberUseCase Test Suite', () => {
  const mockPhoneNumberService = mock<PhoneNumberService>()
  const mockDeviceKeyWorker = mock<DeviceKeyWorker>()
  let instanceUnderTest: ProvisionPhoneNumberUseCase

  beforeEach(() => {
    reset(mockPhoneNumberService)
    reset(mockDeviceKeyWorker)
    instanceUnderTest = new ProvisionPhoneNumberUseCase(
      instance(mockPhoneNumberService),
      instance(mockDeviceKeyWorker),
    )
    when(mockDeviceKeyWorker.generateKeyPair()).thenResolve({
      id: 'testKeyId',
      algorithm: 'RSAEncryptionOAEPAESGCM',
      data: 'cHVibGljS2V5',
      format: PublicKeyFormat.SPKI,
    })
    when(mockPhoneNumberService.provision(anything())).thenResolve(
      EntityDataFactory.phoneNumber,
    )
  })

  describe('execute', () => {
    it('generates a key pair and provisions with its public key', async () => {
      const result = await instanceUnderTest.execute({
        searchId: 'testSearchId',
        phoneNumber: '+14155550100',
        ownershipProofToken: 'proof',
        clientRefId: 'ref',
      })

      expect(result).toStrictEqual(EntityDataFactory.phoneNumber)
      verify(mockDeviceKeyWorker.generateKeyPair()).once()
      const [inputArgs] = capture(mockPhoneNumberService.provision).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>({
        searchId: 'testSearchId',
        phoneNumber: '+14155550100',
        key: {
          keyId: 'testKeyId',
          algorithm: 'RSAEncryptionOAEPAESGCM',
          keyFormat: PublicKeyFormat.SPKI,
          publicKey: 'cHVibGljS2V5',
        },
        ownershipProofToken: 'proof',
        clientRefId: 'ref',
      })
    })

    it('does not call the service when key generation fails', async () => {
      when(mockDeviceKeyWorker.generateKeyPair()).thenReject(
        new Error('key failed'),
      )

      await expect(
        instanceUnderTest.execute({
          searchId: 'testSearchId',
          phoneNumber: '+14155550100',
        }),
      ).rejects.toThrow('key failed')
      verify(mockPhoneNumberService.provision(anything())).never()
    })

    it('throws when the service throws', async () => {
      when(mockPhoneNumberService.provision(anything())).thenReject(
        new Error('provision failed'),
      )

      await expect(
        instanceUnderTest.execute({
          searchId: 'testSearchId',
          phoneNumber: '+14155550100',
        }),
      ).rejects.toThrow('provision failed')
    })
  })
})
