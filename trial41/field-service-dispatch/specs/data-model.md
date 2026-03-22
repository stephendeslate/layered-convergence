# Data Model Specification

## Overview

The FSD data model is designed for multi-tenant field service operations.
All entities use UUID primary keys and include tenant isolation.
See [architecture.md](./architecture.md) for structural overview.

## Entities

### Tenant

Root entity for multi-tenant isolation. All other entities reference a tenant.

### User

Authentication entity with email, password hash, and role.
Roles: ADMIN, USER, TECHNICIAN, DISPATCHER.

<!-- VERIFY: FD-BCRYPT-SALT — packages/shared/src/constants.ts defines BCRYPT_SALT_ROUNDS = 12 -->
<!-- VERIFY: FD-ALLOWED-ROLES — packages/shared/src/constants.ts excludes ADMIN from registration -->

### WorkOrder

Service requests with the following fields:
- title, description, status, priority (1-5)
- latitude/longitude as Decimal(10,7) — never Float
- address, technician assignment, scheduling dates, notes

Status lifecycle: PENDING -> ASSIGNED -> IN_PROGRESS -> COMPLETED | CANCELLED | FAILED

<!-- VERIFY: FD-WORK-ORDER-SERVICE — apps/api/src/work-order/work-order.service.ts has CRUD -->
<!-- VERIFY: FD-WORK-ORDER-CRUD — apps/api/src/work-order/work-order.controller.ts has full CRUD -->

### Technician

Field worker entity:
- name, email (unique), phone, status, specialties array
- GPS location as Decimal(10,7)

Status values: AVAILABLE, ON_ASSIGNMENT, OFF_DUTY, SUSPENDED

<!-- VERIFY: FD-TECHNICIAN-SERVICE — apps/api/src/technician/technician.service.ts has CRUD -->
<!-- VERIFY: FD-TECHNICIAN-CRUD — apps/api/src/technician/technician.controller.ts has full CRUD -->

### Schedule

Time-slot assignments linking technicians to work orders:
- startTime, endTime, status, notes
- References technicianId and workOrderId

Status values: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED

<!-- VERIFY: FD-SCHEDULE-SERVICE — apps/api/src/schedule/schedule.service.ts has CRUD -->
<!-- VERIFY: FD-SCHEDULE-CRUD — apps/api/src/schedule/schedule.controller.ts has full CRUD -->

### ServiceArea

Geographic coverage zones:
- name, zipCodes array, center point (lat/lng as Decimal(10,7))
- radius as Decimal(10,2), active flag

<!-- VERIFY: FD-SERVICE-AREA-SERVICE — apps/api/src/service-area/service-area.service.ts has CRUD -->
<!-- VERIFY: FD-SERVICE-AREA-CRUD — apps/api/src/service-area/service-area.controller.ts has full CRUD -->

## Indexing Strategy

All models have @@index on tenant FK. Status fields are indexed individually
and as composites with tenantId for filtered queries.

## Enum Mapping

All enums use @@map for snake_case table names and @map on each value.
See [security.md](./security.md) for input validation on enum fields.

## Seed Data

Seed includes error/failure states: FAILED work orders, CANCELLED schedules,
SUSPENDED technicians. Uses BCRYPT_SALT_ROUNDS from shared.

<!-- VERIFY: FD-SEED-BCRYPT — apps/api/prisma/seed.ts imports BCRYPT_SALT_ROUNDS from shared -->
