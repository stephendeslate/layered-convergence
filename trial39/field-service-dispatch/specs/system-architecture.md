# System Architecture

## Overview

Field Service Dispatch is a multi-tenant platform for managing work orders,
technicians, and dispatch schedules. It is organized as a Turborepo 2 monorepo
with pnpm workspaces, consisting of two applications and one shared package.

## Monorepo Structure

The project uses the following workspace layout:

- `apps/api/` — NestJS 11 REST API with Prisma 6 ORM and PostgreSQL 16
- `apps/web/` — Next.js 15 App Router frontend with React 19 and shadcn/ui
- `packages/shared/` — Pure TypeScript utilities with zero runtime dependencies

Both applications import from the shared package via `workspace:*` protocol.

<!-- VERIFY: FD-SHARED-001 — Shared types, enums, constants, and utility functions -->

The shared package exports all domain types, enums, constants, and utilities
used by both the API and web applications.

## Shared Utilities

<!-- VERIFY: FD-SHARED-004 — Generic pagination result builder -->

The buildPaginationResult utility constructs paginated response objects
with metadata (total, page, pageSize, totalPages).

<!-- VERIFY: FD-SHARED-005 — Role validation guard for self-registration -->

The ALLOWED_REGISTRATION_ROLES constant restricts self-registration
to non-admin roles, preventing privilege escalation.

<!-- VERIFY: FD-SHARED-006 — Mask sensitive strings preserving trailing chars -->

The maskSensitive utility replaces all but the last few characters of
a string with asterisks, used for logging email addresses safely.

<!-- VERIFY: FD-SHARED-007 — Convert text to URL-safe slug -->

The slugify utility converts text to lowercase URL-safe slugs by
replacing spaces and special characters with hyphens.

<!-- VERIFY: FD-SHARED-008 — Truncate text with configurable suffix -->

The truncateText utility shortens text to a maximum length with
a configurable suffix (default ellipsis), used in list views.

<!-- VERIFY: FD-SHARED-009 — Format byte counts to human-readable strings -->

The formatBytes utility converts numeric byte values to human-readable
strings (KB, MB, GB) for display in the dashboard.

<!-- VERIFY: FD-SHARED-010 — Generate prefixed unique identifiers -->

The generateId utility creates prefixed unique identifiers using
crypto.randomUUID, providing domain-specific ID formats (WO-, TECH-).

<!-- VERIFY: FD-SHARED-011 — Format GPS decimal coordinates for display -->

The formatCoordinates utility formats Decimal(10,7) latitude and
longitude values into a readable coordinate string for the UI.

<!-- VERIFY: FD-API-001 — Bootstrap with fail-fast env validation -->

The API bootstrap performs fail-fast validation of required environment variables
(JWT_SECRET, CORS_ORIGIN) before starting the application.

<!-- VERIFY: FD-API-002 — Root application module with ThrottlerGuard and ResponseTimeInterceptor -->

The root AppModule aggregates all feature modules and registers global providers
including ThrottlerGuard and ResponseTimeInterceptor.

## Deployment

The application is containerized using a multi-stage Docker build targeting
node:20-alpine. PostgreSQL 16 serves as the primary database with connection
pooling configured via DATABASE_URL parameters.

## Cross-References

- See [Infrastructure](./infrastructure.md) for Docker and CI/CD details
- See [Database](./database.md) for schema and migration details
- See [Performance](./performance.md) for optimization strategies
