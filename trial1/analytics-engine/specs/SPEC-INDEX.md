# Specification Index (SPEC-INDEX)

## Analytics Engine — Embeddable Multi-Tenant Analytics Platform

| Field          | Value                          |
|----------------|--------------------------------|
| Version        | 1.0                            |
| Date           | 2026-03-20                     |

---

## 1. Reading Order

| # | Document | File | Description |
|---|----------|------|-------------|
| 1 | PVD | `specs/PVD.md` | Product vision, personas, competitive landscape |
| 2 | BRD | `specs/BRD.md` | Business rules (BR-*), tiers, compliance |
| 3 | PRD | `specs/PRD.md` | Functional requirements (FR-*), user stories |
| 4 | SRS-1 | `specs/SRS-1.md` | Architecture, monorepo, deployment, CI/CD |
| 5 | SRS-2 | `specs/SRS-2.md` | Prisma schema, RLS policies, API endpoints |
| 6 | SRS-3 | `specs/SRS-3.md` | Ingestion pipeline, query engine, state machines |
| 7 | SRS-4 | `specs/SRS-4.md` | Auth flows, embed security, audit, rate limiting |
| 8 | WIREFRAMES | `specs/WIREFRAMES.md` | ASCII wireframes for all views |
| 9 | SPEC-INDEX | `specs/SPEC-INDEX.md` | This file — cross-reference map |

---

## 2. Document Statistics

| Document | Lines | Requirements | Tables | Code Blocks |
|----------|-------|-------------|--------|-------------|
| PVD | ~230 | — | 12 | 0 |
| BRD | ~330 | 49 BR-* | 15 | 0 |
| PRD | ~340 | 31 FR-* | 3 | 0 |
| SRS-1 | ~440 | 24 NFR-* | 20 | 3 |
| SRS-2 | ~940 | — | 12 | 12 |
| SRS-3 | ~850 | — | 10 | 18 |
| SRS-4 | ~870 | — | 8 | 16 |
| WIREFRAMES | ~780 | — | 2 | 12 |

---

## 3. Cross-Reference Map

### Business Rules → Code Modules

| BR Range | Topic | Implementing Module(s) | Spec Reference |
|----------|-------|----------------------|----------------|
| BR-001 to BR-004 | Tenant isolation | `apps/api/src/prisma/` (RLS), `apps/api/src/common/guards/` | §SRS-2 §4, §SRS-4 §1 |
| BR-005 to BR-009 | Data retention | `apps/api/src/jobs/cleanup.processor.ts` | §SRS-3 §5.6 |
| BR-010 to BR-014 | Rate limiting | `apps/api/src/common/guards/rate-limit.guard.ts` | §SRS-4 §7 |
| BR-015 to BR-019 | Embed security | `apps/api/src/modules/embed/`, `apps/embed/` | §SRS-4 §2 |
| BR-020 | Config encryption | `apps/api/src/modules/datasource/encryption.service.ts` | §SRS-4 §3.1 |
| BR-021 to BR-024 | Data source rules | `apps/api/src/modules/datasource/` | §SRS-3 §1 |
| BR-025 to BR-029 | Dashboard/widget rules | `apps/api/src/modules/dashboard/`, `apps/api/src/modules/widget/` | §SRS-3 §6.2 |
| BR-030 to BR-034 | Sync/ingestion rules | `apps/api/src/modules/ingestion/`, `apps/api/src/connectors/` | §SRS-3 §1, §5 |
| BR-035 to BR-038 | Tier enforcement | `apps/api/src/common/guards/tier-limit.guard.ts` | §SRS-4 §7 |
| BR-039 to BR-047 | Regulatory/GDPR | `apps/api/src/modules/audit/`, `apps/api/src/modules/tenant/` | §SRS-4 §6 |
| BR-048 to BR-049 | Usage metrics | `apps/api/src/modules/billing/usage.service.ts` | §SRS-2 §7.10 |

### Functional Requirements → Code Modules

| FR Range | Topic | Primary Module(s) | Spec Reference |
|----------|-------|-------------------|----------------|
| FR-001 to FR-006 | Data sources | `apps/api/src/modules/datasource/`, `apps/web/src/app/(dashboard)/data-sources/` | §SRS-2 §7.2, §SRS-3 §1 |
| FR-007 to FR-009 | Ingestion | `apps/api/src/modules/ingestion/`, `apps/api/src/jobs/sync.processor.ts` | §SRS-3 §1, §5 |
| FR-010 to FR-012 | Dashboard builder | `apps/api/src/modules/dashboard/`, `apps/web/src/app/(dashboard)/dashboards/` | §SRS-3 §6.2 |
| FR-013 to FR-020 | Widget engine | `apps/api/src/modules/widget/`, `apps/web/src/components/charts/` | §SRS-3 §3, §4 |
| FR-021 to FR-023 | Embed system | `apps/api/src/modules/embed/`, `apps/embed/` | §SRS-4 §2 |
| FR-024 to FR-025 | Theme engine | `apps/api/src/modules/theme/`, `apps/web/src/app/(dashboard)/settings/theme/` | §SRS-2 §7.7 |
| FR-026 to FR-029 | Admin portal | `apps/api/src/modules/auth/`, `apps/web/src/app/(auth)/` | §SRS-4 §1 |
| FR-030 to FR-031 | Real-time (SSE) | `apps/api/src/modules/embed/sse.controller.ts`, `apps/embed/src/lib/sse.ts` | §SRS-4 §4 |

### § Cross-Reference Notation Guide

Use `§` to reference sections across documents:
- `§PVD` — Product Vision Document
- `§BRD BR-015` — Business rule 015 in the BRD
- `§PRD FR-001` — Functional requirement 001 in the PRD
- `§SRS-1 §4` — Section 4 of the Architecture spec
- `§SRS-2 §7.2` — Section 7.2 (API endpoints) of the Data Model spec
- `§SRS-3 §5.2` — Section 5.2 (Sync Job) of the Domain Logic spec
- `§SRS-4 §2` — Section 2 (Embed Security) of the Security spec
- `§WIREFRAMES §3` — Section 3 (Dashboard Builder) of the Wireframes spec
