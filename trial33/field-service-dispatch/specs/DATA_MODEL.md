# Field Service Dispatch — Data Model Specification

## Overview

This document defines the 8 entities in the Field Service Dispatch data model.
All tables use Row Level Security. See REQUIREMENTS.md for business context
and STATE_MACHINES.md for status field transitions.

## Entities

### Tenant
- VERIFY: FD-DM-TENANT-001 — Tenant entity with id, name, slug (unique), timestamps
- Maps to table: tenants (@@map)
- Has many: Users, WorkOrders, ServiceLocations

### User
- VERIFY: FD-DM-USER-001 — User entity with email (unique), passwordHash, role
- Maps to table: users (@@map)
- password_hash, tenant_id use @map for snake_case
- Belongs to: Tenant
- Has one: TechnicianProfile (optional)
- Has many: WorkOrders, WorkOrderNotes

### TechnicianProfile
- VERIFY: FD-DM-TECH-001 — TechnicianProfile with skills (string[]), availability, GPS
- Maps to table: technician_profiles (@@map)
- user_id uses @map; latitude/longitude as Decimal(10,7)
- Belongs to: User (1:1)
- Has many: WorkOrders (assignments)

### WorkOrder
- VERIFY: FD-DM-WO-001 — WorkOrder with title, description, status, priority, timestamps
- Maps to table: work_orders (@@map)
- customer_id, technician_id, location_id, scheduled_at, started_at, completed_at use @map
- Status uses WorkOrderStatus enum; Priority uses Priority enum
- Belongs to: Tenant, Customer (User), Technician (optional), Location (optional)
- Has many: WorkOrderNotes, WorkOrderTransitions

### WorkOrderNote
- VERIFY: FD-DM-NOTE-001 — WorkOrderNote with content and author reference
- Maps to table: work_order_notes (@@map)
- work_order_id, author_id use @map
- Belongs to: WorkOrder, Author (User)

### ServiceLocation
- VERIFY: FD-DM-LOC-001 — ServiceLocation with address, latitude, longitude
- Maps to table: service_locations (@@map)
- Coordinates as Decimal(10,7) for GPS precision
- Belongs to: Tenant
- Has many: WorkOrders

### WorkOrderTransition
- VERIFY: FD-DM-TRANS-001 — WorkOrderTransition with fromStatus, toStatus, changedBy
- Maps to table: work_order_transitions (@@map)
- work_order_id, from_status, to_status, changed_by use @map
- Immutable audit of status changes
- Belongs to: WorkOrder

### AuditLog
- VERIFY: FD-DM-AUD-001 — AuditLog with action, entity, entityId, metadata (JSON)
- Maps to table: audit_logs (@@map)
- entity_id, tenant_id, user_id use @map
- Immutable — no update or delete operations

## Enums

- VERIFY: FD-DM-ENUM-001 — Role enum with @@map("role")
- VERIFY: FD-DM-ENUM-002 — WorkOrderStatus enum with @@map("work_order_status")
- VERIFY: FD-DM-ENUM-003 — Priority enum with @@map("priority")
- VERIFY: FD-DM-ENUM-004 — AvailabilityStatus enum with @@map("availability_status")

## Cross-References

- REQUIREMENTS.md: Entity definitions trace to functional requirements
- STATE_MACHINES.md: WorkOrderStatus transition rules
- API_SPEC.md: CRUD operations on these entities
- SECURITY.md: RLS policies reference tenant_id columns
