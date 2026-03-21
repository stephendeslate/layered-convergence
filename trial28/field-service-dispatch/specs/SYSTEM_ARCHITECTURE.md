# System Architecture — Field Service Dispatch

## Backend Architecture

### NestJS Framework
Modular architecture with AuthModule, WorkOrderModule, and InvoiceModule.
Each module encapsulates its own controller, service, and DTOs.

### Server Actions
Frontend uses Next.js Server Actions for API communication.
All server actions check response.ok before processing data.
<!-- VERIFY:FD-SERVER-ACTIONS — Server Actions with response.ok -->

### Validation
Global ValidationPipe with whitelist and forbidNonWhitelisted options.
Strips unknown properties and rejects requests with extra fields.
<!-- VERIFY:FD-VALIDATION-PIPE — ValidationPipe whitelist + forbidNonWhitelisted -->

### Raw SQL Queries
Work order status transitions use $executeRaw with Prisma.sql tagged templates.
This ensures atomic updates and prevents race conditions during dispatching.
<!-- VERIFY:FD-EXECUTE-RAW — $executeRaw with Prisma.sql -->

### Prisma Schema
All models use @@map for snake_case table names in PostgreSQL.
This maintains conventional database naming while using PascalCase in code.
<!-- VERIFY:FD-PRISMA-MAP — @@map on all models -->

## Authentication

### AuthService
User registration and login with bcrypt password hashing.
JWT tokens issued with 24-hour expiration.
Salt rounds set to 12 for bcrypt hashing.
<!-- VERIFY:FD-AUTH-FLOW — AuthService bcrypt + JWT -->

## Infrastructure

### Docker
Multi-stage Dockerfile: deps -> build -> production.
Base image: node:20-alpine. Non-root USER node.
HEALTHCHECK configured for the health endpoint.
<!-- VERIFY:FD-DOCKERFILE — Multi-stage Dockerfile + HEALTHCHECK -->

### CI/CD Pipeline
GitHub Actions workflow with four jobs:
lint, test, build, and migration-check.
Test job uses PostgreSQL 16 service container.
<!-- VERIFY:FD-CI-PIPELINE — CI with migration-check -->

### Database Security
Row Level Security enabled and forced on all tables.
Prevents unauthorized cross-tenant data access.
<!-- VERIFY:FD-RLS — FORCE RLS on all tables -->

### Environment Configuration
JWT_SECRET and CORS_ORIGIN validated at startup.
Application fails fast if required variables are missing.
<!-- VERIFY:FD-ENV-FAILFAST — Fail-fast env checks -->

## Data Flow
1. Dispatcher creates work order (PENDING)
2. Dispatcher assigns technician (ASSIGNED)
3. Technician begins work (IN_PROGRESS)
4. GPS events track technician location
5. Technician completes work (COMPLETED)
6. Invoice generated from work order (DRAFT)
7. Invoice sent to customer (SENT -> PAID)
