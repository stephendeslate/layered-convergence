# Product Vision

## Overview

Field Service Dispatch is a multi-tenant SaaS platform for managing field service operations.
It enables dispatchers to create and assign work orders to technicians, track technician
locations via GPS, plan optimized routes, and generate invoices for completed work.

## Core Features

### Work Order Management
[VERIFY:PV-001] The system SHALL support a work order lifecycle with states:
PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, ON_HOLD, and INVOICED. Transitions
between states must be validated by a state machine that enforces valid paths.
→ Implementation: backend/src/work-order/work-order.service.ts:14

### Technician Management
[VERIFY:PV-002] The system SHALL maintain a technician registry with skill tracking
and availability status (AVAILABLE, ON_JOB, OFF_DUTY). Each technician is linked
to a user account and scoped to a company.
→ Implementation: backend/src/technician/technician.service.ts:8

### Route Planning
[VERIFY:PV-003] The system SHALL support route planning that associates a technician
with a work order, including distance and estimated travel time. Routes enable
dispatchers to optimize field operations.
→ Implementation: backend/src/route/route.service.ts:7

### GPS Tracking
[VERIFY:PV-004] The system SHALL record GPS events (latitude, longitude, timestamp)
for technicians to enable real-time location tracking and route verification.
→ Implementation: backend/src/gps-event/gps-event.service.ts:7

### Invoicing
[VERIFY:PV-005] The system SHALL generate invoices from completed work orders with
amount, tax, and computed total fields. Invoice status tracks the billing lifecycle
through DRAFT, SENT, PAID, and OVERDUE states. Monetary values use Decimal(12,2)
precision to prevent floating-point rounding errors.
→ Implementation: backend/src/invoice/invoice.service.ts:8

## Target Users

- **Dispatchers**: Create work orders, assign technicians, plan routes, manage customers
- **Technicians**: View assigned work orders, update status, report GPS locations
- **Administrators**: System-level access (future phase, registration blocked)

## Multi-Tenant Architecture

Each company operates as an isolated tenant. All data entities (customers, work orders,
technicians, routes, GPS events, invoices) are scoped by companyId. PostgreSQL Row-Level
Security (RLS) provides database-level isolation, with application-level filtering as
defense-in-depth. See [SECURITY_MODEL.md](SECURITY_MODEL.md) for details.

## Success Criteria

- All CRUD operations complete within 200ms under normal load
- Multi-tenant isolation prevents any cross-company data access
- Accessibility compliance (WCAG 2.1 AA) for all frontend pages
- Full traceability from specifications to implementation code
- State machine enforces valid work order transitions with no bypass
