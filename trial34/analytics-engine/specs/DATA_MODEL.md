# Data Model Specification — Analytics Engine

## Overview

The data model consists of 9 entities with 3 enums, all using @@map for snake_case
database naming. Multi-tenancy is enforced via Row Level Security (RLS) on all tables.
See REQUIREMENTS.md for functional context and STATE_MACHINES.md for status transitions.

## Entities

### Tenant
Root entity for multi-tenancy. Has slug for URL-safe identification.
Related: User (1:N), Dashboard (1:N), Pipeline (1:N), AuditLog (1:N).

### User
Authenticated user belonging to a tenant. Roles: OWNER, ADMIN, ANALYST, VIEWER.
passwordHash stored with bcrypt salt 12. See AUTH_SPEC.md for auth details.

### Dashboard, Widget, DataSource, Pipeline, PipelineRun, Report, AuditLog
Domain entities supporting analytics workflows. See STATE_MACHINES.md for pipeline states.

## Schema Conventions

### @@map Directive
All 9 models and all 3 enums use @@map for snake_case table/type names in PostgreSQL.
This ensures consistent naming between Prisma schema and database.
- VERIFY: AE-DA-MAP-001 — @@map on ALL models AND enums in schema.prisma

### Tenant Context Type
The TenantContext interface in shared package defines the shape of tenant-scoped requests.
- VERIFY: AE-DA-TENANT-001 — TenantContext type exported from shared package

### Pipeline Status Enum
Pipeline statuses are defined as a TypeScript union type in shared and as a Prisma enum.
- VERIFY: AE-DA-STATE-001 — PipelineStatus type in shared package

## Prisma Service

The PrismaService extends PrismaClient and provides tenant context setting via RLS.
It uses $executeRaw with Prisma.sql template literals (never $executeRawUnsafe).
- VERIFY: AE-DA-PRISMA-001 — PrismaService with RLS context in prisma.service.ts
- VERIFY: AE-DA-RLS-001 — $executeRaw with Prisma.sql for tenant context

## Row Level Security

The migration enables and forces RLS on all 9 tables. This ensures tenant isolation
at the database level, preventing cross-tenant data access.
- VERIFY: AE-DA-RLS-002 — RLS ENABLE + FORCE on all tables in migration

## Seed Data

Seed script creates realistic data including error/failure states for testing.
Includes tenant, users (OWNER + ANALYST), dashboards, widgets, pipelines (completed + failed),
pipeline runs with error logs, and audit logs.
- VERIFY: AE-SV-SEED-001 — Seed with tenant, users, entities, error/failure states
- VERIFY: AE-SV-SEED-002 — Error/failure state seed data (failed pipeline with error log)

## Cross-References
- See AUTH_SPEC.md for user authentication and role validation
- See STATE_MACHINES.md for pipeline status transitions
- See SECURITY.md for RLS and data isolation details
