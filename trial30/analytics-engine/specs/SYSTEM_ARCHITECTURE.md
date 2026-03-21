# System Architecture — Analytics Engine

## Overview
The Analytics Engine follows a layered architecture with NestJS backend,
Next.js frontend, and PostgreSQL database. See PRODUCT_VISION.md for business
context and DATA_MODEL.md for entity definitions.

## Backend Architecture
The backend uses NestJS with modular organization. Each domain (auth, pipeline,
dashboard) is encapsulated in its own module with service, controller, and DTOs.

<!-- VERIFY:AE-SERVER-ACTIONS — Server Actions with response.ok check -->
The frontend communicates with the backend via Server Actions that check
response.ok before processing data, ensuring proper error propagation.

<!-- VERIFY:AE-VALIDATION-PIPE — ValidationPipe whitelist + forbidNonWhitelisted -->
All incoming requests are validated using ValidationPipe with whitelist and
forbidNonWhitelisted options to strip unknown properties and reject extras.

<!-- VERIFY:AE-EXECUTE-RAW — $executeRaw with Prisma.sql -->
The PipelineService uses $executeRaw with Prisma.sql tagged template literals
for tenant-scoped raw queries. No $executeRawUnsafe is used anywhere.

<!-- VERIFY:AE-PRISMA-MAP — @@map on all models -->
All Prisma models use @@map for snake_case table names, maintaining PostgreSQL
naming conventions while using camelCase in TypeScript code.

## Authentication Flow
<!-- VERIFY:AE-AUTH-FLOW — AuthService with bcrypt and JWT -->
Users authenticate via email/password. Passwords are hashed with bcrypt salt 12.
JWTs are issued with 24-hour expiration. See SECURITY_MODEL.md for details.

## Infrastructure
<!-- VERIFY:AE-DOCKERFILE — Multi-stage Dockerfile with HEALTHCHECK -->
The Dockerfile uses three stages: deps (install + prisma generate), build
(compile TypeScript), and production (minimal runtime). Includes HEALTHCHECK
for container orchestration and runs as non-root USER node.

<!-- VERIFY:AE-CI-PIPELINE — CI workflow with migration-check -->
GitHub Actions CI includes four jobs: lint, test (with PostgreSQL service),
build, and migration-check (verifying schema/migration alignment with pnpm).

<!-- VERIFY:AE-RLS — ENABLE + FORCE ROW LEVEL SECURITY -->
The initial migration enables and forces RLS on all tables. This ensures
tenant isolation even if application-level checks are bypassed.

<!-- VERIFY:AE-ENV-FAILFAST — JWT_SECRET and CORS_ORIGIN fail-fast -->
The bootstrap function validates JWT_SECRET and CORS_ORIGIN at startup,
throwing errors immediately if either is missing. No fallback values.

## Module Structure
```
src/
├── main.ts           — Bootstrap with fail-fast validation
├── app.module.ts     — Root module with JwtModule (no secret fallback)
├── prisma.service.ts — Prisma client lifecycle management
├── auth/             — Authentication (register, login, health)
├── pipeline/         — ETL pipeline management with state machine
└── dashboard/        — Dashboard and widget CRUD
```

## Data Flow
1. Frontend Server Action sends HTTP request to NestJS endpoint
2. ValidationPipe validates and transforms the request body
3. Service layer executes business logic with Prisma queries
4. Response flows back through the controller to the frontend
5. Server Action checks response.ok and returns typed result

## Deployment
Docker Compose orchestrates PostgreSQL 16 and the backend service.
PostgreSQL uses a named volume for data persistence. The test compose
file uses tmpfs for ephemeral test databases. See TESTING_STRATEGY.md
for the complete testing infrastructure setup.

## Error Handling
All services throw typed NestJS exceptions (BadRequestException,
UnauthorizedException, NotFoundException) for consistent error responses.
The frontend error.tsx boundary catches and displays errors with focus
management for accessibility (see UI_SPECIFICATION.md).
