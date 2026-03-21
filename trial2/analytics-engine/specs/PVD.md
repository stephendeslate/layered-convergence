# Product Vision Document (PVD)
# Embeddable Analytics Dashboard Engine

## Document Info
- **Version:** 1.0
- **Last Updated:** 2026-03-20
- **Status:** Approved

---

## 1. Problem Statement

### 1.1 The Analytics Embedding Gap

Modern SaaS businesses need to provide analytics to their customers within their
own products. Building a custom analytics layer from scratch involves significant
engineering investment:

- **Data ingestion infrastructure** — connecting to diverse data sources (APIs,
  databases, file uploads, webhooks) with reliable scheduling and error handling
- **Multi-tenant data isolation** — ensuring strict separation between tenants
  with row-level security, not just application-level filtering
- **Visualization layer** — building interactive charts, tables, and KPI displays
  that render correctly across devices
- **Embedding infrastructure** — iframe security, cross-origin communication,
  white-label theming, and API key management
- **Real-time updates** — pushing fresh data to embedded dashboards without
  requiring page refreshes

### 1.2 Current Market Reality

Existing solutions fall into two categories:

1. **Enterprise BI tools** (Looker, Tableau, Power BI) — expensive, complex to
   embed, heavy customization overhead, not designed for multi-tenant SaaS
2. **Open-source alternatives** (Metabase, Superset) — capable but require
   significant ops work to embed securely, and white-labeling is limited or paid

Neither category provides a developer-first, embeddable-by-default analytics
platform that handles the full pipeline: ingest → transform → aggregate →
visualize → embed.

### 1.3 The Opportunity

There is a clear gap for a platform that:
- Treats embedding as a first-class concern, not an afterthought
- Handles data ingestion with built-in connectors for common sources
- Provides row-level security at the database level, not application level
- Supports white-label theming so embedded dashboards match the host product
- Offers real-time updates via SSE without WebSocket complexity

---

## 2. Target Users

### 2.1 Primary User: SaaS Platform Developer

**Profile:** Full-stack developer building a B2B SaaS product that needs to show
analytics to their customers.

**Goals:**
- Embed analytics dashboards into their product with minimal code
- Connect to their existing data sources without building ETL pipelines
- Provide each of their customers with isolated, branded analytics
- Avoid maintaining a separate BI tool alongside their product

**Pain Points:**
- Building charts from scratch is time-consuming and error-prone
- Ensuring data isolation between customers requires careful architecture
- White-labeling third-party tools often requires enterprise licenses
- Real-time data pushes add WebSocket complexity

### 2.2 Secondary User: Tenant Administrator

**Profile:** Non-technical or semi-technical user at the tenant organization who
configures dashboards and data sources.

**Goals:**
- Set up data connectors without writing code
- Build dashboards by selecting chart types and mapping data fields
- Customize branding (colors, fonts, logo) to match their product
- Monitor sync status and troubleshoot ingestion issues

**Pain Points:**
- Data pipeline configuration is typically a developer task
- Schema mapping between source and analytics dimensions is confusing
- Sync failures are opaque without good logging and history views

### 2.3 Tertiary User: End User (Embed Viewer)

**Profile:** Customer of the tenant who views the embedded dashboard within the
tenant's product.

**Goals:**
- See up-to-date analytics relevant to their context
- Interact with charts (hover for details, filter by date range)
- Trust that the dashboard is part of the product (seamless branding)

**Pain Points:**
- Embedded content that looks foreign or breaks the product's UI
- Stale data that doesn't reflect recent activity
- Slow-loading dashboards that degrade the overall product experience

---

## 3. Value Proposition

### 3.1 Core Value

**Embeddable Analytics Dashboard Engine** provides a complete pipeline from data
ingestion to embedded visualization, with multi-tenant isolation at the database
level, white-label theming, and real-time updates — all accessible through a
developer-friendly API and a visual dashboard builder.

### 3.2 Key Differentiators

| Differentiator | Description |
|----------------|-------------|
| **Ingestion-first** | Built-in connectors for REST API, PostgreSQL, CSV, and webhooks — no separate ETL tool needed |
| **Database-level isolation** | PostgreSQL RLS policies enforce tenant boundaries at the data layer, not just application code |
| **Embed-native** | iframe + postMessage API designed from day one for embedding in third-party products |
| **White-label theming** | CSS custom properties driven by tenant config — colors, fonts, logos applied automatically |
| **Real-time via SSE** | Server-Sent Events push updates to embedded dashboards without WebSocket complexity |
| **Schema mapping UI** | Visual field mapper lets tenants connect source data to analytics dimensions without code |
| **Transform pipeline** | Configurable per-connector transforms: rename, cast, derive computed fields, filter rows |

### 3.3 What This Is NOT

- Not a general-purpose BI tool (no SQL editor, no ad-hoc queries)
- Not a drag-and-drop dashboard builder (dropdown-based config, CSS Grid layout)
- Not a data warehouse (stores aggregated analytics data, not raw business data)
- Not competing with Metabase/Looker — demonstrates building the infrastructure

---

## 4. Success Metrics

### 4.1 Technical Success Criteria

| Metric | Target |
|--------|--------|
| **Data ingestion latency** | < 5 seconds from webhook receipt to DataPoint storage |
| **Dashboard render time** | < 2 seconds for a 6-widget dashboard (pre-aggregated data) |
| **SSE update frequency** | 10-second intervals for real-time dashboards |
| **Tenant isolation** | Zero cross-tenant data leaks (verified by E2E tests) |
| **Sync reliability** | Failed syncs captured in dead letter queue with retry capability |
| **Embed load time** | < 3 seconds for iframe cold load |

### 4.2 Product Quality Criteria

| Metric | Target |
|--------|--------|
| **Widget types** | 7 chart/visualization types available |
| **Connector types** | 4 data source connectors operational |
| **Test coverage** | Integration tests for all critical paths |
| **Security audit** | All RLS policies verified, API key auth tested |
| **CI pipeline** | Real lint + test commands (no placeholders) |

### 4.3 Demo Quality Criteria

| Metric | Target |
|--------|--------|
| **Sample tenants** | 3+ tenants with distinct branding and data |
| **Embed proof** | Dashboard embedded in at least 1 sample host site |
| **Pipeline demo** | End-to-end flow: configure connector → data appears in dashboard |
| **Real-time demo** | POST webhook → dashboard updates without refresh |

---

## 5. Competitive Positioning

### 5.1 Competitive Landscape

| Solution | Embed Support | Multi-Tenant | Data Ingestion | White-Label | Pricing |
|----------|---------------|--------------|----------------|-------------|---------|
| **Metabase** | Yes (paid) | Limited | SQL only | Enterprise tier | Free / $85+/user/mo |
| **Looker** | Yes | Yes | BigQuery-centric | Yes | Enterprise pricing |
| **Tableau** | Yes (paid) | Yes | Broad | Limited | $70+/user/mo |
| **Superset** | Limited | Manual setup | SQL only | Self-host only | Free (self-host) |
| **This Project** | Native | RLS-based | 4 connectors | CSS variables | Self-host |

### 5.2 Positioning Statement

This project demonstrates the engineering required to build an embeddable
analytics platform. It is positioned as a portfolio/demonstration project that
shows competence in:

- Multi-tenant architecture with database-level isolation
- Data ingestion pipeline design with connector framework
- Real-time data streaming with SSE
- Secure embedding with iframe + postMessage
- Full-stack development with NestJS, Next.js, and Recharts

### 5.3 Why Build This Instead of Using Metabase?

This project exists to demonstrate the ability to **build** the infrastructure,
not to compete with established tools. The value is in the engineering:

1. **RLS implementation** — writing actual PostgreSQL policies, not just `WHERE tenant_id = ?`
2. **Connector framework** — designing a pluggable system for diverse data sources
3. **Pipeline architecture** — ingestion, transformation, aggregation, caching
4. **Embed security** — CSP, CORS, API key auth, origin whitelisting
5. **Real-time infrastructure** — SSE endpoint with tenant-scoped event streams

---

## 6. Scope Boundaries

### 6.1 In Scope (MVP)

- 4 connector types (REST API, PostgreSQL, CSV, Webhook)
- 7 widget types (Line, Bar, Pie/Donut, Area, KPI Card, Table, Funnel)
- Dashboard builder with dropdown-based configuration
- CSS Grid layout for widget placement
- iframe embed with postMessage API
- White-label theming via CSS custom properties
- SSE for real-time dashboard updates
- BullMQ for sync scheduling and aggregation jobs
- PostgreSQL RLS for tenant isolation
- API key auth for embed endpoints, JWT for admin
- Dead letter queue for failed ingestion events
- Sync history with status, row counts, errors

### 6.2 Out of Scope

- Drag-and-drop dashboard builder
- SQL editor or ad-hoc query interface
- Kafka, S3, or custom protocol connectors
- User management within tenants (single admin per tenant)
- Alerting or notification system
- Data export (CSV/PDF download)
- Mobile-specific layouts
- A/B testing or feature flags
- Billing or subscription management

### 6.3 Future Considerations

- Additional connector types (Kafka, S3, Google Sheets)
- Drag-and-drop layout with react-grid-layout
- Dashboard sharing with public links
- Scheduled report emails
- Custom SQL queries for power users
- Multi-language support (i18n)

---

## 7. Technical Vision

### 7.1 Architecture Principles

1. **Isolation by default** — RLS policies on every tenant-scoped table
2. **Pipeline-first** — Data flows through a defined pipeline: ingest → map → transform → store → aggregate → cache → render
3. **Embed-native** — The embed renderer is a first-class concern, not a bolt-on
4. **Developer-friendly** — Clear API contracts, comprehensive types, shared enums
5. **Observable** — Sync history, dead letter queue, and error logging for debugging

### 7.2 Technology Choices

| Technology | Rationale |
|------------|-----------|
| **NestJS 11** | Module system maps well to domain boundaries; decorator-based DI |
| **Prisma 6** | Type-safe database access; migration management; schema as code |
| **PostgreSQL 16** | RLS for tenant isolation; JSONB for flexible configs; mature and reliable |
| **Next.js 15** | App Router for modern React patterns; API routes for embed renderer |
| **Recharts** | MIT-licensed; React-native chart library; composable components |
| **BullMQ** | Redis-backed job queue; repeatable jobs for sync scheduling |
| **Redis** | Query caching with TTL; BullMQ backing store |
| **Tailwind CSS 4** | Utility-first CSS; pairs with shadcn/ui for consistent components |
| **Vitest** | Fast, ESM-native testing; compatible with NestJS via unplugin-swc |

### 7.3 Deployment Architecture

```
┌─────────────────────────────┐    ┌──────────────────────────┐
│  Vercel                     │    │  Railway                 │
│  ┌───────────┐ ┌──────────┐ │    │  ┌──────────┐           │
│  │ Next.js   │ │ Embed    │ │    │  │ NestJS   │           │
│  │ Dashboard │ │ Renderer │ │◄──►│  │ API      │           │
│  │ Builder   │ │          │ │    │  │          │           │
│  └───────────┘ └──────────┘ │    │  └──────────┘           │
└─────────────────────────────┘    │       │                  │
                                   │  ┌────┴─────┐ ┌───────┐ │
                                   │  │PostgreSQL│ │ Redis │ │
                                   │  │ + RLS    │ │       │ │
                                   │  └──────────┘ └───────┘ │
                                   └──────────────────────────┘
```

---

## 8. Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Chart builder scope creep | High | Medium | Dropdown-based config only, no drag-and-drop |
| Dashboard layout complexity | Medium | Medium | CSS Grid with fixed column count |
| Real-time performance | Medium | Low | SSE at 10s intervals against pre-aggregated data |
| Embed security | High | Medium | API key + allowedOrigins + CSP frame-ancestors |
| External DB credentials exposure | High | Low | Encrypt connection configs at rest |
| Sync job failures | Medium | Medium | Dead letter queue with retry |
| Webhook abuse | Medium | Medium | Rate limit per tenant, payload size limit |
| SSE connection limits | Low | Medium | Use HTTP/2 or connection multiplexing |
| Recharts v3 API changes | Low | Medium | Verify APIs against v3 docs |
| Railway cold starts | Low | Low | Keep-alive endpoint |

---

## 9. Glossary

| Term | Definition |
|------|------------|
| **Tenant** | An organization using the platform to embed analytics in their product |
| **Connector** | A configured data source (API, PostgreSQL, CSV, or Webhook) |
| **Sync Run** | A single execution of a connector's data ingestion pipeline |
| **DataPoint** | A single record of ingested data with dimensions and metrics |
| **Widget** | A chart or visualization component within a dashboard |
| **Embed** | A dashboard rendered within an iframe in a tenant's product |
| **RLS** | Row-Level Security — PostgreSQL feature for row-level access control |
| **SSE** | Server-Sent Events — HTTP-based one-way server-to-client streaming |
| **DLQ** | Dead Letter Queue — storage for failed ingestion events |
| **Schema Mapping** | The configuration that maps source data fields to analytics dimensions/metrics |
| **Transform Step** | A configurable data transformation applied during ingestion |
