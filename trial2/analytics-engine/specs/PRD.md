# Product Requirements Document (PRD)
# Embeddable Analytics Dashboard Engine

## Document Info
- **Version:** 1.0
- **Last Updated:** 2026-03-20
- **Status:** Approved

---

## 1. User Stories

### 1.1 Data Ingestion

#### US-1.1: Configure REST API Connector
**As a** tenant admin,
**I want to** configure a REST API connector with an endpoint URL, polling
schedule, and authentication headers,
**So that** I can automatically ingest data from external APIs into my
analytics dashboard.

**Acceptance Criteria:**
- Can enter an API endpoint URL
- Can set authentication headers (e.g., Bearer token)
- Can configure a polling schedule (every 15 min, hourly, daily)
- Can map response fields to analytics dimensions and metrics via JSONPath
- Can configure transform steps (rename, cast type, derive fields)
- Sync runs are logged with status and row count

#### US-1.2: Configure PostgreSQL Connector
**As a** tenant admin,
**I want to** connect to an external PostgreSQL database and run a query on
a schedule,
**So that** I can pull data from my existing database into analytics.

**Acceptance Criteria:**
- Can enter a PostgreSQL connection string (encrypted at rest)
- Can write a SQL query to execute on each sync
- Can map result columns to dimensions and metrics
- Can set a sync schedule
- Connection is read-only (no write operations)

#### US-1.3: Upload CSV Data
**As a** tenant admin,
**I want to** upload a CSV file and map its columns to analytics dimensions,
**So that** I can import historical data or data from sources without APIs.

**Acceptance Criteria:**
- Can upload a CSV file (max 10MB)
- Column headers are auto-detected
- Can map columns to dimensions and metrics
- Can preview first 10 rows before import
- Import creates DataPoints with correct field mapping

#### US-1.4: Receive Webhook Events
**As a** tenant admin,
**I want to** receive real-time events via a webhook URL,
**So that** I can ingest data as it happens without polling.

**Acceptance Criteria:**
- System generates a unique webhook URL for each data source
- POST requests to the URL create DataPoints
- Payload is validated against configured schema
- Failed events are stored in dead letter queue
- Rate limiting prevents abuse (per-tenant)

#### US-1.5: View Sync History
**As a** tenant admin,
**I want to** see a history of sync runs for each connector,
**So that** I can monitor pipeline health and troubleshoot failures.

**Acceptance Criteria:**
- List of sync runs with: status, start/end time, rows ingested, errors
- Can filter by status (running, completed, failed)
- Failed runs show error log details
- Can retry failed dead letter events

#### US-1.6: Configure Transform Steps
**As a** tenant admin,
**I want to** define transform steps that process data during ingestion,
**So that** I can clean, rename, and derive fields from raw source data.

**Acceptance Criteria:**
- Can add transform steps: rename field, cast type, derive computed field, filter rows
- Transform steps are applied in order during ingestion
- Preview shows how transforms affect sample data
- Transform config is saved per data source

### 1.2 Dashboard Builder

#### US-2.1: Create Dashboard
**As a** tenant admin,
**I want to** create a new dashboard with a name and description,
**So that** I can organize my analytics views.

**Acceptance Criteria:**
- Can create a dashboard with a name
- Dashboard is associated with the tenant
- Dashboard starts with an empty layout
- Can toggle published state for embedding

#### US-2.2: Add Widget to Dashboard
**As a** tenant admin,
**I want to** add a widget to my dashboard by selecting a chart type and
configuring its data source,
**So that** I can visualize my ingested data.

**Acceptance Criteria:**
- Can select from 7 widget types: Line, Bar, Pie/Donut, Area, KPI Card, Table, Funnel
- Can select a data source for the widget
- Can configure axes (X: dimension, Y: metric)
- Can set a date range filter
- Widget appears in the dashboard layout

#### US-2.3: Configure Widget Layout
**As a** tenant admin,
**I want to** position and size widgets on a CSS Grid layout,
**So that** I can arrange my dashboard according to my needs.

**Acceptance Criteria:**
- Dashboard uses a 12-column CSS Grid
- Can set widget position (column start, row start)
- Can set widget size (column span, row span)
- Can remove widgets from the dashboard
- Layout is saved as JSONB in the database

#### US-2.4: Preview Dashboard
**As a** tenant admin,
**I want to** preview my dashboard as it would appear when embedded,
**So that** I can verify the layout and data before publishing.

**Acceptance Criteria:**
- Preview shows the dashboard with current data
- Preview applies the tenant's theme
- Preview matches the embed renderer output

### 1.3 Embedding

#### US-3.1: Generate Embed Code
**As a** tenant admin,
**I want to** get an embed code snippet for my published dashboard,
**So that** I can add it to my product's HTML.

**Acceptance Criteria:**
- Embed code is an iframe tag with the correct URL
- URL includes the embed ID (not dashboard ID directly)
- API key is passed as a query parameter or header
- Snippet is copyable from the admin panel

#### US-3.2: Configure Embed Settings
**As a** tenant admin,
**I want to** configure allowed origins and theme overrides for each embed,
**So that** I can control where my dashboard is embedded and how it looks.

**Acceptance Criteria:**
- Can set allowed origins (list of domains)
- Can override theme properties (colors, fonts)
- Origins are validated against CSP frame-ancestors
- Invalid origins are rejected

#### US-3.3: View Embedded Dashboard
**As an** end user,
**I want to** see a fully rendered analytics dashboard within the host product,
**So that** I can view data without leaving the product.

**Acceptance Criteria:**
- Dashboard loads within iframe in < 3 seconds
- All widgets render with correct data
- Theme matches the tenant's branding
- No visible analytics platform branding

#### US-3.4: Host-Embed Communication
**As a** SaaS developer,
**I want to** communicate with the embedded dashboard via postMessage,
**So that** I can pass filters, receive events, and control the display.

**Acceptance Criteria:**
- Host can send filter parameters (date range, dimensions)
- Embed responds with acknowledgment messages
- Messages specify target origin (never use wildcard `*`)
- Invalid origins are rejected

### 1.4 Real-Time Updates

#### US-4.1: Live Dashboard Updates
**As an** end user,
**I want to** see dashboard data update automatically without refreshing,
**So that** I get the latest information in near real-time.

**Acceptance Criteria:**
- SSE endpoint pushes updates to connected embed clients
- Updates occur within 10 seconds of new data ingestion
- SSE connection is tenant-scoped (no cross-tenant leaks)
- Reconnection handled gracefully on connection drop

### 1.5 Administration

#### US-5.1: Tenant Admin Panel
**As a** tenant admin,
**I want to** manage my dashboards, connectors, and embed settings from a
single admin panel,
**So that** I have a central place to configure my analytics.

**Acceptance Criteria:**
- List of dashboards with publish status
- List of connectors with sync status
- Embed code snippet for each published dashboard
- API key display with copy button

#### US-5.2: Manage API Keys
**As a** tenant admin,
**I want to** view and manage my API key,
**So that** I can authenticate embed requests.

**Acceptance Criteria:**
- API key is displayed (masked by default, reveal on click)
- Can regenerate API key (invalidates old key)
- Key is used for embed authentication

---

## 2. Feature Descriptions

### 2.1 Data Ingestion Pipeline

The ingestion pipeline processes data from external sources through a defined
flow:

```
Source → Connector → Schema Mapper → Transform Engine → DataPoint Storage
                                                             ↓
                                              Aggregation (BullMQ job)
                                                             ↓
                                                        QueryCache
```

**Connector Framework:**
- Base interface defining `connect()`, `fetch()`, `validate()` methods
- Each connector type implements the interface with source-specific logic
- Connectors are stateless — connection config stored in DataSourceConfig

**Schema Mapping:**
- Maps source fields to analytics dimensions (categorical) and metrics (numeric)
- Supports JSONPath for nested API responses
- Validates data types during mapping

**Transform Engine:**
- Ordered list of transform steps applied during ingestion
- Step types: rename (field A → field B), cast (string → number), derive
  (computed field from expression), filter (include/exclude rows by condition)

**Sync Scheduling:**
- BullMQ repeatable jobs created from DataSourceConfig.syncSchedule
- Scheduler creates/updates/removes jobs when config changes
- Each sync run is logged in SyncRun table

**Error Handling:**
- Failed records stored in DeadLetterEvent table
- Sync runs record error logs and row counts
- Dead letter events can be retried individually

### 2.2 Dashboard Builder

The dashboard builder provides a dropdown-based configuration interface:

- **Chart type selection:** Dropdown with 7 widget types
- **Data source selection:** Dropdown of tenant's configured data sources
- **Axis configuration:** X-axis (dimension field), Y-axis (metric field)
- **Date range:** Preset ranges (7d, 30d, 90d, custom)
- **Layout:** CSS Grid position (column, row, width, height)

### 2.3 Widget Types

| Type | Description | Config Fields |
|------|-------------|---------------|
| **Line Chart** | Time series with multiple lines | dimensions, metrics, dateRange |
| **Bar Chart** | Categorical comparison | dimension, metric, orientation |
| **Pie/Donut** | Distribution breakdown | dimension, metric, donut (bool) |
| **Area Chart** | Stacked area trends | dimensions, metrics, stacked |
| **KPI Card** | Single metric with trend | metric, comparisonPeriod |
| **Table** | Sortable data grid | columns, pageSize, sortable |
| **Funnel** | Conversion funnel | stages (ordered metrics) |

### 2.4 Embed System

The embed system uses iframe + postMessage:

```
Host Page                          Embed Iframe
─────────                          ────────────
<iframe src="/embed/xyz?key=abc">
                                   Loads dashboard
                                   Verifies API key
                                   Checks allowedOrigins
                                   Renders with theme
                                   Connects SSE

postMessage({type: 'filter',       Receives filter
  dateRange: '30d'})               Re-renders widgets
                                   Sends acknowledgment
```

**Security:**
- API key validated on every request
- allowedOrigins checked against request origin
- CSP frame-ancestors set dynamically per embed config
- postMessage target origin specified (never `*`)

### 2.5 Theme Engine

Themes are applied via CSS custom properties:

```css
:root {
  --analytics-primary: #3b82f6;
  --analytics-font-family: 'Inter', sans-serif;
  --analytics-bg: #ffffff;
  --analytics-text: #1e293b;
  --analytics-border: #e2e8f0;
  --analytics-chart-1: #3b82f6;
  --analytics-chart-2: #10b981;
  --analytics-chart-3: #f59e0b;
  --analytics-chart-4: #ef4444;
  --analytics-chart-5: #8b5cf6;
}
```

Tenant branding config overrides these variables in the embed renderer.

### 2.6 Real-Time Updates (SSE)

```
Data ingested → Aggregation job completes → SSE event published
                                                  ↓
                                           Connected embeds
                                           receive update
                                                  ↓
                                           Widgets re-render
                                           with fresh data
```

- Endpoint: `GET /api/sse/dashboard/:dashboardId`
- Authentication: API key in query parameter
- Event format: `data: {"type": "update", "widgetId": "...", "data": {...}}`
- Heartbeat: every 30 seconds to keep connection alive

---

## 3. UX Requirements

### 3.1 Dashboard Builder UX

- Clean, minimal interface — no clutter
- Widget type icons for visual selection
- Live preview panel alongside configuration
- Clear save/publish workflow
- Error messages for invalid configurations

### 3.2 Connector Configuration UX

- Step-by-step wizard: Select type → Configure connection → Map fields →
  Set schedule → Test connection
- Field mapping with source preview (show sample data)
- Transform step builder with add/remove/reorder
- Connection test button with pass/fail feedback

### 3.3 Embed Renderer UX

- Full-width, borderless rendering within iframe
- Responsive layout that adapts to container size
- Loading skeleton while data fetches
- Error state for invalid API key or expired embed
- Smooth transitions on data updates

### 3.4 Admin Panel UX

- Dashboard list with quick actions (edit, embed, delete)
- Connector list with status indicators (active, errored, paused)
- One-click copy for embed code and API key
- Sync history with expandable error details

---

## 4. Non-Functional Requirements

### 4.1 Performance

| Metric | Target |
|--------|--------|
| Dashboard render | < 2s for 6-widget dashboard |
| Embed cold load | < 3s including iframe setup |
| API response time | < 200ms for cached queries |
| Ingestion throughput | > 100 rows/second per connector |
| SSE latency | < 10s from ingestion to embed update |

### 4.2 Security

| Requirement | Implementation |
|-------------|----------------|
| Tenant isolation | PostgreSQL RLS on all tenant-scoped tables |
| Embed auth | API key validation on every request |
| Admin auth | JWT with expiry and refresh |
| Input validation | class-validator on all DTOs |
| SQL injection | Prisma parameterized queries (no raw unsafe) |
| XSS prevention | React's default escaping + CSP headers |
| CORS | Restricted origins, no wildcards on SSE |
| Encryption | Connection configs encrypted at rest |

### 4.3 Reliability

| Requirement | Implementation |
|-------------|----------------|
| Failed ingestion | Dead letter queue with retry |
| Sync monitoring | History log with status, errors, duration |
| SSE reconnection | Client-side reconnection with exponential backoff |
| Job failure | BullMQ retry with configurable attempts |

### 4.4 Maintainability

| Requirement | Implementation |
|-------------|----------------|
| Type safety | TypeScript strict mode, no `as any` |
| Single source of truth | Enums/types in packages/shared |
| Module boundaries | NestJS module per domain (auth, dashboards, ingestion, etc.) |
| Testing | Unit + Integration + E2E tests |
| CI pipeline | Real lint + test commands |
| Documentation | CLAUDE.md with architecture and conventions |

---

## 5. Acceptance Criteria Matrix

| Feature | Must Have | Tested | Security |
|---------|-----------|--------|----------|
| RLS policies | Yes | E2E | RLS on all tables |
| REST API connector | Yes | Integration | Input validation |
| PostgreSQL connector | Yes | Integration | Encrypted config |
| CSV connector | Yes | Integration | File size limit |
| Webhook connector | Yes | Integration | Rate limiting |
| Schema mapping | Yes | Integration | Type validation |
| Transform engine | Yes | Unit | Expression sandboxing |
| Sync scheduler | Yes | Integration | N/A |
| Dead letter queue | Yes | Integration | N/A |
| Dashboard CRUD | Yes | Integration | Tenant-scoped |
| Widget CRUD | Yes | Integration | Tenant-scoped |
| 7 widget types | Yes | Frontend | N/A |
| CSS Grid layout | Yes | Frontend | N/A |
| iframe embed | Yes | E2E | API key + origins |
| postMessage API | Yes | Frontend | Target origin |
| SSE updates | Yes | Integration | Tenant-scoped |
| White-label theme | Yes | Frontend | N/A |
| Admin panel | Yes | Frontend | JWT auth |
| Sync history | Yes | Integration | Tenant-scoped |
| Query caching | Should | Integration | Cache invalidation |
| Rate limiting | Should | E2E | Applied to routes |
