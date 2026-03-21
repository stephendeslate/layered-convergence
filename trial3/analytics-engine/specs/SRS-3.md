# Software Requirements Specification — Part 3: Business Logic
# Analytics Engine

**Version:** 1.0 | **Date:** 2026-03-20

---

## 1. Data Ingestion Pipeline

### 1.1 Connector Framework
Each connector implements a common interface:

```typescript
interface Connector {
  type: 'api' | 'postgresql' | 'csv' | 'webhook';
  extract(config: ConnectionConfig): Promise<RawRecord[]>;
  validate(record: RawRecord, mapping: FieldMapping): ValidationResult;
}
```

### 1.2 REST API Connector
- Polls configured URL on cron schedule
- Supports JSONPath for nested field extraction
- Handles pagination (offset-based or cursor-based)
- Records errors in SyncRun log

### 1.3 PostgreSQL Connector
- Uses read-only connection string (separate from app DB)
- Executes configured SQL query per sync
- Maps columns to dimensions/metrics per fieldMapping config
- Connection timeout: 30 seconds

### 1.4 CSV Upload Connector
- Accepts file upload via API endpoint
- Parses CSV with configurable delimiter
- Maps columns per fieldMapping config
- Creates single SyncRun per upload

### 1.5 Webhook Connector
- Each data source gets a unique webhook token
- POST to `/api/ingest/:webhookToken` validates payload
- Rate limited: 100 req/min per tenant
- Max payload size: 1MB
- Failed events → DeadLetterEvent table

### 1.6 Schema Mapping
- Maps source fields to analytics dimensions (categorical) and metrics (numeric)
- Validation: dimension values must be strings, metric values must be numbers
- Unknown fields are silently dropped

### 1.7 Transform Steps
Executed in order per record:
1. **Rename** — rename source field
2. **Cast** — convert type (string → number, string → date)
3. **Derive** — compute new field from expression
4. **Filter** — exclude rows matching condition

### 1.8 Pipeline Execution Flow
```
1. Create SyncRun (status: running)
2. Extract raw records via connector
3. Apply transform steps
4. Validate against field mapping
5. Batch insert DataPoints (1000 per batch)
6. Update SyncRun (status: completed, rowsIngested)
7. On error: update SyncRun (status: failed, errorLog)
8. For webhook: failed records → DeadLetterEvent
```

## 2. Data Aggregation

### 2.1 Time Bucket Rollups
- BullMQ background job runs after each sync completion
- Aggregates DataPoints into hourly, daily, weekly buckets
- Stores aggregated results in QueryCache with TTL
- Supports: SUM, AVG, COUNT, MIN, MAX per metric

### 2.2 Query Engine
```typescript
interface AnalyticsQuery {
  dataSourceId: string;
  dateRange: { start: Date; end: Date };
  dimensions: string[];
  metrics: string[];
  groupBy: 'hour' | 'day' | 'week' | 'month';
  filters?: QueryFilter[];
}
```

- Checks QueryCache first (by query hash)
- Falls back to direct DataPoint query
- Results cached with configurable TTL (default 5 minutes)

## 3. Dashboard & Widget Logic

### 3.1 Dashboard Layout
- CSS Grid with 12-column layout
- Widgets have positionX, positionY, width, height
- Layout is stored as JSON in dashboard.layout
- Published dashboards are accessible via embed

### 3.2 Widget Configuration
Each widget type has specific config requirements:

| Widget Type | Required Config |
|-------------|----------------|
| Line Chart | dataSourceId, xAxis (timestamp), yAxis (metric), groupBy |
| Bar Chart | dataSourceId, category (dimension), value (metric) |
| Pie/Donut | dataSourceId, category (dimension), value (metric) |
| Area Chart | dataSourceId, xAxis (timestamp), yAxis (metric[]), stacked |
| KPI Card | dataSourceId, metric, comparisonPeriod |
| Table | dataSourceId, columns (dimension[] + metric[]), sortBy, pageSize |
| Funnel | dataSourceId, stages (dimension values in order), metric |

## 4. Embed System

### 4.1 Authentication
- Embed endpoints use API key (X-API-Key header)
- API key maps to tenant → tenant's dashboards only
- No session/cookie auth for embed endpoints

### 4.2 iframe Communication
```typescript
// Host → Embed (postMessage)
{ type: 'SET_FILTER', payload: { dimension: 'country', value: 'US' } }
{ type: 'SET_DATE_RANGE', payload: { start: '2026-01-01', end: '2026-03-01' } }
{ type: 'SET_THEME', payload: { primaryColor: '#FF0000' } }

// Embed → Host (postMessage)
{ type: 'DASHBOARD_LOADED', payload: { widgetCount: 6 } }
{ type: 'WIDGET_CLICKED', payload: { widgetId: 'xxx', data: {} } }
{ type: 'ERROR', payload: { message: 'string' } }
```

### 4.3 Origin Validation
- EmbedConfig.allowedOrigins checked against request Origin header
- If allowedOrigins is empty, all origins allowed (development mode)
- CSP frame-ancestors header set per request

## 5. Real-Time (SSE)

### 5.1 SSE Endpoint
- `GET /api/embed/:dashboardId/sse?apiKey=xxx`
- Sends `data` events with updated widget data
- Reconnect interval: 10 seconds
- Client uses EventSource API

### 5.2 Data Flow
```
Webhook event received →
  Pipeline processes and inserts DataPoints →
  Aggregation job runs →
  SSE controller checks for new data →
  Pushes update to connected clients
```

## 6. Theming

### 6.1 CSS Custom Properties
```css
--ae-primary-color: {tenant.primaryColor}
--ae-font-family: {tenant.fontFamily}
--ae-logo-url: url({tenant.logoUrl})
--ae-bg-color: {embedConfig.themeOverrides.bgColor || '#ffffff'}
--ae-text-color: {embedConfig.themeOverrides.textColor || '#1f2937'}
```

### 6.2 Theme Hierarchy
1. Tenant default branding (primaryColor, fontFamily, logoUrl)
2. EmbedConfig themeOverrides (per-embed customization)
3. Host postMessage SET_THEME (runtime override)
