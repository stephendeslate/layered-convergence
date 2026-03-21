# Spec Index — Escrow Marketplace

**Version:** 1.0 | **Date:** 2026-03-20

---

## Document Hierarchy

| # | Document | Description | Status |
|---|----------|-------------|--------|
| 1 | [PVD.md](./PVD.md) | Product Vision Document — vision, users, scope, risks | Complete |
| 2 | [BRD.md](./BRD.md) | Business Requirements — objectives, stakeholder needs, business rules | Complete |
| 3 | [PRD.md](./PRD.md) | Product Requirements — features, non-functional requirements, acceptance criteria | Complete |
| 4 | [SRS-1.md](./SRS-1.md) | API Contracts — endpoints, schemas, state transitions, auth | Complete |
| 5 | [SRS-2.md](./SRS-2.md) | Database Schema — Prisma models, RLS policies, state machine, query conventions | Complete |
| 6 | [SRS-3.md](./SRS-3.md) | Business Logic — state machine, payments, disputes, Stripe Connect, webhooks | Complete |
| 7 | [SRS-4.md](./SRS-4.md) | Security & Infrastructure — auth, RBAC, Stripe security, CI, ESLint, E2E config | Complete |
| 8 | [WIREFRAMES.md](./WIREFRAMES.md) | UI Wireframes — buyer/provider/admin portals, page map | Complete |

## Verification Tags

| Tag | Document | Description |
|-----|----------|-------------|
| [VERIFY:RLS] | SRS-2, SRS-4 | RLS policies on all user-scoped tables |
| [VERIFY:STATE_MACHINE] | SRS-2, SRS-3, SRS-4 | Single source of truth, valid transitions only |
| [VERIFY:WEBHOOK_IDEMPOTENCY] | SRS-3, SRS-4 | Duplicate Stripe events safely ignored |
| [VERIFY:STRIPE_TEST_MODE] | SRS-4 | No live keys in codebase |
| [VERIFY:STRIPE_SECURITY] | SRS-4 | Webhook signature verification |
| [VERIFY:TENANT_ISOLATION] | SRS-4 | Cross-user access returns 404 |
| [VERIFY:AUTH] | SRS-4 | JWT auth with role-based access |
| [VERIFY:CI] | SRS-4 | Real lint/test/build CI stages |
| [VERIFY:ESLINT] | SRS-4 | no-explicit-any + $queryRawUnsafe ban |
| [VERIFY:E2E_CONFIG] | SRS-4 | fileParallelism: false, real DB |
| [VERIFY:QUERY_CONVENTION] | SRS-2 | findFirstOrThrow default |

## Phase A Checklist

- [x] PVD — Vision, scope, risks defined
- [x] BRD — Business objectives and rules
- [x] PRD — Feature requirements and acceptance criteria
- [x] SRS-1 — API contracts with state transitions
- [x] SRS-2 — Database schema with state machine definition
- [x] SRS-3 — Business logic with payment flows
- [x] SRS-4 — Security, Stripe, infrastructure
- [x] WIREFRAMES — UI layouts with page map
- [x] SPEC-INDEX — This document
