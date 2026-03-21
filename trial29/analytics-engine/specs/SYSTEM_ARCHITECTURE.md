# System Architecture — Analytics Engine

## Overview
The system follows a layered architecture with NestJS backend serving REST APIs
and Next.js frontend using Server Actions. See DATA_MODEL.md for entity
definitions and SECURITY_MODEL.md for security controls.

## Backend Architecture

### Server Actions
<!-- VERIFY:AE-SERVER-ACTIONS — Server Actions with response.ok check -->
Frontend Server Actions communicate with the backend API, checking response.ok
before processing responses. Failed requests return error messages to the UI.

### Validation
<!-- VERIFY:AE-VALIDATION-PIPE — ValidationPipe whitelist + forbidNonWhitelisted -->
NestJS ValidationPipe is configured with whitelist and forbidNonWhitelisted
options to reject unexpected fields in request bodies.

### Raw SQL Usage
<!-- VERIFY:AE-EXECUTE-RAW — $executeRaw with Prisma.sql -->
Production services use $executeRaw with Prisma.sql tagged templates for
tenant-scoped operations that benefit from raw SQL performance.

### Model Mapping
<!-- VERIFY:AE-PRISMA-MAP — @@map on all models -->
All Prisma models use @@map for snake_case table names. Multi-word columns
use @map for consistent database naming conventions.

## Authentication Flow
<!-- VERIFY:AE-AUTH-FLOW — AuthService with bcrypt and JWT -->
Registration creates a user with bcrypt-hashed password (salt 12) and returns
a JWT. Login validates credentials and returns a new JWT.

## Infrastructure

### Docker
<!-- VERIFY:AE-DOCKERFILE — Multi-stage Dockerfile with HEALTHCHECK -->
The Dockerfile uses three stages: deps (install), build (compile), production
(runtime). The production stage runs as the node user with HEALTHCHECK.

### CI/CD
<!-- VERIFY:AE-CI-PIPELINE — CI workflow with migration-check -->
GitHub Actions workflow includes lint, test, build, and migration-check jobs.
Tests run against a PostgreSQL 16 service container. Uses pnpm for package management.

### Row Level Security
<!-- VERIFY:AE-RLS — ENABLE + FORCE ROW LEVEL SECURITY -->
All tables have both ENABLE ROW LEVEL SECURITY and FORCE ROW LEVEL SECURITY
applied in the initial migration. This prevents data leakage between tenants.

### Environment Configuration
<!-- VERIFY:AE-ENV-FAILFAST — JWT_SECRET and CORS_ORIGIN fail-fast -->
JWT_SECRET and CORS_ORIGIN are validated at startup. Missing values cause
immediate application failure with descriptive error messages.

## Frontend Architecture
The frontend uses Next.js App Router with server-side rendering. UI testing
strategy is documented in TESTING_STRATEGY.md. Component specifications are
in UI_SPECIFICATION.md.

## Deployment
Docker Compose orchestrates PostgreSQL 16 and the backend service.
A separate docker-compose.test.yml provides an isolated test environment.

## Scalability Considerations
- Horizontal scaling via container orchestration
- Database connection pooling with Prisma
- CDN for static frontend assets
- Query caching for frequently accessed dashboards
