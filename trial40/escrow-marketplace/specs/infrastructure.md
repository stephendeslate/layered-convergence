# Infrastructure Specification

## Overview

The Escrow Marketplace uses a Turborepo 2 monorepo with pnpm workspaces,
Docker for containerization, and GitHub Actions for CI/CD.

## Monorepo Structure

```
escrow-marketplace/
  apps/api/          — NestJS REST API
  apps/web/          — Next.js frontend
  packages/shared/   — TypeScript shared package
  specs/             — Specification documents
```

## VERIFY Tags

- VERIFY: EM-ARCH-001 — Shared package in Turborepo monorepo
- VERIFY: EM-ARCH-002 — Multi-tenant data isolation via tenantId on all entities
- VERIFY: EM-ARCH-003 — NestJS module architecture with global PrismaModule
- VERIFY: EM-ARCH-004 — Data flow from frontend Server Actions through API to database
- VERIFY: EM-ARCH-005 — Shared package types and utilities

## Turborepo Configuration

- turbo.json defines build, dev, lint, test, test:ci, typecheck tasks
- Build depends on ^build (topological)
- Dev is persistent and uncached
- turbo in root devDependencies (not just scripts)

## pnpm Workspaces

- pnpm-workspace.yaml: apps/*, packages/*
- workspace:* protocol for internal dependencies
- packageManager field in root package.json

## Docker

### Dockerfile (3-stage)
1. **deps** — Install dependencies with pnpm
2. **builder** — Build all packages with turbo
3. **runner** — Production with USER node

- Base: node:20-alpine
- LABEL maintainer metadata
- HEALTHCHECK: wget to /health (matches HealthController endpoint)
- COPY turbo.json in deps stage

### docker-compose.yml
- PostgreSQL 16 with healthcheck
- Named volume for persistence

### docker-compose.test.yml
- PostgreSQL 16 with tmpfs for fast tests

## CI/CD (.github/workflows/ci.yml)

Pipeline steps:
1. Install dependencies (pnpm install --frozen-lockfile)
2. Audit (pnpm audit --audit-level=high)
3. Generate Prisma client
4. Lint (pnpm turbo run lint)
5. Typecheck (pnpm turbo run typecheck)
6. Test (pnpm turbo run test:ci)
7. Build (pnpm turbo run build)
8. Migration check

PostgreSQL 16 service container for integration tests.

## Environment Variables

See .env.example for required variables:
- DATABASE_URL (with connection_limit)
- JWT_SECRET
- CORS_ORIGIN
- PORT
- APP_VERSION

## Health Check Alignment

Dockerfile HEALTHCHECK path (/health) matches the HealthController
endpoint defined in the monitoring module. See [monitoring.md](./monitoring.md).
