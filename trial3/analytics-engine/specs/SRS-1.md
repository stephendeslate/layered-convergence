# Software Requirements Specification — Part 1: API Contracts
# Analytics Engine

**Version:** 1.0 | **Date:** 2026-03-20

---

## 1. API Endpoints

### 1.1 Tenant Management

```
POST   /api/tenants                    — Create tenant
GET    /api/tenants/:id                — Get tenant by ID
PATCH  /api/tenants/:id                — Update tenant (name, branding)
GET    /api/tenants/:id/api-key        — Get/regenerate API key
```

### 1.2 Data Sources

```
POST   /api/tenants/:tenantId/data-sources          — Create data source
GET    /api/tenants/:tenantId/data-sources           — List data sources
GET    /api/tenants/:tenantId/data-sources/:id       — Get data source detail
PATCH  /api/tenants/:tenantId/data-sources/:id       — Update data source
DELETE /api/tenants/:tenantId/data-sources/:id       — Delete data source
POST   /api/tenants/:tenantId/data-sources/:id/sync  — Trigger manual sync
GET    /api/tenants/:tenantId/data-sources/:id/sync-history — Get sync runs
```

### 1.3 Data Source Configuration

```
PUT    /api/tenants/:tenantId/data-sources/:id/config     — Set connection config
PUT    /api/tenants/:tenantId/data-sources/:id/mapping     — Set field mapping
PUT    /api/tenants/:tenantId/data-sources/:id/transforms  — Set transform steps
PUT    /api/tenants/:tenantId/data-sources/:id/schedule    — Set sync schedule
```

### 1.4 Webhook Ingestion

```
POST   /api/ingest/:webhookToken       — Receive webhook event (public, rate-limited)
```

### 1.5 Dashboards

```
POST   /api/tenants/:tenantId/dashboards            — Create dashboard
GET    /api/tenants/:tenantId/dashboards             — List dashboards
GET    /api/tenants/:tenantId/dashboards/:id         — Get dashboard with widgets
PATCH  /api/tenants/:tenantId/dashboards/:id         — Update dashboard
DELETE /api/tenants/:tenantId/dashboards/:id         — Delete dashboard
POST   /api/tenants/:tenantId/dashboards/:id/publish — Publish/unpublish
```

### 1.6 Widgets

```
POST   /api/tenants/:tenantId/dashboards/:dashId/widgets      — Add widget
PATCH  /api/tenants/:tenantId/dashboards/:dashId/widgets/:id   — Update widget
DELETE /api/tenants/:tenantId/dashboards/:dashId/widgets/:id   — Remove widget
```

### 1.7 Embed

```
POST   /api/tenants/:tenantId/dashboards/:id/embed-config — Create/update embed config
GET    /api/embed/:dashboardId                             — Render embedded dashboard (API key auth)
GET    /api/embed/:dashboardId/data                        — Get dashboard data for embed (API key auth)
GET    /api/embed/:dashboardId/sse                         — SSE stream for real-time updates (API key auth)
```

### 1.8 Query

```
POST   /api/tenants/:tenantId/query     — Execute analytics query (date range, dimensions, metrics, groupBy)
```

### 1.9 Dead Letter Queue

```
GET    /api/tenants/:tenantId/data-sources/:id/dead-letters  — List failed events
POST   /api/tenants/:tenantId/data-sources/:id/dead-letters/:eventId/retry — Retry failed event
```

## 2. Request/Response Schemas

### Create Data Source
```json
// POST /api/tenants/:tenantId/data-sources
{
  "name": "string",
  "type": "api | postgresql | csv | webhook"
}
// Response: 201
{
  "id": "uuid",
  "name": "string",
  "type": "string",
  "tenantId": "uuid",
  "webhookToken": "string | null",
  "createdAt": "ISO8601"
}
```

### Analytics Query
```json
// POST /api/tenants/:tenantId/query
{
  "dataSourceId": "uuid",
  "dateRange": { "start": "ISO8601", "end": "ISO8601" },
  "dimensions": ["string"],
  "metrics": ["string"],
  "groupBy": "hour | day | week | month",
  "filters": [{ "dimension": "string", "operator": "eq | ne | gt | lt", "value": "any" }]
}
// Response: 200
{
  "data": [{ "period": "ISO8601", "values": {} }],
  "meta": { "totalRows": "number", "cached": "boolean" }
}
```

## 3. Authentication

| Endpoint Category | Auth Method |
|-------------------|-------------|
| Tenant management | Bearer token (admin) |
| Data source management | Bearer token (tenant admin) |
| Webhook ingestion | Webhook token in URL path |
| Embed endpoints | API key in X-API-Key header |
| SSE stream | API key in query parameter |

## 4. Error Responses

```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

All tenant-scoped lookups use `findFirstOrThrow` — missing or cross-tenant resources return 404.

## 5. Rate Limiting

| Endpoint | Limit |
|----------|-------|
| Webhook ingestion | 100 req/min per tenant |
| Embed data | 60 req/min per API key |
| Admin API | 120 req/min per token |
