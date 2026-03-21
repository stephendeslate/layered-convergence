# Product Vision: Field Service Dispatch

## Overview

Field Service Dispatch is a work order management platform for field service
companies, enabling dispatchers to assign technicians, track routes via GPS,
and manage invoicing.

## Target Users

- **Dispatchers** who assign and monitor work orders
- **Technicians** who complete field service tasks and report status
- **Office Administrators** who manage invoicing and customer records
- **Company Owners** who require operational visibility

## Value Proposition

[VERIFY:FD-001] Work orders follow a structured lifecycle through
CREATED -> ASSIGNED -> IN_PROGRESS -> COMPLETED/CANCELLED states.

[VERIFY:FD-002] Routes track technician dispatching with GPS event recording
through PLANNED -> IN_PROGRESS -> COMPLETED states.

[VERIFY:FD-003] Invoicing supports the full billing cycle via
DRAFT -> SENT -> PAID/OVERDUE state machine transitions.

## Success Metrics

- Average work order completion time under 4 hours
- Route optimization reducing travel time by 20%
- Invoice payment collection rate above 90%

## Core Capabilities

[VERIFY:FD-004] GPS tracking records technician location events with
latitude, longitude, and accuracy using Float types for coordinates.

[VERIFY:FD-005] Multi-company isolation ensures each company's data is
completely segregated using PostgreSQL Row Level Security.

[VERIFY:FD-006] Authentication supports DISPATCHER and TECHNICIAN roles
with ADMIN excluded from self-registration.

## Non-Functional Requirements

- Real-time GPS updates with sub-second latency
- Offline-capable mobile interface for technicians
- Dark mode support via CSS custom properties
- Responsive design for field tablet use

## Release Strategy

Phase 1: Work orders, technician assignment, basic routing
Phase 2: GPS tracking, route optimization, invoicing
Phase 3: Customer portal, automated scheduling, reporting

## Cross-References

- See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for component diagram
- See [DATA_MODEL.md](./DATA_MODEL.md) for entity relationships
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for company isolation
