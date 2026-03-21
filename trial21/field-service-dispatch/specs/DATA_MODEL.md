# Data Model

## Overview

The data model supports multi-tenant field service operations with 8 primary
entities. All company-scoped tables include a companyId foreign key for tenant
isolation, enforced by Row-Level Security (RLS) policies. See
[SECURITY_MODEL.md](SECURITY_MODEL.md) for RLS details.

## Enumerations

[VERIFY:DM-001] The Role enum SHALL define ADMIN, DISPATCHER, and TECHNICIAN
values. ADMIN is present in the schema but blocked at registration by both
DTO validation (@IsIn) and service-layer defense-in-depth checks.
→ Implementation: backend/prisma/schema.prisma:11

[VERIFY:DM-002] The TechnicianAvailability enum SHALL define AVAILABLE, ON_JOB,
and OFF_DUTY values to track field technician availability status.
→ Implementation: backend/prisma/schema.prisma:18

[VERIFY:DM-003] The WorkOrderStatus enum SHALL define PENDING, ASSIGNED,
IN_PROGRESS, COMPLETED, ON_HOLD, and INVOICED values. These states form
a directed graph enforced by the work order state machine. See
[API_CONTRACT.md](API_CONTRACT.md) AC-008 for transition validation.
→ Implementation: backend/prisma/schema.prisma:25

## Entity Definitions

### Company
[VERIFY:DM-004] The Company model SHALL have fields: id (UUID), name (String),
slug (String, unique). Company serves as the tenant root for all scoped entities.
All related models reference Company via a companyId foreign key. The table
maps to "companies" via @@map.
→ Implementation: backend/prisma/schema.prisma:42

### User
[VERIFY:DM-005] The User model SHALL have fields: id (UUID), email (String, unique),
passwordHash (String, @map("password_hash")), role (Role enum), companyId (UUID FK).
Each User may optionally have one linked Technician profile.
→ Implementation: backend/prisma/schema.prisma:61

### Customer
Fields: id (UUID), name, email, phone, address, companyId (UUID FK). Customers
are company-scoped and linked to work orders via WorkOrder.customerId.

### WorkOrder
Fields: id (UUID), title, description, status (WorkOrderStatus, default PENDING),
priority (Int, default 3, range 1-5), customerId (UUID FK), technicianId (UUID FK,
nullable), scheduledAt (DateTime, nullable), completedAt (DateTime, nullable),
companyId (UUID FK). Relations to Customer, Technician, Route[], Invoice[].

### Technician
Fields: id (UUID), userId (UUID FK, unique), skills (String[]), availability
(TechnicianAvailability, default AVAILABLE), companyId (UUID FK). One-to-one
relation with User, one-to-many with WorkOrder, Route, GpsEvent.

### Invoice
[VERIFY:DM-006] The Invoice model SHALL use Decimal(12,2) for amount, tax, and
total fields to ensure precise monetary arithmetic. The total is computed
server-side as amount + tax using Prisma Decimal.add().
→ Implementation: backend/src/invoice/invoice.service.ts:43

### Route
Fields: id (UUID), technicianId (UUID FK), workOrderId (UUID FK), distance (Float),
estimatedMinutes (Int), companyId (UUID FK).

### GpsEvent
Fields: id (UUID), technicianId (UUID FK), lat (Float), lng (Float),
timestamp (DateTime, default now()), companyId (UUID FK). The createdAt
field is separate from timestamp to allow backdated event recording.

## Column Mapping

All foreign key columns use @map annotations to produce snake_case names in the
database (e.g., companyId -> company_id, technicianId -> technician_id). This
follows PostgreSQL naming conventions while keeping camelCase in application code.
Table names use @@map for snake_case (e.g., WorkOrder -> work_orders).

## Indexes

- User.email: unique index
- Company.slug: unique index
- Technician.userId: unique index (one-to-one with User)
- All companyId foreign keys are indexed by default via Prisma relations
