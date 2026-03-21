# Business Requirements Document (BRD) — Analytics Engine

**Version:** 1.0 | **Date:** 2026-03-20

---

## 1. Business Objectives

| ID | Objective | Success Criteria |
|----|-----------|-----------------|
| BO-1 | Demonstrate enterprise data pipeline architecture | 4 connector types ingesting data through transform pipeline |
| BO-2 | Demonstrate embeddable analytics capability | 3 sample sites embedding dashboards with different themes |
| BO-3 | Demonstrate multi-tenant data isolation | RLS policies + application-level WHERE clauses, verified by cross-tenant tests |
| BO-4 | Demonstrate real-time data visualization | Webhook → pipeline → SSE → dashboard update in < 10 seconds |

## 2. Stakeholder Requirements

### 2.1 Tenant Admin
- **BR-001:** Configure data source connectors (REST API, PostgreSQL, CSV, Webhook)
- **BR-002:** Map source fields to analytics dimensions and metrics
- **BR-003:** Configure transform steps (rename, cast, derive, filter)
- **BR-004:** Set sync schedules (cron-based)
- **BR-005:** Build dashboards with configurable widgets
- **BR-006:** Generate embed codes (iframe + API key)
- **BR-007:** Customize dashboard branding (colors, fonts, logo)
- **BR-008:** View sync history with status, row counts, errors

### 2.2 End User (Embedded Dashboard Consumer)
- **BR-009:** View analytics charts with current data
- **BR-010:** Apply filters (date range, dimensions)
- **BR-011:** See real-time updates without page refresh (SSE)

### 2.3 Platform Admin
- **BR-012:** Monitor tenant count and data volume
- **BR-013:** View pipeline health and error rates

## 3. Business Rules

| ID | Rule |
|----|------|
| BRU-1 | Each tenant's data is isolated — a tenant can never see another tenant's data |
| BRU-2 | Embed API keys are tenant-scoped — one key per tenant |
| BRU-3 | Embed rendering respects allowedOrigins whitelist |
| BRU-4 | Failed ingestion events go to dead letter queue for retry |
| BRU-5 | Connection credentials for external data sources are encrypted at rest |
| BRU-6 | Query results are cached in Redis with configurable TTL |
| BRU-7 | Aggregation runs as background jobs (BullMQ) — not in request path |

## 4. Data Requirements

### 4.1 Core Entities
- Tenant, Dashboard, Widget, DataSource, DataSourceConfig
- SyncRun, DataPoint, EmbedConfig, QueryCache, DeadLetterEvent

### 4.2 Data Volume Assumptions
- Up to 10 tenants in demo
- Up to 100,000 data points per tenant
- Up to 10 dashboards per tenant
- Up to 20 widgets per dashboard

## 5. Integration Requirements

| System | Integration Type | Purpose |
|--------|-----------------|---------|
| PostgreSQL (external) | Read-only connection | Data source connector |
| REST APIs (external) | HTTP polling | Data source connector |
| Redis | Cache + Queue | Query caching + BullMQ jobs |
| BullMQ | Background processing | Data aggregation + sync scheduling |

## 6. Compliance & Security

- **[VERIFY:RLS]** — All data tables have RLS policies scoped by tenantId
- **[VERIFY:ENCRYPTION]** — DataSourceConfig connection credentials encrypted
- **[VERIFY:CSP]** — Embed iframes use frame-ancestors per tenant allowedOrigins
- **[VERIFY:API_KEY]** — Embed endpoints authenticated via API key, not session
