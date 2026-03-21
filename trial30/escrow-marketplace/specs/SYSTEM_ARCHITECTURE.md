# System Architecture — Escrow Marketplace

## Overview
The Escrow Marketplace uses a modular NestJS backend with Prisma ORM,
PostgreSQL 16 for persistence, and a Next.js 15 frontend with shadcn/ui.
See PRODUCT_VISION.md for business context and DATA_MODEL.md for schema.

## Backend Architecture
The backend follows NestJS module architecture with three domain modules:
AuthModule, TransactionModule, and DisputeModule. Each module encapsulates
its own controller, service, and DTOs.

<!-- VERIFY:EM-VALIDATION-PIPE — ValidationPipe whitelist + forbidNonWhitelisted -->
All incoming requests are validated through a global ValidationPipe with
whitelist and forbidNonWhitelisted options enabled in main.ts.

<!-- VERIFY:EM-EXECUTE-RAW — $executeRaw with Prisma.sql -->
Raw SQL operations use $executeRaw with Prisma.sql tagged templates for
parameterized queries. No $executeRawUnsafe is permitted anywhere.

<!-- VERIFY:EM-PRISMA-MAP — @@map on all models -->
All Prisma models use @@map for snake_case table names and @map for
multi-word column names, following PostgreSQL naming conventions.

## Authentication Flow
<!-- VERIFY:EM-AUTH-FLOW — AuthService with bcrypt and JWT -->
AuthService handles registration and login with bcrypt password hashing
(salt rounds: 12) and JWT token generation. See SECURITY_MODEL.md for details.

## Frontend Architecture
<!-- VERIFY:EM-SERVER-ACTIONS — Server Actions with response.ok check -->
The Next.js frontend uses Server Actions for form submissions. All fetch
calls check response.ok before parsing JSON responses.

## Infrastructure
<!-- VERIFY:EM-DOCKERFILE — Multi-stage Dockerfile with HEALTHCHECK -->
The Dockerfile uses a 3-stage build (deps, build, production) with
node:20-alpine base, USER node for security, and a HEALTHCHECK command.

<!-- VERIFY:EM-CI-PIPELINE — CI workflow with migration-check -->
GitHub Actions CI has 4 jobs: lint, test, build, and migration-check.
The migration-check job verifies schema and migration alignment using
prisma migrate diff.

## Database Security
<!-- VERIFY:EM-RLS — ENABLE + FORCE ROW LEVEL SECURITY -->
All 5 tables have Row Level Security enabled and forced at the database
level. This prevents data access bypass even for table owners.

## Environment Configuration
<!-- VERIFY:EM-ENV-FAILFAST — JWT_SECRET and CORS_ORIGIN fail-fast -->
The application fails fast at startup if JWT_SECRET or CORS_ORIGIN
environment variables are missing. No hardcoded fallbacks exist.

## State Machine Design
Transaction and dispute status transitions are validated server-side.
The TransactionService enforces PENDING->FUNDED->RELEASED/DISPUTED paths.
The DisputeService enforces OPEN->UNDER_REVIEW->RESOLVED/ESCALATED paths.
Invalid transitions throw BadRequestException with descriptive messages.

## Docker Compose
Development uses docker-compose.yml with PostgreSQL 16, healthcheck,
and a named volume (em_pg_data) for data persistence. Testing uses
docker-compose.test.yml with tmpfs for ephemeral databases.
