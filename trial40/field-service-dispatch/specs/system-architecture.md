# System Architecture Specification

## Overview

Field Service Dispatch is a multi-tenant field service management platform built as a
Turborepo 2 monorepo with pnpm workspaces. The system supports work order management,
technician dispatch, scheduling, and service area configuration.

## Monorepo Structure

```
field-service-dispatch/
  apps/
    api/        — NestJS 11 backend (REST API)
    web/        — Next.js 15 frontend (React 19)
  packages/
    shared/     — Types, constants, utilities
```

## Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Backend | NestJS | 11.x |
| Frontend | Next.js | 15.x |
| UI | React | 19.x |
| Styling | Tailwind CSS | 4.x |
| ORM | Prisma | 6.x |
| Database | PostgreSQL | 16.x |
| Auth | JWT + Passport | - |
| Hashing | bcrypt | salt 12 |

## Deployment

- VERIFY: FD-DB-001 — 3-stage Dockerfile (deps, build, production) with HEALTHCHECK on /health
- VERIFY: FD-DB-002 — Docker Compose with PostgreSQL 16 and named volumes

## CI/CD

GitHub Actions workflow with jobs:
- lint (ESLint)
- typecheck (tsc --noEmit)
- test (Jest with PostgreSQL service container)
- build (turbo build)
- migration-check (prisma migrate diff)
- audit (pnpm audit)

## Multi-Tenancy

All domain entities are scoped by `tenantId`. Every query filters by tenant to
enforce data isolation at the application layer. Row Level Security is enabled
at the database layer as an additional safeguard.

## Shared Package

- VERIFY: FD-SHARED-001 — Shared types, enums, constants, and utility functions exported from packages/shared

The `@field-service-dispatch/shared` package exports:
- TypeScript interfaces for all domain entities
- Constants (BCRYPT_SALT_ROUNDS, MAX_PAGE_SIZE, ALLOWED_REGISTRATION_ROLES)
- State machine transitions for work order status
- Utility functions (sanitizeInput, paginate, generateId, slugify, etc.)
- T40 variation functions: createCorrelationId(), formatLogEntry()

### Shared Constants

- VERIFY: FD-SHARED-002 — Registration role whitelist excluding ADMIN
- VERIFY: FD-SHARED-003 — Work order state machine transitions defining allowed status changes

### Shared Utilities

- VERIFY: FD-SHARED-004 — Generic pagination result builder for consistent list responses
- VERIFY: FD-SHARED-005 — Role validation guard for self-registration endpoint
- VERIFY: FD-SHARED-006 — Mask sensitive strings preserving trailing chars for log output
- VERIFY: FD-SHARED-007 — Convert text to URL-safe slug for tenant and entity identifiers
- VERIFY: FD-SHARED-008 — Truncate text with configurable suffix for display
- VERIFY: FD-SHARED-009 — Format byte counts to human-readable strings for metrics
- VERIFY: FD-SHARED-010 — Generate prefixed unique identifiers for work orders and technicians
- VERIFY: FD-SHARED-011 — Format GPS decimal coordinates for display in frontend
