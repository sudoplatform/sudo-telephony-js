# Architecture

This document describes the architectural design of Sudo Platform TypeScript/JavaScript SDKs. All code contributions must respect these layered boundaries and conventions.

## Overview

The SDK provides a TypeScript client that exposes a clean public API while encapsulating protocol-specific implementation details behind well-defined boundaries. External infrastructure (protocol SDKs, GraphQL APIs, cloud storage) is abstracted away from consumers.

## Layered Architecture

The codebase follows a **Clean Architecture** pattern with three distinct layers. Dependencies flow inward only: Public → Domain → Data is allowed; Data → Public is not.

```
src/
├── index.ts                  # Package entry point — re-exports public API only
├── gen/                      # Auto-generated code (GraphQL types) — never edit manually
├── public/                   # Public API layer (consumer-facing)
│   ├── <sdk>Client.ts        # Top-level client interface + Default implementation
│   ├── typings/              # Public type definitions exposed to consumers
│   └── errors.ts             # Public error hierarchy
└── private/                  # Internal implementation (not exported)
    ├── domain/               # Domain layer (business logic core)
    │   ├── entities/         # Domain interfaces, entity types, enums, service contracts
    │   └── use-cases/        # Application business logic
    ├── data/                 # Data layer (infrastructure/implementation)
    │   ├── common/           # Shared infrastructure (protocol clients, API clients, config)
    │   └── <feature>/        # Feature-specific data implementations
    │       └── transformer/  # Mappers between external types and domain entities   
    └── util/                 # Shared utilities
```

## Layer Responsibilities

### Public Layer (`src/public/`)

- Defines the **consumer-facing API** via TypeScript interfaces and classes.
- The top-level client is the single entry point. Feature-specific methods live directly on the client or are organized into logical groupings within the client file.
- The client interface defines the public contract; `Default<Sdk>Client` is the concrete implementation that instantiates use-cases and transforms domain entities to public types.
- **Input/Output interfaces** for each operation are defined with full JSDoc documentation alongside the client.
- Transforms between public API types and domain entities using API transformers.
- Orchestrates service instantiation and dependency wiring in the client constructor.
- `typings/` contains all public-facing type definitions: interfaces, identifier classes, and enums.
- `errors.ts` defines the error hierarchy rooted at a base SDK error class.

### Domain Layer (`src/private/domain/`)

- **Entities** (`entities/`) define the core business data contracts as TypeScript interfaces and enums. They have no runtime dependencies on external libraries.
- **Service interfaces** define contracts that the data layer must implement.
- **Use-cases** (`use-cases/`) contain application business logic. Each use-case is a single class with an `execute()` method. Use-cases delegate to data-layer services.
- The domain layer has no knowledge of GraphQL, HTTP, or external APIs.
- Use cases receive services via constructor injection and delegate to them.

### Data Layer (`src/private/data/`)

- Implements domain service interfaces using infrastructure (protocol SDKs, GraphQL APIs, cloud storage, etc.).
- An API client handles GraphQL communication with the Sudo Platform backend using generated typed documents.
- **Transformers** (in `transformer/` subdirectories) convert between domain entities and external representations (protocol events, GraphQL types, public API types).
- Organized by feature, each with its own `transformer/` subdirectory.

## Key Architectural Patterns

### Client Composition

The public client is the single entry point for all SDK operations. Feature-specific logic is encapsulated in use-cases that the client delegates to. Each use-case is independently testable:
- The client interface defines the public contract
- The default implementation wires up use-cases and transformers
- Use-cases are instantiated per-call (not singletons)

### Dependency Injection

- Constructor-based injection throughout. No DI container — wiring happens in the public client constructor.
- Services receive their dependencies (API client, key workers, other services) as constructor parameters.

### Use Case Pattern

- Use cases are instantiated where needed (typically in the public client methods).
- They accept a typed input object and return a typed result.
- Logging is injected via a `Logger` interface.

### Transformer Pattern

Data flows between layers via transformer classes with bidirectional methods:
- `fromEntityToAPI(entity)` — domain entity to public type
- `fromAPIToEntity(data)` — public type to domain entity
- `fromGraphQLToEntity(data)` — GraphQL response to domain entity

### Error Hierarchy

- All SDK-specific errors extends Error`, sets `this.name` to the constructor name, and captures the stack trace. 
- Domain-specific errors provide semantic meaning to consumers. 
- Data layer errors from infrastructure are caught and mapped to domain errors.
- Errors are exported from the public layer and documented in interface JSDoc.

## Generated Code (`src/gen/`)

- `graphqlTypes.ts` — Auto-generated from GraphQL schema via `graphql-codegen`. Never edit manually.

Run `yarn codegen` to regenerate GraphQL types after schema changes.

## Build Outputs

The SDK ships multiple build artifacts:
- `lib/` — ESM (ES2022 modules)
- `cjs/` — CommonJS
- `types/` — TypeScript declarations

The `exports` field in `package.json` maps these for consumers.

## Dependency Direction Rules

1. `src/public/` may import from `src/private/` (to wire up implementations).
2. `src/private/domain/entities/` must NOT import from `src/private/data/` or `src/public/`.
3. `src/private/domain/use-cases/` may import from `entities/` and `data/` (to get service implementations).
4. `src/private/data/` implements domain service interfaces and may import from `entities/`.
5. Nothing outside `src/gen/` should import generated types directly except the API client and transformers.

## Adding a New Feature

1. Define public types in `src/public/typings/`.
2. Define domain entities in `src/private/domain/entities/<feature>/`.
3. Define a service interface in the entities directory.
4. Implement the service in `src/private/data/<feature>/`.
5. Create use-case(s) in `src/private/domain/use-cases/<feature>/`.
6. Add the public method(s) to the client interface and its default implementation.
7. Add transformers as needed for data conversion between layers.

## Telephony Specifics

### Reference implementations
- **Feature scope and API shape:** `sudo-telephony-android` 6.0.0. Public method names, inputs, outputs and error cases follow that SDK, adapted to JS conventions. For example, errors are flat classes instead of per-feature sealed classes.
- **GraphQL contract:** Android's `graphql/schema/telephony.graphql` and its `documents/`. They match the deployed `telephony-service`.
- **Key handling:** `sudo-virtual-cards-js` (`deviceKeyWorker.ts`).
- **Partial list results and Sudo ownership proofs:** `sudo-email-js`.

### Configuration
- The service config namespace is `telephonyService` (`apiUrl`, `region`) in `sudoplatformconfig.json`.
- The API client is obtained with `getClient({ configNamespace: 'telephonyService' })`.

### Keys and sealed data
- Message `body` and `remotePhoneNumber` arrive sealed and are unsealed on the device.
- The only supported algorithm is `RSAEncryptionOAEPAESGCM`: an RSA-OAEP (SHA-1) wrapped AES-256 key, a 12-byte IV, then AES-GCM ciphertext with a 16-byte tag. Do not add CBC support.
- Each provisioned phone number gets a new key pair. Its public key is sent in `provisionPhoneNumber`, so there is no separate key registration call.
- Keys are stored through a `WebSudoCryptoProvider('SudoTelephonyClient', 'com.sudoplatform.appservicename')` unless the caller passes a `sudoCryptoProvider`. The service assigns the key ring ID, so the client does not build one.
- GraphQL messages do not say which key sealed them. Resolve the key from the phone number's `keyIds` by picking the first one with a private key on the device.
- Key export and import use sudo-common's `DefaultSudoKeyArchive` and leave out public keys. Import reads the archive first, then replaces the whole key store, so an unreadable archive leaves the existing keys in place.
- A message that fails to unseal does not fail a list call. List methods return sudo-common's `ListOperationResult`, with the message in `failed` as a `PartialPhoneMessage` and an `UnsealingFailedError` cause.
- `reset` removes every key on the device. It does not close subscriptions; callers unsubscribe themselves.

### Sudo ownership
- Callers obtain an ownership proof from `SudoProfilesClient.getOwnershipProof(sudoId, 'sudoplatform.telephony.phone-number')` and pass it in `ProvisionPhoneNumberInput.ownershipProofToken`.
- The SDK does not depend on `sudo-profiles` at runtime. It is a dev dependency, used by integration tests.


### Entitlements
- `sudoplatform.telephony.serviceUserEntitled`
- `sudoplatform.telephony.phoneNumberMaxPerUser`
- `sudoplatform.telephony.phoneNumberMaxPerSudo`
