# System Architecture — Escrow Marketplace

## Overview
Escrow Marketplace uses a layered architecture with NestJS backend and Next.js frontend,
communicating via RESTful APIs secured with JWT tokens.

## Architecture Layers

### Presentation Layer (Next.js Frontend)
Server Actions handle form submissions with response.ok validation.
No raw HTML select elements — shadcn Select components used throughout.
<!-- VERIFY:EM-SERVER-ACTIONS — Server Actions with response.ok check -->

### API Layer (NestJS Controllers)
Controllers handle HTTP requests with ValidationPipe configured for
whitelist and forbidNonWhitelisted to prevent mass assignment.
<!-- VERIFY:EM-VALIDATION-PIPE — ValidationPipe whitelist + forbidNonWhitelisted -->

### Business Logic Layer (NestJS Services)
TransactionService uses $executeRaw with Prisma.sql for atomic status transitions.
This ensures race-condition-free transaction release operations.
<!-- VERIFY:EM-EXECUTE-RAW — $executeRaw with Prisma.sql in TransactionService -->

### Data Access Layer (Prisma ORM)
Type-safe database access with all models mapped to snake_case tables.
<!-- VERIFY:EM-PRISMA-MAP — @@map on all models -->

## Authentication Flow
1. User registers via POST /auth/register (ADMIN excluded from self-registration)
2. Password hashed with bcrypt (salt rounds: 12)
3. JWT token returned with user claims
4. Protected routes validate JWT on each request
<!-- VERIFY:EM-AUTH-FLOW — AuthService with bcrypt and JWT -->

## Infrastructure

### Docker Configuration
Multi-stage Dockerfile with deps, build, and production stages.
node:20-alpine base image with non-root USER node.
HEALTHCHECK monitors application readiness.
<!-- VERIFY:EM-DOCKERFILE — Multi-stage Dockerfile with HEALTHCHECK -->

### CI/CD Pipeline
GitHub Actions with lint, test, build, and migration-check jobs.
PostgreSQL 16 service container for database-dependent tests.
<!-- VERIFY:EM-CI-PIPELINE — CI workflow with migration-check -->

### Database Security
PostgreSQL 16 with FORCE ROW LEVEL SECURITY on all tables.
<!-- VERIFY:EM-RLS — FORCE ROW LEVEL SECURITY on all tables -->

## Module Structure
```
src/
├── main.ts           — Bootstrap with fail-fast env checks
├── app.module.ts     — Root module
├── prisma.service.ts — Shared database client
├── auth/             — Authentication with bcrypt + JWT
├── transaction/      — Transaction management with raw SQL
└── dispute/          — Dispute resolution module
```

## Environment Configuration
Required variables validated at startup:
- DATABASE_URL: PostgreSQL connection string
- JWT_SECRET: Validated at startup (fail-fast)
- CORS_ORIGIN: Validated at startup (fail-fast)
- PORT: Server port (defaults to 4001)
<!-- VERIFY:EM-ENV-FAILFAST — JWT_SECRET and CORS_ORIGIN fail-fast -->

## Deployment
Docker Compose orchestrates PostgreSQL 16 and backend services.
Migrations applied before application startup.
