# Database Specification

**Project:** Analytics Engine
**Prefix:** AE-DB
**Cross-references:** [Performance](performance.md), [Infrastructure](infrastructure.md)

---

## Overview

The database layer uses Prisma 6 with PostgreSQL 16.
Six models support multi-tenant analytics with Row-Level Security enforcement.

---

## Requirements

### AE-DB-01: Schema Definition
- VERIFY:AE-DB-01 — Prisma schema defines 6 models with @@map, @@index, composite indexes
- Models: Tenant, User, Dashboard, Pipeline, PipelineRun, Report
- All models use @@map for snake_case table names
- All enums use @@map and @map for value mapping

### AE-DB-02: Seed Data
- VERIFY:AE-DB-02 — Seed script creates tenant, users, dashboards, pipelines, runs with error states
- Includes FAILURE and TIMED_OUT pipeline runs for testing
- Uses console.error + process.exit(1) for error handling

### AE-DB-03: Prisma Module
- VERIFY:AE-DB-03 — PrismaModule is @Global and exports PrismaService
- Single PrismaClient instance shared across all modules

### AE-DB-04: Prisma Service Lifecycle
- VERIFY:AE-DB-04 — PrismaService implements onModuleInit and onModuleDestroy
- Connects on init, disconnects on destroy
- See [Infrastructure](infrastructure.md) for connection pooling

### AE-DB-05: Row-Level Security
- VERIFY:AE-DB-05 — Migration enables RLS on all 6 tables with ENABLE + FORCE
- RLS policies enforced at database level for defense in depth

### AE-DB-06: Indexing Strategy
- VERIFY:AE-DB-06 — @@index on all tenant-scoped foreign keys and status columns
- At least one composite index per entity (dashboards: tenant+isPublic, pipelines: tenant+status)
- See [Performance](performance.md) for index analysis

### AE-DB-07: Enum Mapping
- VERIFY:AE-DB-07 — All enums (UserRole, PipelineStatus, RunStatus) use @@map and @map
- Database stores lowercase values; application uses uppercase

### AE-DB-08: Cascade Deletes
- VERIFY:AE-DB-08 — All foreign key relations use onDelete: Cascade
- Deleting a tenant cascades to users, dashboards, pipelines

---

**SJD Labs, LLC** — Analytics Engine T39
