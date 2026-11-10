/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger } from '@sudoplatform/sudo-common'
import { Sudo, SudoProfilesClient } from '@sudoplatform/sudo-profiles'
import {
  OWNERSHIP_PROOF_AUDIENCE,
  PhoneNumber,
  PhoneNumberSearch,
  PhoneNumberState,
  PhoneNumberUnavailableError,
  SudoTelephonyClient,
} from '../../../src/public'
import { createSudo } from './createSudo'

export const countryCode = process.env.COUNTRY_CODE ?? 'US'
// 650 is an area code the dev instance currently offers numbers in.
export const areaCode = process.env.AREA_CODE ?? '650'

const STATE_TIMEOUT_MS = 60_000
const STATE_POLL_INTERVAL_MS = 2_000

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export interface ProvisionedNumber {
  searchId: string
  ownershipProofToken?: string
  number: PhoneNumber
}

/**
 * Provisions phone numbers for a test and releases them, and deletes the
 * Sudos it created, when the test ends.
 */
export class PhoneNumberTestHelper {
  private readonly provisionedIds = new Set<string>()
  private readonly createdSudos: Sudo[] = []

  constructor(
    private readonly telephonyClient: SudoTelephonyClient,
    private readonly profilesClient: SudoProfilesClient,
    private readonly log: DefaultLogger,
  ) {}

  async createSudo(): Promise<Sudo> {
    const sudo = await createSudo(this.profilesClient)
    this.createdSudos.push(sudo)
    return sudo
  }

  async getOwnershipProof(
    sudo: Sudo,
    audience: string = OWNERSHIP_PROOF_AUDIENCE,
  ): Promise<string> {
    return await this.profilesClient.getOwnershipProof(sudo.id!, audience)
  }

  async newOwnershipProof(): Promise<string> {
    return await this.getOwnershipProof(await this.createSudo())
  }

  /**
   * Searches the test area code. Returns `undefined` when the instance offers
   * no numbers there, so the caller can skip.
   */
  async searchAvailableNumbers(): Promise<PhoneNumberSearch | undefined> {
    const search = await this.telephonyClient.searchAvailablePhoneNumbers({
      countryCode,
      areaCode,
    })
    if (search.results.length === 0) {
      this.log.info(`No numbers offered in ${countryCode}-${areaCode}`)
      return undefined
    }
    return search
  }

  /**
   * Provisions one of the numbers a search offers, trying the next if one is
   * taken after the search.
   */
  async provisionANumber(
    options: {
      clientRefId?: string
      ownershipProof?: () => Promise<string | undefined>
    } = {},
  ): Promise<ProvisionedNumber> {
    const search = await this.searchAvailableNumbers()
    if (!search) {
      throw new Error(`No numbers offered in ${countryCode}-${areaCode}`)
    }
    const ownershipProofToken = await (
      options.ownershipProof ?? (() => this.newOwnershipProof())
    )()
    // Shuffled so concurrent runs are unlikely to contend for the same number.
    const candidates = [...search.results].sort(() => Math.random() - 0.5)
    for (const available of candidates) {
      try {
        const number = await this.telephonyClient.provisionPhoneNumber({
          searchId: search.id,
          phoneNumber: available.phoneNumber,
          clientRefId: options.clientRefId,
          ownershipProofToken,
        })
        this.trackForRelease(number.id)
        return { searchId: search.id, ownershipProofToken, number }
      } catch (err) {
        if (!(err instanceof PhoneNumberUnavailableError)) {
          throw err
        }
        this.log.info(`${available.phoneNumber} was taken, trying the next`)
      }
    }
    throw new Error(
      `Every number offered in ${countryCode}-${areaCode} was taken`,
    )
  }

  trackForRelease(id: string): void {
    this.provisionedIds.add(id)
  }

  /**
   * Polls a phone number until `isSettled` accepts its state.
   */
  async awaitState(
    id: string,
    isSettled: (state: PhoneNumberState) => boolean,
  ): Promise<PhoneNumber> {
    const deadline = Date.now() + STATE_TIMEOUT_MS
    for (;;) {
      const phoneNumber = await this.telephonyClient.getPhoneNumber(id)
      if (!phoneNumber) {
        throw new Error(`Phone number ${id} does not exist`)
      }
      if (isSettled(phoneNumber.state)) {
        return phoneNumber
      }
      if (Date.now() >= deadline) {
        throw new Error(`${id} stayed in state ${phoneNumber.state}`)
      }
      await delay(STATE_POLL_INTERVAL_MS)
    }
  }

  /**
   * Releases every tracked number and deletes every created Sudo. Errors are
   * logged rather than thrown.
   */
  async cleanUp(): Promise<void> {
    for (const id of this.provisionedIds) {
      await this.releaseQuietly(id)
    }
    this.provisionedIds.clear()
    for (const sudo of this.createdSudos) {
      await this.profilesClient
        .deleteSudo(sudo)
        .catch((err) =>
          this.log.error(`failed to delete Sudo ${sudo.id}`, { err }),
        )
    }
    this.createdSudos.length = 0
  }

  private async releaseQuietly(id: string): Promise<void> {
    try {
      // Only an active or suspended number can be released.
      const phoneNumber = await this.awaitState(
        id,
        (state) => state !== PhoneNumberState.Provisioning,
      )
      if (phoneNumber.state === PhoneNumberState.Released) {
        return
      }
      if (phoneNumber.state === PhoneNumberState.Failed) {
        this.log.error(`cannot release ${id}, it failed to provision`)
        return
      }
      await this.telephonyClient.deprovisionPhoneNumber(id)
    } catch (err) {
      this.log.error(`failed to release ${id}`, { err })
    }
  }
}
