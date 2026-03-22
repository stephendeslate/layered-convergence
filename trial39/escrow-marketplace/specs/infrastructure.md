# Infrastructure Specification

## Overview

The Escrow Marketplace uses Docker for containerization, GitHub Actions for CI/CD,
pnpm workspaces with Turborepo for monorepo management, and PostgreSQL 16 as the database.

## Docker

The Dockerfile uses a 3-stage build process:
1. **deps** — Install dependencies with pnpm (COPYs turbo.json in this stage)
2. **builder** — Build all packages via turbo
3. **runner** — Production image with minimal footprint

Base image: node:20-alpine. Production stage runs as USER node.
HEALTHCHECK targets /auth/health endpoint.
LABEL maintainer metadata is set in the deps stage.

- VERIFY: EM-INFRA-001 — 3-stage Dockerfile with node:20-alpine, USER node, HEALTHCHECK

## Docker Compose

docker-compose.yml defines PostgreSQL 16 with a named volume and healthcheck.
docker-compose.test.yml defines a test PostgreSQL instance using tmpfs for speed.

- VERIFY: EM-INFRA-002 — Docker Compose with PostgreSQL 16, healthcheck, named volume

## Environment Configuration

.env.example documents all required environment variables:
- DATABASE_URL with ?connection_limit=10 for Prisma connection pooling
- DIRECT_URL for Prisma migrations
- JWT_SECRET (no default value)
- CORS_ORIGIN (no default value)
- PORT

- VERIFY: EM-INFRA-003 — Environment configuration with connection_limit in DATABASE_URL

## Database Seeding

prisma/seed.ts creates initial data: tenant, users (admin, seller, buyer),
listings (active and cancelled), transactions (completed, failed, disputed),
escrow account, and dispute record. Error handling uses console.error + process.exit(1).

- VERIFY: EM-INFRA-004 — Database seeding with error states and proper error handling

## CI/CD Pipeline

GitHub Actions CI runs on push to main and pull requests. Pipeline steps:
install, audit (pnpm audit --audit-level=high), generate (Prisma),
lint, typecheck, test, build, and migration check.
PostgreSQL 16 service container provides database for tests.

## Cross-References

- See database.md for Prisma schema and migration details
- See security.md for Helmet and CORS configuration in deployment
