# Fly&Travel – Master Build Specification

Full-stack travel planner app. User builds a connected multi-destination trip across European capital cities. Follow all docs strictly.

## Core Principle

Never allow inconsistent trip state. Validation must protect data integrity. State must always mirror selected destinations. Keep architecture clean and predictable. Prefer clarity over cleverness.

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
