# Database Schema

**Project:** analytics-engine
**Layer:** 5 — Monorepo
**Version:** 1.0.0
**Cross-references:** api.md, auth.md

---

## Overview

The database uses PostgreSQL 16 with Prisma 6 as the ORM. All models
use @@map for snake_case table names and @map for multi-word column names.
Row Level Security is enabled and forced on every table.

## Schema Design

The schema follows a multi-tenant architecture with tenant_id as a
foreign key on all domain entities. All models and enums include @@map
annotations to maintain consistent snake_case naming in the database.

- VERIFY: AE-DB-001 — Schema defines generator and datasource
- VERIFY: AE-DB-002 — Tenant model with @@map("tenants")
- VERIFY: AE-DB-003 — User model with @@map("users") and @map on multi-word columns
- VERIFY: AE-DB-005 — Dashboard model with @@map("dashboards")
- VERIFY: AE-DB-006 — Widget model with @@map("widgets")
- VERIFY: AE-DB-008 — Pipeline model with @@map("pipelines")
- VERIFY: AE-DB-010 — Report model with @@map("reports")

## Migration Strategy

Migrations are stored in prisma/migrations/ with SQL files that create
tables, indexes, foreign keys, and enable Row Level Security.

- VERIFY: AE-MIG-001 — Initial migration creates all tables with proper types
- VERIFY: AE-MIG-002 — RLS enabled and forced on all tables

## Seed Data

The seed script creates a complete tenant with users, dashboards,
widgets, pipelines in various statuses (including FAILED state),
and reports (including FAILED state) for development and testing.

- VERIFY: AE-SEED-001 — Seed creates tenant, users, entities with error states

## Model Relationships

- Tenant -> Users (1:N)
- Tenant -> Dashboards (1:N)
- Tenant -> Pipelines (1:N)
- Tenant -> Reports (1:N)
- User -> Dashboards (1:N, created_by)
- User -> Pipelines (1:N, created_by)
- Dashboard -> Widgets (1:N)

## Column Naming Convention

All multi-word columns use @map for snake_case:
- passwordHash -> password_hash
- tenantId -> tenant_id
- createdById -> created_by_id
- createdAt -> created_at
- updatedAt -> updated_at
- dashboardId -> dashboard_id
- lastRunAt -> last_run_at
- outputUrl -> output_url
- fileSize -> file_size
- generatedAt -> generated_at

## Enum Mapping

All enums use @@map for snake_case type names in PostgreSQL:
- UserRole -> user_role
- WidgetType -> widget_type
- PipelineStatus -> pipeline_status
- ReportType -> report_type
- ReportStatus -> report_status
