# Field Service Dispatch — Requirements Specification

## Overview

Field Service Dispatch is a multi-tenant field service management platform supporting
work order management, technician dispatch, availability tracking, service locations,
and audit logging. See DATA_MODEL.md for entities and API_SPEC.md for endpoints.

## Functional Requirements

### FR-1: Multi-Tenancy
- VERIFY: FD-REQ-MT-001 — Each tenant has isolated data via Row Level Security
- VERIFY: FD-REQ-MT-002 — Users belong to exactly one tenant
- Tenant context is set per-request using Prisma.sql parameterized queries
- Cross-references: DATA_MODEL.md (Tenant entity), SECURITY.md (RLS policies)

### FR-2: Work Order Management
- VERIFY: FD-REQ-WO-001 — Customers can create work orders with title, description, priority
- VERIFY: FD-REQ-WO-002 — Work orders follow a defined state machine lifecycle
- VERIFY: FD-REQ-WO-003 — Work orders track scheduled, started, and completed timestamps
- Pagination uses the shared paginate<T>() utility from @field-service-dispatch/shared
- Cross-references: API_SPEC.md (work order endpoints), STATE_MACHINES.md (WorkOrderStatus)

### FR-3: Technician Management
- VERIFY: FD-REQ-TECH-001 — Technicians have profiles with skills and availability
- VERIFY: FD-REQ-TECH-002 — Availability tracked via AvailabilityStatus enum
- VERIFY: FD-REQ-TECH-003 — GPS coordinates stored for location tracking
- Cross-references: DATA_MODEL.md (TechnicianProfile), API_SPEC.md (technician endpoints)

### FR-4: Service Locations
- VERIFY: FD-REQ-LOC-001 — Service locations with address and GPS coordinates
- Work orders can optionally reference a service location
- Cross-references: DATA_MODEL.md (ServiceLocation)

### FR-5: Audit Logging
- VERIFY: FD-REQ-AUD-001 — All entity mutations are logged with metadata
- Audit logs are immutable (no update/delete operations)
- Cross-references: DATA_MODEL.md (AuditLog), SECURITY.md (audit controls)

## Non-Functional Requirements

### NFR-1: Security
- JWT-based authentication with 24-hour token expiry
- bcrypt password hashing with salt rounds of 12
- No hardcoded secrets — environment variables required
- Cross-references: AUTH_SPEC.md, SECURITY.md

### NFR-2: Performance
- Paginated list endpoints with configurable page size (max 100)
- Database indexes on foreign keys and unique constraints

### NFR-3: Accessibility
- All UI components pass jest-axe accessibility checks
- Keyboard navigation supported for all interactive elements
- Loading states use role="status" with aria-busy
- Error states use role="alert" with focus management
- Cross-references: TESTING_STRATEGY.md (accessibility tests)

### NFR-4: Deployment
- Multi-stage Docker build with node:20-alpine
- CI/CD via GitHub Actions with PostgreSQL service container
- Turborepo for coordinated builds across workspace packages
- Cross-references: SECURITY.md (container security)
