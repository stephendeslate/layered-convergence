# Product Vision Document (PVD) — Embeddable Analytics Dashboard Engine

**Version:** 1.0
**Date:** 2026-03-20
**Project:** Analytics Engine (Trial 3)

---

## 1. Vision Statement

Build a multi-tenant embeddable analytics platform that enables businesses to ingest data from external sources and embed customizable, white-labeled analytics dashboards into their own products. The platform demonstrates enterprise-grade data pipeline architecture, real-time visualization, and secure multi-tenant isolation.

## 2. Problem Statement

Businesses need analytics capabilities within their products but building data pipelines and visualization from scratch is expensive. Existing solutions (Metabase, Looker) are monolithic and hard to embed. This project demonstrates the infrastructure layer — data ingestion, transformation, aggregation, and embeddable rendering — as a composable, tenant-isolated service.

## 3. Target Users

| User Type | Description | Key Needs |
|-----------|-------------|-----------|
| **Tenant Admin** | Business owner configuring analytics for their product | Configure data sources, build dashboards, generate embed codes, manage branding |
| **End User** | Consumer of an embedded dashboard within a tenant's product | View charts, apply filters, see real-time data updates |
| **Platform Admin** | System operator | Monitor tenants, data pipeline health, system metrics |

## 4. Core Value Propositions

1. **Data Ingestion Pipeline** — 4 connector types (REST API, PostgreSQL, CSV, Webhook) with schema mapping and transform steps
2. **Embeddable Dashboards** — iframe-based with postMessage API, white-label theming, API key authentication
3. **Real-Time Updates** — SSE-powered live data refresh without page reload
4. **Multi-Tenant Isolation** — RLS-backed data separation with per-tenant branding and API keys
5. **Chart Builder** — Dropdown-based configuration for 7 widget types (line, bar, pie, area, KPI, table, funnel)

## 5. Success Metrics

| Metric | Target |
|--------|--------|
| Connector types implemented | 4 (REST API, PostgreSQL, CSV, Webhook) |
| Widget types implemented | 7 (line, bar, pie, area, KPI, table, funnel) |
| Tenant isolation tests | Cross-tenant access returns 404 |
| E2E tests with real DB | All E2E tests hit PostgreSQL, no mocked Prisma |
| Embed demo sites | 3 sample host sites with different themes |
| Real-time data flow | Webhook → pipeline → SSE → dashboard update |

## 6. Scope Boundaries

### In Scope
- Data ingestion pipeline with 4 connector types
- Schema mapping and transform engine
- Sync scheduling (cron-based)
- Dashboard builder with 7 widget types
- Embed renderer with iframe + postMessage API
- White-label theming (colors, fonts, logo)
- SSE for real-time updates
- Query caching in Redis
- BullMQ job processing for aggregation
- Synthetic data seeding
- Multi-tenant RLS isolation

### Out of Scope
- Drag-and-drop dashboard builder (dropdown-based only)
- Custom SQL query builder for end users
- Data warehouse / OLAP engine
- Kafka or S3 connectors
- User authentication (API key only for embeds)
- Production deployment hardening
- Real payment processing

## 7. Technical Constraints

- **Charts:** Recharts (MIT) + D3.js (ISC) — no proprietary charting libraries
- **Database:** PostgreSQL 16 with RLS policies for tenant isolation
- **ORM:** Prisma 6 — `findFirstOrThrow` as default for tenant-scoped queries
- **Real-time:** SSE (not WebSocket) — simpler for one-way data push
- **Queue:** BullMQ + Redis for background aggregation
- **Embed Security:** API key + allowedOrigins whitelist + CSP frame-ancestors

## 8. Key Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Chart builder scope creep | HIGH | Dropdown-based config only, no drag-and-drop |
| Dashboard layout complexity | MEDIUM | CSS Grid with fixed column count |
| SSE connection limits | LOW | HTTP/2 or connection multiplexing |
| Recharts v3 API changes | MEDIUM | Verify against v3 docs |
| Pipeline scope creep | HIGH | 4 connector types max |
| External DB credential security | HIGH | Encrypt connection configs at rest |
