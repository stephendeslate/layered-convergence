# Product Vision Document (PVD)

## Analytics Engine — Embeddable Multi-Tenant Analytics Platform

| Field          | Value                          |
|----------------|--------------------------------|
| Version        | 1.0                            |
| Date           | 2026-03-20                     |
| Status         | Draft                          |
| Owner          | Product Team                   |
| Classification | Internal                       |

---

## 1. Problem Space

### 1.1 Market Pain Point

Businesses building SaaS products, agency portals, and e-commerce platforms frequently need to surface analytics to their end users. Today they face a difficult choice:

1. **Build from scratch** — 3-6 months of engineering effort to build data pipelines, chart rendering, and embed infrastructure. Ongoing maintenance burden for schema changes, connector updates, and performance tuning.
2. **Use heavyweight BI tools** (Metabase, Looker, Tableau) — designed for internal analysts, not for embedding. Licensing costs scale per-seat, branding is limited, and the integration surface is complex.
3. **Use developer-focused tools** (Cube.js, Tremor) — require significant frontend engineering to compose into a finished product. No turnkey dashboard builder or embed system.

None of these options give a product team what they actually want: a managed platform where they configure data sources, build dashboards through a UI, and embed branded analytics into their product with a single script tag.

### 1.2 Root Causes

- **Data ingestion is fragmented.** Every connector (REST API, database, CSV, webhook) requires its own integration code, error handling, retry logic, and scheduling.
- **Chart rendering is table stakes but time-consuming.** Teams spend weeks wiring up Recharts or D3 when they should be focusing on their core product.
- **Multi-tenancy is hard.** Tenant isolation at the data layer (not just the application layer) requires RLS policies, scoped queries, and careful testing.
- **Embed security is non-trivial.** CSP headers, origin allowlisting, postMessage APIs, and API key rotation are all potential attack surfaces.

### 1.3 Opportunity Size

The embedded analytics market is projected to reach $77B by 2026. The fastest-growing segment is "analytics-as-a-feature" — platforms that let non-technical users configure and embed dashboards without writing code.

---

## 2. Target Users

### 2.1 Primary Segments

| Segment | Description | Size Estimate |
|---------|-------------|---------------|
| **SaaS Companies** | B2B products that want to show usage analytics, performance metrics, or reporting dashboards to their customers | Large |
| **Agencies** | Digital marketing and consulting agencies that need client-facing reporting portals | Medium |
| **E-commerce Platforms** | Merchants who want to embed sales analytics, funnel analysis, and inventory dashboards | Medium |
| **Internal Tools Teams** | Engineering teams building admin dashboards that pull from multiple data sources | Small |

### 2.2 Personas

#### Persona 1: Platform Admin (Alex)

| Attribute | Detail |
|-----------|--------|
| Role | Product manager or technical lead at a SaaS company |
| Goal | Configure data sources, build dashboards, and manage embed settings without writing code |
| Pain points | Currently maintains a custom analytics pipeline; tired of fixing broken connectors and stale caches |
| Technical skill | Can write SQL queries; comfortable with REST APIs; does not write frontend code daily |
| Success metric | Time from "new data source" to "live embedded dashboard" under 30 minutes |

#### Persona 2: End User (Jordan)

| Attribute | Detail |
|-----------|--------|
| Role | Customer of the platform that embeds Analytics Engine |
| Goal | View accurate, real-time analytics within the product they already use |
| Pain points | Currently exports CSV files and builds charts in spreadsheets |
| Technical skill | Non-technical; expects consumer-grade UX |
| Success metric | Can understand key metrics within 10 seconds of page load |

#### Persona 3: Developer (Sam)

| Attribute | Detail |
|-----------|--------|
| Role | Frontend or full-stack engineer integrating the embed into their product |
| Goal | Drop in an iframe or script tag, configure via API, and move on |
| Pain points | Previous BI tool integrations required weeks of custom CSS and JavaScript hacks |
| Technical skill | Senior engineer; comfortable with APIs, iframes, postMessage |
| Success metric | Integration complete in under 2 hours; zero ongoing maintenance |

---

## 3. Product Pillars

### Pillar 1: Zero-Code Dashboard Building

Platform Admins configure everything through a dropdown-based UI. No drag-and-drop complexity — select a chart type, pick a data source, map dimensions and metrics, and the widget renders immediately. CSS Grid layout with predefined column/row options.

### Pillar 2: Reliable Data Ingestion

Four connector types (REST API, PostgreSQL, CSV upload, Webhook) with automatic schema detection, field mapping, transform steps, and configurable sync schedules. Failed syncs are retried with exponential backoff and surfaced in a sync history view with actionable error messages.

### Pillar 3: Secure Multi-Tenant Isolation

Every data row is scoped to a tenant via PostgreSQL Row-Level Security. There is no application-level "WHERE tenant_id = ?" — the database enforces isolation at the query planner level. Embed access is gated by API key + origin allowlisting.

### Pillar 4: White-Label Embedding

Tenants customize colors, fonts, logos, and corner radius. The embedded dashboard renders with the tenant's branding — no Analytics Engine branding visible to end users (on Pro/Enterprise tiers). Embed via iframe with postMessage API for bidirectional communication.

### Pillar 5: Real-Time Updates

Server-Sent Events push new data to embedded dashboards as sync runs complete. No polling. Widgets re-render with animated transitions when new data arrives.

---

## 4. Competitive Landscape

| Feature | Analytics Engine | Metabase (OSS) | Looker (Google) | Cube.js (OSS) |
|---------|-----------------|-----------------|-----------------|----------------|
| Embed-first design | Yes | Bolt-on | Bolt-on | SDK only |
| Multi-tenant RLS | Native | Manual config | Via LookML | Manual |
| No-code dashboard builder | Yes | Yes | Yes | No |
| White-label theming | Full | Limited | Limited | N/A |
| Connector marketplace | 4 built-in | 20+ | 200+ | Via drivers |
| Real-time (SSE) | Yes | No (polling) | Limited | Via WebSocket |
| Self-serve embed code | Copy-paste | Requires admin | Requires admin | Code required |
| Pricing model | Tiered (Free/Pro/Enterprise) | OSS + paid | Per-seat (expensive) | OSS + paid cloud |
| Setup time | < 30 min | Hours | Days | Hours |

### 4.1 Differentiation Strategy

Analytics Engine wins by being **opinionated and simple**. We do not compete on connector count (Looker's 200+ connectors) or raw query power (Cube.js's semantic layer). We compete on:

1. **Time to embed** — under 30 minutes from signup to live embedded dashboard
2. **Zero maintenance** — managed connectors with automatic retry, schema drift detection, and dead letter queues
3. **Tenant isolation by default** — RLS is not optional; every query is scoped

---

## 5. Success Metrics

### 5.1 North Star Metric

**Monthly Active Embedded Dashboards** — the count of dashboards that received at least one end-user view in the past 30 days.

### 5.2 Supporting Metrics

| Metric | Target (6 months post-launch) | Measurement |
|--------|-------------------------------|-------------|
| Time to first embedded dashboard | < 30 minutes | Onboarding funnel tracking |
| Dashboard load time (P95) | < 2 seconds | Embed performance monitoring |
| Sync success rate | > 99.5% | SyncRun status aggregation |
| Data freshness (time from source change to widget update) | < 5 minutes (scheduled) / < 10 seconds (webhook) | End-to-end latency measurement |
| Tenant activation rate (created dashboard within 7 days) | > 60% | Cohort analysis |
| Embed integration time (developer) | < 2 hours | Developer survey + support ticket analysis |
| Monthly recurring revenue | $50K | Billing system |
| Churn rate | < 5% monthly | Subscription tracking |

---

## 6. Scope Boundaries

### 6.1 In Scope (v1.0)

- Four connectors: REST API (poll), PostgreSQL (query), CSV (upload), Webhook (push)
- Seven widget types: Line, Bar, Pie/Donut, Area, KPI Card, Table, Funnel
- Dashboard builder with CSS Grid layout and dropdown-based configuration
- Embed via iframe with postMessage API
- White-label theming (colors, fonts, logo, corner radius)
- SSE real-time updates
- Admin portal with data source management, dashboard builder, sync history, and embed settings
- Multi-tenant isolation via PostgreSQL RLS
- Three subscription tiers: Free, Pro, Enterprise

### 6.2 Out of Scope (v1.0)

- Drag-and-drop dashboard layout
- Drag-and-drop chart builder
- Custom SQL query editor for end users
- Alerting / threshold-based notifications
- Data export (PDF, CSV) from embedded dashboards
- Mobile-native SDKs (iOS, Android)
- Custom connector plugin API
- Collaborative editing (multiplayer dashboard builder)
- AI-generated insights or natural language queries

---

## 7. Risks and Mitigations

| ID | Risk | Impact | Probability | Mitigation |
|----|------|--------|-------------|------------|
| R-001 | PostgreSQL RLS performance degrades at scale (>100K rows per tenant) | High | Medium | Pre-aggregate data into time buckets; cache query results in QueryCache; benchmark at 1M rows during development |
| R-002 | SSE connections exhaust server resources under high concurrency | High | Medium | Use Redis pub/sub to fan out events; limit SSE connections per tenant; implement connection pooling |
| R-003 | Connector failures cause data staleness without user awareness | Medium | High | Sync history with clear error states; email alerts on consecutive failures; dead letter queue for manual retry |
| R-004 | Embed iframe blocked by customer's CSP policies | High | Medium | Provide clear integration docs; offer script-tag alternative; expose CSP header requirements in embed config |
| R-005 | Schema drift in external data sources breaks field mappings | Medium | High | Schema validation on each sync; alert on new/missing fields; graceful degradation (show "data unavailable" instead of crashing) |
| R-006 | Tenant data leak via application bug bypassing RLS | Critical | Low | RLS enforced at database level (not application); integration tests verify tenant isolation; no cross-tenant queries in application code |
| R-007 | Free tier abuse (crypto mining via webhook ingestion) | Medium | Medium | Rate limiting per tenant; payload size limits; webhook signature verification |
| R-008 | Recharts rendering performance with large datasets | Medium | Medium | Client-side data sampling for >10K points; server-side aggregation; virtualized table rendering |

---

## 8. Phasing Strategy

| Phase | Timeline | Deliverables |
|-------|----------|-------------|
| **Phase 1: Foundation** | Weeks 1-3 | Monorepo setup, Prisma schema, RLS policies, auth system, tenant CRUD |
| **Phase 2: Ingestion** | Weeks 4-6 | Connector framework, REST API + CSV connectors, sync scheduler, transform engine |
| **Phase 3: Visualization** | Weeks 7-9 | Dashboard builder, widget engine (all 7 types), query engine |
| **Phase 4: Embed** | Weeks 10-11 | Embed iframe, postMessage API, theme engine, API key auth |
| **Phase 5: Polish** | Week 12 | SSE real-time, sync history, error handling, performance tuning |

### 8.1 Phase Dependencies

```
Phase 1 (Foundation)
  └──▶ Phase 2 (Ingestion)     ← Requires Prisma schema + auth
         └──▶ Phase 3 (Visualization) ← Requires data in DataPoint table
                └──▶ Phase 4 (Embed)       ← Requires dashboard + widget rendering
                       └──▶ Phase 5 (Polish)    ← Requires all features functional
```

### 8.2 MVP Definition

The Minimum Viable Product includes Phases 1-4. Phase 5 is polish and can ship incrementally. The MVP enables:

- A tenant to register, connect one data source, build one dashboard, and embed it.
- End users to view a branded, live-updating analytics dashboard.
- The platform to enforce tenant isolation, rate limits, and tier restrictions.

### 8.3 Technical Milestones

| Milestone | Phase | Criteria |
|-----------|-------|----------|
| First RLS-protected query | Phase 1 | Integration test proves cross-tenant isolation |
| First successful sync | Phase 2 | REST API connector syncs 100+ rows into DataPoint table |
| First rendered chart | Phase 3 | Line chart renders from real DataPoint data |
| First external embed | Phase 4 | Dashboard loads in an iframe on a different domain |
| Production readiness | Phase 5 | All NFRs met (§SRS-1 §6), zero critical bugs |

---

## 9. Document References

| Document | Section | Description |
|----------|---------|-------------|
| §BRD | Business Rules | Detailed business rules and constraints |
| §PRD | Functional Requirements | Feature specifications with acceptance criteria |
| §SRS-1 | Architecture | System architecture and deployment topology |
| §SRS-2 | Data Model | Prisma schema and RLS policies |
| §SRS-3 | Domain Logic | Algorithms, state machines, and API contracts |
| §SRS-4 | Security | Auth flows, embed security, audit logging |
| §WIREFRAMES | UI Layouts | ASCII wireframes for all views |
