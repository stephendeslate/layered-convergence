# Data Model: Analytics Engine

## Overview

The Analytics Engine data model consists of 9 entities organized around
multi-tenant data analytics workflows. All entities use PostgreSQL with
Prisma ORM and enforce Row Level Security.

## Entity Definitions

### Tenant
[VERIFY:AE-014] The Prisma schema defines all 9 entities: Tenant, User,
DataSource, DataPoint, Pipeline, Dashboard, Widget, Embed, and SyncRun.
Tenant serves as the root of the multi-tenant hierarchy with all data
scoped through foreign key relationships.

### User
[VERIFY:AE-015] Tenant entity is the root of the multi-tenant hierarchy.
Users belong to a single tenant and have role-based access with four roles:
ADMIN, VIEWER, EDITOR, ANALYST. Passwords are stored as bcrypt hashes.

### Role Enum
[VERIFY:AE-016] The Role enum defines four values: ADMIN, VIEWER, EDITOR,
ANALYST. ADMIN is excluded from self-registration but available for
programmatic assignment by existing administrators.

### DataSource
DataSource stores connection information for external databases and APIs.
Each data source belongs to a tenant and produces DataPoints and SyncRuns.

### DataPoint
[VERIFY:AE-017] DataPoint uses Decimal(20,6) for metric values to prevent
floating-point precision errors in analytics calculations. This is critical
for financial and statistical data where rounding errors compound.

### Pipeline
[VERIFY:AE-018] Pipeline entities follow a state machine pattern with
DataSource connecting to the pipeline for processing configuration.
Valid states: DRAFT, ACTIVE, PAUSED, ARCHIVED.

### Dashboard
Dashboards belong to tenants and track their creator. They contain
widgets for visualization and can be shared via embed tokens.

### Widget
Widgets are positioned within dashboards using JSON configuration for
flexible layout management. Each widget has a type and title.

### Embed
[VERIFY:AE-019] Embed tokens have expiration dates (expiresAt) and are
scoped to specific dashboards within a tenant boundary. The token field
is unique to prevent collisions.

## Mapping Conventions

[VERIFY:AE-020] All Prisma models use @@map for snake_case table names
(e.g., model DataSource -> @@map("data_sources")) and @map for multi-word
column names (e.g., tenantId -> @map("tenant_id"), createdAt -> @map("created_at")).

## Relationships

- Tenant 1:N User, DataSource, Pipeline, Dashboard, Embed
- DataSource 1:N DataPoint, SyncRun
- Dashboard 1:N Widget, Embed
- User 1:N Dashboard (creator relationship)

## Cross-References

- See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for ORM configuration
- See [API_CONTRACT.md](./API_CONTRACT.md) for CRUD endpoints on these entities
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for RLS policies on each table
