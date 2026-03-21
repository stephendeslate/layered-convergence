# Product Vision: Field Service Dispatch

## Overview

Field Service Dispatch is a platform for managing field service operations,
including work order creation, technician dispatch, route optimization,
GPS tracking, and automated invoicing. Companies use it to coordinate
technicians in the field with dispatchers and managers in the office.

## Target Users

- **Dispatchers**: Create and assign work orders, manage daily schedules
- **Technicians**: Receive assignments, update work order status in the field
- **Managers**: Monitor operations, review invoices, manage company settings

## Core Workflow

[VERIFY:FD-001] The platform uses Row Level Security to isolate data between
companies. Each company operates in its own tenant with complete data isolation
enforced at the database level.

[VERIFY:FD-002] Users self-register with roles Dispatcher, Technician, or
Manager. The ADMIN role is excluded from self-registration to prevent
privilege escalation.

[VERIFY:FD-003] Authentication is handled via JWT tokens issued on login.
Register and login endpoints are public; all other endpoints require a valid
Bearer token.

## Dispatch Flow

[VERIFY:FD-004] Work orders follow a state machine: CREATED -> ASSIGNED ->
EN_ROUTE -> IN_PROGRESS -> COMPLETED or CANCELLED at any active stage.
Dispatchers create work orders, assign them to technicians, and monitor
progress through the lifecycle.

[VERIFY:FD-005] Routes represent a technician's daily schedule. Routes
transition from PLANNED -> ACTIVE -> COMPLETED. Multiple work orders
can be grouped into a single route for optimized dispatch.

[VERIFY:FD-006] Invoices are generated from completed work orders with
precise financial amounts. Invoice lifecycle: DRAFT -> SENT -> PAID or
OVERDUE -> PAID or VOID.

## GPS Tracking

The platform captures GPS events from technicians in the field, including
latitude, longitude, speed, and heading. This data enables:
- Real-time technician location on dispatch maps
- Automatic ETA calculations for customers
- Route optimization based on historical travel patterns
- Proof of arrival for compliance and billing

## Cross-References

- See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for module structure
- See [DATA_MODEL.md](./DATA_MODEL.md) for entity definitions
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for RLS and auth details
