# Product Vision — Field Service Dispatch

## Overview

Field Service Dispatch (FSD) is a multi-tenant platform for managing field service operations.
It enables companies to coordinate work orders, dispatch technicians, track routes, and
handle invoicing — all within a single, secure, role-based system.

## Target Users

- **Dispatchers** — office staff who create work orders, assign technicians, plan routes,
  and manage invoicing for their company.
- **Technicians** — field workers who receive assignments, update job status in the field,
  and report GPS location events.

## Value Proposition

FSD eliminates the friction of paper-based or fragmented dispatch workflows by providing:

1. A unified work order lifecycle with enforced state transitions.
2. Real-time GPS tracking of technician field activity.
3. Integrated invoicing tied directly to completed work orders.
4. Strict multi-tenant isolation so each company's data is completely segregated.
5. Role-based access that prevents privilege escalation (no ADMIN role exists).

## Success Metrics

| Metric | Target |
|--------|--------|
| Work order throughput | 100+ WOs per company per day |
| Route optimization accuracy | < 5% deviation from estimated distance |
| Invoice cycle time | < 48 hours from COMPLETED to SENT |
| System availability | 99.9% uptime SLA |

## Domain Entities

The system manages 8 primary entities:

- **Company** — tenant boundary; all data is scoped per company.
- **User** — authenticated operator with a role (DISPATCHER or TECHNICIAN).
- **WorkOrder** — a unit of service work with a 7-state lifecycle.
- **Technician** — a field worker who can be assigned to work orders and routes.
- **Customer** — the service recipient linked to work orders and invoices.
- **Route** — a planned sequence of stops for a technician on a given day.
- **GpsEvent** — a timestamped location report from a technician in the field.
- **Invoice** — a billing document tied to a work order and customer.

## Verified Requirements

[VERIFY:SA-001] All 9 NestJS modules (Auth, Company, CompanyContext, WorkOrder, Customer,
Technician, Invoice, Route, GpsEvent) MUST be registered in the AppModule.
> Implementation: `backend/src/app.module.ts`

[VERIFY:DM-008] WorkOrder MUST implement a state machine with transitions:
OPEN -> ASSIGNED -> IN_PROGRESS -> COMPLETED -> INVOICED -> CLOSED, plus CANCELLED from OPEN/ASSIGNED.
> Implementation: `backend/src/work-order/work-order.service.ts`

[VERIFY:DM-009] Invoice MUST implement a state machine with transitions:
DRAFT -> SENT -> PAID -> VOID.
> Implementation: `backend/src/invoice/invoice.service.ts`

[VERIFY:DM-010] Route MUST implement a state machine with transitions:
PLANNED -> IN_PROGRESS -> COMPLETED.
> Implementation: `backend/src/route/route.service.ts`

## Cross-References

- See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for technology stack and deployment model.
- See [DATA_MODEL.md](./DATA_MODEL.md) for entity definitions and relationship constraints.
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for multi-tenant isolation and role-based access rules.
