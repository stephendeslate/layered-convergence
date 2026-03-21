# Analytics Engine — Data Model Specification

## Overview

This document defines the 9 entities in the Analytics Engine data model.
All tables use Row Level Security. See REQUIREMENTS.md for business context
and STATE_MACHINES.md for status field transitions.

## Entities

### Tenant
- VERIFY: AE-DM-TENANT-001 — Tenant entity with id, name, slug (unique), timestamps
- Maps to table: tenants (@@map)
- Has many: Users, Dashboards, DataSources, Pipelines

### User
- VERIFY: AE-DM-USER-001 — User entity with email (unique), passwordHash, role
- Maps to table: users (@@map)
- password_hash column uses @map for snake_case
- Belongs to: Tenant
- Has many: Dashboards, Widgets

### Dashboard
- VERIFY: AE-DM-DASH-001 — Dashboard entity with name, isDefault, tenant/user refs
- Maps to table: dashboards (@@map)
- is_default and tenant_id use @map
- Belongs to: Tenant, User
- Has many: Widgets

### Widget
- VERIFY: AE-DM-WIDG-001 — Widget entity with type, config (JSON), status, position
- Maps to table: widgets (@@map)
- widget_type, dashboard_id, position_x, position_y use @map
- Status field uses WidgetStatus enum
- Belongs to: Dashboard, User

### DataSource
- VERIFY: AE-DM-DS-001 — DataSource entity with connectionType, config (JSON), isActive
- Maps to table: data_sources (@@map)
- connection_type, is_active use @map
- Belongs to: Tenant
- Has many: Pipelines

### Pipeline
- VERIFY: AE-DM-PIPE-001 — Pipeline entity with schedule, isActive, data source ref
- Maps to table: pipelines (@@map)
- data_source_id, is_active use @map
- Belongs to: Tenant, DataSource
- Has many: PipelineRuns

### PipelineRun
- VERIFY: AE-DM-RUN-001 — PipelineRun entity with status, timestamps, error, rowsRead
- Maps to table: pipeline_runs (@@map)
- pipeline_id, started_at, completed_at, error_msg, rows_read use @map
- Status field uses PipelineStatus enum
- Belongs to: Pipeline

### Report
- VERIFY: AE-DM-RPT-001 — Report entity with query, schedule, lastRunAt
- Maps to table: reports (@@map)
- last_run_at uses @map
- Standalone entity (tenant-scoped by tenant_id)

### AuditLog
- VERIFY: AE-DM-AUD-001 — AuditLog entity with action, entity, entityId, metadata
- Maps to table: audit_logs (@@map)
- entity_id, tenant_id, user_id use @map
- Immutable — no update or delete operations

## Enums

- VERIFY: AE-DM-ENUM-001 — Role enum with @@map("role")
- VERIFY: AE-DM-ENUM-002 — PipelineStatus enum with @@map("pipeline_status")
- VERIFY: AE-DM-ENUM-003 — WidgetStatus enum with @@map("widget_status")

## Cross-References

- REQUIREMENTS.md: Entity definitions trace to functional requirements
- STATE_MACHINES.md: PipelineStatus and WidgetStatus transition rules
- API_SPEC.md: CRUD operations on these entities
- SECURITY.md: RLS policies reference tenant_id columns
