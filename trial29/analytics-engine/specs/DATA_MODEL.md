# Data Model — Analytics Engine

## Overview
The data model supports multi-tenant analytics with strict isolation.
All entities are tenant-scoped via foreign key relationships.
See SECURITY_MODEL.md for RLS enforcement details and API_CONTRACT.md
for how these entities are exposed via the API.

## Entities

### Tenant
Primary organizational unit. All data is scoped to a tenant.
Fields: id, name, slug (unique), createdAt, updatedAt.
<!-- VERIFY:AE-TENANT-MODEL — Tenant model with slug unique constraint -->

### User
Authenticated user belonging to a tenant with a role assignment.
Fields: id, email (unique), passwordHash, role, tenantId, createdAt, updatedAt.
Password stored as bcrypt hash with salt rounds of 12.
<!-- VERIFY:AE-USER-MODEL — User model with bcrypt salt 12 -->

### DataSource
External data connection configuration for a tenant.
Fields: id, name, type, config, tenantId, createdAt, updatedAt.
<!-- VERIFY:AE-DATASOURCE-MODEL — DataSource model with tenant scope -->

### DataPoint
Individual data measurement from a data source.
Fields: id, value (Decimal 20,6), label, timestamp, dataSourceId, createdAt.
Monetary and precise numeric values use Decimal, never Float.
<!-- VERIFY:AE-DECIMAL-FIELDS — Decimal type for DataPoint.value -->

### Pipeline
ETL pipeline with lifecycle state management.
Fields: id, name, status, config, tenantId, createdAt, updatedAt.
Status enum: DRAFT, ACTIVE, PAUSED, ARCHIVED.
<!-- VERIFY:AE-PIPELINE-MODEL — Pipeline model with PipelineStatus enum -->

### Dashboard
User-created analytics view containing widgets.
Fields: id, title, tenantId, userId, createdAt, updatedAt.

### Widget
Individual visualization component within a dashboard.
Fields: id, type, config, dashboardId, createdAt, updatedAt.

### Embed
Secure token for embedding dashboards in external applications.
Fields: id, token (unique), tenantId, config, expiresAt, createdAt.

### SyncRun
Record of a data synchronization execution.
Fields: id, status, dataSourceId, startedAt, completedAt, recordCount, errorMessage, createdAt.
Status enum: PENDING, RUNNING, COMPLETED, FAILED.

## Enums
All enums use @@map for PostgreSQL naming conventions:
- UserRole -> user_role
- PipelineStatus -> pipeline_status
- SyncRunStatus -> sync_run_status
<!-- VERIFY:AE-ENUM-MAP — All enums have @@map -->

## Column Mapping
Multi-word columns use @map for snake_case:
- passwordHash -> password_hash
- tenantId -> tenant_id
- dataSourceId -> data_source_id
- dashboardId -> dashboard_id
- startedAt -> started_at
- completedAt -> completed_at
- recordCount -> record_count
- errorMessage -> error_message
- expiresAt -> expires_at
- createdAt -> created_at
- updatedAt -> updated_at
<!-- VERIFY:AE-COLUMN-MAP — @map on all multi-word columns -->

## Indexes
- tenants.slug: unique index
- users.email: unique index
- embeds.token: unique index

## Row Level Security
All tables have both ENABLE and FORCE ROW LEVEL SECURITY applied
in the initial migration. See SYSTEM_ARCHITECTURE.md for infrastructure details.
