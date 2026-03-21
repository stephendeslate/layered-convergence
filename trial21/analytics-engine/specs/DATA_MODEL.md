# Data Model

## Overview

The Analytics Engine data model is defined in Prisma 6 schema format and maps to PostgreSQL 16
tables with explicit `@@map` annotations. All models (except Tenant) carry a `tenantId` foreign
key used for row-level security enforcement. The schema uses three enums: Role, PipelineState,
and WidgetType.

## Database Provider

[VERIFY:DM-001] The Prisma schema MUST use PostgreSQL as the database provider.
> Implementation: `prisma/schema.prisma:1` — `provider = "postgresql"`

## Enums

### Role Enum

[VERIFY:DM-002] The Role enum MUST contain exactly VIEWER, EDITOR, ANALYST — no ADMIN role.
> Implementation: `prisma/schema.prisma:13` — Role enum definition

The intentional exclusion of ADMIN from the application-layer Role enum is a security decision.
Administrative operations bypass the application entirely, reducing the attack surface.

### PipelineState Enum

[VERIFY:DM-003] The PipelineState enum MUST define DRAFT, ACTIVE, PAUSED, ARCHIVED states.
> Implementation: `prisma/schema.prisma:20` — PipelineState enum definition

These four states form the pipeline governance model. Transitions between states are validated
by the PipelineService, not by database constraints.

## Entity Definitions

### Tenant

[VERIFY:DM-004] Tenant MUST be the root entity for multi-tenancy with cascading relationships.
> Implementation: `prisma/schema.prisma:43` — Tenant model with relation arrays

| Field | Type | Constraints |
|-------|------|------------|
| id | UUID | @id @default(uuid()) |
| name | String | required |
| slug | String | @unique |
| createdAt | DateTime | @default(now()) |

Tenant is the organizational boundary. All child entities reference Tenant via `tenantId`.

### User

[VERIFY:DM-005] User MUST have tenantId foreign key with @@map("users") annotation.
> Implementation: `prisma/schema.prisma:63` — User model definition

| Field | Type | Constraints |
|-------|------|------------|
| id | UUID | @id @default(uuid()) |
| email | String | @unique |
| name | String | required |
| password | String | hashed, never returned in API responses |
| role | Role | VIEWER, EDITOR, or ANALYST |
| tenantId | UUID | FK to Tenant |

### DataSource

| Field | Type | Constraints |
|-------|------|------------|
| id | UUID | @id @default(uuid()) |
| name | String | required |
| type | String | connection type identifier |
| config | Json | connection parameters |
| tenantId | UUID | FK to Tenant |

### DataPoint

[VERIFY:DM-006] DataPoint.value MUST use Decimal(20,6) type for numeric precision.
> Implementation: `prisma/schema.prisma:95` — `value Decimal @db.Decimal(20, 6)`

| Field | Type | Constraints |
|-------|------|------------|
| id | UUID | @id @default(uuid()) |
| value | Decimal(20,6) | high-precision numeric |
| label | String | human-readable identifier |
| timestamp | DateTime | when the data was recorded |
| dataSourceId | UUID | FK to DataSource |
| tenantId | UUID | FK to Tenant |

### Pipeline

| Field | Type | Constraints |
|-------|------|------------|
| id | UUID | @id @default(uuid()) |
| name | String | required |
| state | PipelineState | default: DRAFT |
| config | Json | pipeline configuration |
| tenantId | UUID | FK to Tenant |

### Dashboard, Widget, Embed, SyncRun

These entities follow the same pattern: UUID primary key, required fields, tenantId FK,
timestamp columns, and `@@map` annotations mapping to snake_case table names.

## DataPoint Service Layer

[VERIFY:DM-007] The DataPoint service MUST handle Decimal values through the Prisma Decimal type.
> Implementation: `src/data-point/data-point.service.ts:1` — Decimal handling in create/findAll

The DataPoint service accepts string representations of decimal values from the API layer
and stores them using Prisma's Decimal type, which maps to PostgreSQL's `DECIMAL(20,6)`.
This preserves precision for financial and scientific calculations.

## Migration Strategy

Schema changes are managed through Prisma Migrate. Each migration is versioned and applied
sequentially. The migration flow:
1. Modify `prisma/schema.prisma`
2. Run `npx prisma migrate dev` to generate migration SQL
3. Review generated SQL for correctness
4. Apply to production via `npx prisma migrate deploy`

## Cross-References

- API contract for data operations: [API_CONTRACT.md](./API_CONTRACT.md)
- Security model for RLS: [SECURITY_MODEL.md](./SECURITY_MODEL.md)
- System architecture: [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)
