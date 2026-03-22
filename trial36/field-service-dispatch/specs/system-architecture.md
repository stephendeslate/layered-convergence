# System Architecture

**Project:** field-service-dispatch
**Layer:** 6 — Security
**Version:** 1.0.0

---

## Overview

The Field Service Dispatch platform is a multi-tenant system for managing
work orders, technician schedules, and field service operations. Built as
a Turborepo monorepo with pnpm workspaces.

## Monorepo Structure

The project uses Turborepo 2 for task orchestration with pnpm workspaces.
The workspace configuration defines apps/* and packages/* as workspace roots.

### Shared Package

The shared package (@field-service-dispatch/shared) provides common types,
constants, and utility functions used by both the API and web applications.

- VERIFY: FD-SHARED-001 — Shared package exports types, constants, and utilities
- VERIFY: FD-SHARED-002 — Registration role whitelist excludes ADMIN
- VERIFY: FD-SHARED-003 — Work order status transition map includes FAILED state
- VERIFY: FD-SHARED-004 — Pagination utility returns PaginatedResult structure
- VERIFY: FD-SHARED-005 — Role validation rejects ADMIN for self-registration
- VERIFY: FD-SHARED-006 — formatBytes converts bytes to human-readable strings
- VERIFY: FD-SHARED-007 — generateId creates prefixed 8-char random IDs
- VERIFY: FD-SHARED-008 — formatCoordinates formats GPS to display string

## Workspace Dependencies

Both apps/api and apps/web depend on @field-service-dispatch/shared using the
workspace:* protocol. The shared package must NOT import from either app
to prevent circular dependencies.

## Build Pipeline

Turborepo tasks include build, test, lint, typecheck, and dev. All tasks
except dev use dependsOn: ["^build"] to ensure shared is built first.

## Technology Stack

- **Backend:** NestJS 11 with Prisma 6
- **Frontend:** Next.js 15 with React 19
- **Shared:** TypeScript library
- **Database:** PostgreSQL 16 with Row Level Security
- **Package Manager:** pnpm 9.15.4
- **Task Runner:** Turborepo 2

## Multi-Tenancy

All data access is scoped by tenant_id. Row Level Security policies
enforce isolation at the database level. The API uses JWT claims to
determine the current tenant context for every request.

## Data Flow

1. Client sends request with JWT token
2. API validates JWT and extracts tenant context
3. Service layer sanitizes inputs before processing
4. Service layer queries database with tenant scoping
5. Prisma client enforces type safety on all queries
6. GPS coordinates use Decimal(10, 7) precision for accuracy
7. Sensitive data is masked before returning to client
8. Response is serialized and returned to client
