# Spec Index — Field Service Dispatch

**Version:** 1.0 | **Date:** 2026-03-20

---

## Document Hierarchy

| # | Document | Description | Status |
|---|----------|-------------|--------|
| 1 | [PVD.md](./PVD.md) | Product Vision Document — vision, users, scope, risks | Complete |
| 2 | [BRD.md](./BRD.md) | Business Requirements — objectives, stakeholder needs, business rules | Complete |
| 3 | [PRD.md](./PRD.md) | Product Requirements — features, non-functional requirements, acceptance criteria | Complete |
| 4 | [SRS-1.md](./SRS-1.md) | API Contracts — endpoints, WebSocket events, state transitions, route ordering | Complete |
| 5 | [SRS-2.md](./SRS-2.md) | Database Schema — Prisma models with PostGIS, RLS policies, state machine, query conventions | Complete |
| 6 | [SRS-3.md](./SRS-3.md) | Business Logic — state machine, auto-assign, route optimization, GPS tracking, invoicing | Complete |
| 7 | [SRS-4.md](./SRS-4.md) | Security & Infrastructure — auth, RBAC, tenant isolation, route ordering, map security, CI | Complete |
| 8 | [WIREFRAMES.md](./WIREFRAMES.md) | UI Wireframes — dispatch dashboard, technician mobile, customer portal, page map | Complete |

## Verification Tags

| Tag | Document | Description |
|-----|----------|-------------|
| [VERIFY:RLS] | SRS-2, SRS-4 | RLS policies on all company-scoped tables |
| [VERIFY:STATE_MACHINE] | SRS-2, SRS-3 | Single source of truth, valid transitions only |
| [VERIFY:TENANT_ISOLATION] | SRS-4 | Cross-company access returns 404 |
| [VERIFY:ROUTE_ORDERING] | SRS-1, SRS-4 | Static routes before parameterized |
| [VERIFY:NO_GOOGLE_MAPS] | SRS-4 | Zero Google Maps references |
| [VERIFY:AUTH] | SRS-4 | JWT auth with role-based access |
| [VERIFY:CI] | SRS-4 | Real lint/test/build CI stages (PostGIS image) |
| [VERIFY:ESLINT] | SRS-4 | no-explicit-any + $queryRawUnsafe ban |
| [VERIFY:E2E_CONFIG] | SRS-4 | fileParallelism: false, real DB |
| [VERIFY:QUERY_CONVENTION] | SRS-2 | findFirstOrThrow default |

## Phase A Checklist

- [x] PVD — Vision, scope, risks defined
- [x] BRD — Business objectives and rules
- [x] PRD — Feature requirements and acceptance criteria
- [x] SRS-1 — API contracts with WebSocket events and route ordering
- [x] SRS-2 — Database schema with PostGIS and state machine
- [x] SRS-3 — Business logic with GPS tracking and route optimization
- [x] SRS-4 — Security, map safety, infrastructure
- [x] WIREFRAMES — UI layouts with page map
- [x] SPEC-INDEX — This document
