# Data Model — Analytics Engine

## Overview
The data model supports multi-tenant analytics with tenant-scoped entities,
flexible data pipelines, and embeddable dashboards.

See also: [PRODUCT_VISION.md](PRODUCT_VISION.md), [API_CONTRACT.md](API_CONTRACT.md)

## Tenant
<!-- VERIFY:AE-TENANT-MODEL -->
- id: CUID primary key
- name: display name
- slug: unique identifier for URL routing
- created_at, updated_at: timestamps
- Relations: users[], dataSources[], dashboards[], pipelines[], embeds[]

## User
<!-- VERIFY:AE-USER-MODEL -->
- id: CUID primary key
- email: unique
- password_hash: bcrypt with salt 12
- role: UserRole enum (VIEWER, EDITOR, ANALYST, ADMIN)
- tenant_id: FK to tenants
- Relations: tenant, dashboards[]

## DataSource
<!-- VERIFY:AE-DATASOURCE-MODEL -->
- id: CUID primary key
- name: display name
- type: connection type (postgresql, rest_api, csv)
- config: JSON configuration string
- tenant_id: FK to tenants
- Relations: tenant, dataPoints[], syncRuns[]

## DataPoint
<!-- VERIFY:AE-DECIMAL-FIELDS -->
- id: CUID primary key
- value: Decimal(20,6) for precise measurements
- label: descriptive label
- timestamp: measurement time
- data_source_id: FK to data_sources
- Relations: dataSource

## Pipeline
<!-- VERIFY:AE-PIPELINE-MODEL -->
- id: CUID primary key
- name: pipeline name
- status: PipelineStatus enum (DRAFT, ACTIVE, PAUSED, ARCHIVED)
- config: JSON configuration
- tenant_id: FK to tenants
- Relations: tenant

## Mapping Conventions
<!-- VERIFY:AE-ENUM-MAP -->
All enums use @@map for snake_case type names in PostgreSQL:
- UserRole -> user_role
- PipelineStatus -> pipeline_status
- SyncRunStatus -> sync_run_status

<!-- VERIFY:AE-COLUMN-MAP -->
All multi-word columns use @map for snake_case in the database:
- passwordHash -> password_hash
- tenantId -> tenant_id
- dataSourceId -> data_source_id
- dashboardId -> dashboard_id
- createdAt -> created_at
- updatedAt -> updated_at
- startedAt -> started_at
- completedAt -> completed_at
- recordCount -> record_count
- errorMessage -> error_message
- expiresAt -> expires_at
