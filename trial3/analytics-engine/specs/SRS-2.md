# Software Requirements Specification — Part 2: Database Schema
# Analytics Engine

**Version:** 1.0 | **Date:** 2026-03-20

---

## 1. Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Tenant {
  id            String   @id @default(uuid())
  name          String
  apiKey        String   @unique @default(uuid())
  primaryColor  String   @default("#3B82F6")
  fontFamily    String   @default("Inter")
  logoUrl       String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  dashboards    Dashboard[]
  dataSources   DataSource[]

  @@map("tenants")
}

model Dashboard {
  id          String   @id @default(uuid())
  tenantId    String
  name        String
  layout      Json     @default("{}")
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  tenant      Tenant    @relation(fields: [tenantId], references: [id])
  widgets     Widget[]
  embedConfig EmbedConfig?

  @@map("dashboards")
}

model Widget {
  id          String   @id @default(uuid())
  dashboardId String
  type        String   // line, bar, pie, area, kpi, table, funnel
  config      Json     @default("{}")
  positionX   Int      @default(0)
  positionY   Int      @default(0)
  width       Int      @default(6)
  height      Int      @default(4)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  dashboard   Dashboard @relation(fields: [dashboardId], references: [id], onDelete: Cascade)

  @@map("widgets")
}

model DataSource {
  id            String   @id @default(uuid())
  tenantId      String
  name          String
  type          String   // api, postgresql, csv, webhook
  webhookToken  String?  @unique @default(uuid())
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  tenant        Tenant            @relation(fields: [tenantId], references: [id])
  config        DataSourceConfig?
  syncRuns      SyncRun[]
  dataPoints    DataPoint[]
  deadLetters   DeadLetterEvent[]

  @@map("data_sources")
}

model DataSourceConfig {
  id              String   @id @default(uuid())
  dataSourceId    String   @unique
  connectionConfig Json    @default("{}") // encrypted at app level
  fieldMapping    Json     @default("{}") // source field → dimension/metric mapping
  transformSteps  Json     @default("[]") // array of transform operations
  syncSchedule    String?  // cron expression
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  dataSource      DataSource @relation(fields: [dataSourceId], references: [id], onDelete: Cascade)

  @@map("data_source_configs")
}

model SyncRun {
  id            String   @id @default(uuid())
  dataSourceId  String
  status        String   // running, completed, failed
  rowsIngested  Int      @default(0)
  errorLog      String?
  startedAt     DateTime @default(now())
  completedAt   DateTime?

  dataSource    DataSource @relation(fields: [dataSourceId], references: [id], onDelete: Cascade)

  @@map("sync_runs")
}

model DataPoint {
  id            String   @id @default(uuid())
  dataSourceId  String
  tenantId      String
  timestamp     DateTime
  dimensions    Json     @default("{}")
  metrics       Json     @default("{}")
  createdAt     DateTime @default(now())

  dataSource    DataSource @relation(fields: [dataSourceId], references: [id], onDelete: Cascade)

  @@index([tenantId, dataSourceId, timestamp])
  @@map("data_points")
}

model EmbedConfig {
  id              String   @id @default(uuid())
  dashboardId     String   @unique
  allowedOrigins  String[] @default([])
  themeOverrides  Json     @default("{}")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  dashboard       Dashboard @relation(fields: [dashboardId], references: [id], onDelete: Cascade)

  @@map("embed_configs")
}

model QueryCache {
  id        String   @id @default(uuid())
  queryHash String   @unique
  result    Json
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@map("query_cache")
}

model DeadLetterEvent {
  id            String   @id @default(uuid())
  dataSourceId  String
  payload       Json
  errorReason   String
  retriedAt     DateTime?
  createdAt     DateTime @default(now())

  dataSource    DataSource @relation(fields: [dataSourceId], references: [id], onDelete: Cascade)

  @@map("dead_letter_events")
}
```

## 2. RLS Policies [VERIFY:RLS]

```sql
-- Enable RLS on all tenant-scoped tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_source_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE embed_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dead_letter_events ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policies
CREATE POLICY tenant_isolation_dashboards ON dashboards
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY tenant_isolation_data_sources ON data_sources
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY tenant_isolation_data_points ON data_points
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY tenant_isolation_widgets ON widgets
  USING (dashboard_id IN (
    SELECT id FROM dashboards WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
  ));

CREATE POLICY tenant_isolation_sync_runs ON sync_runs
  USING (data_source_id IN (
    SELECT id FROM data_sources WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
  ));

CREATE POLICY tenant_isolation_dead_letters ON dead_letter_events
  USING (data_source_id IN (
    SELECT id FROM data_sources WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
  ));

CREATE POLICY tenant_isolation_embed ON embed_configs
  USING (dashboard_id IN (
    SELECT id FROM dashboards WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
  ));

CREATE POLICY tenant_isolation_ds_configs ON data_source_configs
  USING (data_source_id IN (
    SELECT id FROM data_sources WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
  ));
```

**Note:** Prisma connects as DB owner, bypassing RLS. RLS is defense-in-depth. Primary isolation is application-level `WHERE tenantId` in all service methods.

## 3. Indexes

```sql
CREATE INDEX idx_data_points_tenant_source_time ON data_points (tenant_id, data_source_id, timestamp);
CREATE INDEX idx_sync_runs_data_source ON sync_runs (data_source_id, started_at DESC);
CREATE INDEX idx_dashboards_tenant ON dashboards (tenant_id);
CREATE INDEX idx_data_sources_tenant ON data_sources (tenant_id);
CREATE INDEX idx_dead_letters_data_source ON dead_letter_events (data_source_id, created_at DESC);
CREATE INDEX idx_query_cache_hash ON query_cache (query_hash);
CREATE INDEX idx_query_cache_expires ON query_cache (expires_at);
```

## 4. Prisma Query Convention [VERIFY:QUERY_CONVENTION]

| Method | Usage |
|--------|-------|
| `findFirstOrThrow` | Default for tenant-scoped lookups by ID |
| `findUniqueOrThrow` | When querying by unique constraint |
| `findFirst` | Only when null is a valid business outcome (requires `// findFirst justified:` comment) |
| `findMany` | List operations — always filter by tenantId |
