export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string }
  String: { input: string; output: string }
  Boolean: { input: boolean; output: boolean }
  Int: { input: number; output: number }
  Float: { input: number; output: number }
  AWSDate: { input: unknown; output: unknown }
  AWSDateTime: { input: unknown; output: unknown }
  AWSEmail: { input: unknown; output: unknown }
  AWSIPAddress: { input: unknown; output: unknown }
  AWSJSON: { input: unknown; output: unknown }
  AWSPhone: { input: unknown; output: unknown }
  AWSTime: { input: unknown; output: unknown }
  AWSTimestamp: { input: unknown; output: unknown }
  AWSURL: { input: unknown; output: unknown }
}

/** A phone number that a search found available to provision. */
export type AvailablePhoneNumber = {
  /** ISO 3166-1 alpha-2 country code of the number, for example US. */
  countryCode: Scalars['String']['output']
  /** City or rate centre of the number, if the carrier reports one. */
  locality?: Maybe<Scalars['String']['output']>
  /** The kind of number. */
  numberType: PhoneNumberType
  /** The number in E.164 format, for example +14155550123. */
  phoneNumber: Scalars['String']['output']
  /** State or province code of the number, for example NY or ON. */
  region?: Maybe<Scalars['String']['output']>
}

/** Input for deletePhoneMessages. */
export type DeletePhoneMessagesInput = {
  /** IDs of the messages to delete. At most 100. */
  ids: Array<Scalars['ID']['input']>
}

/** The encoding of a public key. */
export type KeyFormat =
  /** PKCS#1 RSA public key. */
  | 'RSA_PUBLIC_KEY'
  /** X.509 SubjectPublicKeyInfo. */
  | 'SPKI'
  | '%future added value'

/** Input for listPhoneMessagesForConversationId. */
export type ListPhoneMessagesForConversationIdInput = {
  /**
   * ID of the conversation whose messages to list. A conversation belongs to one
   * phone number.
   */
  conversationId: Scalars['ID']['input']
  /**
   * Maximum number of items per page. Defaults to 20. A limit above 100 returns
   * at most 100 items; a limit below 1 is rejected with InvalidArgumentError.
   */
  limit?: InputMaybe<Scalars['Int']['input']>
  /** The nextToken returned by the previous page. Omit for the first page. */
  nextToken?: InputMaybe<Scalars['String']['input']>
  /** Order of the messages. Defaults to DESC, newest first. */
  sortOrder?: InputMaybe<SortOrder>
}

/** Input for listPhoneMessagesForPhoneNumberId. */
export type ListPhoneMessagesForPhoneNumberIdInput = {
  /**
   * Maximum number of items per page. Defaults to 20. A limit above 100 returns
   * at most 100 items; a limit below 1 is rejected with InvalidArgumentError.
   */
  limit?: InputMaybe<Scalars['Int']['input']>
  /** The nextToken returned by the previous page. Omit for the first page. */
  nextToken?: InputMaybe<Scalars['String']['input']>
  /** ID of the phone number whose messages to list. */
  phoneNumberId: Scalars['ID']['input']
  /** Order of the messages. Defaults to DESC, newest first. */
  sortOrder?: InputMaybe<SortOrder>
}

/** Input for listPhoneNumbersForSudoId. */
export type ListPhoneNumbersForSudoIdInput = {
  /**
   * Maximum number of items per page. Defaults to 20. A limit above 100 returns
   * at most 100 items; a limit below 1 is rejected with InvalidArgumentError.
   */
  limit?: InputMaybe<Scalars['Int']['input']>
  /** The nextToken returned by the previous page. Omit for the first page. */
  nextToken?: InputMaybe<Scalars['String']['input']>
  /** The Sudo whose phone numbers to list. A Sudo of another user lists nothing. */
  sudoId: Scalars['ID']['input']
}

/** Input for listPhoneNumbers. */
export type ListPhoneNumbersInput = {
  /**
   * Maximum number of items per page. Defaults to 20. A limit above 100 returns
   * at most 100 items; a limit below 1 is rejected with InvalidArgumentError.
   */
  limit?: InputMaybe<Scalars['Int']['input']>
  /** The nextToken returned by the previous page. Omit for the first page. */
  nextToken?: InputMaybe<Scalars['String']['input']>
}

export type Mutation = {
  /** Delete up to 100 of the caller's phone messages. */
  deletePhoneMessages: PhoneMessageBatchResult
  /**
   * Release one of the caller's ACTIVE or SUSPENDED numbers. Returns the number in
   * RELEASED and returns the unit of the caller's phone number allowance at once;
   * the number is returned to the carrier in the background. Releasing a RELEASED
   * number returns it unchanged.
   *
   * Errors: PhoneNumberNotFound when no number with the id belongs to the caller,
   * InvalidPhoneNumberState (with the current state in errorInfo) for a
   * PROVISIONING or FAILED number.
   */
  deprovisionPhoneNumber: PhoneNumber
  /**
   * Provision a number from one of the caller's searches. Returns the number in
   * PROVISIONING; onPhoneNumberUpdate reports when it becomes ACTIVE or FAILED.
   *
   * Errors: PhoneNumberSearchExpired, PhoneNumberNotInSearch,
   * PhoneNumberUnavailable, IdentityContextMissing, InvalidTokenError,
   * InvalidArgumentError, InsufficientEntitlementsError.
   */
  provisionPhoneNumber: PhoneNumber
  /**
   * Internal. Called by the service's stream processors to notify
   * onPhoneMessageEvent subscribers. IAM only.
   */
  publishPhoneMessageEvent?: Maybe<PhoneMessageEvent>
  /**
   * Internal. Called by the service's stream processors to notify
   * onPhoneNumberUpdate subscribers. IAM only.
   */
  publishPhoneNumberUpdate?: Maybe<PhoneNumber>
  /** Set the read state of up to 100 of the caller's phone messages. */
  updatePhoneMessages: PhoneMessageBatchResult
}

export type MutationDeletePhoneMessagesArgs = {
  input: DeletePhoneMessagesInput
}

export type MutationDeprovisionPhoneNumberArgs = {
  id: Scalars['ID']['input']
}

export type MutationProvisionPhoneNumberArgs = {
  input: ProvisionPhoneNumberInput
}

export type MutationPublishPhoneMessageEventArgs = {
  input: PhoneMessageEventInput
}

export type MutationPublishPhoneNumberUpdateArgs = {
  input: PhoneNumberUpdateInput
}

export type MutationUpdatePhoneMessagesArgs = {
  input: UpdatePhoneMessagesInput
}

/** The owner of a resource, taken from an ownership proof. */
export type Owner = {
  /** ID of the owner, for example a Sudo ID. */
  id: Scalars['String']['output']
  /** Issuer of the ownership proof, for example sudoplatform.sudoservice. */
  issuer: Scalars['String']['output']
}

export type OwnerInput = {
  id: Scalars['String']['input']
  issuer: Scalars['String']['input']
}

/** The outcome of a batch operation on phone messages. */
export type PhoneMessageBatchResult = {
  /** IDs of the messages that weren't found or don't belong to the caller. */
  failedIds: Array<Scalars['ID']['output']>
  /** IDs of the messages the operation applied to. */
  succeededIds: Array<Scalars['ID']['output']>
}

/** The change that a phone message event reports. */
export type PhoneMessageChangeType =
  /** A message was deleted. */
  | 'DELETED'
  /** A new message arrived. */
  | 'RECEIVED'
  /** A message changed, for example its seen state. */
  | 'UPDATED'
  | '%future added value'

/** A page of phone messages. */
export type PhoneMessageConnection = {
  /** The phone messages on this page. */
  items: Array<SealedPhoneMessage>
  /** Pass to the next request to get the next page. Null on the last page. */
  nextToken?: Maybe<Scalars['String']['output']>
}

/** The direction of a phone message. OUTBOUND comes with replies. */
export type PhoneMessageDirection =
  /** Received on the user's number from the other party. */
  'INBOUND' | '%future added value'

/**
 * Subscription payload for a phone message change. It leaves out the body and
 * the other party's number so that message content never passes through publish
 * mutations. Fetch the message with getPhoneMessage.
 */
export type PhoneMessageEvent = {
  /** The change being reported. */
  changeType: PhoneMessageChangeType
  /** ID of the conversation the message belongs to. */
  conversationId: Scalars['ID']['output']
  /** Whether the message was received or sent. */
  direction: PhoneMessageDirection
  /** ID of the message. */
  id: Scalars['ID']['output']
  /** ID of the user who owns the message. */
  owner: Scalars['ID']['output']
  /** Owners taken from the ownership proofs, which tie the phone number to a Sudo. */
  owners: Array<Owner>
  /** ID of the phone number that sent or received the message. */
  phoneNumberId: Scalars['ID']['output']
  /** Whether the user has marked the message as read. */
  seen: Scalars['Boolean']['output']
  /** The kind of message. */
  type: PhoneMessageType
  /** Time in milliseconds since 1970-01-01T00:00:00Z when the message was last updated. */
  updatedAtEpochMs: Scalars['Float']['output']
  /** Version of the message after the change. */
  version: Scalars['Int']['output']
}

/** Input for publishPhoneMessageEvent. Mirrors PhoneMessageEvent. */
export type PhoneMessageEventInput = {
  /** The change being reported. */
  changeType: PhoneMessageChangeType
  /** ID of the conversation the message belongs to. */
  conversationId: Scalars['ID']['input']
  /** Whether the message was received or sent. */
  direction: PhoneMessageDirection
  /** ID of the message. */
  id: Scalars['ID']['input']
  /** ID of the user who owns the message. */
  owner: Scalars['ID']['input']
  /** Owners taken from the ownership proofs, which tie the phone number to a Sudo. */
  owners: Array<OwnerInput>
  /** ID of the phone number that sent or received the message. */
  phoneNumberId: Scalars['ID']['input']
  /** Whether the user has marked the message as read. */
  seen: Scalars['Boolean']['input']
  /** The kind of message. */
  type: PhoneMessageType
  /** Time in milliseconds since 1970-01-01T00:00:00Z when the message was last updated. */
  updatedAtEpochMs: Scalars['Float']['input']
  /** Version of the message after the change. */
  version: Scalars['Int']['input']
}

/** The kind of phone message. MMS and VOICEMAIL come later. */
export type PhoneMessageType =
  /** A text message. */
  'SMS' | '%future added value'

/** A phone number provisioned for a user. */
export type PhoneNumber = {
  /** Area code of the number. Null where the country has no area codes. */
  areaCode?: Maybe<Scalars['String']['output']>
  /** Client-supplied reference passed when provisioning, returned unchanged. */
  clientRefId?: Maybe<Scalars['String']['output']>
  /** ISO 3166-1 alpha-2 country code of the number, for example US. */
  countryCode: Scalars['String']['output']
  /** Time in milliseconds since 1970-01-01T00:00:00Z when the object was created. */
  createdAtEpochMs: Scalars['Float']['output']
  /** Why provisioning failed. Set only when state is FAILED. */
  failureReason?: Maybe<PhoneNumberFailureReason>
  /**
   * Time in milliseconds since 1970-01-01T00:00:00Z when the number will be
   * released. Set only when state is SUSPENDED.
   */
  gracePeriodEndsAtEpochMs?: Maybe<Scalars['Float']['output']>
  /** ID of the phone number. */
  id: Scalars['ID']['output']
  /** Identity ID of the user who owns the phone number. */
  identityId: Scalars['ID']['output']
  /** IDs of the keys in the key ring. */
  keyIds: Array<Scalars['String']['output']>
  /** ID of the key ring whose keys seal the phone number's messages. */
  keyRingId: Scalars['ID']['output']
  /** The kind of number. */
  numberType: PhoneNumberType
  /** ID of the user who owns the phone number. */
  owner: Scalars['ID']['output']
  /** Owners taken from the ownership proofs, which tie the phone number to a Sudo. */
  owners: Array<Owner>
  /** The number in E.164 format, for example +14155550123. */
  phoneNumber: Scalars['String']['output']
  /** Lifecycle state of the number. */
  state: PhoneNumberState
  /** Time in milliseconds since 1970-01-01T00:00:00Z when the object was last updated. */
  updatedAtEpochMs: Scalars['Float']['output']
  /** Version of this object, incremented on each update. */
  version: Scalars['Int']['output']
}

/** A page of phone numbers. */
export type PhoneNumberConnection = {
  /** The phone numbers on this page. */
  items: Array<PhoneNumber>
  /** Pass to the next request to get the next page. Null on the last page. */
  nextToken?: Maybe<Scalars['String']['output']>
}

/** The reason provisioning a phone number failed. */
export type PhoneNumberFailureReason =
  /** The telephony provider or carrier rejected the order. */
  | 'CARRIER_ERROR'
  /**
   * The number is no longer available, for example because someone else took it
   * after the search.
   */
  | 'NUMBER_UNAVAILABLE'
  /** The Sudo or user that owned the number was deleted before its order was placed. */
  | 'OWNER_DELETED'
  | '%future added value'

/**
 * The result of a phone number search. The search is kept for 15 minutes so that
 * provisioning can check the requested number came from it.
 */
export type PhoneNumberSearch = {
  /** Area code that was searched. Null for a country-wide search. */
  areaCode?: Maybe<Scalars['String']['output']>
  /** ISO 3166-1 alpha-2 country code that was searched. */
  countryCode: Scalars['String']['output']
  /** Time in milliseconds since 1970-01-01T00:00:00Z when the object was created. */
  createdAtEpochMs: Scalars['Float']['output']
  /**
   * Time in milliseconds since 1970-01-01T00:00:00Z after which provisioning
   * from this search is refused. The carrier doesn't reserve the numbers, so one
   * can be taken by someone else sooner.
   */
  expiresAtEpochMs: Scalars['Float']['output']
  /** ID of the search. Pass it as searchId when provisioning. */
  id: Scalars['ID']['output']
  /** ID of the user who made the search. */
  owner: Scalars['ID']['output']
  /** The available numbers, without duplicates and at most the requested limit. */
  results: Array<AvailablePhoneNumber>
  /** Time in milliseconds since 1970-01-01T00:00:00Z when the object was last updated. */
  updatedAtEpochMs: Scalars['Float']['output']
  /** Version of this object, incremented on each update. */
  version: Scalars['Int']['output']
}

/**
 * The lifecycle state of a phone number.
 *
 * PROVISIONING -> ACTIVE <-> SUSPENDED -> RELEASED, or PROVISIONING -> FAILED.
 */
export type PhoneNumberState =
  /** The number is active and can send and receive messages. */
  | 'ACTIVE'
  /** Provisioning failed. failureReason says why. */
  | 'FAILED'
  /** The order for the number is in progress with the telephony provider. */
  | 'PROVISIONING'
  /** The number has been returned to the telephony provider. */
  | 'RELEASED'
  /**
   * The user's entitlements no longer cover the number. The number keeps
   * receiving messages until the grace period ends, then it is released.
   */
  | 'SUSPENDED'
  | '%future added value'

/** The type of phone number. */
export type PhoneNumberType =
  /** A geographic number tied to an area code. */
  'LOCAL' | '%future added value'

/** Input for publishPhoneNumberUpdate. Mirrors PhoneNumber. */
export type PhoneNumberUpdateInput = {
  /** Area code of the number. Null where the country has no area codes. */
  areaCode?: InputMaybe<Scalars['String']['input']>
  /** Client-supplied reference passed when provisioning. */
  clientRefId?: InputMaybe<Scalars['String']['input']>
  /** ISO 3166-1 alpha-2 country code of the number. */
  countryCode: Scalars['String']['input']
  /** Time in milliseconds since 1970-01-01T00:00:00Z when the phone number was created. */
  createdAtEpochMs: Scalars['Float']['input']
  /** Why provisioning failed. Set only when state is FAILED. */
  failureReason?: InputMaybe<PhoneNumberFailureReason>
  /** When the number will be released. Set only when state is SUSPENDED. */
  gracePeriodEndsAtEpochMs?: InputMaybe<Scalars['Float']['input']>
  /** ID of the phone number. */
  id: Scalars['ID']['input']
  /** Identity ID of the user who owns the phone number. */
  identityId: Scalars['ID']['input']
  /** IDs of the keys in the key ring. */
  keyIds: Array<Scalars['String']['input']>
  /** ID of the key ring whose keys seal the phone number's messages. */
  keyRingId: Scalars['ID']['input']
  /** The kind of number. */
  numberType: PhoneNumberType
  /** ID of the user who owns the phone number. */
  owner: Scalars['ID']['input']
  /** Owners taken from the ownership proofs. */
  owners: Array<OwnerInput>
  /** The number in E.164 format. */
  phoneNumber: Scalars['String']['input']
  /** Lifecycle state of the number. */
  state: PhoneNumberState
  /** Time in milliseconds since 1970-01-01T00:00:00Z when the phone number was last updated. */
  updatedAtEpochMs: Scalars['Float']['input']
  /** Version of the phone number. */
  version: Scalars['Int']['input']
}

/** Input for provisionPhoneNumber. */
export type ProvisionPhoneNumberInput = {
  /**
   * Client-supplied reference, returned unchanged on the phone number. Repeating
   * a request with the same clientRefId returns the number the first request
   * provisioned, without provisioning another.
   */
  clientRefId?: InputMaybe<Scalars['String']['input']>
  /**
   * The public key to seal the number's messages with. The service registers it
   * in a new key ring, whose ID is returned as keyRingId.
   */
  key: ProvisionPhoneNumberPublicKeyInput
  /**
   * Proofs that the caller owns the Sudo the number will belong to. Required only
   * in deployments that require Sudo ownership (RD_REQUIRE_SUDO_OWNERSHIP_PROOF).
   * When given, they must include exactly one proof issued by the Sudo service.
   */
  ownershipProofTokens?: InputMaybe<Array<Scalars['String']['input']>>
  /** The number to provision, in E.164 format. Must be one of the search's results. */
  phoneNumber: Scalars['String']['input']
  /** ID of one of the caller's searches that hasn't expired. */
  searchId: Scalars['ID']['input']
}

/** The public key that seals the messages of a provisioned phone number. */
export type ProvisionPhoneNumberPublicKeyInput = {
  /** Algorithm of the key, for example RSAEncryptionOAEPAESCBC. */
  algorithm: Scalars['String']['input']
  /** Encoding of publicKey. Defaults to RSA_PUBLIC_KEY. */
  keyFormat?: InputMaybe<KeyFormat>
  /** Client-generated ID of the key. */
  keyId: Scalars['String']['input']
  /** The base64-encoded public key. */
  publicKey: Scalars['String']['input']
}

export type Query = {
  /** Get one of the caller's phone messages. Null if not found. */
  getPhoneMessage?: Maybe<SealedPhoneMessage>
  /**
   * Get one of the caller's phone numbers in any state, including RELEASED and
   * FAILED. Null when no number with the id belongs to the caller.
   */
  getPhoneNumber?: Maybe<PhoneNumber>
  /**
   * Return the set of countries the telephony service supports, as ISO 3166-1
   * alpha-2 country codes (e.g. "US", "CA", "GB").
   *
   * The list is sourced behind a replaceable mechanism; today it is served from a
   * bundled static snapshot, but the API contract is a simple array of codes so
   * the backing source can change without affecting consumers.
   */
  getSupportedCountriesForTelephony: Array<Scalars['String']['output']>
  /** Returns configuration related to the telephony service configuration. */
  getTelephonyConfig: TelephonyConfigurationData
  /**
   * List the caller's messages of one conversation, newest first by default. A
   * nextToken that the service cannot decode, or that was issued by another list
   * or for another conversation, is rejected with InvalidArgumentError.
   */
  listPhoneMessagesForConversationId: PhoneMessageConnection
  /**
   * List the caller's messages of one phone number, newest first by default. A
   * nextToken that the service cannot decode, or that was issued by another list
   * or for another phone number, is rejected with InvalidArgumentError.
   */
  listPhoneMessagesForPhoneNumberId: PhoneMessageConnection
  /**
   * List the caller's PROVISIONING, ACTIVE, and SUSPENDED phone numbers, oldest
   * first. A nextToken that the service cannot decode, or that was issued to
   * another user, is rejected with InvalidArgumentError.
   */
  listPhoneNumbers: PhoneNumberConnection
  /**
   * List the caller's PROVISIONING, ACTIVE, and SUSPENDED phone numbers that the
   * Sudo owns, oldest first. An empty sudoId, or a nextToken that the service
   * cannot decode or that was issued to another user, Sudo, or list, is rejected
   * with InvalidArgumentError.
   */
  listPhoneNumbersForSudoId: PhoneNumberConnection
  /**
   * Search for phone numbers available to provision in an area code. The search
   * is kept for 15 minutes; pass its id to provisionPhoneNumber.
   *
   * Errors: UnsupportedCountry, InvalidAreaCode, InvalidArgumentError,
   * LimitExceededError, InsufficientEntitlementsError.
   */
  searchAvailablePhoneNumbers: PhoneNumberSearch
}

export type QueryGetPhoneMessageArgs = {
  id: Scalars['ID']['input']
}

export type QueryGetPhoneNumberArgs = {
  id: Scalars['ID']['input']
}

export type QueryListPhoneMessagesForConversationIdArgs = {
  input: ListPhoneMessagesForConversationIdInput
}

export type QueryListPhoneMessagesForPhoneNumberIdArgs = {
  input: ListPhoneMessagesForPhoneNumberIdInput
}

export type QueryListPhoneNumbersArgs = {
  input?: InputMaybe<ListPhoneNumbersInput>
}

export type QueryListPhoneNumbersForSudoIdArgs = {
  input: ListPhoneNumbersForSudoIdInput
}

export type QuerySearchAvailablePhoneNumbersArgs = {
  input: SearchAvailablePhoneNumbersInput
}

/**
 * A phone message whose sensitive fields are sealed. Fields marked SEALED are
 * encrypted with a key of the phone number's key ring. All other fields are in
 * plaintext.
 */
export type SealedPhoneMessage = {
  /** SEALED: The message text. Empty for a media-only MMS. */
  body: Scalars['String']['output']
  /**
   * ID of the conversation, which groups every message between the phone number
   * and the other party.
   */
  conversationId: Scalars['ID']['output']
  /** Time in milliseconds since 1970-01-01T00:00:00Z when the object was created. */
  createdAtEpochMs: Scalars['Float']['output']
  /** Whether the message was received or sent. */
  direction: PhoneMessageDirection
  /** ID of the message. */
  id: Scalars['ID']['output']
  /** The user's number in E.164 format. */
  localPhoneNumber: Scalars['String']['output']
  /** True for an inbound MMS whose media was dropped and only its text kept. */
  mediaOmitted: Scalars['Boolean']['output']
  /** ID of the user who owns the message. */
  owner: Scalars['ID']['output']
  /** Owners taken from the ownership proofs, which tie the message to a Sudo. */
  owners: Array<Owner>
  /** ID of the phone number that sent or received the message. */
  phoneNumberId: Scalars['ID']['output']
  /**
   * Time in milliseconds since 1970-01-01T00:00:00Z when the service received the
   * message from the telephony provider. createdAtEpochMs can be later if
   * processing is delayed.
   */
  receivedAtEpochMs: Scalars['Float']['output']
  /**
   * SEALED: The other party's number: the sender of an inbound message, the
   * recipient of an outbound one. E.164 or a short code. Nullable for future
   * voicemails from withheld numbers. Always set for SMS.
   */
  remotePhoneNumber?: Maybe<Scalars['String']['output']>
  /** Whether the user has marked the message as read. */
  seen: Scalars['Boolean']['output']
  /**
   * The number of SMS segments the message was carried in, as reported by the
   * telephony provider.
   */
  segmentCount: Scalars['Int']['output']
  /** The kind of message. */
  type: PhoneMessageType
  /** Time in milliseconds since 1970-01-01T00:00:00Z when the object was last updated. */
  updatedAtEpochMs: Scalars['Float']['output']
  /** Version of this object, incremented on each update. */
  version: Scalars['Int']['output']
}

/** Input for searchAvailablePhoneNumbers. */
export type SearchAvailablePhoneNumbersInput = {
  /**
   * Three-digit area code to search. Currently required: a request without one
   * is rejected with InvalidArgumentError, and an unknown area code with
   * InvalidAreaCode.
   */
  areaCode?: InputMaybe<Scalars['String']['input']>
  /** ISO 3166-1 alpha-2 country code to search. One of getSupportedCountriesForTelephony. */
  countryCode: Scalars['String']['input']
  /**
   * Maximum number of results. Defaults to 10. A limit above 20 is rejected with
   * LimitExceededError.
   */
  limit?: InputMaybe<Scalars['Int']['input']>
}

/** The order in which a list is returned. */
export type SortOrder =
  /** Oldest first. */
  | 'ASC'
  /** Newest first. */
  | 'DESC'
  | '%future added value'

/**
 * Real-time updates. Each subscription resolver must reject the request unless
 * owner is the caller's sub.
 */
export type Subscription = {
  /** Notifies the caller when one of their phone messages is received, updated, or deleted. */
  onPhoneMessageEvent?: Maybe<PhoneMessageEvent>
  /** Notifies the caller when one of their phone numbers changes. */
  onPhoneNumberUpdate?: Maybe<PhoneNumber>
}

/**
 * Real-time updates. Each subscription resolver must reject the request unless
 * owner is the caller's sub.
 */
export type SubscriptionOnPhoneMessageEventArgs = {
  owner: Scalars['ID']['input']
}

/**
 * Real-time updates. Each subscription resolver must reject the request unless
 * owner is the caller's sub.
 */
export type SubscriptionOnPhoneNumberUpdateArgs = {
  owner: Scalars['ID']['input']
}

/**
 * How the deployment is configured, so that clients can follow its rules
 * without hard-coding them.
 */
export type TelephonyConfigurationData = {
  /** The most message ids one deletePhoneMessages request may name. */
  deletePhoneMessagesLimit: Scalars['Int']['output']
  /** The page size of the list queries when the request sets no limit. */
  listDefaultLimit: Scalars['Int']['output']
  /**
   * The largest page the list queries return. A larger limit returns this many
   * items at most.
   */
  listMaxLimit: Scalars['Int']['output']
  /**
   * The number of results searchAvailablePhoneNumbers returns when the request
   * sets no limit.
   */
  phoneNumberSearchDefaultLimit: Scalars['Int']['output']
  /**
   * How long, in milliseconds, a phone number search can be passed to
   * provisionPhoneNumber after it is created.
   */
  phoneNumberSearchLifetimeMs: Scalars['Int']['output']
  /**
   * The largest limit searchAvailablePhoneNumbers accepts. A larger limit is
   * rejected with LimitExceededError.
   */
  phoneNumberSearchMaxLimit: Scalars['Int']['output']
  /**
   * Whether provisionPhoneNumber requires a Sudo ownership proof. When false, a
   * number provisioned without a proof belongs to the user only.
   */
  sudoOwnershipProofRequired: Scalars['Boolean']['output']
  /** The most message ids one updatePhoneMessages request may name. */
  updatePhoneMessagesLimit: Scalars['Int']['output']
}

/** Input for updatePhoneMessages. */
export type UpdatePhoneMessagesInput = {
  /** IDs of the messages to update. At most 100. */
  ids: Array<Scalars['ID']['input']>
  /** The read state to set. */
  seen: Scalars['Boolean']['input']
}
