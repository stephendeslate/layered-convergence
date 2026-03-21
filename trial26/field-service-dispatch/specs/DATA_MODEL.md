# Data Model: Field Service Dispatch

## Overview

The Field Service Dispatch data model consists of 8 entities organized
around work order management and field service operations.

## Entity Definitions

### Company
[VERIFY:FD-014] Company entity serves as the multi-tenant root.
All operational data is scoped to a company via foreign keys.

### User
[VERIFY:FD-015] Users belong to a company with DISPATCHER or TECHNICIAN
roles. ADMIN assigned only by database administrators.
Passwords hashed with bcrypt salt 12.

### Customer
[VERIFY:FD-016] Customers belong to a company and have associated work
orders and invoices for service tracking.

### Technician
[VERIFY:FD-017] Technicians have specialties array and availability status.
GPS coordinates use Float type (lastLat, lastLng) for location tracking.

### WorkOrder
[VERIFY:FD-018] Work orders follow state machine: CREATED -> ASSIGNED ->
IN_PROGRESS -> COMPLETED/CANCELLED. EstimatedCost uses Decimal(10,2).

### Route
[VERIFY:FD-019] Routes track technician dispatch: PLANNED -> IN_PROGRESS ->
COMPLETED with scheduled and completion timestamps.

### GpsEvent
[VERIFY:FD-020] GPS events record technician location with Float for
latitude, longitude, and accuracy fields.

### Invoice
[VERIFY:FD-021] Invoices follow billing cycle: DRAFT -> SENT -> PAID/OVERDUE.
Amount, tax, and total use Decimal(10,2) for precision.

## Relationships

- Company 1:N User, Customer, Technician, WorkOrder, Route, Invoice
- Customer 1:N WorkOrder, Invoice
- Technician 1:N WorkOrder, GpsEvent, Route
- WorkOrder N:1 Customer, N:1 Technician

## Mapping Conventions

[VERIFY:FD-022] All models use @@map for snake_case table names.
Multi-word columns use @map (e.g., company_id, estimated_cost).

## Cross-References

- See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for ORM setup
- See [API_CONTRACT.md](./API_CONTRACT.md) for CRUD operations
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for RLS policies
