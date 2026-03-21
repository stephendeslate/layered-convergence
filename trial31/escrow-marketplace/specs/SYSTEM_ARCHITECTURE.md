# System Architecture — Escrow Marketplace

## Overview
The Escrow Marketplace follows a layered architecture with NestJS backend,
Next.js frontend, and PostgreSQL database with Row Level Security.

See also: [PRODUCT_VISION.md](PRODUCT_VISION.md), [SECURITY_MODEL.md](SECURITY_MODEL.md)

## Backend Architecture

### Server Actions
<!-- VERIFY:EM-SERVER-ACTIONS -->
Frontend uses Next.js Server Actions with 'use server' directive.
All fetch calls check response.ok before processing data.

### Validation Pipeline
<!-- VERIFY:EM-VALIDATION-PIPE -->
NestJS ValidationPipe configured with whitelist and forbidNonWhitelisted
to strip unknown properties and reject unrecognized fields.

### Raw SQL Usage
<!-- VERIFY:EM-EXECUTE-RAW -->
All raw SQL uses $executeRaw with Prisma.sql tagged template literals.
Never uses $executeRawUnsafe to prevent SQL injection.

### ORM Mapping
<!-- VERIFY:EM-PRISMA-MAP -->
All Prisma models use @@map for snake_case table names.
All multi-word columns use @map for snake_case column names.
All enums use @@map for snake_case type names.

### Authentication Flow
<!-- VERIFY:EM-AUTH-FLOW -->
AuthService uses bcrypt with salt 12 for password hashing.
JWT tokens issued on login and registration with 24h expiry.

## Infrastructure

### Dockerfile
<!-- VERIFY:EM-DOCKERFILE -->
Multi-stage build: deps -> build -> production.
Uses node:20-alpine with USER node, HEALTHCHECK, and LABEL metadata.

### CI/CD Pipeline
<!-- VERIFY:EM-CI-PIPELINE -->
GitHub Actions workflow with 5 jobs:
- lint: ESLint on source files
- test: Jest with PostgreSQL service container
- build: Production build verification
- typecheck: tsc --noEmit (Trial 31 variation)
- migration-check: prisma migrate diff alignment check

### Row Level Security
<!-- VERIFY:EM-RLS -->
PostgreSQL tables use both ENABLE ROW LEVEL SECURITY and
FORCE ROW LEVEL SECURITY for defense-in-depth access control.

### Environment Validation
<!-- VERIFY:EM-ENV-FAILFAST -->
Application startup validates JWT_SECRET and CORS_ORIGIN presence.
Missing variables cause immediate failure with descriptive error messages.
No hardcoded fallback values are used.

## Deployment
- Docker Compose with PostgreSQL 16 and named volume
- Separate test compose file with tmpfs for isolation
- Health checks on both application and database containers
