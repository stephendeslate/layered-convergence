# System Architecture — Analytics Engine

## Overview
The system follows a layered architecture with NestJS backend serving
a Next.js frontend. PostgreSQL provides persistence with RLS enforcement.

See also: [PRODUCT_VISION.md](PRODUCT_VISION.md), [SECURITY_MODEL.md](SECURITY_MODEL.md)

## Frontend Architecture
<!-- VERIFY:AE-SERVER-ACTIONS -->
The Next.js frontend uses Server Actions with 'use server' directive.
All API calls check response.ok before processing data. Failed responses
return structured error objects to the UI layer.

## Backend Architecture
<!-- VERIFY:AE-VALIDATION-PIPE -->
NestJS uses ValidationPipe globally with whitelist and forbidNonWhitelisted
options enabled. This strips unknown properties and rejects invalid payloads.

<!-- VERIFY:AE-EXECUTE-RAW -->
Production code uses $executeRaw with Prisma.sql tagged templates for
raw SQL operations. This prevents SQL injection while enabling complex queries
that cannot be expressed through the Prisma query builder.

<!-- VERIFY:AE-PRISMA-MAP -->
All Prisma models use @@map for snake_case table names. Multi-word columns
use @map for snake_case column names. All enums use @@map.

## Authentication Flow
<!-- VERIFY:AE-AUTH-FLOW -->
AuthService handles registration and login. Passwords are hashed with bcrypt
(salt rounds: 12). JWT tokens are signed with configurable secret and
returned as access_token in the response body.

## Infrastructure
<!-- VERIFY:AE-DOCKERFILE -->
Multi-stage Dockerfile: deps -> build -> production stages.
Uses node:20-alpine, USER node for security, and HEALTHCHECK for orchestration.
LABEL metadata includes maintainer, version, and description.

<!-- VERIFY:AE-CI-PIPELINE -->
GitHub Actions CI pipeline with five jobs: lint, test, build, typecheck,
and migration-check. The typecheck job runs tsc --noEmit separately.

<!-- VERIFY:AE-RLS -->
PostgreSQL Row Level Security is enabled and forced on all tables via
ALTER TABLE ... ENABLE ROW LEVEL SECURITY and ALTER TABLE ... FORCE ROW LEVEL SECURITY.

## Environment Configuration
<!-- VERIFY:AE-ENV-FAILFAST -->
JWT_SECRET and CORS_ORIGIN are validated at startup. If either is missing,
the application throws an error and refuses to start. No hardcoded fallback
values are used for secrets.

## Deployment
The application is containerized and deployed via Docker Compose with
PostgreSQL 16, named volumes for data persistence, and health checks
for service readiness verification.
