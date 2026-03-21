# Data Model: Analytics Engine

## Overview

The Analytics Engine data model consists of 9 entities organized around
multi-tenant data analytics workflows.

## Entity Definitions

### Tenant
[VERIFY:AE-014] Tenant entity serves as the root of the multi-tenant hierarchy.
All data is scoped to a tenant via foreign key relationships.

### User
[VERIFY:AE-015] Users belong to a single tenant and have role-based access
(ADMIN, VIEWER, EDITOR, ANALYST). Passwords are hashed with bcrypt salt 12.

### DataSource
[VERIFY:AE-016] DataSource stores connection information for external databases.
Connection URIs are stored securely.

### DataPoint
[VERIFY:AE-017] DataPoint uses Decimal(20,6) for metric values to prevent
floating-point precision errors in analytics calculations.

### Pipeline
[VERIFY:AE-018] Pipeline follows state machine: DRAFT -> ACTIVE -> PAUSED -> ARCHIVED.
Invalid transitions are rejected at the service layer.

### Dashboard
Dashboards belong to tenants and are created by users. They contain widgets
and can be shared via embed tokens.

### Widget
Widgets are positioned within dashboards using JSON configuration for
flexible layout management.

### Embed
[VERIFY:AE-019] Embed tokens have expiration dates and are scoped to specific
dashboards within a tenant boundary.

### SyncRun
SyncRun tracks data synchronization operations with status tracking
through PENDING -> RUNNING -> COMPLETED/FAILED.

## Relationships

- Tenant 1:N User, DataSource, Pipeline, Dashboard, Embed
- DataSource 1:N DataPoint, SyncRun
- Dashboard 1:N Widget, Embed
- User 1:N Dashboard (creator)

## Mapping Conventions

[VERIFY:AE-020] All models use @@map for table names and @map for multi-word
column names following snake_case database conventions.

## Cross-References

- See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for ORM configuration
- See [API_CONTRACT.md](./API_CONTRACT.md) for CRUD operations
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for RLS policies
