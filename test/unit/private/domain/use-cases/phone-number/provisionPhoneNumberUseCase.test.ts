/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PublicKeyFormat,
  RequestFailedError,
  ServiceError,
  UnknownGraphQLError,
} from '@sudoplatform/sudo-common'
import {
  anything,
  capture,
  instance,
  mock,
  reset,
  verify,
  when,
} from 'ts-mockito'
import {
  DeviceKey,
  DeviceKeyWorker,
} from '../../../../../../src/private/data/common/deviceKeyWorker'
import { PhoneNumberService } from '../../../../../../src/private/domain/entities/phone-number/phoneNumberService'
import { ProvisionPhoneNumberUseCase } from '../../../../../../src/private/domain/use-cases/phone-number/provisionPhoneNumberUseCase'
import {
  PhoneNumberSearchExpiredError,
  PhoneNumberUnavailableError,
  SingletonKeyPairNotFoundError,
} from '../../../../../../src/public/errors'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('ProvisionPhoneNumberUseCase Test Suite', () => {
  const mockPhoneNumberService = mock<PhoneNumberService>()
  const mockDeviceKeyWorker = mock<DeviceKeyWorker>()

  const generatedKey: DeviceKey = {
    id: 'testKeyId',
    algorithm: 'RSAEncryptionOAEPAESGCM',
    data: 'cHVibGljS2V5',
    format: PublicKeyFormat.SPKI,
  }
  const singletonKey: DeviceKey = {
    id: 'singletonKeyId',
    algorithm: 'RSAEncryptionOAEPAESGCM',
    data: 'c2luZ2xldG9u',
    format: PublicKeyFormat.SPKI,
  }
  const input = { searchId: 'testSearchId', phoneNumber: '+14155550100' }

  const newUseCase = (enforceSingletonKeyPair: boolean) =>
    new ProvisionPhoneNumberUseCase(
      instance(mockPhoneNumberService),
      instance(mockDeviceKeyWorker),
      enforceSingletonKeyPair,
    )

  beforeEach(() => {
    reset(mockPhoneNumberService)
    reset(mockDeviceKeyWorker)
    when(mockDeviceKeyWorker.generateKeyPair()).thenResolve(generatedKey)
    when(mockDeviceKeyWorker.getSingletonKeyPair()).thenResolve(singletonKey)
    when(mockDeviceKeyWorker.removeKeyPair(anything())).thenResolve()
    when(mockPhoneNumberService.provision(anything())).thenResolve(
      EntityDataFactory.phoneNumber,
    )
  })

  describe('execute with a key pair per number', () => {
    let instanceUnderTest: ProvisionPhoneNumberUseCase

    beforeEach(() => {
      instanceUnderTest = newUseCase(false)
    })

    it('generates a key pair and provisions with its public key', async () => {
      const result = await instanceUnderTest.execute({
        ...input,
        ownershipProofToken: 'proof',
        clientRefId: 'ref',
      })

      expect(result).toStrictEqual(EntityDataFactory.phoneNumber)
      verify(mockDeviceKeyWorker.generateKeyPair()).once()
      verify(mockDeviceKeyWorker.getSingletonKeyPair()).never()
      verify(mockDeviceKeyWorker.removeKeyPair(anything())).never()
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

      await expect(instanceUnderTest.execute(input)).rejects.toThrow(
        'key failed',
      )
      verify(mockPhoneNumberService.provision(anything())).never()
    })

    it.each([
      new PhoneNumberUnavailableError(),
      new PhoneNumberSearchExpiredError(),
    ])(
      'removes the generated key when the service refuses with $name',
      async (error) => {
        when(mockPhoneNumberService.provision(anything())).thenReject(error)

        await expect(instanceUnderTest.execute(input)).rejects.toBe(error)
        verify(mockDeviceKeyWorker.removeKeyPair('testKeyId')).once()
      },
    )

    it.each([
      new RequestFailedError(),
      new ServiceError('internal'),
      new UnknownGraphQLError(new Error('unknown')),
      new Error('unexpected'),
    ])('keeps the generated key when the failure is $name', async (error) => {
      when(mockPhoneNumberService.provision(anything())).thenReject(error)

      await expect(instanceUnderTest.execute(input)).rejects.toBe(error)
      verify(mockDeviceKeyWorker.removeKeyPair(anything())).never()
    })

    it('throws the refusal when removing the key fails', async () => {
      const error = new PhoneNumberUnavailableError()
      when(mockPhoneNumberService.provision(anything())).thenReject(error)
      when(mockDeviceKeyWorker.removeKeyPair(anything())).thenReject(
        new Error('remove failed'),
      )

      await expect(instanceUnderTest.execute(input)).rejects.toBe(error)
    })
  })

  describe('execute with a singleton key pair', () => {
    let instanceUnderTest: ProvisionPhoneNumberUseCase

    beforeEach(() => {
      instanceUnderTest = newUseCase(true)
    })

    it('provisions with the singleton public key', async () => {
      await instanceUnderTest.execute(input)

      verify(mockDeviceKeyWorker.getSingletonKeyPair()).once()
      verify(mockDeviceKeyWorker.generateKeyPair()).never()
      const [inputArgs] = capture(mockPhoneNumberService.provision).first()
      expect(inputArgs.key).toStrictEqual<typeof inputArgs.key>({
        keyId: 'singletonKeyId',
        algorithm: 'RSAEncryptionOAEPAESGCM',
        keyFormat: PublicKeyFormat.SPKI,
        publicKey: 'c2luZ2xldG9u',
      })
    })

    it('fails before calling the service when the singleton is absent', async () => {
      when(mockDeviceKeyWorker.getSingletonKeyPair()).thenResolve(undefined)

      await expect(instanceUnderTest.execute(input)).rejects.toThrow(
        SingletonKeyPairNotFoundError,
      )
      verify(mockPhoneNumberService.provision(anything())).never()
      verify(mockDeviceKeyWorker.generateKeyPair()).never()
    })

    it('keeps the singleton key when the service refuses', async () => {
      const error = new PhoneNumberUnavailableError()
      when(mockPhoneNumberService.provision(anything())).thenReject(error)

      await expect(instanceUnderTest.execute(input)).rejects.toBe(error)
      verify(mockDeviceKeyWorker.removeKeyPair(anything())).never()
    })
  })
})
