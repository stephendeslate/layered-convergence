# System Architecture — Field Service Dispatch

## Overview
Field Service Dispatch uses a layered NestJS backend with Prisma ORM and a
Next.js frontend. This document describes the architecture, key patterns,
and infrastructure. See PRODUCT_VISION.md for business context and
DATA_MODEL.md for entity definitions.

## Backend Architecture
The NestJS backend follows a modular architecture with three domain modules:

- **AuthModule** — user registration, login, JWT token issuance
- **WorkOrderModule** — work order CRUD, state machine transitions
- **ScheduleModule** — technician schedule management

<!-- VERIFY:FSD-VALIDATION-PIPE — ValidationPipe whitelist + forbidNonWhitelisted -->
All incoming requests are validated through NestJS ValidationPipe with
whitelist and forbidNonWhitelisted options enabled in main.ts bootstrap.

<!-- VERIFY:FSD-EXECUTE-RAW — $executeRaw with Prisma.sql -->
Raw SQL operations use $executeRaw with Prisma.sql tagged templates.
The work order service uses raw queries for priority escalation and
status count aggregation. No $executeRawUnsafe is used anywhere.

<!-- VERIFY:FSD-PRISMA-MAP — @@map on all models -->
All Prisma models use @@map for snake_case table names. Multi-word
column names use @map for snake_case. Enums use @@map for snake_case
type names. See DATA_MODEL.md for complete mapping.

<!-- VERIFY:FSD-AUTH-FLOW — AuthService with bcrypt and JWT -->
Authentication uses bcrypt with salt rounds 12 for password hashing.
JWT tokens contain sub (user ID), email, and role claims. JwtModule
is registered globally with secret from process.env.JWT_SECRET.

## Frontend Architecture
<!-- VERIFY:FSD-SERVER-ACTIONS — Server Actions with response.ok check -->
The Next.js frontend uses App Router with Server Actions for form handling.
All server actions check response.ok before processing the response body.
See UI_SPECIFICATION.md for component details.

## Infrastructure
<!-- VERIFY:FSD-DOCKERFILE — Multi-stage Dockerfile with HEALTHCHECK -->
The Dockerfile uses three stages (deps, build, production) with
node:20-alpine base images. The production stage runs as USER node
with a HEALTHCHECK on the /auth/health endpoint.

<!-- VERIFY:FSD-CI-PIPELINE — CI workflow with migration-check -->
GitHub Actions CI includes four jobs: lint, test, build, and
migration-check. The test job runs against a PostgreSQL 16 service.
The migration-check job verifies schema/migration alignment.

<!-- VERIFY:FSD-RLS — ENABLE + FORCE ROW LEVEL SECURITY -->
All seven tables have Row Level Security enabled and forced in the
initial migration. Both ENABLE ROW LEVEL SECURITY and FORCE ROW LEVEL
SECURITY are applied. See SECURITY_MODEL.md for policy details.

<!-- VERIFY:FSD-ENV-FAILFAST — JWT_SECRET and CORS_ORIGIN fail-fast -->
The bootstrap function validates JWT_SECRET and CORS_ORIGIN environment
variables at startup, throwing an error if either is missing. No
hardcoded fallback values are used for secrets.
