# Data Model Specification

## Overview

The data model uses Prisma 6 with PostgreSQL 16. All models use `@@map` for
snake_case table names. Enums use `@@map` and `@map` for snake_case values.
Row Level Security is enabled on all tables.

## VERIFY:AE-DATA-001 -- Prisma Schema

### Models

**Tenant** (`@@map("tenants")`)
- `id` -- UUID, default `uuid()`
- `name` -- String, max 100
- `users` -- Relation to User[]
- `dashboards` -- Relation to Dashboard[]
- `dataSources` -- Relation to DataSource[]
- `events` -- Relation to Event[]
- `pipelines` -- Relation to Pipeline[]

**User** (`@@map("users")`)
- `id` -- UUID
- `email` -- String, unique
- `passwordHash` -- String, `@map("password_hash")`
- `role` -- UserRole enum
- `tenantId` -- String, `@map("tenant_id")`
- `tenant` -- Relation to Tenant
- `dashboards` -- Relation to Dashboard[]
- `@@index([tenantId])`

**Dashboard** (`@@map("dashboards")`)
- `id` -- UUID
- `name` -- String, max 100
- `tenantId`, `userId` -- Foreign keys
- `createdAt`, `updatedAt` -- DateTime
- `@@index([tenantId])`

**DataSource** (`@@map("data_sources")`)
- `id` -- UUID
- `name` -- String, max 100
- `type` -- DataSourceType enum
- `connectionString` -- String, `@map("connection_string")`
- `status` -- DataSourceStatus enum, default ACTIVE
- `monthlyCost` -- Decimal(12,2), optional
- `tenantId` -- Foreign key
- `@@index([tenantId, status])`

**Event** (`@@map("events")`)
- `id` -- UUID
- `type` -- EventType enum
- `payload` -- Json, default `{}`
- `status` -- EventStatus enum, default PENDING
- `source` -- String, max 255
- `tenantId` -- Foreign key
- `createdAt` -- DateTime
- `@@index([tenantId, status])`

**Pipeline** (`@@map("pipelines")`)
- `id` -- UUID
- `name` -- String, max 100
- `status` -- PipelineStatus enum, default INACTIVE
- `schedule` -- String, optional (cron expression)
- `processingCost` -- Decimal(12,2), optional
- `tenantId` -- Foreign key
- `@@index([tenantId, status])`

### Enums

All enums use `@@map` for the enum type and `@map` on each value:

- `UserRole`: ADMIN, USER, VIEWER, EDITOR
- `DataSourceType`: POSTGRESQL, MYSQL, REST_API, S3_BUCKET, KAFKA
- `DataSourceStatus`: ACTIVE, INACTIVE, ERROR
- `EventType`: CLICK, PAGE_VIEW, API_CALL, CUSTOM, ERROR
- `EventStatus`: PENDING, PROCESSED, FAILED, ARCHIVED
- `PipelineStatus`: ACTIVE, INACTIVE, RUNNING, FAILED

## VERIFY:AE-DATA-002 -- Prisma Service

`PrismaService` extends `PrismaClient` and implements `OnModuleInit` and
`OnModuleDestroy` for lifecycle management. Connects on module init and
disconnects on module destroy.

## Row Level Security

The migration includes `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` and
`ALTER TABLE ... FORCE ROW LEVEL SECURITY` on all tenant-scoped tables.

## Indexes

Composite indexes on `(tenantId, status)` for data_sources, events, and
pipelines to support filtered tenant-scoped queries. Simple index on
`tenantId` for users and dashboards.

## Decimal Fields

`monthlyCost` (data_sources) and `processingCost` (pipelines) use
`@db.Decimal(12,2)` for precise monetary values.

## VERIFY:AE-RAW-001 -- Raw SQL Operations

`EventsService.countByTenant` uses `$executeRaw(Prisma.sql\`...\`)` for bulk
status updates on archived events. All raw SQL uses parameterized queries via
`Prisma.sql` tagged template literals to prevent SQL injection.
