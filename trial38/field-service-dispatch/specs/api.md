# API Specification

## Overview

The REST API is built with NestJS 11 and exposes endpoints for work orders,
technicians, and schedules. All endpoints require JWT authentication except
auth routes.

## Work Orders

<!-- VERIFY: FD-WO-002 — Work orders REST controller with full CRUD -->
<!-- VERIFY: FD-WO-003 — Work orders service with status transitions and measureDuration -->
<!-- VERIFY: FD-WO-004 — Create work order DTO with @MaxLength on all strings -->
<!-- VERIFY: FD-WO-005 — Update work order DTO with @MaxLength on all strings -->
<!-- VERIFY: FD-WO-006 — Update work order status DTO -->

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /work-orders | List all work orders (paginated) |
| GET | /work-orders/:id | Get a single work order with schedules |
| POST | /work-orders | Create a new work order |
| PATCH | /work-orders/:id | Update work order fields |
| PATCH | /work-orders/:id/status | Update work order status |
| DELETE | /work-orders/:id | Delete a work order |

### Status Transitions (T38)

<!-- VERIFY: FD-SHARED-003 — Work order status transitions -->

In Trial 38, the status transition model does not include an ASSIGNED status:

- **OPEN** can transition to: IN_PROGRESS, CANCELLED
- **IN_PROGRESS** can transition to: COMPLETED, FAILED, OPEN
- **COMPLETED** is terminal (no transitions)
- **CANCELLED** can transition to: OPEN
- **FAILED** can transition to: OPEN

## Technicians

<!-- VERIFY: FD-TECH-002 — Technicians REST controller with full CRUD -->
<!-- VERIFY: FD-TECH-003 — Technicians service with generateId and sanitizeInput -->
<!-- VERIFY: FD-TECH-004 — Create technician DTO with @MaxLength on all strings -->
<!-- VERIFY: FD-TECH-005 — Update technician DTO with @MaxLength on all strings -->

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /technicians | List all technicians (paginated) |
| GET | /technicians/:id | Get a technician with schedules |
| POST | /technicians | Create a new technician |
| PATCH | /technicians/:id | Update technician fields |
| DELETE | /technicians/:id | Delete a technician |

### T38 Variation

Technicians have a `specialty` field (e.g., HVAC, Electrical, Plumbing)
that was not present in Trial 37.

## Shared Utilities Used by API

<!-- VERIFY: FD-SHARED-004 — Pagination utility -->
<!-- VERIFY: FD-SHARED-007 — Generate prefixed unique ID -->
<!-- VERIFY: FD-SHARED-009 — Sensitive data masking utility -->
<!-- VERIFY: FD-SHARED-010 — URL-safe slug generation -->
<!-- VERIFY: FD-SHARED-011 — Display text truncation utility -->
<!-- VERIFY: FD-SEC-006 — HTML tag stripping to prevent XSS -->

## Request Validation

All DTO fields use class-validator decorators. String fields include
@MaxLength constraints to prevent oversized payloads. The global
ValidationPipe rejects unknown properties and applies type transformation.

## Cross-References

- [Security Specification](./security.md) — Input validation and XSS prevention details
