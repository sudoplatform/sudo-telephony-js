# Testing

This document defines the testing conventions, tools, and patterns for Sudo Platform TypeScript/JavaScript SDKs. All new code must include appropriate test coverage.

## Test Runner

- **Vitest** is the test runner, configured in `vitest.config.ts`.
- Globals are enabled — `describe`, `it`, `expect`, `beforeEach`, `afterEach` etc. are available without imports.
- Environment: `node`.
- Mocks are cleared automatically between tests (`clearMocks: true`).
- A setup file (`vitest.setup.ts`) runs before all tests.

## Running Tests

| Command | Scope |
|---------|-------|
| `yarn unit-test` | Unit tests only (`test/unit/`) |
| `yarn integration-test` | Integration tests only (`test/integration/`) |
| `yarn smoketest` | Unit tests + integration smoke tests |

Use `vitest run` (not watch mode) for CI and scripted execution.

## Directory Structure

Tests mirror the source directory structure:

```
test/
├── data-factory/           # Shared test fixtures
│   ├── entity.ts           # Domain entity fixtures 
│   ├── api.ts              # Public API type fixtures 
│   └── graphQL.ts          # GraphQL response fixtures
├── unit/                   # Unit tests
│   ├── private/
│   │   ├── domain/
│   │   │   └── use-cases/  # Use-case tests (mirrors src/private/domain/use-cases/)
│   │   └── data/           # Data layer tests (mirrors src/private/data/)
│   └── public/             # Public module tests (mirrors src/public/)
├── integration/            # Integration tests (real backend)
│   ├── util/               # Integration test utilities (client lifecycle, helpers)
│   ├── <feature>Module.test.ts
│   └── ...
└── tsconfig.json           # Test-specific TypeScript configuration
```

### Placement Rules

- Unit tests for use cases: `test/unit/private/domain/use-cases/<feature>/`.
- Unit tests for data services/transformers: `test/unit/private/data/<feature>/`.
- Unit tests for public client methods: `test/unit/public/`.
- Integration tests: `test/integration/<feature>/`.
- Test file name matches source file: `provisionAccountUseCase.ts` → `provisionAccountUseCase.test.ts`.

## Mocking with ts-mockito

The project uses **ts-mockito** for creating mocks and verifying interactions.

### Core API

```typescript
import { anything, capture, instance, mock, reset, verify, when } from 'ts-mockito'
```

### Standard Pattern

```typescript
describe('MyUseCase Test Suite', () => {
  const mockService = mock<ServiceInterface>()

  let instanceUnderTest: MyUseCase

  beforeEach(() => {
    reset(mockService)
    instanceUnderTest = new MyUseCase(instance(mockService))
  })

  describe('execute', () => {
    it('performs the operation correctly', async () => {
      // Arrange
      when(mockService.create(anything())).thenResolve(expectedEntity)

      // Act
      const result = await instanceUnderTest.execute(input)

      // Assert
      expect(result).toStrictEqual(expectedEntity)
      verify(mockService.create(anything())).once()

      // Verify exact arguments passed
      const [inputArgs] = capture(mockService.create).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>({
        // expected input shape
      })
    })
  })
})
```

### Key Patterns

- `mock<InterfaceType>()` — create a mock from an interface (not a class).
- `instance(mockObj)` — get the instance to pass to constructors.
- `reset(mockObj)` — reset all stubs and recorded interactions in `beforeEach`.
- `when(...).thenResolve(value)` — stub async methods.
- `when(...).thenThrow(error)` — stub methods to throw.
- `verify(...).once()` / `.never()` / `.times(n)` — verify interaction counts.
- `capture(mock.method).first()` — capture arguments passed to a mock method.
- `anything()` — match any argument in stubbing or verification.

## Data Factories

Shared test data is centralized in `test/unit/data-factory/`. Each factory is a class with **static properties** providing pre-built instances:

```typescript
export class EntityDataFactory {
  private static readonly commonProps = {
    id: 'testId',
    owner: 'testOwner',
    version: 1,
    createdAt: new Date(1.0),
    updatedAt: new Date(2.0),
  }

  static readonly myEntity: MyEntity = {
    ...EntityDataFactory.commonProps,
    // entity-specific fields
  }

  static readonly myEntityVariant: MyEntity = {
    ...EntityDataFactory.myEntity,
    // override specific fields for this variant
  }
}
```

### Factory Files

| File | Purpose |
|------|---------|
| `entity.ts` | Domain entity fixtures |
| `graphQL.ts` | GraphQL API response fixtures |
| `api.ts` | Public API type fixtures |
| Others | Feature-specific fixtures (messages, drafts, etc.) |

### Guidelines

- Use spread (`...`) to compose fixtures from common props or base entities.
- Name variants descriptively: `entityWithAlias`, `entityWithMetadata`.
- Keep factory data minimal but valid — just enough to satisfy type requirements.
- Use deterministic values (`'testId'`, `new Date(1.0)`) for predictable assertions.

## Test Structure Conventions

### Describe Blocks

- Top-level `describe`: `'<ClassName> Test Suite'`.
- Nested `describe` for each method being tested: `describe('execute', ...)` or `describe('methodName', ...)`.
- Further nesting for scenario groups if needed.

### Test Naming

- Use descriptive `it` strings that explain the expected behavior:
  - `'creates the resource correctly'`
  - `'throws an error when input is invalid'`
  - `'passes configuration flags to the service'`

### Assertions

- Prefer `expect(result).toStrictEqual(expected)` for deep equality (type-aware).
- Use `expect(inputArgs).toStrictEqual<typeof inputArgs>({...})` to get type checking on expected values.
- Use `expect(...).toThrow(ErrorClass)` or `expect(...).rejects.toThrow(ErrorClass)` for error cases.
- Verify mock interactions with `verify()` to confirm delegation happened correctly.

## Integration Tests

- Integration tests run against real or emulated services.
- They test the full stack through the public client interface.
- Longer timeouts are configured (`testTimeout: 240000`, `hookTimeout: 240000`).
- Integration tests may require environment configuration (`.env` files, service endpoints).

## Coverage

- Provider: `v8`.
- Coverage includes all `src/**/*.ts` files, excluding specs and declarations.
- Reports: `text`, `json-summary`, `html`.
- Output directory: `./build/coverage`.

## Writing Tests for New Features

1. **Identify the layer** — is it a use case, data service, transformer, or public method?
2. **Place the test** in the corresponding mirror path under `test/unit/`.
3. **Create or reuse data factories** for the entities involved.
4. **Mock dependencies** using ts-mockito — mock the interface, not the implementation.
5. **Follow the Arrange-Act-Assert pattern** in each test case.
6. **Test happy paths and error paths** — verify both expected returns and thrown errors.
7. **Verify interactions** — use `verify()` and `capture()` to confirm correct delegation to dependencies.
8. **Keep tests isolated** — each test should set up its own state via `beforeEach` with `reset()`.
9. **Integration tests** - Test end-to-end flows through the real SDK client against a live backend.
