# System Architecture Specification

## Overview

Field Service Dispatch is a multi-tenant platform for managing work orders,
technicians, and dispatch schedules. It is built as a Turborepo monorepo with
three packages.

## Monorepo Structure

```
field-service-dispatch/
  apps/
    api/          — NestJS 11 backend (REST API, auth, Prisma)
    web/          — Next.js 15 frontend (App Router, shadcn/ui)
  packages/
    shared/       — Shared types, constants, utilities
  specs/          — Specification documents
```

## Technology Stack

- **Runtime**: Node.js 20 (LTS)
- **Package Manager**: pnpm 9.15.4 with workspaces
- **Build Orchestrator**: Turborepo 2 with task graph caching
- **Backend**: NestJS 11, Prisma 6, PostgreSQL 16
- **Frontend**: Next.js 15, React 19, Tailwind CSS 4, shadcn/ui
- **Auth**: JWT with Passport.js, bcrypt salt 12
- **Testing**: Jest, Supertest, Testing Library, jest-axe

## Package Dependencies

- `apps/api` depends on `packages/shared` (workspace:*)
- `apps/web` depends on `packages/shared` (workspace:*)
- `packages/shared` has zero external dependencies

## Traceability

<!-- VERIFY: FD-SHARED-001 — Shared types, constants, and utilities -->
<!-- VERIFY: FD-API-001 — Fail-fast environment validation -->
<!-- VERIFY: FD-API-002 — Root application module -->
<!-- VERIFY: FD-API-003 — Prisma service with safe raw queries -->

## Build Pipeline

Turborepo tasks are configured with the following dependency graph:

- `build` depends on `^build` (upstream packages first)
- `test` depends on `^build`
- `lint` has no dependencies
- `typecheck` depends on `^build`

## Deployment

The application is containerized with a 3-stage Dockerfile:
1. **deps** — Install production dependencies
2. **build** — Compile TypeScript and build packages
3. **production** — Minimal runtime with non-root user

Docker Compose provides PostgreSQL 16 for local development and testing.

## Multi-Tenancy

All domain models include a `tenantId` foreign key. Row Level Security (RLS)
policies are enabled on all tables to ensure data isolation between tenants.
The Prisma service sets the tenant context via `SET app.tenant_id` before
each operation that requires tenant scoping.
