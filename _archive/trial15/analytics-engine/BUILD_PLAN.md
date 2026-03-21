# Embeddable Analytics Dashboard Engine — Build Plan

## Verified Score: 9.05
| CD | DI | TS | VI | SY | BF |
|----|----|----|----|----|-----|
| 9  | 9  | 9  | 9  | 8  | 8   |

## Overview
A multi-tenant platform that lets businesses ingest data from external sources and embed customizable analytics dashboards into their own products. Data ingestion pipeline with connectors (REST API, PostgreSQL, CSV, webhook), schema mapping, transform steps, and sync scheduling. Chart builder, real-time updates, white-label theming, and an embed API via iframe/script tag. Each tenant gets isolated analytics with their own branding.

## Legal Caveats
- All charting libraries are MIT/BSD/ISC — zero licensing risk
- No data privacy concerns with synthetic analytics data
- No IP/patent risk (established category with many open-source implementations)
- Position as "I built the infrastructure" not "competing with Metabase"
- No disclaimers legally required, but include one for professionalism

## Tech Stack
- **Backend:** NestJS 11 + Prisma 6 + PostgreSQL 16 (RLS)
- **Frontend:** Next.js 15 App Router + shadcn/ui + Tailwind CSS 4
- **Charts:** Recharts (MIT) for standard charts + D3.js (ISC) for custom visualizations
- **Embed:** iframe with postMessage API for host communication
- **Real-time:** Server-Sent Events (SSE) for dashboard updates
- **Queue:** BullMQ + Redis (data aggregation jobs)
- **Testing:** Vitest
- **Deployment:** Vercel (frontend + embed renderer) + Railway (API + PostgreSQL + Redis)

## Architecture

### Embed Flow
```
Tenant admin → Configure dashboard in builder
  → Set charts, data sources, filters, theme
  → Generate embed code (iframe + API key)
  → Paste into their product
  → End users see branded dashboard with live data
```

### Multi-Tenant Data Isolation
```
Each tenant → Own API key → RLS-scoped data
  → Embed renders only that tenant's data
  → Theme applied from tenant config (colors, fonts, logo)
```

### Data Ingestion Pipeline
```
Tenant configures connector (API, PostgreSQL, CSV upload, webhook)
  → Pipeline validates schema + maps fields to dimensions/metrics
  → BullMQ job runs on schedule (or on webhook receipt)
  → Raw data extracted → transformed (flatten, cast, derive fields)
  → Loaded into DataPoint table (tenant-scoped via RLS)
  → Aggregation jobs roll up into time-bucketed summaries
  → Dashboard widgets query aggregated data
```

#### Connector Types
- **REST API** — poll external endpoint on cron schedule, JSONPath field mapping
- **PostgreSQL** — read-only connection string, SQL query per sync, column-to-dimension mapping
- **CSV upload** — manual file upload, column mapping UI, import as batch
- **Webhook** — tenant receives a unique ingest URL, POST events in real-time

#### Pipeline Features
- **Schema mapping UI** — tenant maps source fields to analytics dimensions/metrics
- **Transform steps** — configurable per-connector: rename, cast type, derive computed fields, filter rows
- **Sync scheduling** — cron-based for API/PostgreSQL connectors (e.g., every 15 min, hourly, daily)
- **Sync history** — log of each pipeline run with status, row count, errors, duration
- **Backfill** — re-run a connector for a historical date range
- **Dead letter queue** — failed ingestion events stored for inspection and retry

### Data Model (Key Entities)
- `Tenant` (name, apiKey, branding: { primaryColor, fontFamily, logoUrl })
- `Dashboard` (tenantId, name, layout JSONB, isPublished)
- `Widget` (dashboardId, type, config JSONB, position, size)
- `DataSource` (tenantId, name, type: 'postgresql' | 'api' | 'csv' | 'webhook')
- `DataSourceConfig` (dataSourceId, connectionConfig JSONB encrypted, fieldMapping JSONB, transformSteps JSONB, syncSchedule)
- `SyncRun` (dataSourceId, status: 'running' | 'completed' | 'failed', rowsIngested, errorLog, startedAt, completedAt)
- `DataPoint` (dataSourceId, timestamp, dimensions JSONB, metrics JSONB)
- `EmbedConfig` (dashboardId, allowedOrigins[], theme overrides)
- `QueryCache` (queryHash, result JSONB, expiresAt)
- `DeadLetterEvent` (dataSourceId, payload JSONB, errorReason, createdAt, retriedAt)

### Widget Types
- **Line Chart** — time series trends (page views, revenue)
- **Bar Chart** — categorical comparison (top pages, conversion by source)
- **Pie/Donut** — distribution (traffic sources, device types)
- **Area Chart** — stacked trends (revenue by product)
- **KPI Card** — single metric with trend arrow (total users, conversion rate)
- **Table** — sortable data grid with pagination
- **Funnel** — conversion funnel steps with drop-off percentages

## SavSpot Module Reuse Map

| SavSpot Module | Reuse | Adaptation Needed |
|----------------|-------|-------------------|
| `analytics/` | Adapt | Date-range filtering, KPI aggregation, trend calculation |
| `embed/` | Adapt | Tenant slug resolution + brand config reusable; booking-specific logic replaced with dashboard/widget logic |
| `tenant-context/` | Direct | RLS-based data isolation |
| `auth/` | Adapt | API key auth for embed endpoints (no user session) |
| `common/guards/` | Direct | Throttle, API key validation |
| `public-api/` | Adapt | Embed API endpoints pattern |
| `redis/` | Direct | Query result caching |
| `bullmq/` | Direct | Background data aggregation |

### New Code Required
- **Ingestion pipeline** — connector framework (API poller, PG reader, CSV parser, webhook receiver), schema mapper, transform engine, sync scheduler
- **Connector config UI** — tenant configures connection, maps fields, sets schedule, views sync history
- **Chart builder UI** — dropdown-based config (chart type, data source, dimensions, metrics)
- **Dashboard layout engine** — grid-based widget placement (CSS Grid, not drag-and-drop)
- **Embed renderer** — standalone Next.js route that renders a dashboard by embedId
- **Data aggregation pipeline** — roll up raw data points into time-bucketed summaries
- **SSE endpoint** — push updated metrics to embedded dashboards
- **Theme engine** — CSS custom properties from tenant branding config
- **Synthetic data generator** — seed script producing realistic web analytics data + external API/DB sources to ingest from

## 2-Week Sprint Plan

### Week 1: Ingestion Pipeline + Data Layer + Chart Builder
| Day | Task | Hours |
|-----|------|-------|
| 1 | Project scaffold + Prisma schema (Tenant, Dashboard, Widget, DataSource, DataSourceConfig, SyncRun, DataPoint, DeadLetterEvent) | 6 |
| 1 | Connector framework — base connector interface, API poller, CSV parser | 4 |
| 2 | PostgreSQL connector — read-only query execution, column mapping | 3 |
| 2 | Webhook receiver — tenant-scoped ingest URL, event validation, dead letter queue | 3 |
| 2 | Sync scheduler — BullMQ repeatable jobs per connector, sync history logging | 2 |
| 3 | Schema mapping + transform engine — field mapping UI, type casting, computed fields, row filtering | 6 |
| 3 | Connector config UI — add connector, configure connection, map fields, set schedule, view sync history | 4 |
| 4 | Data aggregation service — time-bucket rollups (hourly, daily, weekly) | 4 |
| 4 | Query engine — filter by date range, dimensions, group by period | 2 |
| 4 | Synthetic data seed — 3 tenants with data ingested through the pipeline (API + CSV + webhook sources) | 2 |
| 5 | Chart builder UI — select chart type, pick data source, configure axes | 4 |
| 5 | Widget rendering — Recharts components for all 7 widget types | 4 |

### Week 2: Dashboard, Embed, Theming, Polish
| Day | Task | Hours |
|-----|------|-------|
| 6 | Dashboard layout — CSS Grid placement, add/remove/resize widgets | 4 |
| 6 | Query caching in Redis (TTL-based) | 2 |
| 6 | Embed renderer route — /embed/:dashboardId with API key auth | 2 |
| 7 | iframe postMessage API — host ↔ embed communication (filters, events) | 4 |
| 7 | Theme engine — CSS custom properties from tenant branding config | 4 |
| 8 | White-label: logo, colors, fonts applied per-tenant in embed | 2 |
| 8 | SSE endpoint for real-time metric updates | 3 |
| 8 | Webhook connector → SSE — real-time events flow through pipeline to live dashboards | 3 |
| 9 | 3 sample host sites (static HTML on Vercel) embedding dashboards | 4 |
| 9 | Tenant admin — view embed code snippet, copy API key, list connectors, list dashboards | 4 |
| 10 | Seed data polish — ensure charts look convincing with realistic distributions | 2 |
| 10 | Demo flow walkthrough, README | 4 |
| 10 | Deploy to Vercel + Railway, test embed + ingestion on sample sites | 2 |

## Demo Strategy
- **Hero screenshot:** Dashboard with 4-6 widgets showing real-time web analytics
- **Pipeline demo:** Tenant configures a REST API connector → maps fields → data appears in dashboard within minutes
- **Webhook flow:** POST an event to the ingest URL → watch the dashboard update in real-time via SSE
- **Sync history:** Show the pipeline runs page with row counts, durations, and error handling
- **Embed proof:** Same dashboard embedded on 3 different sample sites with different themes
- **Builder demo:** Screen recording of configuring a chart and seeing it appear live
- **White-label:** Side-by-side of same dashboard with different tenant branding
- **Real-time:** Show metrics updating without page refresh

### Sample Host Sites
1. **SaaS product** — dark theme, analytics tab within a mock product UI
2. **E-commerce** — light theme, sales dashboard embedded in a shop admin
3. **Marketing agency** — branded with custom colors, client reporting dashboard

## Key Dependencies
```json
{
  "recharts": "^3.x",
  "d3-scale": "^4.x",
  "d3-shape": "^3.x",
  "@prisma/client": "^6.x",
  "@nestjs/bullmq": "^11.x",
  "date-fns": "^4.x"
}
```

## Risk Mitigation
| Risk | Mitigation |
|------|------------|
| Chart builder scope creep | Dropdown-based config only, NO drag-and-drop |
| Dashboard layout complexity | CSS Grid with fixed column count, not free-form |
| Real-time performance | SSE at 10-second intervals against pre-aggregated data |
| Embed security | API key + allowedOrigins whitelist + CSP frame-ancestors |
| "Why not Metabase?" question | README explains: this demonstrates building the infrastructure |
| SSE connection limit | Browsers limit 6 SSE connections per domain on HTTP/1.1; use HTTP/2 or connection multiplexing |
| CSP/iframe header conflicts | Set frame-ancestors per tenant allowedOrigins; verify Vercel default headers don't block |
| Seed data quality | Invest 4h+ in realistic distributions (seasonality, correlated metrics, funnel drop-off) |
| Recharts v3 API changes | Verify component APIs against v3 docs; v2 tutorials may not apply |
| Railway cold starts | Add keep-alive ping endpoint or upgrade tier to avoid 5-10s first-request delay |
| Pipeline scope creep | 4 connector types max — no Kafka, no S3, no custom protocol connectors |
| External DB credentials | Encrypt connection configs at rest (Prisma encrypted JSONB or app-level AES), never log credentials |
| Sync job failures | Dead letter queue + sync history UI — tenant can inspect and retry failed events |
| Webhook abuse | Rate limit per tenant ingest URL, validate payload size (max 1MB), reject malformed events |
