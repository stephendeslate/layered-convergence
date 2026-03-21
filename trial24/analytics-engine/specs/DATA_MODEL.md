# Data Model — Analytics Engine

## Overview

The data model consists of 9 entities organized around multi-tenant isolation. Every entity
either belongs directly to a Tenant or is reachable through a tenant-scoped parent.

## Entity Inventory

| Entity | Table Name | Tenant-Scoped | State Machine |
|--------|-----------|---------------|---------------|
| Tenant | tenants | Root | No |
| User | users | Yes (tenant_id) | No |
| DataSource | data_sources | Yes (tenant_id) | No |
| DataPoint | data_points | Yes (tenant_id) | No |
| Pipeline | pipelines | Yes (tenant_id) | Yes (PipelineStatus) |
| Dashboard | dashboards | Yes (tenant_id) | No |
| Widget | widgets | Via Dashboard | No |
| Embed | embeds | Yes (tenant_id) | No |
| SyncRun | sync_runs | Yes (tenant_id) | Yes (SyncRunStatus) |

## Naming Conventions

All Prisma models use `@@map` to define explicit PostgreSQL table names in snake_case. This
ensures consistency between the ORM layer and database queries.

[VERIFY:DM-001] All Prisma models use @@map for explicit table name mapping.
> Implementation: `backend/prisma/schema.prisma:51`

Multi-word column names use `@map` to convert camelCase field names to snake_case column names
in the database, maintaining PostgreSQL naming conventions.

[VERIFY:DM-002] All multi-word columns use @map for snake_case database columns.
> Implementation: `backend/prisma/schema.prisma:43`

## Precision Requirements

DataPoint values require high precision for analytics calculations. The Decimal type with
20 digits and 6 decimal places ensures no loss of precision in aggregations.

[VERIFY:DM-003] DataPoint.value uses Decimal(20,6) — no Float on metric fields.
> Implementation: `backend/prisma/schema.prisma:86`

The DataPoint service handles Decimal values correctly when creating records, ensuring the
string-to-Decimal conversion preserves full precision.

[VERIFY:DM-004] DataPoint service creates records with Decimal precision preserved.
> Implementation: `backend/src/data-point/data-point.service.ts:3`

## Query Patterns

All queries that filter by composite keys (id + tenantId) use findFirst with justification
comments explaining why findFirst is chosen over findUnique.

[VERIFY:DM-005] All findFirst calls include justification comments explaining the choice.
> Implementation: `backend/src/pipeline/pipeline.service.ts:4`

## Enumerations

Three enums define the domain vocabulary:

- **Role**: VIEWER, EDITOR, ANALYST (no ADMIN — see [SECURITY_MODEL.md](SECURITY_MODEL.md))
- **PipelineStatus**: DRAFT, ACTIVE, PAUSED, ARCHIVED
- **SyncRunStatus**: PENDING, RUNNING, SUCCESS, FAILED

## Relationships

- Tenant -> User (1:N)
- Tenant -> DataSource (1:N)
- Tenant -> Pipeline (1:N)
- Tenant -> Dashboard (1:N)
- Tenant -> Embed (1:N)
- DataSource -> DataPoint (1:N)
- DataSource -> SyncRun (1:N)
- Dashboard -> Widget (1:N)
- Dashboard -> Embed (1:N)

## Cross-References

- **PRODUCT_VISION.md**: Defines the business entities modeled here
- **API_CONTRACT.md**: Documents CRUD operations on these entities
- **SECURITY_MODEL.md**: Specifies RLS policies applied to these tables
