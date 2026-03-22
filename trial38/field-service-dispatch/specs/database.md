# Database Specification

## Overview

The database layer uses Prisma 6 ORM with PostgreSQL 16. All models use
snake_case table names via @@map, and all enums use @map for database
column values.

## Schema

<!-- VERIFY: FD-DB-001 — Prisma schema generator/datasource -->
<!-- VERIFY: FD-DB-002 — Tenant model with @@map -->
<!-- VERIFY: FD-DB-003 — User model with role enum -->
<!-- VERIFY: FD-DB-005 — Technician model Decimal GPS -->
<!-- VERIFY: FD-DB-006 — Schedule model links work orders to technicians -->
<!-- VERIFY: FD-DB-008 — All models use @@map -->

## Models

### Tenant

| Field | Type | Notes |
|-------|------|-------|
| id | String @id @default(uuid()) | Primary key |
| name | String | Tenant display name |
| slug | String @unique | URL-safe identifier |
| createdAt | DateTime | Auto-set |
| updatedAt | DateTime | Auto-updated |

Table name: `tenants` (@@map)

### User

| Field | Type | Notes |
|-------|------|-------|
| id | String @id @default(uuid()) | Primary key |
| email | String | Login credential |
| passwordHash | String | bcrypt hash |
| role | UserRole | ADMIN, DISPATCHER, TECHNICIAN, VIEWER |
| tenantId | String | Foreign key to Tenant |

Table name: `users` (@@map)
Unique constraint: @@unique([email, tenantId])

### WorkOrder

| Field | Type | Notes |
|-------|------|-------|
| id | String @id @default(uuid()) | Primary key |
| title | String | Work order title |
| description | String? | Optional details |
| status | WorkOrderStatus | OPEN, IN_PROGRESS, COMPLETED, CANCELLED, FAILED |
| priority | WorkOrderPriority | LOW, MEDIUM, HIGH, URGENT |
| tenantId | String | Foreign key to Tenant |
| createdAt | DateTime | Auto-set |
| updatedAt | DateTime | Auto-updated |

Table name: `work_orders` (@@map)

### Technician

| Field | Type | Notes |
|-------|------|-------|
| id | String @id @default(uuid()) | Primary key |
| name | String | Full name |
| email | String | Contact email |
| specialty | String | T38: HVAC, Electrical, Plumbing, General |
| status | TechnicianStatus | AVAILABLE, BUSY, OFF_DUTY, INACTIVE |
| latitude | Decimal @db.Decimal(10, 7) | GPS latitude (NEVER Float) |
| longitude | Decimal @db.Decimal(10, 7) | GPS longitude (NEVER Float) |
| tenantId | String | Foreign key to Tenant |

Table name: `technicians` (@@map)

### Schedule

| Field | Type | Notes |
|-------|------|-------|
| id | String @id @default(uuid()) | Primary key |
| workOrderId | String | Foreign key to WorkOrder |
| technicianId | String | Foreign key to Technician |
| scheduledAt | DateTime | Appointment timestamp |
| tenantId | String | Foreign key to Tenant |

Table name: `schedules` (@@map)

## Row Level Security

All tables have RLS enabled and forced. Policies use the session
variable `app.tenant_id` set by the Prisma service before each
multi-tenant query.

## Performance Indexes

- `work_orders(tenant_id, status)` — Filter by tenant and status
- `work_orders(tenant_id, created_at)` — Sort by creation date
- `technicians(tenant_id, status)` — Filter by availability
- `schedules(work_order_id)` — Join optimization
- `schedules(technician_id)` — Join optimization

## Seed Data

<!-- VERIFY: FD-SEED-001 — Seed data with CANCELLED and FAILED work orders -->

The seed script creates one tenant (Metro Field Services), three users,
four technicians covering all statuses, five work orders including
CANCELLED and FAILED states, and two schedules.

## Cross-References

- [Authentication Specification](./auth.md) — User model and role enum usage
- [API Specification](./api.md) — Service layer interactions with Prisma models
