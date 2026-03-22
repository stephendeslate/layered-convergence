# Data Model Specification

## Overview
The data model uses Prisma 6 ORM with PostgreSQL 16. All models use @@map for
snake_case table names. All enums use @@map with @map on individual values.

## Models

### Tenant
- id (UUID, PK), name (VARCHAR 255), slug (VARCHAR 100, unique)
- Has many: users, events, dashboards, dataSources, pipelines
- @@map("tenants")

### User
- id (UUID, PK), email (VARCHAR 255, unique), passwordHash (VARCHAR 255), role (UserRole)
- tenantId (FK -> Tenant)
- @@index on tenantId, email
- @@map("users")

### Event
- id (UUID, PK), type (EventType), status (EventStatus), payload (JSON), source (VARCHAR 255)
- tenantId (FK -> Tenant)
- @@index on tenantId, status, (tenantId+status), type
- @@map("events")

### Dashboard
- id (UUID, PK), name (VARCHAR 255), description (TEXT), config (JSON), isPublic (BOOLEAN)
- tenantId (FK -> Tenant), userId (FK -> User)
- @@index on tenantId, userId, (tenantId+userId)
- @@map("dashboards")

### DataSource
- id (UUID, PK), name (VARCHAR 255), type (DataSourceType), status (DataSourceStatus)
- connectionUri (VARCHAR 500), config (JSON), monthlyCost (Decimal(12,2))
- tenantId (FK -> Tenant)
- @@index on tenantId, status, (tenantId+status)
- @@map("data_sources")

### Pipeline
- id (UUID, PK), name (VARCHAR 255), description (TEXT), status (PipelineStatus)
- schedule (VARCHAR 100), config (JSON), processingCost (Decimal(12,2))
- dataSourceId (FK -> DataSource), tenantId (FK -> Tenant)
- @@index on tenantId, status, dataSourceId, (tenantId+status)
- @@map("pipelines")

## Enums
All enums @@map to snake_case names and individual values have @map annotations.
- UserRole: ADMIN, USER, VIEWER, EDITOR → @@map("user_role")
- EventType: CLICK, PAGE_VIEW, API_CALL, CUSTOM, ERROR → @@map("event_type")
- EventStatus: PENDING, PROCESSED, FAILED, ARCHIVED → @@map("event_status")
- PipelineStatus: ACTIVE, PAUSED, FAILED, DISABLED → @@map("pipeline_status")
- DataSourceType: POSTGRESQL, MYSQL, REST_API, CSV, S3 → @@map("data_source_type")
- DataSourceStatus: CONNECTED, DISCONNECTED, ERROR → @@map("data_source_status")

## Money Fields
monthlyCost (DataSource) and processingCost (Pipeline) use Decimal @db.Decimal(12,2).
Never use Float for monetary values.

### VERIFY:AE-DATA-001 — Seed creates tenant, users, events (including FAILED), dashboards, data sources (including ERROR), pipelines (including FAILED)
### VERIFY:AE-DATA-002 — PrismaService implements OnModuleInit and OnModuleDestroy lifecycle hooks

## Migrations
Migration 0001_init creates all tables, indexes, foreign keys, and enables RLS.
Row Level Security is enabled and forced on all tables.

## Test Coverage
### VERIFY:AE-TEST-002 — Dashboard unit tests cover CRUD operations and NotFoundException
### VERIFY:AE-TEST-003 — Event unit tests cover CRUD, pagination clamping, NotFoundException
### VERIFY:AE-TEST-005 — Event integration tests use supertest with auth token
