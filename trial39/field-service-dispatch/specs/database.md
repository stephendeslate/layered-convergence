# Database Specification

## Overview

The database layer uses Prisma 6 ORM with PostgreSQL 16. All models
use snake_case table names via @@map. All enums use @map for database
values. Row Level Security is enabled on all tables.

## Prisma Service

<!-- VERIFY: FD-DB-001 — Prisma service with lifecycle hooks -->

The Prisma service extends PrismaClient and implements OnModuleInit
and OnModuleDestroy lifecycle hooks for proper connection management.

<!-- VERIFY: FD-DB-002 — Prisma module with global scope -->

The Prisma module is marked as @Global so all feature modules can
inject PrismaService without explicit imports.

## Models

The schema defines 6 models: Tenant, User, WorkOrder, Technician,
Schedule, and ServiceArea.

### GPS Coordinates

GPS fields use Decimal(10,7) precision for latitude and longitude.
This provides 7 decimal places of precision, accurate to approximately
1.1 centimeters. Float types are explicitly prohibited for GPS data.

### Indexes

All tenant-scoped foreign keys have @@index directives. Status columns
on WorkOrder and Technician have individual indexes. Composite indexes
exist on (tenantId, status) for both WorkOrder and Technician, plus
(workOrderId, technicianId) on Schedule.

## Relationships

<!-- VERIFY: FD-DB-005 — N+1 prevention via eager loading with include -->

Related data is fetched using Prisma include directives to prevent
N+1 query patterns. Detail endpoints use include for schedules.

## State Machine

<!-- VERIFY: FD-SHARED-003 — Work order state machine transitions -->

Work order status transitions follow a strict state machine:

| Current | Allowed Transitions |
|---------|-------------------|
| OPEN | IN_PROGRESS, CANCELLED |
| IN_PROGRESS | COMPLETED, FAILED, OPEN |
| COMPLETED | (none) |
| CANCELLED | OPEN |
| FAILED | OPEN |

## Seeding

<!-- VERIFY: FD-SEED-001 — Database seed with error states and console.error handling -->

The seed script creates a demo tenant with users across all roles,
technicians in various states, work orders including FAILED and
CANCELLED error states, schedules, and service areas. Error handling
uses console.error and process.exit(1).

## Cross-References

- See [API](./api.md) for how models are exposed via endpoints
- See [Performance](./performance.md) for index strategy details
