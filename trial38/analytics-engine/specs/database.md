# Database Specification

## Trial 38 | Analytics Engine

### Overview

PostgreSQL 16 database managed via Prisma 6 ORM. Schema includes six
models with multi-tenant isolation. All tables use snake_case mapping.
Row-Level Security is enforced at the database level.

### VERIFY: AE-DB-01 - Schema Models

Six Prisma models with `@@map` to snake_case table names:

| Model | Table | Description |
|-------|-------|-------------|
| Tenant | tenants | Organization/tenant |
| User | users | Authenticated users |
| Dashboard | dashboards | Analytics dashboards |
| Pipeline | pipelines | Data pipelines |
| PipelineRun | pipeline_runs | Pipeline execution runs |
| Report | reports | Generated reports |

TRACED in: `apps/api/prisma/schema.prisma`

### VERIFY: AE-DB-02 - Enum Types

Four enums with `@map` to snake_case values:

- `UserRole`: ADMIN, EDITOR, VIEWER
- `PipelineStatus`: ACTIVE, PAUSED, FAILED
- `RunStatus`: PENDING, RUNNING, COMPLETED, FAILED
- `ReportFormat`: PDF, CSV, JSON

TRACED in: `apps/api/prisma/schema.prisma`

### VERIFY: AE-DB-03 - Relations

- Tenant hasMany Users, Dashboards, Pipelines
- User belongsTo Tenant
- Dashboard belongsTo Tenant
- Pipeline belongsTo Tenant, hasMany PipelineRuns, hasMany Reports
- PipelineRun belongsTo Pipeline
- Report belongsTo Pipeline

All relations use `onDelete: Cascade` for tenant cleanup.

TRACED in: `apps/api/prisma/schema.prisma`

### VERIFY: AE-DB-04 - Migration Strategy

Single initial migration `00000000000000_init` creates all tables,
enums, indexes, and Row-Level Security policies. Migrations are
stored in `apps/api/prisma/migrations/`.

TRACED in: `apps/api/prisma/migrations/00000000000000_init/migration.sql`

### VERIFY: AE-DB-05 - Performance Indexes

Indexes are created for common query patterns:

- `idx_users_email` on users(email)
- `idx_users_tenant` on users(tenant_id)
- `idx_dashboards_tenant` on dashboards(tenant_id)
- `idx_pipelines_tenant` on pipelines(tenant_id)
- `idx_pipeline_runs_pipeline` on pipeline_runs(pipeline_id)
- `idx_reports_pipeline` on reports(pipeline_id)

TRACED in: `apps/api/prisma/migrations/00000000000000_init/migration.sql`

### VERIFY: AE-DB-06 - Row-Level Security

RLS is enabled and forced on ALL tables via:
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_name FORCE ROW LEVEL SECURITY;
```

This provides defense-in-depth multi-tenant isolation at the DB level.

TRACED in: `apps/api/prisma/migrations/00000000000000_init/migration.sql`

### VERIFY: AE-DB-07 - Seed Data

Seed script creates realistic test data including:
- One tenant
- Three users (admin, editor, viewer) with bcrypt-hashed passwords
- Multiple dashboards with varied configurations
- Pipelines in different states (active, failed, paused)
- Pipeline runs (completed, failed, pending)
- Reports in different formats

Error handling uses `console.error` + `process.exit(1)`, never `console.log`.

TRACED in: `apps/api/prisma/seed.ts`

### VERIFY: AE-DB-08 - Prisma Service

`PrismaService` extends `PrismaClient` and implements `OnModuleInit`.
It calls `$connect()` on module init. The `$executeRaw` method uses
`Prisma.sql` tagged template literals, never `$executeRawUnsafe`.

TRACED in: `apps/api/src/prisma/prisma.service.ts`

---

Cross-references: [auth.md](auth.md), [performance.md](performance.md)
