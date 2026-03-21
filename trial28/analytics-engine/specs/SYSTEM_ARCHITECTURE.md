# System Architecture — Analytics Engine

## Overview
Analytics Engine follows a layered architecture with clear separation between
API, business logic, and data access layers.

## Architecture Layers

### Presentation Layer (Next.js Frontend)
The frontend is built with Next.js 15 using the App Router pattern.
Server Actions handle form submissions with response.ok validation.
<!-- VERIFY:AE-SERVER-ACTIONS — Server Actions with response.ok check -->

### API Layer (NestJS Controllers)
RESTful controllers handle HTTP requests with validation pipes.
ValidationPipe is configured with whitelist and forbidNonWhitelisted.
<!-- VERIFY:AE-VALIDATION-PIPE — ValidationPipe with whitelist + forbidNonWhitelisted -->

### Business Logic Layer (NestJS Services)
Services encapsulate business rules including state machine transitions.
Raw SQL queries use $executeRaw with Prisma.sql for parameterized execution.
<!-- VERIFY:AE-EXECUTE-RAW — $executeRaw with Prisma.sql in PipelineService -->

### Data Access Layer (Prisma ORM)
Prisma provides type-safe database access with migration management.
All models use @@map for snake_case table names.
<!-- VERIFY:AE-PRISMA-MAP — @@map on all models in schema.prisma -->

## Authentication Flow
1. User submits credentials to POST /auth/login
2. AuthService validates password with bcrypt.compare
3. JWT token issued with user ID, email, and role claims
4. Subsequent requests include JWT in Authorization header
<!-- VERIFY:AE-AUTH-FLOW — AuthService with bcrypt and JWT -->

## Infrastructure

### Docker Configuration
Multi-stage Dockerfile: deps -> build -> production stages.
Base image: node:20-alpine with non-root USER node.
HEALTHCHECK instruction monitors application availability.
<!-- VERIFY:AE-DOCKERFILE — Multi-stage Dockerfile with HEALTHCHECK -->

### CI/CD Pipeline
GitHub Actions workflow with lint, test, build, and migration-check jobs.
PostgreSQL 16 service container for integration testing.
<!-- VERIFY:AE-CI-PIPELINE — CI workflow with migration-check step -->

### Database
PostgreSQL 16 with Row Level Security enforced on all tables.
Docker Compose configuration for local development and testing.
<!-- VERIFY:AE-RLS — FORCE ROW LEVEL SECURITY on all tables -->

## Module Structure
```
src/
├── main.ts          — Bootstrap with fail-fast env checks
├── app.module.ts    — Root module importing feature modules
├── prisma.service.ts — Shared Prisma client
├── auth/            — Authentication module
├── pipeline/        — Pipeline management module
└── dashboard/       — Dashboard and widget module
```

## Environment Configuration
Required environment variables with fail-fast validation:
- DATABASE_URL: PostgreSQL connection string
- JWT_SECRET: Token signing key (validated at startup)
- CORS_ORIGIN: Allowed origin for CORS (validated at startup)
- PORT: Server port (defaults to 4000)
<!-- VERIFY:AE-ENV-FAILFAST — JWT_SECRET and CORS_ORIGIN fail-fast checks -->

## Deployment
Production deployments use the multi-stage Docker image.
Database migrations run before application startup via Prisma migrate deploy.
