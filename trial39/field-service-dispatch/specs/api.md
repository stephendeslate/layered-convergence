# API Specification

## Overview

The REST API exposes endpoints for authentication, work orders, and
technicians. All domain endpoints require JWT authentication. The API
uses NestJS 11 with class-validator for input validation.

## Work Orders

<!-- VERIFY: FD-WO-001 — Create work order DTO with GPS and validation -->

Work order creation accepts title, optional description, priority,
and optional GPS coordinates (latitude/longitude as strings for
Decimal(10,7) precision).

<!-- VERIFY: FD-WO-002 — Work orders REST controller with full CRUD -->

The controller exposes full CRUD: POST (create), GET (list/detail),
PATCH (update/status), DELETE (remove). All endpoints are tenant-scoped
via the JWT tenantId claim.

<!-- VERIFY: FD-WO-003 — Work orders service with state machine and select optimization -->

The service implements state machine logic for status transitions.
List queries use Prisma select to avoid over-fetching columns.

<!-- VERIFY: FD-WO-004 — Update work order DTO -->

Update allows partial modification of title, description, priority,
and GPS coordinates. All fields are optional.

<!-- VERIFY: FD-WO-005 — Update work order status DTO with enum validation -->

Status updates are validated against the allowed enum values.
The service enforces the state machine transitions defined in
WORK_ORDER_STATUS_TRANSITIONS.

<!-- VERIFY: FD-WO-006 — Work orders module -->

The work orders module registers the controller and service, and
exports the service for potential use by other modules.

## Technicians

<!-- VERIFY: FD-TECH-001 — Create technician DTO with GPS validation -->

Technician creation requires name and GPS coordinates. Specialty is optional.

<!-- VERIFY: FD-TECH-002 — Technicians REST controller with full CRUD -->

Full CRUD endpoints for technicians: create, list, detail, update, delete.

<!-- VERIFY: FD-TECH-003 — Technicians service with select optimization -->

Service methods use Prisma select on list queries for optimal performance.

<!-- VERIFY: FD-TECH-004 — Update technician DTO with optional fields -->

Update supports partial modification of name, specialty, status, and GPS.

<!-- VERIFY: FD-TECH-005 — Technicians module -->

Module registration for the technicians feature.

## Cross-References

- See [Database](./database.md) for Prisma model details
- See [Performance](./performance.md) for query optimization
