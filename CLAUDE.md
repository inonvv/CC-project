# Fly&Travel – Master Build Specification

Full-stack travel planner app. User builds a connected multi-destination trip across European capital cities. Follow all docs strictly.

## Core Principle

Never allow inconsistent trip state. Validation must protect data integrity. State must always mirror selected destinations. Keep architecture clean and predictable. Prefer clarity over cleverness.

## Development Approach — TDD

Follow test-driven development. Write tests **before** developing features or fixing bugs.

1. **Before coding a feature or fix:** write the relevant tests first (Playwright E2E for user flows, Vitest for unit/component logic, Pytest for backend endpoints).
2. **Confirm the tests fail** (red) for the expected reason.
3. **Implement** the feature or fix.
4. **Confirm all tests pass** (green).
5. **Refactor** if needed while keeping tests green.

### Test commands
| Layer | Command |
|-------|---------|
| Frontend unit (Vitest) | `npm test --prefix "frontend"` |
| Frontend E2E (Playwright) | `npm run test:e2e --prefix "frontend"` |
| Backend (Pytest) | `docker-compose exec backend pytest` |

### Playwright E2E structure (`frontend/e2e/`)
- `helpers.ts` — shared navigation utilities (skipOnboarding, addCity, chooseSuggestion, fillScheduleManually, etc.)
- `happy-path.spec.ts` — full wizard flow (suggestion route + manual route)
- `suggestions.spec.ts` — suggestions step (loading, Budget/Premium pre-fill, Customize Manually)
- `validation.spec.ts` — validation guards per step
- `remove-destination.spec.ts` — destination removal behavior
- `edge-cases.spec.ts` — back-nav state, Start Over, direct URL, localStorage, single destination
- `navigation.spec.ts` — Next/Back button traversal and visibility

## Docs Index

| Doc | Description |
|-----|-------------|
| [docs/tech-stack.md](docs/tech-stack.md) | Frontend, backend, testing, and containerization stack |
| [docs/project-goal.md](docs/project-goal.md) | App goal and user flow (10 steps) |
| [docs/design-system.md](docs/design-system.md) | Colors, cards, hover, transitions, and DO NOTs |
| [docs/project-structure.md](docs/project-structure.md) | Folder layout for frontend and backend |
| [docs/global-state.md](docs/global-state.md) | Trip store shape and state consistency rules |
| [docs/frontend-pages.md](docs/frontend-pages.md) | All 7 pages with requirements and validation |
| [docs/backend-api.md](docs/backend-api.md) | FastAPI endpoints and flight generation rules |
| [docs/database-schema.md](docs/database-schema.md) | DB tables: capitals, hotels, attractions, trips |
| [docs/validation.md](docs/validation.md) | Validation enforcement and step navigation rules |
| [docs/testing.md](docs/testing.md) | Pytest, Vitest, and Playwright test requirements |
| [docs/docker.md](docs/docker.md) | Docker services and Postgres config |
| [docs/build-order.md](docs/build-order.md) | Strict 14-step build order |
