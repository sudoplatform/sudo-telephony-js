/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ListOutput, SudoCryptoProvider } from '@sudoplatform/sudo-common'
import { SudoUserClient } from '@sudoplatform/sudo-user'
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
  ConfigurationData,
  ListPhoneMessagesResult,
  PhoneMessage,
  PhoneMessageBatchResult,
  PhoneMessageSubscriber,
  PhoneNumber,
  PhoneNumberSearch,
  PhoneNumberSubscriber,
} from './typings'

/**
 * Audience to request a Sudo ownership proof for when provisioning a phone number.
 * The service rejects a proof issued for any other audience.
 */
export const OWNERSHIP_PROOF_AUDIENCE = 'sudoplatform.telephony.phone-number'

/**
 * Client used to interface with the Sudo Platform telephony service.
 *
 * It is recommended to code to this interface, rather than the implementation class
 * ({@link DefaultSudoTelephonyClient}), as the implementation class is only meant to be used for initializing an
 * instance of the client.
 */
export interface SudoTelephonyClient {
  /**
   * Get the ISO 3166-1 alpha-2 country codes in which the telephony service can search for and provision
   * phone numbers.
   *
   * A code returned here is the value to pass as the country code of
   * {@link SudoTelephonyClient.searchAvailablePhoneNumbers}.
   *
   * @returns {string[]} A list of supported country codes, for example `US`, `CA`, `GB`.
   */
  getSupportedCountries(): Promise<string[]>

  /**
   * Get the configuration data for the telephony service.
   *
   * Check {@link ConfigurationData.sudoOwnershipProofRequired} before provisioning to find out whether a
   * number must belong to a Sudo, and use the limits to size searches, pages and message batches rather than
   * hard-coding them.
   *
   * @returns {ConfigurationData} The configuration data for the telephony service.
   */
  getConfigurationData(): Promise<ConfigurationData>

  /**
   * Search for phone numbers available to provision in an area code.
   *
   * The service keeps the returned search for a short time so that provisioning can check the requested number
   * came from it. The carrier does not reserve the numbers, so one can be taken by someone else before it is
   * provisioned.
   *
   * @param {SearchAvailablePhoneNumbersInput} input Parameters used to search for available phone numbers.
   * @returns {PhoneNumberSearch} The search holding the available phone numbers.
   */
  searchAvailablePhoneNumbers(
    input: SearchAvailablePhoneNumbersInput,
  ): Promise<PhoneNumberSearch>

  /**
   * Provision one of the phone numbers from a previous search.
   *
   * The SDK generates the key pair that seals the number's messages, registers the public key with the service,
   * and keeps the private key in the device key store. Losing that private key makes the number's messages
   * unreadable, so back it up with {@link SudoTelephonyClient.exportKeys}.
   *
   * The returned number is in {@link PhoneNumberState.Provisioning}; the order completes asynchronously with the
   * telephony provider. Use {@link SudoTelephonyClient.subscribeToPhoneNumbers} to learn when it becomes
   * {@link PhoneNumberState.Active} or {@link PhoneNumberState.Failed}.
   *
   * To make the number belong to a Sudo, pass a Sudo ownership proof issued for {@link OWNERSHIP_PROOF_AUDIENCE}.
   * Check {@link SudoTelephonyClient.getConfigurationData} to find out whether the deployment requires one.
   *
   * @param {ProvisionPhoneNumberInput} input Parameters used to provision a phone number.
   * @returns {PhoneNumber} The phone number being provisioned.
   */
  provisionPhoneNumber(input: ProvisionPhoneNumberInput): Promise<PhoneNumber>

  /**
   * Deprovision one of the caller's phone numbers.
   *
   * The unit of the caller's phone number allowance is returned at once and the number is handed back to the
   * telephony provider in the background. Deprovisioning a number that is already released returns it unchanged,
   * so the call is safe to repeat.
   *
   * Only a {@link PhoneNumberState.Active} or {@link PhoneNumberState.Suspended} number can be deprovisioned.
   *
   * @param {string} id The identifier of the phone number to deprovision.
   * @returns {PhoneNumber} The deprovisioned phone number, in {@link PhoneNumberState.Released}.
   */
  deprovisionPhoneNumber(id: string): Promise<PhoneNumber>

  /**
   * Get a phone number identified by id, in any state including {@link PhoneNumberState.Released} and
   * {@link PhoneNumberState.Failed}.
   *
   * Use this to follow a number through provisioning: it is reported as {@link PhoneNumberState.Provisioning}
   * until the order completes with the telephony provider.
   *
   * @param {string} id The identifier of the phone number to be retrieved.
   * @returns {PhoneNumber | undefined} The phone number identified by id or undefined if the phone number cannot
   *  be found.
   */
  getPhoneNumber(id: string): Promise<PhoneNumber | undefined>

  /**
   * Get a list of the caller's phone numbers, oldest first.
   *
   * Lists numbers that are being provisioned, active or suspended. Released and failed numbers are not included;
   * fetch those by id with {@link SudoTelephonyClient.getPhoneNumber}.
   *
   * @param {ListPhoneNumbersInput} input Parameters used to retrieve a list of provisioned phone numbers.
   * @returns {ListOutput<PhoneNumber>} A list of phone numbers and the token for the next page.
   */
  listPhoneNumbers(
    input?: ListPhoneNumbersInput,
  ): Promise<ListOutput<PhoneNumber>>

  /**
   * Get a list of the caller's phone numbers owned by the specified Sudo, oldest first.
   *
   * Lists the same states as {@link SudoTelephonyClient.listPhoneNumbers}. A Sudo that has no numbers, or that
   * belongs to another user, reads as an empty page.
   *
   * @param {ListPhoneNumbersForSudoIdInput} input Parameters used to retrieve a list of phone numbers for a sudoId.
   * @returns {ListOutput<PhoneNumber>} A list of phone numbers and the token for the next page.
   */
  listPhoneNumbersForSudoId(
    input: ListPhoneNumbersForSudoIdInput,
  ): Promise<ListOutput<PhoneNumber>>

  /**
   * Get a phone message identified by id, with its sealed fields made readable.
   *
   * The other party's number and the message text are sealed with the key registered for the message's phone
   * number, so reading a message requires the device that provisioned that number, or one that imported its keys
   * with {@link SudoTelephonyClient.importKeys}.
   *
   * @param {string} id The identifier of the phone message to be retrieved.
   * @returns {PhoneMessage | undefined} The phone message identified by id or undefined if the phone message
   *  cannot be found.
   */
  getPhoneMessage(id: string): Promise<PhoneMessage | undefined>

  /**
   * Get the list of phone messages for the specified phone number across all its conversations, with their
   * sealed fields made readable. Defaults to newest first.
   *
   * The service filters the inbox by owner rather than rejecting an unknown phone number, so a number that does
   * not exist, or belongs to someone else, reads as an empty page.
   *
   * A message that cannot be unsealed does not fail the page. The result is then a partial result that returns
   * the message in `failed` without its sealed fields, alongside an {@link UnsealingFailedError} explaining why.
   *
   * @param {ListPhoneMessagesForPhoneNumberIdInput} input Parameters used to retrieve a list of phone messages for
   *  a phoneNumberId.
   * @returns {ListPhoneMessagesResult} List operation result.
   */
  listPhoneMessagesForPhoneNumberId(
    input: ListPhoneMessagesForPhoneNumberIdInput,
  ): Promise<ListPhoneMessagesResult>

  /**
   * Get the list of phone messages for the specified conversation, with their sealed fields made readable.
   * Defaults to newest first.
   *
   * A conversation groups every message between one phone number and one other party; its id is
   * {@link PhoneMessage.conversationId}. The service filters by owner rather than rejecting an unknown
   * conversation, so a conversation that does not exist, or belongs to someone else, reads as an empty page.
   *
   * A message that cannot be unsealed does not fail the page. The result is then a partial result that returns
   * the message in `failed` without its sealed fields, alongside an {@link UnsealingFailedError} explaining why.
   *
   * @param {ListPhoneMessagesForConversationIdInput} input Parameters used to retrieve a list of phone messages for
   *  a conversationId.
   * @returns {ListPhoneMessagesResult} List operation result.
   */
  listPhoneMessagesForConversationId(
    input: ListPhoneMessagesForConversationIdInput,
  ): Promise<ListPhoneMessagesResult>

  /**
   * Delete the phone messages identified by the list of ids.
   *
   * Phone messages can only be deleted in batches of 100. Anything greater will throw a LimitExceededError.
   *
   * The batch can partially succeed: a message that was not found, or does not belong to the caller, is reported
   * in {@link PhoneMessageBatchResult.failedIds} rather than failing the whole call, so check the result rather
   * than relying on the absence of an error.
   *
   * @param {DeletePhoneMessagesInput} input Parameters used to delete a batch of phone messages.
   * @returns {PhoneMessageBatchResult} The identifiers of the phone messages that succeeded and failed to delete.
   */
  deletePhoneMessages(
    input: DeletePhoneMessagesInput,
  ): Promise<PhoneMessageBatchResult>

  /**
   * Update the read state of the phone messages identified by the list of ids.
   *
   * Phone messages can only be updated in batches of 100. Anything greater will throw a LimitExceededError. The
   * batch can partially succeed, in the same way as {@link SudoTelephonyClient.deletePhoneMessages}.
   *
   * @param {UpdatePhoneMessagesInput} input Parameters used to update a batch of phone messages.
   * @returns {PhoneMessageBatchResult} The identifiers of the phone messages that succeeded and failed to update.
   */
  updatePhoneMessages(
    input: UpdatePhoneMessagesInput,
  ): Promise<PhoneMessageBatchResult>

  /**
   * Subscribe to phone number events.
   *
   * This is how a caller learns that a number being provisioned became {@link PhoneNumberState.Active} or
   * {@link PhoneNumberState.Failed}, rather than polling {@link SudoTelephonyClient.getPhoneNumber}. The
   * subscriber is told when the connection opens and closes; on {@link ConnectionState.Disconnected} every
   * subscriber is dropped and the caller must subscribe again.
   *
   * @param {string} subscriptionId unique identifier to differentiate subscriptions; note that specifying a
   *  duplicate subscription id will replace the previous subscription.
   * @param {PhoneNumberSubscriber} subscriber implementation of callback to be invoked when a phone number event
   *  occurs.
   * @returns {void}
   */
  subscribeToPhoneNumbers(
    subscriptionId: string,
    subscriber: PhoneNumberSubscriber,
  ): Promise<void>

  /**
   * Unsubscribe from phone number events.
   *
   * @param {string} subscriptionId unique identifier to differentiate subscription
   * @returns {void}
   */
  unsubscribeFromPhoneNumbers(subscriptionId: string): void

  /**
   * Subscribe to phone message events.
   *
   * An event carries no message content; fetch the message with {@link SudoTelephonyClient.getPhoneMessage} to
   * read its text. The subscriber is told when the connection opens and closes; on
   * {@link ConnectionState.Disconnected} every subscriber is dropped and the caller must subscribe again.
   *
   * @param {string} subscriptionId unique identifier to differentiate subscriptions; note that specifying a
   *  duplicate subscription id will replace the previous subscription.
   * @param {PhoneMessageSubscriber} subscriber implementation of callback to be invoked when a phone message event
   *  occurs.
   * @returns {void}
   */
  subscribeToPhoneMessages(
    subscriptionId: string,
    subscriber: PhoneMessageSubscriber,
  ): Promise<void>

  /**
   * Unsubscribe from phone message events.
   *
   * @param {string} subscriptionId unique identifier to differentiate subscription
   * @returns {void}
   */
  unsubscribeFromPhoneMessages(subscriptionId: string): void

  /**
   * Export the cryptographic keys to a key archive.
   *
   * @returns Key archive data, to be imported with {@link SudoTelephonyClient.importKeys}.
   */
  exportKeys(): Promise<ArrayBuffer>

  /**
   * Imports cryptographic keys from a key archive.
   *
   * @param archiveData Key archive data to import the keys from, as returned by
   *  {@link SudoTelephonyClient.exportKeys}.
   */
  importKeys(archiveData: ArrayBuffer): Promise<void>

  /**
   * Removes any cryptographic keys held on this device.
   */
  reset(): Promise<void>
}

/**
 * Options used to construct a {@link DefaultSudoTelephonyClient}.
 */
export type SudoTelephonyClientOptions = {
  /** Sudo User client to use. No default */
  sudoUserClient: SudoUserClient
  /** SudoCryptoProvider to use. Default is to create a WebSudoCryptoProvider */
  sudoCryptoProvider?: SudoCryptoProvider
}
