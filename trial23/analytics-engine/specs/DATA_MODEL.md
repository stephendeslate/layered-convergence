# Data Model — Analytics Engine

## Overview

The data model supports multi-tenant analytics with 9 entities: Tenant, User, DataSource,
DataPoint, Pipeline, Dashboard, Widget, Embed, and SyncRun. All entities except Tenant
itself are scoped to a tenant for isolation.

## Entity Definitions

### Tenant
The top-level entity for multi-tenant isolation. All other entities reference a Tenant
either directly (via tenantId) or indirectly (via parent relationships).

Fields: id (UUID), name, createdAt, updatedAt

### User
Represents an authenticated user belonging to a Tenant. Each user has a Role that
determines their access level within the platform.

Fields: id (UUID), email (unique), password (hashed), role (enum), tenantId, createdAt, updatedAt

[VERIFY:DM-001] All models use @@map for table naming -> Implementation: backend/prisma/schema.prisma:44
[VERIFY:DM-002] Multi-word columns use @map -> Implementation: backend/prisma/schema.prisma:46

### DataSource
Represents an external data connection. Stores connection configuration as JSON.
Has many DataPoints and SyncRuns.

Fields: id (UUID), name, type, config (JSON), tenantId, createdAt, updatedAt

### DataPoint
Individual data records with high-precision decimal values. Each DataPoint belongs
to a DataSource and is scoped to a Tenant.

Fields: id (UUID), value (Decimal 20,6), label, timestamp, dataSourceId, tenantId, createdAt, updatedAt

[VERIFY:DM-003] DataPoint.value is Decimal(20,6) -> Implementation: backend/prisma/schema.prisma:72
[VERIFY:DM-004] DataPoint value stored with precision -> Implementation: backend/src/data-point/data-point.service.ts:2

### Pipeline
Data processing workflow with a state machine governing its lifecycle.

Fields: id (UUID), name, status (enum), config (JSON), tenantId, createdAt, updatedAt

Status transitions: DRAFT -> ACTIVE -> PAUSED -> ARCHIVED

### Dashboard
A collection of Widgets for data visualization. Scoped to a Tenant.

Fields: id (UUID), name, tenantId, createdAt, updatedAt

### Widget
A visualization component placed on a Dashboard. Supports different types
(bar, line, pie, table, etc.) with type-specific configuration.

Fields: id (UUID), name, type, config (JSON), dashboardId, createdAt, updatedAt

### Embed
Enables external access to a Dashboard through a unique token. Can be
activated or deactivated without deletion.

Fields: id (UUID), token (unique UUID), isActive, tenantId, dashboardId, createdAt, updatedAt

### SyncRun
Tracks data synchronization execution with timing and error information.

Fields: id (UUID), status (enum), startedAt, completedAt, errorMessage, dataSourceId, tenantId, createdAt, updatedAt

## Enumerations

### Role
- VIEWER — read-only access to dashboards and data
- EDITOR — can create and modify dashboards, widgets, and data sources
- ANALYST — full analytical capabilities including pipeline management

### PipelineStatus
DRAFT, ACTIVE, PAUSED, ARCHIVED

### SyncRunStatus
PENDING, RUNNING, SUCCESS, FAILED

## Cross-References

- See [PRODUCT_VISION.md](./PRODUCT_VISION.md) for business context
- See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for how models are used
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for RLS policies
