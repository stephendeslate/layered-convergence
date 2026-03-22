# Infrastructure Specification

## Overview

The Analytics Engine uses Docker for containerization, GitHub Actions for
CI/CD, and PostgreSQL as the primary database. All infrastructure
configuration follows security best practices.

## Docker

The Dockerfile uses a three-stage build process: deps (install dependencies),
build (compile TypeScript), and production (minimal runtime image). The
production stage runs as the non-root "node" user and includes a healthcheck.

[VERIFY: AE-INFRA-01] The main.ts file listens on the PORT environment
variable with a default of 3001.

## Docker Compose

The docker-compose.yml defines postgres and api services. PostgreSQL uses
the 16-alpine image with a named volume for data persistence and a
healthcheck for readiness detection.

[VERIFY: AE-INFRA-02] The API service depends on postgres with
condition: service_healthy.

## CI/CD Pipeline

The GitHub Actions workflow runs on pushes to main/develop and pull requests
to main. It executes five verification steps in sequence.

[VERIFY: AE-INFRA-03] CI runs all five steps: lint, test, build, typecheck,
and migration-check using pnpm turbo run.

## Environment Configuration

Environment variables are documented in .env.example at the repository root.
Required variables cause a fail-fast error in main.ts if missing. Optional
variables have sensible defaults for local development.

Variables:
- DATABASE_URL — PostgreSQL connection string (required)
- JWT_SECRET — Secret for signing JWT tokens (required)
- CORS_ORIGIN — Allowed origin for CORS (default: http://localhost:3000)
- PORT — HTTP server port (default: 3001)
- NODE_ENV — Runtime environment (development/production)

[VERIFY: AE-INFRA-04] The .env.example file documents all required
environment variables: DATABASE_URL, JWT_SECRET, CORS_ORIGIN, PORT, NODE_ENV.

## Database Migrations

Prisma manages database migrations in apps/api/prisma/migrations/. The
initial migration creates all tables, enums, indexes, foreign keys, and
enables Row-Level Security. CI verifies that the migration state matches
the schema.prisma datamodel.

[VERIFY: AE-INFRA-05] CI runs prisma migrate diff to verify migrations are
in sync with the schema.
