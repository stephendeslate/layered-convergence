# Spec Index — Analytics Engine

**Version:** 1.0 | **Date:** 2026-03-20

---

## Document Hierarchy

| # | Document | Description | Status |
|---|----------|-------------|--------|
| 1 | [PVD.md](./PVD.md) | Product Vision Document — vision, users, scope, risks | Complete |
| 2 | [BRD.md](./BRD.md) | Business Requirements — objectives, stakeholder needs, business rules | Complete |
| 3 | [PRD.md](./PRD.md) | Product Requirements — features, non-functional requirements, acceptance criteria | Complete |
| 4 | [SRS-1.md](./SRS-1.md) | API Contracts — endpoints, schemas, authentication, rate limits | Complete |
| 5 | [SRS-2.md](./SRS-2.md) | Database Schema — Prisma models, RLS policies, indexes, query conventions | Complete |
| 6 | [SRS-3.md](./SRS-3.md) | Business Logic — pipeline, aggregation, dashboards, embed, SSE, theming | Complete |
| 7 | [SRS-4.md](./SRS-4.md) | Security & Infrastructure — auth, isolation, encryption, CI, ESLint, E2E config | Complete |
| 8 | [WIREFRAMES.md](./WIREFRAMES.md) | UI Wireframes — dashboard builder, data sources, embed, page map | Complete |

## Verification Tags

| Tag | Document | Description |
|-----|----------|-------------|
| [VERIFY:RLS] | SRS-2, SRS-4 | RLS policies on all tenant-scoped tables |
| [VERIFY:ENCRYPTION] | SRS-4 | DataSourceConfig credentials encrypted at rest |
| [VERIFY:EMBED_SECURITY] | SRS-4 | Origin validation + CSP headers |
| [VERIFY:API_KEY] | BRD, SRS-1 | Embed endpoints use API key auth |
| [VERIFY:AUTH] | SRS-4 | JWT auth for admin, API key for embed |
| [VERIFY:CI] | SRS-4 | Real lint/test/build CI stages |
| [VERIFY:ESLINT] | SRS-4 | no-explicit-any + $queryRawUnsafe ban |
| [VERIFY:E2E_CONFIG] | SRS-4 | fileParallelism: false, real DB |
| [VERIFY:QUERY_CONVENTION] | SRS-2 | findFirstOrThrow default |
| [VERIFY:TENANT_ISOLATION] | SRS-4 | Cross-tenant access returns 404 |

## Phase A Checklist

- [x] PVD — Vision, scope, risks defined
- [x] BRD — Business objectives and rules
- [x] PRD — Feature requirements and acceptance criteria
- [x] SRS-1 — API contracts with request/response schemas
- [x] SRS-2 — Database schema with RLS policies
- [x] SRS-3 — Business logic with pipeline and embed details
- [x] SRS-4 — Security, infrastructure, CI, ESLint, E2E config
- [x] WIREFRAMES — UI layouts with page map
- [x] SPEC-INDEX — This document
