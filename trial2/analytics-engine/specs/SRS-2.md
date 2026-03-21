# System Requirements Specification — Part 2: Database Schema & API Design
# Embeddable Analytics Dashboard Engine

## Document Info
- **Version:** 1.0
- **Last Updated:** 2026-03-20
- **Status:** Approved

---

## 1. Database Schema (Prisma)

### 1.1 Full Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Tenant {
  id            String          @id @default(cuid())
  name          String
  slug          String          @unique
  apiKey        String          @unique
  apiKeyHash    String
  branding      Json            @default("{}")
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  dashboards    Dashboard[]
  dataSources   DataSource[]

  @@map("tenants")
}

model Dashboard {
  id            String          @id @default(cuid())
  tenantId      String
  name          String
  description   String?
  layout        Json            @default("[]")
  isPublished   Boolean         @default(false)
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  tenant        Tenant          @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  widgets       Widget[]
  embedConfigs  EmbedConfig[]

  @@index([tenantId])
  @@map("dashboards")
}

model Widget {
  id            String          @id @default(cuid())
  dashboardId   String
  type          String          // WidgetType enum from shared package
  config        Json            @default("{}")
  position      Json            @default("{}")  // { col: number, row: number }
  size          Json            @default("{}")  // { colSpan: number, rowSpan: number }
  title         String?
  dataSourceId  String?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  dashboard     Dashboard       @relation(fields: [dashboardId], references: [id], onDelete: Cascade)
  dataSource    DataSource?     @relation(fields: [dataSourceId], references: [id])

  @@index([dashboardId])
  @@map("widgets")
}

model DataSource {
  id            String          @id @default(cuid())
  tenantId      String
  name          String
  type          String          // ConnectorType enum from shared package
  isActive      Boolean         @default(true)
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  tenant        Tenant          @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  config        DataSourceConfig?
  syncRuns      SyncRun[]
  dataPoints    DataPoint[]
  widgets       Widget[]
  deadLetterEvents DeadLetterEvent[]

  @@index([tenantId])
  @@map("data_sources")
}

model DataSourceConfig {
  id              String        @id @default(cuid())
  dataSourceId    String        @unique
  connectionConfig Json         @default("{}")  // Encrypted connection details
  fieldMapping    Json          @default("[]")  // Array of field mappings
  transformSteps  Json          @default("[]")  // Array of transform steps
  syncSchedule    String?       // Cron expression
  webhookSecret   String?       // For webhook signature verification
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  dataSource      DataSource    @relation(fields: [dataSourceId], references: [id], onDelete: Cascade)

  @@map("data_source_configs")
}

model SyncRun {
  id            String          @id @default(cuid())
  dataSourceId  String
  status        String          @default("pending") // SyncStatus enum
  rowsIngested  Int             @default(0)
  errorLog      String?
  startedAt     DateTime        @default(now())
  completedAt   DateTime?

  dataSource    DataSource      @relation(fields: [dataSourceId], references: [id], onDelete: Cascade)

  @@index([dataSourceId])
  @@index([status])
  @@map("sync_runs")
}

model DataPoint {
  id            String          @id @default(cuid())
  dataSourceId  String
  tenantId      String
  timestamp     DateTime
  dimensions    Json            @default("{}")
  metrics       Json            @default("{}")
  createdAt     DateTime        @default(now())

  dataSource    DataSource      @relation(fields: [dataSourceId], references: [id], onDelete: Cascade)

  @@index([dataSourceId])
  @@index([tenantId])
  @@index([timestamp])
  @@index([tenantId, dataSourceId, timestamp])
  @@map("data_points")
}

model EmbedConfig {
  id              String        @id @default(cuid())
  dashboardId     String
  allowedOrigins  String[]      @default([])
  themeOverrides  Json          @default("{}")
  isActive        Boolean       @default(true)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  dashboard       Dashboard     @relation(fields: [dashboardId], references: [id], onDelete: Cascade)

  @@index([dashboardId])
  @@map("embed_configs")
}

model QueryCache {
  id            String          @id @default(cuid())
  queryHash     String          @unique
  tenantId      String
  result        Json
  expiresAt     DateTime

  @@index([queryHash])
  @@index([expiresAt])
  @@map("query_cache")
}

model DeadLetterEvent {
  id            String          @id @default(cuid())
  dataSourceId  String
  tenantId      String
  payload       Json
  errorReason   String
  retriedAt     DateTime?
  createdAt     DateTime        @default(now())

  dataSource    DataSource      @relation(fields: [dataSourceId], references: [id], onDelete: Cascade)

  @@index([dataSourceId])
  @@index([tenantId])
  @@map("dead_letter_events")
}
```

### 1.2 RLS Policy Design

Every tenant-scoped table requires RLS policies. The following tables are
tenant-scoped:

| Table | Tenant Column | Policy Type |
|-------|---------------|-------------|
| dashboards | tenantId | SELECT, INSERT, UPDATE, DELETE |
| widgets | via dashboard.tenantId | SELECT, INSERT, UPDATE, DELETE (joined) |
| data_sources | tenantId | SELECT, INSERT, UPDATE, DELETE |
| data_source_configs | via data_source.tenantId | SELECT, INSERT, UPDATE, DELETE (joined) |
| sync_runs | via data_source.tenantId | SELECT (joined) |
| data_points | tenantId | SELECT, INSERT |
| embed_configs | via dashboard.tenantId | SELECT, INSERT, UPDATE, DELETE (joined) |
| query_cache | tenantId | SELECT, INSERT, DELETE |
| dead_letter_events | tenantId | SELECT, INSERT |

RLS context is set per-request using:
```sql
SET LOCAL app.current_tenant_id = '<tenantId>';
```

Policies use:
```sql
current_setting('app.current_tenant_id', true)
```

### 1.3 Index Strategy

Indexes are designed for common query patterns:

| Index | Purpose |
|-------|---------|
| `data_points(tenantId, dataSourceId, timestamp)` | Primary query path for widget data |
| `data_points(timestamp)` | Time-range filtering |
| `sync_runs(dataSourceId)` | Sync history for a data source |
| `sync_runs(status)` | Filter by sync status |
| `query_cache(queryHash)` | Cache lookup |
| `query_cache(expiresAt)` | Cache cleanup |
| `dead_letter_events(dataSourceId)` | DLQ by data source |
| `dashboards(tenantId)` | Tenant's dashboards |
| `data_sources(tenantId)` | Tenant's data sources |

---

## 2. REST API Design

### 2.1 API Conventions

- Base URL: `/api/v1`
- Authentication: JWT Bearer token (admin) or API key (embed)
- Content-Type: `application/json`
- Pagination: cursor-based with `cursor` and `limit` parameters
- Error format: `{ statusCode, message, errors? }`
- Dates: ISO 8601 format
- IDs: CUID strings

### 2.2 Authentication Endpoints

#### POST /api/v1/auth/login

Authenticate a tenant admin and receive JWT token.

**Request:**
```json
{
  "email": "admin@tenant.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400
}
```

**Errors:**
- 401: Invalid credentials

#### POST /api/v1/auth/validate-key

Validate an API key (used by embed renderer).

**Request:**
```json
{
  "apiKey": "ak_live_abc123..."
}
```

**Response (200):**
```json
{
  "valid": true,
  "tenantId": "clx...",
  "tenantName": "Acme Corp"
}
```

**Errors:**
- 401: Invalid API key

### 2.3 Dashboard Endpoints

#### GET /api/v1/dashboards

List dashboards for the authenticated tenant.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| cursor | string | null | Pagination cursor |
| limit | number | 20 | Items per page (max 100) |

**Response (200):**
```json
{
  "data": [
    {
      "id": "clx...",
      "name": "Web Analytics",
      "description": "Main website analytics dashboard",
      "isPublished": true,
      "widgetCount": 6,
      "createdAt": "2026-03-20T00:00:00Z",
      "updatedAt": "2026-03-20T00:00:00Z"
    }
  ],
  "nextCursor": "clx...",
  "hasMore": false
}
```

#### POST /api/v1/dashboards

Create a new dashboard.

**Request:**
```json
{
  "name": "Web Analytics",
  "description": "Main website analytics dashboard"
}
```

**Response (201):**
```json
{
  "id": "clx...",
  "tenantId": "clx...",
  "name": "Web Analytics",
  "description": "Main website analytics dashboard",
  "layout": [],
  "isPublished": false,
  "createdAt": "2026-03-20T00:00:00Z",
  "updatedAt": "2026-03-20T00:00:00Z"
}
```

**Errors:**
- 400: Validation error (name required)

#### GET /api/v1/dashboards/:id

Get a dashboard with its widgets.

**Response (200):**
```json
{
  "id": "clx...",
  "tenantId": "clx...",
  "name": "Web Analytics",
  "description": "Main website analytics dashboard",
  "layout": [],
  "isPublished": true,
  "widgets": [
    {
      "id": "clx...",
      "type": "line",
      "title": "Page Views",
      "config": { "metric": "pageViews", "dimension": "date" },
      "position": { "col": 0, "row": 0 },
      "size": { "colSpan": 6, "rowSpan": 2 },
      "dataSourceId": "clx..."
    }
  ],
  "createdAt": "2026-03-20T00:00:00Z",
  "updatedAt": "2026-03-20T00:00:00Z"
}
```

**Errors:**
- 404: Dashboard not found

#### PATCH /api/v1/dashboards/:id

Update a dashboard.

**Request:**
```json
{
  "name": "Updated Name",
  "isPublished": true,
  "layout": [
    { "widgetId": "clx...", "col": 0, "row": 0, "colSpan": 6, "rowSpan": 2 }
  ]
}
```

**Response (200):** Updated dashboard object.

**Errors:**
- 400: Validation error
- 404: Dashboard not found

#### DELETE /api/v1/dashboards/:id

Delete a dashboard and all its widgets.

**Response (204):** No content.

**Errors:**
- 404: Dashboard not found

### 2.4 Widget Endpoints

#### POST /api/v1/dashboards/:dashboardId/widgets

Add a widget to a dashboard.

**Request:**
```json
{
  "type": "line",
  "title": "Page Views Over Time",
  "config": {
    "metric": "pageViews",
    "dimension": "date",
    "dateRange": "30d"
  },
  "position": { "col": 0, "row": 0 },
  "size": { "colSpan": 6, "rowSpan": 2 },
  "dataSourceId": "clx..."
}
```

**Response (201):** Created widget object.

**Errors:**
- 400: Validation error
- 404: Dashboard not found

#### PATCH /api/v1/dashboards/:dashboardId/widgets/:widgetId

Update a widget's configuration or position.

**Request:**
```json
{
  "title": "Updated Title",
  "config": { "metric": "uniqueVisitors", "dimension": "date" },
  "position": { "col": 6, "row": 0 },
  "size": { "colSpan": 6, "rowSpan": 2 }
}
```

**Response (200):** Updated widget object.

**Errors:**
- 400: Validation error
- 404: Widget not found

#### DELETE /api/v1/dashboards/:dashboardId/widgets/:widgetId

Delete a widget.

**Response (204):** No content.

**Errors:**
- 404: Widget not found

### 2.5 Data Source Endpoints

#### GET /api/v1/data-sources

List data sources for the authenticated tenant.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| cursor | string | null | Pagination cursor |
| limit | number | 20 | Items per page |
| type | string | null | Filter by connector type |

**Response (200):**
```json
{
  "data": [
    {
      "id": "clx...",
      "name": "Website API",
      "type": "rest_api",
      "isActive": true,
      "lastSyncStatus": "completed",
      "lastSyncAt": "2026-03-20T00:00:00Z",
      "createdAt": "2026-03-20T00:00:00Z"
    }
  ],
  "nextCursor": null,
  "hasMore": false
}
```

#### POST /api/v1/data-sources

Create a new data source.

**Request:**
```json
{
  "name": "Website API",
  "type": "rest_api",
  "config": {
    "connectionConfig": {
      "url": "https://api.example.com/analytics",
      "method": "GET",
      "headers": { "Authorization": "Bearer token123" },
      "responsePath": "$.data"
    },
    "fieldMapping": [
      { "source": "date", "target": "date", "type": "dimension", "dataType": "date" },
      { "source": "views", "target": "pageViews", "type": "metric", "dataType": "number" }
    ],
    "transformSteps": [
      { "type": "cast", "field": "views", "toType": "number" }
    ],
    "syncSchedule": "0 */15 * * *"
  }
}
```

**Response (201):** Created data source with config.

**Errors:**
- 400: Validation error (invalid type, missing config)

#### GET /api/v1/data-sources/:id

Get a data source with its config (connection details masked).

**Response (200):**
```json
{
  "id": "clx...",
  "name": "Website API",
  "type": "rest_api",
  "isActive": true,
  "config": {
    "connectionConfig": {
      "url": "https://api.example.com/analytics",
      "method": "GET",
      "headers": { "Authorization": "Bearer ****" },
      "responsePath": "$.data"
    },
    "fieldMapping": [...],
    "transformSteps": [...],
    "syncSchedule": "0 */15 * * *"
  },
  "createdAt": "2026-03-20T00:00:00Z"
}
```

#### PATCH /api/v1/data-sources/:id

Update a data source and/or its config.

**Request:**
```json
{
  "name": "Updated Name",
  "isActive": false,
  "config": {
    "syncSchedule": "0 * * * *"
  }
}
```

**Response (200):** Updated data source object.

#### DELETE /api/v1/data-sources/:id

Delete a data source and all associated data.

**Response (204):** No content.

### 2.6 Sync Run Endpoints

#### GET /api/v1/data-sources/:dataSourceId/sync-runs

List sync runs for a data source.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| cursor | string | null | Pagination cursor |
| limit | number | 20 | Items per page |
| status | string | null | Filter by status |

**Response (200):**
```json
{
  "data": [
    {
      "id": "clx...",
      "status": "completed",
      "rowsIngested": 1500,
      "errorLog": null,
      "startedAt": "2026-03-20T00:00:00Z",
      "completedAt": "2026-03-20T00:01:30Z",
      "durationMs": 90000
    }
  ],
  "nextCursor": null,
  "hasMore": false
}
```

#### POST /api/v1/data-sources/:dataSourceId/sync

Trigger a manual sync run.

**Response (202):**
```json
{
  "syncRunId": "clx...",
  "status": "pending",
  "message": "Sync run queued"
}
```

### 2.7 Webhook Ingestion Endpoint

#### POST /api/v1/ingest/:webhookId

Receive webhook events for a data source.

**Request:**
```json
{
  "event": "page_view",
  "timestamp": "2026-03-20T12:00:00Z",
  "data": {
    "page": "/pricing",
    "sessionId": "sess_123",
    "duration": 45
  }
}
```

**Response (202):**
```json
{
  "accepted": true,
  "eventId": "clx..."
}
```

**Errors:**
- 400: Invalid payload
- 401: Invalid webhook secret (if signature verification enabled)
- 404: Webhook endpoint not found
- 429: Rate limit exceeded

### 2.8 Query Endpoints

#### POST /api/v1/query

Execute an analytics query.

**Request:**
```json
{
  "dataSourceId": "clx...",
  "metrics": ["pageViews", "uniqueVisitors"],
  "dimensions": ["page"],
  "dateRange": {
    "start": "2026-03-01T00:00:00Z",
    "end": "2026-03-20T23:59:59Z"
  },
  "groupBy": "day",
  "filters": [
    { "field": "page", "operator": "eq", "value": "/pricing" }
  ],
  "limit": 100
}
```

**Response (200):**
```json
{
  "data": [
    {
      "date": "2026-03-20",
      "pageViews": 1250,
      "uniqueVisitors": 890,
      "page": "/pricing"
    }
  ],
  "meta": {
    "totalRows": 20,
    "cached": true,
    "queryTimeMs": 45
  }
}
```

**Errors:**
- 400: Invalid query parameters
- 404: Data source not found

### 2.9 Embed Endpoints

#### GET /api/v1/embed/:embedId

Get embed configuration and dashboard data.

**Headers:**
- `X-API-Key: ak_live_abc123...`

**Response (200):**
```json
{
  "dashboard": {
    "id": "clx...",
    "name": "Web Analytics",
    "layout": [...],
    "widgets": [...]
  },
  "theme": {
    "primaryColor": "#3b82f6",
    "fontFamily": "Inter",
    "logoUrl": "https://example.com/logo.png",
    "overrides": {}
  },
  "allowedOrigins": ["https://app.example.com"]
}
```

**Errors:**
- 401: Invalid API key
- 403: Origin not allowed
- 404: Embed not found

#### POST /api/v1/embed

Create an embed configuration.

**Request:**
```json
{
  "dashboardId": "clx...",
  "allowedOrigins": ["https://app.example.com"],
  "themeOverrides": {
    "primaryColor": "#10b981"
  }
}
```

**Response (201):** Created embed config.

#### PATCH /api/v1/embed/:embedId

Update embed configuration.

**Request:**
```json
{
  "allowedOrigins": ["https://app.example.com", "https://staging.example.com"],
  "themeOverrides": { "primaryColor": "#ef4444" }
}
```

**Response (200):** Updated embed config.

### 2.10 SSE Endpoint

#### GET /api/v1/sse/dashboard/:dashboardId

Subscribe to real-time dashboard updates.

**Headers:**
- `X-API-Key: ak_live_abc123...`

**Response:** SSE stream.

```
event: connected
data: {"dashboardId": "clx...", "timestamp": "2026-03-20T12:00:00Z"}

event: update
data: {"widgetId": "clx...", "data": {"pageViews": 1251, "timestamp": "2026-03-20T12:00:10Z"}}

event: heartbeat
data: {"timestamp": "2026-03-20T12:00:30Z"}
```

**Errors:**
- 401: Invalid API key
- 404: Dashboard not found

### 2.11 Dead Letter Queue Endpoints

#### GET /api/v1/data-sources/:dataSourceId/dead-letters

List dead letter events for a data source.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| cursor | string | null | Pagination cursor |
| limit | number | 20 | Items per page |

**Response (200):**
```json
{
  "data": [
    {
      "id": "clx...",
      "payload": { "event": "page_view", "data": {} },
      "errorReason": "Invalid field mapping: 'views' not found in payload",
      "retriedAt": null,
      "createdAt": "2026-03-20T12:00:00Z"
    }
  ],
  "nextCursor": null,
  "hasMore": false
}
```

#### POST /api/v1/data-sources/:dataSourceId/dead-letters/:id/retry

Retry a dead letter event.

**Response (202):**
```json
{
  "retried": true,
  "syncRunId": "clx..."
}
```

### 2.12 Tenant Admin Endpoints

#### GET /api/v1/tenant

Get current tenant information.

**Response (200):**
```json
{
  "id": "clx...",
  "name": "Acme Corp",
  "slug": "acme-corp",
  "apiKey": "ak_live_****",
  "branding": {
    "primaryColor": "#3b82f6",
    "fontFamily": "Inter",
    "logoUrl": "https://example.com/logo.png"
  },
  "createdAt": "2026-03-20T00:00:00Z"
}
```

#### PATCH /api/v1/tenant

Update tenant branding.

**Request:**
```json
{
  "branding": {
    "primaryColor": "#10b981",
    "fontFamily": "Roboto",
    "logoUrl": "https://example.com/new-logo.png"
  }
}
```

**Response (200):** Updated tenant object.

#### POST /api/v1/tenant/regenerate-key

Regenerate the tenant's API key.

**Response (200):**
```json
{
  "apiKey": "ak_live_new_key_123...",
  "message": "API key regenerated. Old key is now invalid."
}
```

---

## 3. Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Request body validation failed |
| INVALID_QUERY | 400 | Invalid query parameters |
| INVALID_CONNECTOR_TYPE | 400 | Unknown connector type |
| INVALID_WIDGET_TYPE | 400 | Unknown widget type |
| INVALID_CRON | 400 | Invalid cron expression |
| FILE_TOO_LARGE | 400 | CSV file exceeds size limit |
| UNAUTHORIZED | 401 | Missing or invalid authentication |
| INVALID_API_KEY | 401 | API key is invalid or expired |
| INVALID_CREDENTIALS | 401 | Email or password incorrect |
| FORBIDDEN | 403 | Access denied (wrong tenant) |
| ORIGIN_NOT_ALLOWED | 403 | Request origin not in allowedOrigins |
| NOT_FOUND | 404 | Resource not found |
| DASHBOARD_NOT_FOUND | 404 | Dashboard does not exist |
| DATA_SOURCE_NOT_FOUND | 404 | Data source does not exist |
| EMBED_NOT_FOUND | 404 | Embed config does not exist |
| WEBHOOK_NOT_FOUND | 404 | Webhook endpoint does not exist |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Unexpected server error |

---

## 4. Pagination

All list endpoints use cursor-based pagination:

```json
{
  "data": [...],
  "nextCursor": "clx_cursor_value",
  "hasMore": true
}
```

**Parameters:**
- `cursor` (optional): The cursor from the previous response's `nextCursor`
- `limit` (optional): Number of items per page (default 20, max 100)

**Implementation:**
```sql
SELECT * FROM table
WHERE id > :cursor
ORDER BY id ASC
LIMIT :limit + 1
```

The extra row determines `hasMore`. If `limit + 1` rows are returned,
`hasMore = true` and the last row is excluded from results.

---

## 5. Field Mapping Schema

Field mappings define how source data maps to analytics dimensions and metrics:

```json
[
  {
    "source": "date",
    "target": "timestamp",
    "type": "dimension",
    "dataType": "date",
    "jsonPath": "$.created_at"
  },
  {
    "source": "page_url",
    "target": "page",
    "type": "dimension",
    "dataType": "string"
  },
  {
    "source": "view_count",
    "target": "pageViews",
    "type": "metric",
    "dataType": "number"
  }
]
```

**Field Types:**
- `dimension`: Categorical field for grouping (string, date)
- `metric`: Numeric field for aggregation (number)

**Data Types:**
- `string`: Text value
- `number`: Numeric value (parsed from string if needed)
- `date`: Date/datetime value (ISO 8601)
- `boolean`: True/false value

---

## 6. Transform Step Schema

Transform steps are applied in order during ingestion:

```json
[
  {
    "type": "rename",
    "source": "page_url",
    "target": "page"
  },
  {
    "type": "cast",
    "field": "view_count",
    "toType": "number"
  },
  {
    "type": "derive",
    "field": "bounceRate",
    "expression": "bounces / sessions * 100"
  },
  {
    "type": "filter",
    "field": "page",
    "operator": "not_eq",
    "value": "/admin"
  }
]
```

**Transform Types:**
- `rename`: Rename a field
- `cast`: Cast a field to a different type
- `derive`: Compute a new field from an expression
- `filter`: Include/exclude rows by condition

**Filter Operators:**
- `eq`: Equal
- `not_eq`: Not equal
- `gt`: Greater than
- `gte`: Greater than or equal
- `lt`: Less than
- `lte`: Less than or equal
- `contains`: String contains
- `not_contains`: String does not contain

---

## 7. Widget Config Schemas

### 7.1 Line Chart
```json
{
  "metric": "pageViews",
  "dimension": "date",
  "dateRange": "30d",
  "groupBy": "day",
  "additionalMetrics": ["uniqueVisitors"]
}
```

### 7.2 Bar Chart
```json
{
  "metric": "pageViews",
  "dimension": "page",
  "dateRange": "30d",
  "orientation": "vertical",
  "limit": 10
}
```

### 7.3 Pie/Donut Chart
```json
{
  "metric": "sessions",
  "dimension": "source",
  "dateRange": "30d",
  "donut": true,
  "limit": 8
}
```

### 7.4 Area Chart
```json
{
  "metrics": ["revenue", "costs"],
  "dimension": "date",
  "dateRange": "90d",
  "groupBy": "week",
  "stacked": true
}
```

### 7.5 KPI Card
```json
{
  "metric": "totalUsers",
  "comparisonPeriod": "previous_period",
  "dateRange": "30d",
  "format": "number",
  "prefix": "",
  "suffix": ""
}
```

### 7.6 Table
```json
{
  "columns": [
    { "field": "page", "label": "Page", "sortable": true },
    { "field": "pageViews", "label": "Views", "sortable": true },
    { "field": "avgDuration", "label": "Avg Duration", "sortable": true }
  ],
  "pageSize": 10,
  "dateRange": "30d"
}
```

### 7.7 Funnel
```json
{
  "stages": [
    { "name": "Visited", "metric": "visits" },
    { "name": "Signed Up", "metric": "signups" },
    { "name": "Activated", "metric": "activations" },
    { "name": "Purchased", "metric": "purchases" }
  ],
  "dateRange": "30d"
}
```

---

## 8. Connection Config Schemas

### 8.1 REST API Connector
```json
{
  "url": "https://api.example.com/analytics",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer token123",
    "Content-Type": "application/json"
  },
  "queryParams": { "limit": "1000" },
  "responsePath": "$.data",
  "pagination": {
    "type": "cursor",
    "cursorParam": "cursor",
    "cursorPath": "$.nextCursor"
  }
}
```

### 8.2 PostgreSQL Connector
```json
{
  "connectionString": "postgresql://user:pass@host:5432/db",
  "query": "SELECT date, page, views FROM analytics WHERE date > $1",
  "params": ["{{lastSyncDate}}"],
  "readOnly": true
}
```

### 8.3 CSV Connector
```json
{
  "delimiter": ",",
  "hasHeader": true,
  "encoding": "utf-8",
  "dateFormat": "YYYY-MM-DD"
}
```

### 8.4 Webhook Connector
```json
{
  "webhookUrl": "https://api.analytics-engine.com/api/v1/ingest/wh_abc123",
  "signatureHeader": "X-Signature-256",
  "signatureAlgorithm": "sha256"
}
```
