---
name: devops
description: "Use when working on CI/CD pipelines, Docker configuration, deployment scripts, or infrastructure concerns. Covers build pipelines, container patterns, and deployment strategies."
---

# DevOps Patterns

## CI/CD

- Pipeline stages: install -> typecheck -> lint -> test -> build -> deploy
- Use `pnpm install --frozen-lockfile` in CI
- Cache `node_modules` and pnpm store between runs
- Test only affected packages: `pnpm test --filter=...[origin/main]`

## Docker

```dockerfile
# Multi-stage build pattern
FROM node:20-slim AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/*/package.json ./packages/
RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runtime
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
USER node
CMD ["node", "dist/index.js"]
```

## Deployment

- Use environment-specific config: `.env.production`, `.env.staging`
- Health check endpoint: `GET /health` returning `{ status: "ok" }`
- Graceful shutdown: handle SIGTERM, drain connections
- Use rolling deploys, never deploy all instances at once

## Rules

- Never store secrets in Docker images or CI config
- Pin base image versions (e.g., `node:20.11-slim`, not `node:latest`)
- Run containers as non-root user
- Keep images minimal — use `.dockerignore`
