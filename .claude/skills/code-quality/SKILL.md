---
name: code-quality
description: "Use when reviewing code quality, refactoring, or asked about coding standards. Provides TypeScript rules, complexity thresholds, error handling patterns, and naming conventions for this project."
---

# Code Quality Standards

## TypeScript

- No `any` — use `unknown` and narrow with type guards
- Prefer `interface` for object shapes, `type` for unions
- Use `as const` for literal types
- Exhaustive switch with `never` for discriminated unions
- No non-null assertions (`!`) — handle null explicitly

## Functions

- Max 30 lines (extract if longer)
- Max 3 params (use options object for more)
- Single responsibility
- Pure where possible

## Error Handling

- Typed errors: `class NotFoundError extends AppError`
- Never swallow silently (no empty catch blocks)
- Log at boundary, throw through layers
- Use `Result<T, E>` for expected failures

## Naming

- Boolean: `isActive`, `hasPermission`, `canEdit` (verb prefix)
- Handlers: `handleClick`, `onSubmit` (action prefix)
- Utils: `formatDate`, `parseConfig` (verb describing transformation)
- Constants: `MAX_RETRIES`, `DEFAULT_TIMEOUT` (UPPER_SNAKE)
