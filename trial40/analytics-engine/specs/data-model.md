# Data Model Specification

## Overview
Prisma 6 ORM with PostgreSQL 16. All models use @@map for table names.
All enums use @@map for type names and @map for individual values.

## Entities

### Tenant
Root entity for multi-tenancy isolation. All domain entities belong to a tenant.
Fields: id (UUID), name, slug (unique), createdAt, updatedAt.
- VERIFY:AE-DATA-01 — Prisma schema with all domain models

### User
Authenticated user within a tenant. Roles: ADMIN, EDITOR, VIEWER.
Fields: id, email (unique), password (bcrypt), name, role, tenantId.
Indexes: tenantId, role.

### Event
Analytics event tracked within a tenant.
Fields: id, type (EventType enum), name, payload (JSON), tenantId, createdAt.
Indexes: tenantId, type, composite (tenantId, type).
Types: PAGE_VIEW, CLICK, CONVERSION, CUSTOM.

### Dashboard
Analytics dashboard owned by a user within a tenant.
Fields: id, title, description, isPublic, tenantId, userId, timestamps.
Indexes: tenantId, userId, composite (tenantId, isPublic).

### DataSource
External data connection configuration.
Fields: id, name, type (DataSourceType), config (JSON), cost (Decimal 12,2), tenantId.
Indexes: tenantId, type.
Types: DATABASE, API, FILE, STREAM.
- VERIFY:AE-DATA-03 — Decimal for money fields, @@index on tenant FKs and status

### Pipeline
Data processing pipeline linked to a data source.
Fields: id, name, description, status (PipelineStatus), schedule, tenantId, dataSourceId.
Indexes: tenantId, status, composite (tenantId, status).
Statuses: IDLE, RUNNING, COMPLETED, FAILED.

## Enum Mapping
- VERIFY:AE-DATA-02 — @@map on all models and enums, @map on enum values

All enums mapped to lowercase PostgreSQL types:
- UserRole -> user_role (admin, editor, viewer)
- EventType -> event_type (page_view, click, conversion, custom)
- PipelineStatus -> pipeline_status (idle, running, completed, failed)
- DataSourceType -> data_source_type (database, api, file, stream)

## Row Level Security
RLS enabled and forced on all tables via migration.
Cross-reference: security.md for RLS policy details.

## Money Fields
DataSource.cost uses Decimal @db.Decimal(12, 2). Never Float.
Cross-reference: api.md for how cost is exposed via API.

## Async Safety
- VERIFY:AE-PERF-02 — TimeoutError custom class for async timeout handling
- VERIFY:AE-PERF-03 — withTimeout wraps async with timeout guard

## Database Connection
Uses connection_limit parameter in DATABASE_URL for pool management.
