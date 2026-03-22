# Infrastructure Specification

## Overview
Monorepo managed by Turborepo 2 with pnpm workspaces.
Containerized with Docker multi-stage builds. CI/CD via GitHub Actions.

## Monorepo Structure
- apps/api/ — NestJS REST API
- apps/web/ — Next.js frontend
- packages/shared/ — Shared types, constants, utilities
- VERIFY:AE-ARCH-01 — Shared package exports for monorepo consumption
- VERIFY:AE-ARCH-05 — Shared package consumed by both apps via workspace:*

## Turborepo Configuration
Root turbo.json defines build, dev, lint, test, typecheck tasks.
Build depends on ^build for proper dependency ordering.
- VERIFY:AE-ARCH-02 — slugify for URL-safe identifiers
- VERIFY:AE-ARCH-03 — NestJS bootstrap with Pino logger, Helmet, CORS
- VERIFY:AE-ARCH-04 — AppModule with ThrottlerModule and interceptors

## Docker
Multi-stage Dockerfile: deps -> build -> production.
- Base image: node:20-alpine
- COPY turbo.json in deps stage
- USER node for non-root execution
- HEALTHCHECK on /health endpoint
- LABEL maintainer="SJD Labs, LLC"
- VERIFY:AE-INFRA-02 — GET /health and GET /health/ready endpoints

### Docker Compose
- PostgreSQL 16 with healthcheck and named volume (pg_data)
- API service depends on postgres healthy state
- Test compose uses tmpfs for ephemeral test databases

## CI/CD Pipeline
GitHub Actions workflow with PostgreSQL service container:
1. Install dependencies (pnpm)
2. Lint (pnpm turbo run lint)
3. Typecheck (pnpm turbo run typecheck)
4. Migration check (prisma migrate deploy)
5. Test (pnpm turbo run test)
6. Build (pnpm turbo run build)
7. Audit (pnpm audit --audit-level=high)

## Database Migrations
- Prisma migrations in prisma/migrations/
- Initial migration includes ENABLE + FORCE ROW LEVEL SECURITY
- Migration check runs in CI before tests
- VERIFY:AE-INFRA-01 — Seed with error/failure states, BCRYPT_SALT_ROUNDS from shared

## Seed Data
prisma/seed.ts creates:
- Tenant with slug
- Users (admin, editor, viewer) with bcrypt-hashed passwords
- Events of all types including error/failure states
- Dashboards (public and private)
- Data sources with cost values
- Pipelines in various statuses including FAILED

Error handling: main().catch(console.error + process.exit(1))
Cross-reference: security.md for RLS and database security.

## Environment Variables
All required variables documented in .env.example:
- DATABASE_URL with connection_limit
- JWT_SECRET (no default)
- CORS_ORIGIN (no default)
- PORT, NODE_ENV, APP_VERSION
Cross-reference: monitoring.md for APP_VERSION usage in health endpoint.

## Performance
- VERIFY:AE-PERF-06 — ResponseTimeInterceptor using performance.now()
- VERIFY:AE-PERF-07 — Pipelines controller with Cache-Control headers
- VERIFY:AE-PERF-08 — Performance tests for response time and pagination
