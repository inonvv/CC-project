---
name: testing
description: "Use when writing tests, debugging test failures, creating mocks, or following TDD. Covers Vitest, React Testing Library, integration tests, and fixture patterns for this monorepo."
---

# Testing Patterns

## Commands

- All: `pnpm test`
- Package: `pnpm test --filter=@myproduct/<pkg>`
- Single file: `pnpm test --filter=@myproduct/<pkg> -- <path>`
- Watch: `pnpm test --filter=@myproduct/<pkg> -- --watch`

## Structure

- Colocated: `foo.ts` -> `foo.test.ts`
- Integration: `__tests__/integration/*.integration.test.ts`
- AAA pattern: Arrange -> Act -> Assert

## Mocking (factory pattern)

```typescript
function getMockUserService(overrides?: Partial<UserService>): UserService {
  return {
    findById: vi.fn().mockResolvedValue(createTestUser()),
    create: vi.fn().mockResolvedValue(createTestUser()),
    ...overrides,
  }
}
```

## React Testing

- Use screen queries: `getByRole`, `getByLabelText` (prefer accessible queries)
- Use `userEvent` over `fireEvent`
- Test behavior, not implementation
- Await async operations: `await waitFor(() => expect(...))`

## Rules

- No network calls in unit tests — mock everything
- Deterministic fixtures — no `Math.random()`, no `Date.now()`
- Each test independent — no shared mutable state
- For fixture patterns, see `fixtures-guide.md` in this directory
