# Database Specification

## Overview

The database layer uses Prisma 6 ORM with PostgreSQL 16. All models use `@@map()`
directives to map camelCase model names to snake_case table names.

## Schema Design

### Tables

| Table | Primary Key | Tenant-Scoped | Notes |
|-------|------------|---------------|-------|
| tenants | uuid | N/A | Root entity |
| users | uuid | Yes | Composite unique on email+tenantId |
| work_orders | string | Yes | Custom IDs via generateId() |
| technicians | string | Yes | Custom IDs via generateId() |
| schedules | uuid | Via workOrder | FK to work_orders and technicians |
| service_areas | uuid | Yes | Simple name + tenant reference |

### Enums

All enums use `@@map()` for snake_case DB representation and `@map()` on each value.

- VERIFY: FD-DB-001 — user_role enum maps ADMIN, DISPATCHER, TECHNICIAN, VIEWER
- VERIFY: FD-DB-002 — work_order_status enum maps OPEN, IN_PROGRESS, COMPLETED, CANCELLED, FAILED

### GPS Coordinates

- VERIFY: FD-DB-005 — Coordinates use Decimal @db.Decimal(10,7), NEVER Float

### Indexes

Composite indexes on:
- `(tenant_id, status)` on work_orders and technicians
- `(work_order_id, technician_id)` on schedules
- `tenant_id` on all tenant-scoped tables

## Row Level Security

- VERIFY: FD-DB-006 — All tables have ENABLE ROW LEVEL SECURITY and FORCE ROW LEVEL SECURITY

## Seed Data

- VERIFY: FD-SEED-001 — Database seed script with error states and console.error handling

The seed script creates:
- 1 tenant (Acme Field Services)
- 3 users (admin, dispatcher, technician)
- 3 technicians with GPS coordinates
- 4 work orders including FAILED and CANCELLED error states
- 1 schedule linking work order to technician
- 2 service areas

## Migration

Single initial migration (`00000000000000_init`) containing:
- Enum creation
- Table creation with all constraints
- Index creation
- Foreign key constraints
- RLS enablement

## Data Integrity

- Foreign keys with ON DELETE RESTRICT
- NOT NULL on required fields
- DEFAULT values for status fields and timestamps
- Composite unique constraint on users(email, tenant_id)
