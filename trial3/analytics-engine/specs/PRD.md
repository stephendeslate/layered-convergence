# Product Requirements Document (PRD) — Analytics Engine

**Version:** 1.0 | **Date:** 2026-03-20

---

## 1. Feature Requirements

### F1: Data Ingestion Pipeline
- **F1.1:** REST API connector — poll external endpoint on cron schedule, JSONPath field mapping
- **F1.2:** PostgreSQL connector — read-only connection string, SQL query per sync, column mapping
- **F1.3:** CSV upload connector — manual file upload, column mapping, batch import
- **F1.4:** Webhook connector — tenant receives unique ingest URL, POST events in real-time
- **F1.5:** Schema mapping UI — map source fields to analytics dimensions/metrics
- **F1.6:** Transform steps — rename, cast type, derive computed fields, filter rows
- **F1.7:** Sync scheduling — cron-based for API/PostgreSQL connectors
- **F1.8:** Sync history — log of each pipeline run with status, rows, errors, duration
- **F1.9:** Dead letter queue — failed events stored for inspection and retry

### F2: Data Aggregation
- **F2.1:** Time-bucket rollups (hourly, daily, weekly) via BullMQ background jobs
- **F2.2:** Query engine — filter by date range, dimensions, group by period
- **F2.3:** Query caching in Redis with TTL

### F3: Dashboard Builder
- **F3.1:** Create/edit dashboards with name and layout
- **F3.2:** Add widgets with dropdown-based config (chart type, data source, axes)
- **F3.3:** CSS Grid layout with configurable widget position and size
- **F3.4:** Dashboard publish/unpublish toggle

### F4: Widget Rendering
- **F4.1:** Line Chart — time series trends
- **F4.2:** Bar Chart — categorical comparison
- **F4.3:** Pie/Donut Chart — distribution
- **F4.4:** Area Chart — stacked trends
- **F4.5:** KPI Card — single metric with trend arrow
- **F4.6:** Table — sortable data grid with pagination
- **F4.7:** Funnel — conversion steps with drop-off percentages

### F5: Embed System
- **F5.1:** Embed renderer route — /embed/:dashboardId with API key auth
- **F5.2:** iframe postMessage API — host-embed communication (filters, events)
- **F5.3:** Embed code generator — copy-paste snippet for tenant admin
- **F5.4:** allowedOrigins whitelist per embed config

### F6: Theming & White-Label
- **F6.1:** Tenant branding config (primaryColor, fontFamily, logoUrl)
- **F6.2:** CSS custom properties applied per-tenant in embed
- **F6.3:** Theme overrides per embed config

### F7: Real-Time Updates
- **F7.1:** SSE endpoint for dashboard metric updates
- **F7.2:** Webhook connector events flow through pipeline to SSE

## 2. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-1 | Tenant data isolation | RLS + application-level WHERE companyId |
| NFR-2 | API response time | < 500ms for dashboard queries (cached) |
| NFR-3 | Embed load time | < 3 seconds for initial render |
| NFR-4 | Concurrent SSE connections | Support 50+ per tenant |
| NFR-5 | Data point ingestion rate | 1000+ rows per sync run |

## 3. User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|------------|
| US-001 | Tenant Admin | Configure a REST API connector | I can ingest data from my external service |
| US-002 | Tenant Admin | Map source fields to dimensions/metrics | My data is structured for analytics |
| US-003 | Tenant Admin | Build a dashboard with multiple chart types | I can visualize my data |
| US-004 | Tenant Admin | Generate an embed code | I can add analytics to my product |
| US-005 | Tenant Admin | Customize dashboard branding | The embed matches my product's look |
| US-006 | End User | View live-updating charts | I see current data without refreshing |
| US-007 | End User | Filter by date range | I can analyze specific time periods |
| US-008 | Tenant Admin | View sync history | I can monitor pipeline health |
| US-009 | Tenant Admin | Retry failed ingestion events | I don't lose data |

## 4. Acceptance Criteria

- All 4 connector types ingest data and produce DataPoint records
- All 7 widget types render with Recharts
- Embed renderer loads dashboard with correct tenant theme
- SSE pushes updates to embedded dashboards
- Cross-tenant API calls return 404 (not 200 with null)
- `findFirstOrThrow` used for all tenant-scoped lookups
- E2E tests hit real PostgreSQL (no mocked Prisma)
- `fileParallelism: false` in E2E vitest config
