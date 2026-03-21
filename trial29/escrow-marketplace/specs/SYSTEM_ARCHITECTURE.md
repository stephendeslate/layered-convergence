# System Architecture — Escrow Marketplace

## Overview
The Escrow Marketplace follows a layered architecture with NestJS backend,
Next.js frontend, and PostgreSQL database. See DATA_MODEL.md for schema design
and SECURITY_MODEL.md for security controls.

## Backend Architecture
<!-- VERIFY:EM-VALIDATION-PIPE — ValidationPipe whitelist + forbidNonWhitelisted -->
NestJS applies a global ValidationPipe with whitelist and forbidNonWhitelisted
options to reject unknown properties.

<!-- VERIFY:EM-EXECUTE-RAW — $executeRaw with Prisma.sql -->
Raw SQL uses Prisma.sql tagged templates via $executeRaw and $queryRaw. The
$executeRawUnsafe method is never used.

<!-- VERIFY:EM-PRISMA-MAP — @@map on all models -->
All Prisma models use @@map for snake_case table names and @map for column names.

## Authentication Flow
<!-- VERIFY:EM-AUTH-FLOW — AuthService with bcrypt and JWT -->
Users authenticate via email/password. Passwords are hashed with bcrypt (salt 12).
JWT tokens are issued on login and registration.

## Server-Side Rendering
<!-- VERIFY:EM-SERVER-ACTIONS — Server Actions with response.ok check -->
Frontend uses Next.js Server Actions with response.ok validation before
processing API responses.

## Infrastructure
<!-- VERIFY:EM-DOCKERFILE — Multi-stage Dockerfile with HEALTHCHECK -->
Dockerfile uses multi-stage build (deps -> build -> production) with
node:20-alpine, USER node, and HEALTHCHECK.

<!-- VERIFY:EM-CI-PIPELINE — CI workflow with migration-check -->
GitHub Actions CI runs lint, test, build, and migration-check jobs using pnpm.

## Database Layer
<!-- VERIFY:EM-RLS — ENABLE + FORCE ROW LEVEL SECURITY -->
PostgreSQL Row Level Security is configured with both ENABLE and FORCE on all
tables in the migration SQL.

## Environment Configuration
<!-- VERIFY:EM-ENV-FAILFAST — JWT_SECRET and CORS_ORIGIN fail-fast -->
JWT_SECRET and CORS_ORIGIN are validated at application startup. Missing values
cause an immediate error with no fallback defaults.

## Testing Strategy
See TESTING_STRATEGY.md for unit test patterns, integration test setup, and
accessibility testing approach. See UI_SPECIFICATION.md for component requirements.
