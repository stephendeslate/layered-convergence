# Specification Index

## Field Service Dispatch & Management Platform

**Date:** 2026-03-20

---

## Documents

| Document | File | Description | Lines |
|----------|------|-------------|-------|
| Product Vision | [PVD.md](./PVD.md) | Problem statement, target users, value proposition, competitive analysis | ~310 |
| Business Requirements | [BRD.md](./BRD.md) | Multi-tenancy, dispatch workflow, real-time requirements, invoicing, compliance | ~340 |
| Product Requirements | [PRD.md](./PRD.md) | User stories for dispatchers, technicians, customers, admins with acceptance criteria | ~370 |
| System Architecture | [SRS-1.md](./SRS-1.md) | Service boundaries, WebSocket architecture, PostGIS integration, real-time data flow | ~460 |
| Database & API | [SRS-2.md](./SRS-2.md) | Full Prisma schema, RLS policies, REST + WebSocket endpoints, DTOs | ~980 |
| Business Logic | [SRS-3.md](./SRS-3.md) | Work order state machine, route optimization, auto-assign, GPS streaming, ETA | ~1050 |
| Security & Compliance | [SRS-4.md](./SRS-4.md) | RLS policies, WebSocket auth, GPS tenant isolation, SQL injection prevention, rate limiting | ~920 |
| Wireframes | [WIREFRAMES.md](./WIREFRAMES.md) | ASCII wireframes for dispatch board, technician UI, customer portal, admin panel | ~780 |

---

## Key Cross-References

### State Machine
- Defined in: SRS-3.md Section 1
- Implemented in: `packages/shared/src/state-machine/`
- Used by: Work order service, dispatch board, technician UI

### RLS Policies
- Specified in: SRS-2.md Section 1.3, SRS-4.md Section 2
- Implemented in: Prisma migrations
- Tables covered: users, technicians, customers, work_orders, work_order_status_history, routes, job_photos, invoices

### WebSocket Security
- Specified in: SRS-4.md Section 3
- Implemented in: GPS Gateway module
- Key requirement: JWT on handshake, tenant-isolated rooms, position:update company verification

### API Endpoints
- Full list: SRS-2.md Section 2
- Authentication: POST /auth/login, /auth/register
- Work Orders: GET/POST/PATCH /work-orders
- GPS: WebSocket namespace /gps
- Invoices: GET/POST /invoices

---

## Verification Tags
All security claims are tagged with `[VERIFY:*]` in SRS-4.md.
Total claims: 77 across 12 categories.
Verification occurs in Phase C5 (Hardening).
