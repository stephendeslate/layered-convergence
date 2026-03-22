# Data Model Specification

## Overview

The Analytics Engine data model uses Prisma 6 with PostgreSQL 16. All models use
snake_case table mapping via @@map. All enums use @@map with @map on individual values.
Money fields use Decimal(12,2), never Float.

## Entities

### Tenant
Multi-tenant root entity. All domain entities belong to a tenant.
Table: `tenants`

### User
Authenticated users with role-based access. Roles: ADMIN, USER, VIEWER, EDITOR.
Table: `users`

<!-- VERIFY:AE-SEED-SCRIPT — Seed creates tenants, users, and all domain entities including error/failure states -->

### Event
Analytics events with status tracking and cost attribution.
Table: `events`. Statuses: PENDING, PROCESSING, COMPLETED, FAILED.

<!-- VERIFY:AE-SHARED-STATUS — Shared package exports EVENT_STATUSES and PIPELINE_STATUSES arrays -->

### Dashboard
User-created analytics dashboards with visibility controls.
Table: `dashboards`. Supports public/private toggle.

### DataSource
External data connections with type classification.
Table: `data_sources`. Types: DATABASE, API, FILE, STREAM.

### Pipeline
Data processing pipeline definitions with status and cost tracking.
Table: `pipelines`. Statuses: ACTIVE, PAUSED, ERROR, DISABLED.

## Relationships

- Tenant has many Users, Events, Dashboards, DataSources, Pipelines
- User belongs to Tenant; User owns many Dashboards
- Event belongs to Tenant; Event optionally references DataSource
- Dashboard belongs to Tenant and User (owner)
- DataSource belongs to Tenant; has many Events and Pipelines
- Pipeline belongs to Tenant; optionally references DataSource

## Indexing Strategy

All tenant foreign keys have @@index for query performance.
Status fields are indexed for filtered queries.
Composite indexes on (tenantId, status) and (tenantId, isPublic/isActive) for
common multi-column query patterns.

See [api-contracts.md](./api-contracts.md) for how these entities are exposed via REST.

## Row Level Security

All tables have ENABLE ROW LEVEL SECURITY and FORCE ROW LEVEL SECURITY
applied in the initial migration.

## Money Fields

The `cost` field on Event, DataSource, and Pipeline uses Decimal @db.Decimal(12,2).
This prevents floating-point precision errors in financial calculations.

## Enum Mapping

All enums use @@map for snake_case table names:
- UserRole -> user_role
- EventStatus -> event_status
- PipelineStatus -> pipeline_status
- DataSourceType -> data_source_type

Each enum value has @map for snake_case value storage.
