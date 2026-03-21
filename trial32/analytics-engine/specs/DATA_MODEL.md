# Data Model — Analytics Engine

## Overview

The data model centers on multi-tenant isolation with Tenant as the root entity.
All domain entities reference a Tenant for data isolation via Row-Level Security.

See also: [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md), [API_CONTRACT.md](API_CONTRACT.md)

## Conventions

- [VERIFY:AE-DM-001] All Prisma models use @@map for SQL table name mapping -> Implementation: apps/api/prisma/schema.prisma:1
- [VERIFY:AE-DM-002] Multi-word columns use @map for snake_case SQL names -> Implementation: apps/api/prisma/schema.prisma:2
- [VERIFY:AE-DM-003] DataPoint.value uses Decimal(20,6) for precision -> Implementation: apps/api/prisma/schema.prisma:3
- [VERIFY:AE-DM-004] DataPoint service handles Decimal precision correctly -> Implementation: apps/api/src/data-point/data-point.service.ts:2

## Entity Relationships

### Tenant (root)
- Has many: User, DataSource, Pipeline, Dashboard, Embed
- Primary isolation boundary for all data

### User
- Belongs to: Tenant
- Fields: id, email (unique), password (hashed), role, tenantId
- Role enum: VIEWER, EDITOR, ANALYST

### DataSource
- Belongs to: Tenant
- Has many: DataPoint, SyncRun
- Fields: id, name, type, config (JSON), tenantId

### DataPoint
- Belongs to: DataSource
- Fields: id, value (Decimal 20,6), label, timestamp, dataSourceId, tenantId

### Pipeline
- Belongs to: Tenant
- Fields: id, name, status (PipelineStatus), config (JSON), tenantId
- Default status: DRAFT

### Dashboard
- Belongs to: Tenant
- Has many: Widget, Embed
- Fields: id, name, tenantId

### Widget
- Belongs to: Dashboard
- Fields: id, name, type, config (JSON), dashboardId

### Embed
- Belongs to: Tenant, Dashboard
- Fields: id, token (unique, auto-generated), isActive, tenantId, dashboardId

### SyncRun
- Belongs to: DataSource
- Fields: id, status, startedAt, completedAt, errorMessage, dataSourceId, tenantId

## Enums

### Role
- VIEWER — read-only access
- EDITOR — read-write access
- ANALYST — full analytical access

### PipelineStatus
- DRAFT -> ACTIVE -> PAUSED -> ARCHIVED
- DRAFT is the initial state, ARCHIVED is terminal

### SyncRunStatus
- PENDING -> RUNNING -> COMPLETED | FAILED
- PENDING is the initial state, COMPLETED and FAILED are terminal

## Indexes

- users.email: unique index
- embeds.token: unique index
- All foreign keys are indexed by default via Prisma
