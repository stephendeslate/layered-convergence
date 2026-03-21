# Data Model — Analytics Engine

## Overview
The Analytics Engine data model supports multi-tenant analytics with nine
entities. See PRODUCT_VISION.md for business context and SECURITY_MODEL.md
for access control details.

## Entity Definitions

<!-- VERIFY:AE-TENANT-MODEL — Tenant model with slug unique -->
### Tenant
The root entity for multi-tenant isolation. Each tenant has a unique slug
used for URL-based routing and API scoping.
- `id`: CUID primary key
- `name`: Display name
- `slug`: Unique URL-safe identifier
- `createdAt`, `updatedAt`: Timestamp fields

<!-- VERIFY:AE-USER-MODEL — User model with bcrypt salt 12 -->
### User
Users belong to exactly one tenant. Passwords are hashed with bcrypt salt 12.
Roles control access permissions within the tenant scope.
- `id`: CUID primary key
- `email`: Unique across all tenants
- `passwordHash`: bcrypt hash stored as password_hash
- `role`: UserRole enum (VIEWER, EDITOR, ANALYST, ADMIN)
- `tenantId`: Foreign key to tenants table

<!-- VERIFY:AE-DATASOURCE-MODEL — DataSource model with tenant scope -->
### DataSource
External data connections scoped to a tenant. Supports multiple types
including PostgreSQL databases, REST APIs, and CSV file sources.
- `id`: CUID primary key
- `name`: Human-readable identifier
- `type`: Connection type (postgresql, rest_api, csv)
- `config`: JSON configuration string
- `tenantId`: Foreign key to tenants table

<!-- VERIFY:AE-DECIMAL-FIELDS — Decimal type for DataPoint.value -->
### DataPoint
Individual data measurements with Decimal precision (20,6) to avoid
floating-point errors in analytics calculations.
- `id`: CUID primary key
- `value`: Decimal(20,6) — precise numerical value
- `label`: Descriptive text label
- `timestamp`: When the measurement was taken
- `dataSourceId`: Foreign key to data_sources table

### Pipeline
ETL workflows with lifecycle state management. Valid transitions are
enforced by the PipelineService (see SYSTEM_ARCHITECTURE.md).
- `id`: CUID primary key
- `name`: Pipeline display name
- `status`: PipelineStatus enum
- `config`: JSON configuration with schedule

### Dashboard, Widget, Embed
Dashboard aggregation entities. Widgets belong to dashboards.
Embeds provide external access via unique tokens with expiration.
See API_CONTRACT.md for CRUD endpoints.

### SyncRun
Tracks data synchronization execution. Records start/end times,
record counts, and error messages for failed runs.

## Naming Conventions
<!-- VERIFY:AE-ENUM-MAP — All enums have @@map -->
All enums use @@map for snake_case PostgreSQL type names:
- UserRole → user_role
- PipelineStatus → pipeline_status
- SyncRunStatus → sync_run_status

<!-- VERIFY:AE-COLUMN-MAP — @map on multi-word columns -->
All multi-word columns use @map for snake_case:
- passwordHash → password_hash
- tenantId → tenant_id
- dataSourceId → data_source_id
- dashboardId → dashboard_id
- createdAt → created_at
- updatedAt → updated_at
- startedAt → started_at
- completedAt → completed_at
- recordCount → record_count
- errorMessage → error_message
- expiresAt → expires_at

## Relationships
- Tenant → User (one-to-many)
- Tenant → DataSource (one-to-many)
- Tenant → Dashboard (one-to-many)
- Tenant → Pipeline (one-to-many)
- Tenant → Embed (one-to-many)
- DataSource → DataPoint (one-to-many)
- DataSource → SyncRun (one-to-many)
- Dashboard → Widget (one-to-many)
- User → Dashboard (one-to-many, creator)
