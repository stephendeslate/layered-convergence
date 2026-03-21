# Specification Index
# Embeddable Analytics Dashboard Engine

## Document Info
- **Version:** 1.0
- **Last Updated:** 2026-03-20
- **Status:** Approved

---

## Specification Documents

| # | Document | Path | Summary |
|---|----------|------|---------|
| 1 | **Product Vision Document** | [PVD.md](./PVD.md) | Problem statement, target users (SaaS developers, tenant admins, end users), value proposition (ingestion-first embeddable analytics), success metrics, competitive positioning vs Metabase/Looker/Tableau, scope boundaries |
| 2 | **Business Requirements** | [BRD.md](./BRD.md) | 7 business requirements (RLS isolation, data ingestion pipeline, dashboard builder, embeddable dashboards, real-time SSE updates, white-label theming, sync monitoring), constraints, assumptions, hypothetical revenue model |
| 3 | **Product Requirements** | [PRD.md](./PRD.md) | 15 user stories across ingestion, builder, embedding, real-time, and admin flows. Feature descriptions, UX requirements, non-functional requirements (performance targets, security controls, reliability) |
| 4 | **System Architecture (SRS-1)** | [SRS-1.md](./SRS-1.md) | Tech stack decisions (NestJS 11, Prisma 6, PostgreSQL 16, Next.js 15, Recharts, BullMQ), Turborepo monorepo structure, NestJS module map, data flow diagrams (ingestion, rendering, scheduling, auth), deployment architecture |
| 5 | **Database & API Design (SRS-2)** | [SRS-2.md](./SRS-2.md) | Full Prisma schema (10 models), RLS policy design, index strategy, REST API design (12 endpoint groups with request/response shapes), error codes, pagination, field mapping schema, widget config schemas, connection config schemas |
| 6 | **Business Logic (SRS-3)** | [SRS-3.md](./SRS-3.md) | SyncRun state machine, pipeline processing logic, connector implementations (REST API, PostgreSQL, CSV, Webhook), schema mapping engine, transform engine (rename, cast, derive, filter), data aggregation (time-bucket rollups), query engine, caching strategy, SSE protocol, encryption, rate limiting, DLQ |
| 7 | **Security & Performance (SRS-4)** | [SRS-4.md](./SRS-4.md) | RLS policies (SQL), JWT + API key auth, input validation (class-validator), rate limiting, CORS, CSP, embed security (postMessage), encryption (AES-256-GCM), SQL injection prevention, performance targets, error handling, monitoring. All security claims tagged with [VERIFY:*] markers |
| 8 | **Wireframes** | [WIREFRAMES.md](./WIREFRAMES.md) | ASCII wireframes for: dashboard list, dashboard editor, widget config modal, connector list, connector config wizard (4 steps), sync history, embed view (loading/error/rendered), admin panel, widget type gallery, PostgreSQL/CSV/webhook-specific configs |

---

## Cross-References

- **Enums & Types:** Defined once in `packages/shared/src/enums.ts` and `types.ts`, referenced by SRS-2 (schema), SRS-3 (state machines), SRS-4 (validation)
- **RLS Policies:** Specified in SRS-2 (tables), SRS-4 (SQL), verified in C5_AUDIT.md
- **Connector Types:** PVD (overview), BRD (requirement BR-2), PRD (user stories US-1.1–1.4), SRS-3 (implementation)
- **Widget Types:** PVD (list), PRD (US-2.2), SRS-2 (config schemas), WIREFRAMES (visual gallery)
- **Security Controls:** SRS-4 (comprehensive), with [VERIFY:*] tags for audit traceability
