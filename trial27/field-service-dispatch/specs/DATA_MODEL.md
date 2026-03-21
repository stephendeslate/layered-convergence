# Data Model: Field Service Dispatch

## Overview

The data model consists of 8 entities organized around company-scoped
multi-tenancy with work order lifecycle management.

## Entity Definitions

[VERIFY:FD-014] Company is the top-level tenant entity. All other entities
reference a company for tenant isolation. Fields: id, name, domain (unique),
createdAt, updatedAt.

[VERIFY:FD-015] User represents authenticated users with role-based access.
Fields: id, email (unique), password (hashed), name, role (enum), companyId,
createdAt, updatedAt.

[VERIFY:FD-016] Customer represents service recipients within a company.
Fields: id, name, email, phone, address, companyId, createdAt, updatedAt.
Customers have many WorkOrders and Invoices.

[VERIFY:FD-017] Technician represents field workers with skills and availability.
Fields: id, name, email (unique), phone, skills (string array), availability
(boolean), companyId, createdAt, updatedAt. Technicians have many WorkOrders,
Routes, and GpsEvents.

[VERIFY:FD-018] WorkOrder is the core operational entity with a state machine.
Fields: id, title, description, status (enum), priority, scheduledAt,
completedAt, estimatedCost (Decimal 20,2), actualCost (Decimal 20,2),
companyId, customerId, technicianId, routeId, createdAt, updatedAt.

[VERIFY:FD-019] Route represents a technician's daily planned schedule.
Fields: id, date, status (enum), companyId, technicianId, createdAt,
updatedAt. Routes contain multiple WorkOrders.

[VERIFY:FD-020] GpsEvent captures real-time technician location data.
Fields: id, latitude (Decimal 10,7), longitude (Decimal 10,7), speed
(Decimal 6,2), heading (Decimal 5,2), technicianId, recordedAt.

## Financial Precision

[VERIFY:FD-023] All financial amounts use Decimal(20,2) type for exact
arithmetic. Invoice has amount, tax, and total fields all as Decimal.
WorkOrder has estimatedCost and actualCost as optional Decimals. Float
is never used for monetary values.

## State Machines

### WorkOrder Status
```
CREATED -> ASSIGNED -> EN_ROUTE -> IN_PROGRESS -> COMPLETED
     \         \          \            \
      -> CANCELLED  CANCELLED  CANCELLED  CANCELLED
```

### Route Status
```
PLANNED -> ACTIVE -> COMPLETED
```

### Invoice Status
```
DRAFT -> SENT -> PAID
              -> OVERDUE -> PAID
                         -> VOID
     -> VOID
```

## Cross-References

- See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for module mapping
- See [API_CONTRACT.md](./API_CONTRACT.md) for CRUD endpoints
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for RLS policies
