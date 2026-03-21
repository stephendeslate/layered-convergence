# Data Model — Analytics Engine

## Overview

The data model consists of 9 entities organized around multi-tenant analytics. All models use `@@map` for PostgreSQL table names and `@map` for multi-word column names. Monetary and metric fields use Decimal type.

See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for RLS policies that enforce tenant isolation on each table.

## Entity Definitions

### Tenant
- Primary key: UUID
- Fields: name, slug (unique), timestamps
- Relations: has many Users, DataSources, Pipelines, Dashboards

### User
- Primary key: UUID
- Fields: email (unique), password (bcrypt hash), name, role, tenant_id
- Relations: belongs to Tenant, has many Dashboards

### DataSource
- Primary key: UUID
- Fields: name, type (enum), connection_uri, tenant_id, is_active, last_synced_at
- Relations: belongs to Tenant, has many DataPoints, SyncRuns

### DataPoint
- Primary key: UUID
- Fields: data_source_id, metric_name, metric_value (Decimal), dimensions (JSON), recorded_at

### Pipeline
- Primary key: UUID
- Fields: name, description, status (enum), config (JSON), tenant_id
- State machine: DRAFT → ACTIVE → PAUSED → ARCHIVED

### Dashboard
- Primary key: UUID
- Fields: title, tenant_id, owner_id, is_public
- Relations: belongs to Tenant and User, has many Widgets, Embeds

### Widget
- Primary key: UUID
- Fields: title, type (enum), config (JSON), position_x, position_y, width, height, dashboard_id

### Embed
- Primary key: UUID
- Fields: token (unique), dashboard_id, expires_at, is_active

### SyncRun
- Primary key: UUID
- Fields: pipeline_id, data_source_id, status (enum), records_processed (Decimal), error_message, started_at, completed_at

## Verification Tags

[VERIFY:DM-001] All Prisma models use @@map for table names and @map for multi-word columns.
> Implementation: `backend/prisma/schema.prisma`

[VERIFY:DM-002] Role enum defines ADMIN, VIEWER, EDITOR, ANALYST — registration excludes ADMIN via DTO validation.
> Implementation: `backend/prisma/schema.prisma` (enum) + `backend/src/auth/dto/register.dto.ts` (@IsIn)

[VERIFY:DM-003] PipelineStatus enum implements DRAFT, ACTIVE, PAUSED, ARCHIVED states.
> Implementation: `backend/prisma/schema.prisma`

[VERIFY:DM-004] SyncRunStatus enum implements PENDING, RUNNING, COMPLETED, FAILED states.
> Implementation: `backend/prisma/schema.prisma`

[VERIFY:DM-005] DataSource entity stores connection metadata with type discriminator.
> Implementation: `backend/prisma/schema.prisma` (DataSource model)

[VERIFY:DM-006] DataPoint metric_value uses Decimal type (not Float).
> Implementation: `backend/prisma/schema.prisma` (DataPoint model)

[VERIFY:DM-007] SyncRun records_processed uses Decimal type (not Float).
> Implementation: `backend/prisma/schema.prisma` (SyncRun model)

## Cross-References

- See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for state machine enforcement logic
- See [API_CONTRACT.md](./API_CONTRACT.md) for how entities map to API endpoints
