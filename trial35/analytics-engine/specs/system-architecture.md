# System Architecture

**Project:** analytics-engine
**Layer:** 5 — Monorepo
**Version:** 1.0.0

---

## Overview

The Analytics Engine is a multi-tenant analytics platform built as a Turborepo
monorepo with pnpm workspaces. The system consists of a NestJS API backend,
a Next.js frontend, and a shared package for types, constants, and utilities.

## Monorepo Structure

The project uses Turborepo 2 for task orchestration with pnpm workspaces.
The workspace configuration defines apps/* and packages/* as workspace roots.

### Shared Package

The shared package (@analytics-engine/shared) provides common types, constants,
and utility functions used by both the API and web applications.

- VERIFY: AE-SHARED-001 — Shared package exports types, constants, and utilities
- VERIFY: AE-SHARED-002 — Registration role whitelist excludes ADMIN
- VERIFY: AE-SHARED-003 — Pipeline status transition map enforces valid transitions
- VERIFY: AE-SHARED-004 — Pagination utility returns PaginatedResult structure
- VERIFY: AE-SHARED-005 — Role validation rejects ADMIN for self-registration
- VERIFY: AE-SHARED-006 — formatBytes converts bytes to human-readable strings
- VERIFY: AE-SHARED-007 — generateId creates prefixed 8-char random IDs
- VERIFY: AE-SHARED-008 — Slug generation normalizes text to URL-safe format

## Workspace Dependencies

Both apps/api and apps/web depend on @analytics-engine/shared using the
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
3. Service layer queries database with tenant scoping
4. Prisma client enforces type safety on all queries
5. Response is serialized and returned to client
