# Data Model

## Overview

The Analytics Engine data model consists of 9 entities organized around
multi-tenant isolation. Every entity (except Tenant itself) carries a
`tenantId` foreign key for RLS enforcement.

## Entity Catalog

### Tenant
The root entity for multi-tenancy. All other entities belong to a tenant.
- Fields: id (UUID), name, slug (unique), createdAt, updatedAt
- Table name: `tenants`

### User
Represents an authenticated user within a tenant.
- Fields: id (UUID), email (unique), hashedPassword, role (enum), tenantId, createdAt, updatedAt
- Table name: `users`

### DataSource
A configured data integration endpoint.
- Fields: id (UUID), name, type, config (JSON), tenantId, createdAt, updatedAt
- Table name: `data_sources`

### DataPoint
Individual data measurements ingested from data sources.
- Fields: id (UUID), key, value (Decimal 20,6), timestamp, tenantId, dataSourceId, createdAt
- Table name: `data_points`

### Pipeline
A data processing workflow with state machine.
- Fields: id (UUID), name, status (enum), config (JSON), tenantId, createdAt, updatedAt
- Table name: `pipelines`

### Dashboard
A container for widgets that visualize data.
- Fields: id (UUID), name, tenantId, createdAt, updatedAt
- Table name: `dashboards`

### Widget
A visualization component within a dashboard.
- Fields: id (UUID), name, type, config (JSON), dashboardId, tenantId, createdAt, updatedAt
- Table name: `widgets`

### Embed
A shareable token for embedding dashboards externally.
- Fields: id (UUID), token (unique), config (JSON), tenantId, expiresAt, createdAt
- Table name: `embeds`

### SyncRun
Tracks the execution of a data source synchronization.
- Fields: id (UUID), status (enum), dataSourceId, tenantId, startedAt, completedAt, error, createdAt
- Table name: `sync_runs`

## Schema Conventions

[VERIFY:DM-001] Prisma schema defines all 9 entities with proper relationships -> Implementation: prisma/schema.prisma:1

[VERIFY:DM-002] All models use @@map for snake_case table names -> Implementation: prisma/schema.prisma:2

[VERIFY:DM-003] All columns use @map for snake_case column names -> Implementation: prisma/schema.prisma:3

[VERIFY:DM-004] DataPoint.value uses Decimal(20,6) for financial precision, not Float -> Implementation: prisma/schema.prisma:4

[VERIFY:DM-005] Role enum restricted to VIEWER, EDITOR, ANALYST (no ADMIN) -> Implementation: prisma/schema.prisma:5

## Row Level Security

All tenant-scoped tables have RLS enabled and forced. Policies filter on
`current_setting('app.tenant_id')` to ensure complete tenant isolation at
the database level.

[VERIFY:DM-006] RLS policies filter on current_setting('app.tenant_id') -> Implementation: prisma/rls.sql:3

## Type Mapping (Frontend)

Frontend TypeScript types mirror the Prisma schema for type safety across
the API boundary.

[VERIFY:DM-007] Frontend type definitions match Prisma schema -> Implementation: frontend/lib/types.ts:1

## Cross-References

- RLS implementation details: see SECURITY_MODEL.md
- API serialization: see API_CONTRACT.md
- Schema diagram aligns with SYSTEM_ARCHITECTURE.md module graph
