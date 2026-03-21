# Data Model — Field Service Dispatch

## Overview

The data model uses Prisma 6 with PostgreSQL 16. All entities are scoped to a Company
for multi-tenant isolation. Row-Level Security is enforced at the database level.

See also: [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md), [API_CONTRACT.md](API_CONTRACT.md)

## Entities

### Company
- Root multi-tenant entity
- Fields: id (UUID), name, createdAt, updatedAt
- All other entities reference Company via companyId foreign key

### User
- Authentication identity belonging to a Company
- Fields: id, email (unique), password (hashed), role (enum), companyId
- Roles: ADMIN, DISPATCHER, TECHNICIAN, MANAGER

### Customer
- Service recipient belonging to a Company
- Fields: id, name, email, phone, address, companyId

### Technician
- Field worker belonging to a Company
- Fields: id, name, specialty, isAvailable (boolean), companyId

### WorkOrder
- Service request tracking work from creation to completion
- Fields: id, title, description, status (enum), priority (enum), customerId, technicianId (nullable), scheduledAt (nullable), completedAt (nullable), companyId
- Status enum: PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED
- Priority enum: LOW, MEDIUM, HIGH, URGENT

### Route
- Planned service route for a technician on a date
- Fields: id, name, date, technicianId, companyId

### GpsEvent
- Real-time location report from a technician
- Fields: id, latitude (Decimal 10,6), longitude (Decimal 10,6), timestamp, technicianId, companyId

### Invoice
- Payment record for completed work
- Fields: id, amount (Decimal 20,2), currency, workOrderId, customerId, paidAt (nullable), companyId

## Conventions

- [VERIFY:FD-DM-001] @@map on all models for table names -> Implementation: apps/api/prisma/schema.prisma:3
- [VERIFY:FD-DM-002] @map on multi-word columns -> Implementation: apps/api/prisma/schema.prisma:4
- [VERIFY:FD-DM-003] GPS coordinates use Decimal(10,6) precision -> Implementation: apps/api/prisma/schema.prisma:5
- [VERIFY:FD-DM-004] Invoice amount uses Decimal(20,2) precision -> Implementation: apps/api/prisma/schema.prisma:8

## State Machine

### Work Order Transitions
```
PENDING    -> ASSIGNED, CANCELLED
ASSIGNED   -> IN_PROGRESS, CANCELLED
IN_PROGRESS -> COMPLETED, CANCELLED
COMPLETED  -> (terminal)
CANCELLED  -> (terminal)
```

## Indexes and Constraints

- User.email has unique constraint
- All foreign keys have implicit indexes
- companyId indexed on all tenant-scoped tables for RLS performance
