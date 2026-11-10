# Coding Standards

This document defines the coding conventions and style requirements for Sudo Platform TypeScript/JavaScript SDKs. All contributions must follow these standards. The project enforces many of these rules automatically via ESLint and Prettier.

## Language & Compiler

- TypeScript with **strict mode** enabled.
- Target and module: `ES2022`.
- No `allowJs` — all source must be TypeScript.
- Module resolution: `node`.
- `esModuleInterop` and `allowSyntheticDefaultImports` are enabled.
- `importHelpers` is enabled — use `tslib` for emit helpers to reduce bundle size.
- `skipLibCheck` is enabled for build performance.

## Formatting (Prettier)

Prettier handles all formatting automatically. Configuration:

- No semicolons (`semi: false`)
- Single quotes (`singleQuote: true`)
- 2-space indentation (`tabWidth: 2`, `useTabs: false`)
- Trailing commas everywhere (`trailingComma: "all"`)

Run `yarn lint:prettier` to check or rely on editor integration.

## Linting (ESLint)

The project uses `@typescript-eslint` with Prettier integration.

### Key Rules

- `@typescript-eslint/no-floating-promises: error` — all promises must be awaited, returned, or explicitly voided.
- `quotes: ['error', 'single', { avoidEscape: true }]` — enforced in source files.
- Copyright header is **required** on all source and test files (enforced by `eslint-plugin-headers`).

### Imports

- Use named imports; avoid `import *`.
- Group imports logically: external packages first, then internal modules (relative paths).
- Prefer deep imports from specific modules over barrel re-exports in internal code.

### Import Ordering

Imports must be ordered by group and alphabetized:
1. Built-in modules
2. External packages
3. Internal modules
4. Parent/sibling/index

No blank lines between import groups. Members within a multi-import are sorted alphabetically.

```typescript
// Correct
import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { SudoUserClient } from '@sudoplatform/sudo-user'
import { SomeDataService } from '../../../data/feature/someDataService'
```

### Tree-Shaking

The `tree-shaking/no-side-effects-in-initialization` rule is enforced for source files. Avoid top-level side effects. The package declares `"sideEffects": false`.

### Relaxed Rules

- `@typescript-eslint/explicit-function-return-type`: off — inferred return types are acceptable.
- `@typescript-eslint/no-explicit-any`: off in source, but prefer typed alternatives when practical.
- `@typescript-eslint/no-explicit-any`: off in test files.
- `@typescript-eslint/no-non-null-assertion`: off in test files only.

## File Headers

Every source file must include the copyright header:

```typescript
/*
 * Copyright © <year> Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
```

The year is validated as a 4-digit number and defaults to the current year for new files.

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Files (source) | camelCase | `featureModule.ts` |
| Files (test) | camelCase + `.test.ts` suffix | `someUseCase.test.ts` |
| Classes | PascalCase | `DefaultFeatureModule` |
| Interfaces | PascalCase (no `I` prefix) | `FeatureService` |
| Type aliases | PascalCase | `SomeEntity` |
| Enums | PascalCase, members UPPER_CASE | `StateEntity.COMMITTED` |
| Functions/methods | camelCase | `doSomething` |
| Constants (module-level) | UPPER_SNAKE_CASE | `DEFAULT_TIMEOUT_MS` |
| Private fields | camelCase (no underscore prefix) | `private readonly log: Logger` |
| Input interfaces | PascalCase + `Input` suffix | `DoSomethingInput` |
| Entity interfaces | PascalCase + `Entity` suffix | `ItemEntity` |
| Transformers | PascalCase + `Transformer` suffix | `ItemTransformer` |
| Use-cases | PascalCase + `UseCase` suffix | `DoSomethingUseCase` |
| Modules | PascalCase + `Module` suffix | `FeatureModule` |
| Default implementations | `Default` prefix + interface name | `DefaultFeatureModule` |

## Code Style

### Classes

- Use `readonly` for constructor parameters that should not be reassigned.
- Prefer `private readonly` for injected dependencies.
- Mark class fields with appropriate access modifiers (`public`, `private`).

### Async / Promises

- Always `await` promises or explicitly handle them. No floating promises.
- Use `async/await` over raw `.then()` chains.
- Use `Promise.all` or `Promise.allSettled` for concurrent independent operations.

### Error Handling

- Throw domain-specific error classes, not generic `Error`.
- Use `Error.captureStackTrace` in custom error constructors for clean stack traces.
- Set `this.name = this.constructor.name` in the base error class.
- Document thrown errors in JSDoc `@throws` tags on interface methods.

### Null Handling

- Prefer `undefined` over `null` for optional values in domain entities and internal code.
- Use `null` only where external APIs (GraphQL) require it.
- Use optional chaining (`?.`) and nullish coalescing (`??`) where appropriate.

## Documentation

### Public API
All public types, interfaces, classes, and methods in `src/public/` must have JSDoc comments including:
- A description
- `@interface` or `@enum` tags where appropriate
- `@property` tags for interface members with type and description
- `@param` and `@returns` tags for methods

```typescript
/**
 * Properties required to perform an action.
 *
 * @interface DoSomethingInput
 * @property {string} id Identifier of the resource.
 * @property {SomeObject} value The value to set.
 */
export interface DoSomethingInput {
  id: string
  value: SomeObject
}
```

### Domain Entities
Domain entity interfaces in `src/private/domain/entities/` should also include JSDoc with `@interface` and `@property` tags.

### Internal Code
Internal use-cases and data services benefit from brief class-level JSDoc but method-level documentation is optional for private implementation details.

## TypeScript Patterns

### Prefer Interfaces Over Types
Use `interface` for object shapes that might be extended. Use `type` for unions, intersections, or computed types.

### Discriminated Unions
Use discriminated unions with a `type` property for polymorphic domain entities:

```typescript
export type FooBarEntity = FooEntity | BarEntity

export interface FooEntity {
  type: 'Foo'
  fooId: string
  name: string
}

export interface BarEntity {
  type: 'Bar'
}
```

### Logging
Use `@sudoplatform/sudo-common` `DefaultLogger` with the class name as namespace:

```typescript
private readonly log: Logger
// in constructor:
this.log = new DefaultLogger(this.constructor.name)
```

### Error Classes
Custom errors extend a base SDK error class and set their name:

```typescript
export class SdkBaseError extends Error {
  constructor(msg?: string) {
    super(msg)
    this.name = this.constructor.name
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export class ResourceNotFoundError extends SdkBaseError {
  constructor(msg?: string) {
    super(msg)
  }
}
```

`Error.captureStackTrace` is only called in the base error class.

### Runtime Type Validation
Use `io-ts` codecs for validating external configuration at runtime:

```typescript
const ServiceConfigCodec = t.type({
  region: t.string,
  serviceEndpointUrl: t.string,
})
export type ServiceConfig = t.TypeOf<typeof ServiceConfigCodec>
```

## Module Exports

- `src/index.ts` re-exports only `src/public/`.
- `src/public/index.ts` barrel-exports errors, modules, the client, and typings.
- Each `typings/` file exports its own types; `typings/index.ts` re-exports them all.
- Internal code (`src/private/`) is never exported from the package.

## Generated Code

- Never manually edit files in `src/gen/`.
- Run `yarn codegen` after GraphQL schema changes.
- Generated files include a `// DO NOT EDIT!` header and ESLint disable comment.

## Build & Verification

Before submitting code:

```bash
yarn verify        # Audit dependencies + ESLint + Prettier check
yarn unit-test     # Unit tests
yarn build         # Full build (codegen → lint → transpile → docs)
```

`yarn verify` runs `audit-with-suppressions` (dependency vulnerability audit) followed by `yarn lint`. Use it as a quick pre-push sanity check to catch both security issues in dependencies and code style violations in a single command.

The CI pipeline runs `yarn build` (which includes lint and unit-test) on every merge request.

## Package Publishing

- The `files` field restricts published content to `cjs/`, `lib/`, `types/`, and `docs/`.
- Entry points are defined via `exports` map supporting `import`, `require`, and `types`.
- `sideEffects: false` enables tree-shaking for consumers.
- Use pinned or caret versions for dependencies. Use `resolutions` to lock transitive dependency versions when needed for security.
