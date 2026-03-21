# Software Requirements Specification — Data Model (SRS-2)

## Analytics Engine — Embeddable Multi-Tenant Analytics Platform

| Field          | Value                          |
|----------------|--------------------------------|
| Version        | 1.0                            |
| Date           | 2026-03-20                     |
| Status         | Draft                          |
| Owner          | Engineering Team               |
| Classification | Internal                       |

---

## 1. Prisma Schema

### 1.1 Enum Definitions

```prisma
enum ConnectorType {
  REST_API
  POSTGRESQL
  CSV
  WEBHOOK
}

enum SyncStatus {
  IDLE
  RUNNING
  COMPLETED
  FAILED
}

enum SyncSchedule {
  MANUAL
  EVERY_15_MIN
  HOURLY
  DAILY
  WEEKLY
}

enum DashboardStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum WidgetType {
  LINE
  BAR
  PIE_DONUT
  AREA
  KPI_CARD
  TABLE
  FUNNEL
}

enum AggregationFunction {
  SUM
  AVG
  COUNT
  MIN
  MAX
}

enum FieldType {
  STRING
  NUMBER
  DATE
  BOOLEAN
}

enum FieldRole {
  DIMENSION
  METRIC
}

enum SubscriptionTier {
  FREE
  PRO
  ENTERPRISE
}

enum AuditAction {
  TENANT_CREATED
  TENANT_UPDATED
  TENANT_DELETED
  DATASOURCE_CREATED
  DATASOURCE_UPDATED
  DATASOURCE_DELETED
  DATASOURCE_TEST_CONNECTION
  DASHBOARD_CREATED
  DASHBOARD_UPDATED
  DASHBOARD_PUBLISHED
  DASHBOARD_ARCHIVED
  DASHBOARD_REVERTED_TO_DRAFT
  DASHBOARD_DELETED
  WIDGET_CREATED
  WIDGET_UPDATED
  WIDGET_DELETED
  SYNC_STARTED
  SYNC_COMPLETED
  SYNC_FAILED
  SYNC_PAUSED
  SYNC_RESUMED
  EMBED_CONFIG_UPDATED
  API_KEY_CREATED
  API_KEY_REVOKED
  THEME_UPDATED
  TIER_UPGRADED
  TIER_DOWNGRADED
  DATA_EXPORTED
  ACCOUNT_DELETION_REQUESTED
}

enum GroupingPeriod {
  NONE
  HOURLY
  DAILY
  WEEKLY
  MONTHLY
}

enum DateRangePreset {
  LAST_7_DAYS
  LAST_30_DAYS
  LAST_90_DAYS
  CUSTOM
  ALL_TIME
}

enum ApiKeyType {
  ADMIN
  EMBED
}
```

### 1.2 Core Models

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────
// Tenant & Auth
// ─────────────────────────────────────────────

model Tenant {
  id               String            @id @default(cuid())
  name             String
  email            String            @unique
  passwordHash     String
  emailVerified    Boolean           @default(false)
  emailVerifyToken String?
  region           String            @default("us-east-1")
  tier             SubscriptionTier  @default(FREE)
  stripeCustomerId String?           @unique
  syncPausedGlobal Boolean           @default(false)

  // Theme settings (§PRD FR-024)
  primaryColor     String            @default("#3B82F6")
  secondaryColor   String            @default("#6366F1")
  backgroundColor  String            @default("#FFFFFF")
  textColor        String            @default("#1F2937")
  fontFamily       String            @default("Inter")
  cornerRadius     Int               @default(8)
  logoUrl          String?

  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  deletedAt        DateTime?

  // Relations
  dataSources      DataSource[]
  dashboards       Dashboard[]
  apiKeys          ApiKey[]
  auditLogs        AuditLog[]
  embedConfigs     EmbedConfig[]

  @@map("tenants")
}

model ApiKey {
  id          String      @id @default(cuid())
  tenantId    String
  tenant      Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  type        ApiKeyType
  keyHash     String      @unique
  keyPrefix   String      // Last 4 chars for display
  name        String      @default("Default")
  isActive    Boolean     @default(true)
  lastUsedAt  DateTime?
  expiresAt   DateTime?
  createdAt   DateTime    @default(now())
  revokedAt   DateTime?

  @@index([tenantId])
  @@index([keyHash])
  @@map("api_keys")
}

// ─────────────────────────────────────────────
// Data Sources & Connectors
// ─────────────────────────────────────────────

model DataSource {
  id              String          @id @default(cuid())
  tenantId        String
  tenant          Tenant          @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  name            String
  connectorType   ConnectorType
  syncSchedule    SyncSchedule    @default(MANUAL)
  syncPaused      Boolean         @default(false)
  consecutiveFails Int            @default(0)
  lastSyncAt      DateTime?
  nextSyncAt      DateTime?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  // Relations
  config          DataSourceConfig?
  fieldMappings   FieldMapping[]
  syncRuns        SyncRun[]
  dataPoints      DataPoint[]
  widgets         Widget[]

  @@index([tenantId])
  @@index([nextSyncAt])
  @@map("data_sources")
}

model DataSourceConfig {
  id              String      @id @default(cuid())
  dataSourceId    String      @unique
  dataSource      DataSource  @relation(fields: [dataSourceId], references: [id], onDelete: Cascade)

  // Encrypted JSON blob containing connector-specific config
  // REST API: { url, method, headers, queryParams, authType, authCredentials, jsonPath, paginationType, paginationConfig }
  // PostgreSQL: { host, port, database, username, password, sslMode, query }
  // CSV: { fileUrl, delimiter, encoding }
  // Webhook: { webhookUrl, webhookSecret, signatureHeader, expectedSchema }
  configEncrypted Bytes
  configIv        Bytes         // AES-256-GCM initialization vector
  configTag       Bytes         // AES-256-GCM auth tag

  // Transform steps as JSON array
  // [{ type: "rename", from: "old_name", to: "new_name" },
  //  { type: "cast", field: "amount", targetType: "NUMBER" },
  //  { type: "default", field: "region", value: "US" },
  //  { type: "dateFormat", field: "created", format: "YYYY-MM-DD" }]
  transforms      Json          @default("[]")

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@map("data_source_configs")
}

model FieldMapping {
  id              String      @id @default(cuid())
  dataSourceId    String
  dataSource      DataSource  @relation(fields: [dataSourceId], references: [id], onDelete: Cascade)
  sourceField     String      // Original field name from external source
  targetField     String      // Mapped field name used internally
  fieldType       FieldType
  fieldRole       FieldRole
  isRequired      Boolean     @default(false)
  isPii           Boolean     @default(false)
  sortOrder       Int         @default(0)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@unique([dataSourceId, targetField])
  @@index([dataSourceId])
  @@map("field_mappings")
}

// ─────────────────────────────────────────────
// Sync & Ingestion
// ─────────────────────────────────────────────

model SyncRun {
  id              String      @id @default(cuid())
  dataSourceId    String
  dataSource      DataSource  @relation(fields: [dataSourceId], references: [id], onDelete: Cascade)
  tenantId        String
  status          SyncStatus  @default(IDLE)
  rowsSynced      Int         @default(0)
  rowsFailed      Int         @default(0)
  errorMessage    String?
  startedAt       DateTime?
  completedAt     DateTime?
  archivedAt      DateTime?
  createdAt       DateTime    @default(now())

  // Relations
  deadLetterEvents DeadLetterEvent[]

  @@index([dataSourceId])
  @@index([tenantId])
  @@index([status])
  @@index([createdAt])
  @@map("sync_runs")
}

model DeadLetterEvent {
  id              String      @id @default(cuid())
  syncRunId       String?
  syncRun         SyncRun?    @relation(fields: [syncRunId], references: [id], onDelete: SetNull)
  tenantId        String
  dataSourceId    String
  payload         Json        // Original payload that failed
  errorMessage    String
  errorStack      String?
  createdAt       DateTime    @default(now())

  @@index([tenantId])
  @@index([syncRunId])
  @@index([createdAt])
  @@map("dead_letter_events")
}

// ─────────────────────────────────────────────
// Data Storage
// ─────────────────────────────────────────────

model DataPoint {
  id              String      @id @default(cuid())
  tenantId        String
  dataSourceId    String
  dataSource      DataSource  @relation(fields: [dataSourceId], references: [id], onDelete: Cascade)

  // Dynamic data stored as JSONB
  // { "region": "US", "product": "Widget A", "revenue": 1500, "date": "2026-03-15" }
  dimensions      Json        // Key-value pairs for dimension fields
  metrics         Json        // Key-value pairs for metric fields
  timestamp       DateTime    // The canonical timestamp for this data point

  // Deduplication
  sourceHash      String      // SHA-256 of the source record for idempotent sync (§BRD BR-030)

  createdAt       DateTime    @default(now())

  @@unique([dataSourceId, sourceHash])
  @@index([tenantId])
  @@index([dataSourceId])
  @@index([timestamp])
  @@index([tenantId, dataSourceId, timestamp])
  @@map("data_points")
}

model AggregatedDataPoint {
  id              String          @id @default(cuid())
  tenantId        String
  dataSourceId    String
  period          GroupingPeriod
  periodStart     DateTime        // Start of the time bucket
  dimensionKey    String          // Serialized dimension values (e.g., "region=US|product=Widget A")
  metricName      String          // Name of the metric being aggregated
  sumValue        Float           @default(0)
  avgValue        Float           @default(0)
  countValue      Int             @default(0)
  minValue        Float           @default(0)
  maxValue        Float           @default(0)
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@unique([tenantId, dataSourceId, period, periodStart, dimensionKey, metricName])
  @@index([tenantId, dataSourceId])
  @@index([periodStart])
  @@index([tenantId, dataSourceId, period, periodStart])
  @@map("aggregated_data_points")
}

// ─────────────────────────────────────────────
// Dashboards & Widgets
// ─────────────────────────────────────────────

model Dashboard {
  id              String            @id @default(cuid())
  tenantId        String
  tenant          Tenant            @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  name            String
  description     String?
  status          DashboardStatus   @default(DRAFT)
  gridColumns     Int               @default(12)
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  // Relations
  widgets         Widget[]
  embedConfig     EmbedConfig?

  @@index([tenantId])
  @@index([status])
  @@map("dashboards")
}

model Widget {
  id                String              @id @default(cuid())
  dashboardId       String
  dashboard         Dashboard           @relation(fields: [dashboardId], references: [id], onDelete: Cascade)
  tenantId          String
  dataSourceId      String
  dataSource        DataSource          @relation(fields: [dataSourceId], references: [id], onDelete: Cascade)

  // Widget type and display
  type              WidgetType
  title             String
  subtitle          String?

  // Grid layout position (§PRD FR-011)
  gridColumnStart   Int                 @default(1)
  gridColumnSpan    Int                 @default(6)
  gridRowStart      Int                 @default(1)
  gridRowSpan       Int                 @default(1)

  // Query configuration
  dimensionField    String              // Which dimension field to use (X axis / category)
  metricFields      Json                // Array of { field: string, aggregation: AggregationFunction }
  dateRangePreset   DateRangePreset     @default(LAST_30_DAYS)
  dateRangeStart    DateTime?           // For CUSTOM preset
  dateRangeEnd      DateTime?           // For CUSTOM preset
  groupingPeriod    GroupingPeriod      @default(DAILY)

  // Type-specific config stored as JSON
  // LINE: { showPoints: true, curveType: "monotone" }
  // BAR: { mode: "grouped" | "stacked", orientation: "vertical" }
  // PIE_DONUT: { innerRadius: 0 | 60, maxSegments: 10 }
  // AREA: { stacked: false, fillOpacity: 0.3 }
  // KPI_CARD: { prefix: "$", suffix: "%", comparisonPeriod: "week", showSparkline: true }
  // TABLE: { pageSize: 10, sortColumn: null, sortDirection: "asc" }
  // FUNNEL: { showPercentages: true }
  typeConfig        Json                @default("{}")

  sortOrder         Int                 @default(0)
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  @@index([dashboardId])
  @@index([tenantId])
  @@index([dataSourceId])
  @@map("widgets")
}

// ─────────────────────────────────────────────
// Embed
// ─────────────────────────────────────────────

model EmbedConfig {
  id              String      @id @default(cuid())
  dashboardId     String      @unique
  dashboard       Dashboard   @relation(fields: [dashboardId], references: [id], onDelete: Cascade)
  tenantId        String
  tenant          Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  // Security (§BRD BR-015, BR-018)
  allowedOrigins  String[]    // Array of allowed origins (e.g., ["https://myapp.com", "https://staging.myapp.com"])
  isEnabled       Boolean     @default(false)

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([tenantId])
  @@map("embed_configs")
}

// ─────────────────────────────────────────────
// Caching
// ─────────────────────────────────────────────

model QueryCache {
  id              String      @id @default(cuid())
  tenantId        String
  widgetId        String
  queryHash       String      // SHA-256 of the query parameters
  resultData      Json        // Cached query result
  expiresAt       DateTime    // TTL expiration timestamp (§BRD BR-008)
  createdAt       DateTime    @default(now())

  @@unique([widgetId, queryHash])
  @@index([tenantId])
  @@index([expiresAt])
  @@map("query_cache")
}

// ─────────────────────────────────────────────
// Audit
// ─────────────────────────────────────────────

model AuditLog {
  id              String      @id @default(cuid())
  tenantId        String
  tenant          Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  action          AuditAction
  resourceType    String      // e.g., "DataSource", "Dashboard", "Widget"
  resourceId      String?     // ID of the affected resource
  metadata        Json?       // Additional context (e.g., { oldStatus: "DRAFT", newStatus: "PUBLISHED" })
  ipAddress       String?
  userAgent       String?
  createdAt       DateTime    @default(now())

  @@index([tenantId])
  @@index([action])
  @@index([createdAt])
  @@index([tenantId, createdAt])
  @@map("audit_logs")
}
```

---

## 2. Entity Relationship Diagram

```
┌──────────┐       ┌────────────┐       ┌──────────────────┐
│  Tenant   │──1:N──│ DataSource │──1:1──│ DataSourceConfig  │
│           │       │            │──1:N──│                    │
│           │       │            │       └──────────────────┘
│           │       │            │──1:N──┌──────────────┐
│           │       │            │       │ FieldMapping  │
│           │       │            │       └──────────────┘
│           │       │            │──1:N──┌──────────┐
│           │       │            │       │ SyncRun   │──1:N──┌─────────────────┐
│           │       │            │       │           │       │ DeadLetterEvent  │
│           │       │            │       └──────────┘       └─────────────────┘
│           │       │            │──1:N──┌───────────┐
│           │       │            │       │ DataPoint  │
│           │       │            │       └───────────┘
│           │       │            │──1:N──┌────────┐
│           │       └────────────┘       │ Widget  │
│           │                            └───┬────┘
│           │──1:N──┌────────────┐──1:N──────┘
│           │       │ Dashboard  │──1:1──┌─────────────┐
│           │       └────────────┘       │ EmbedConfig  │
│           │                            └─────────────┘
│           │──1:N──┌──────────┐
│           │       │ ApiKey    │
│           │──1:N──┌──────────┐
│           │       │ AuditLog  │
│           │       └──────────┘
└──────────┘

Standalone (tenant-scoped but no FK to Tenant model):
┌────────────────────────┐
│ AggregatedDataPoint     │  (tenantId stored as string for query performance)
└────────────────────────┘
┌────────────────────────┐
│ QueryCache              │  (tenantId stored as string, evicted lazily)
└────────────────────────┘
```

---

## 3. Relationship Cardinality

| Parent | Child | Cardinality | On Delete | Notes |
|--------|-------|-------------|-----------|-------|
| Tenant | DataSource | 1:N | Cascade | Tier limits enforced at API layer |
| Tenant | Dashboard | 1:N | Cascade | Tier limits enforced at API layer |
| Tenant | ApiKey | 1:N | Cascade | Max 2 active embed keys, unlimited admin keys |
| Tenant | AuditLog | 1:N | Cascade | Retained for 1 year (§BRD BR-046) |
| Tenant | EmbedConfig | 1:N | Cascade | Via dashboard |
| DataSource | DataSourceConfig | 1:1 | Cascade | Config is required; created atomically with DataSource |
| DataSource | FieldMapping | 1:N | Cascade | At least 1 dimension + 1 metric required |
| DataSource | SyncRun | 1:N | Cascade | Archived after 90 days (§BRD BR-007) |
| DataSource | DataPoint | 1:N | Cascade | Retention per tier (§BRD BR-005) |
| DataSource | Widget | 1:N | Cascade | Widget shows "Data source removed" if deleted (§BRD BR-022) |
| Dashboard | Widget | 1:N | Cascade | Max 20 per dashboard (§BRD BR-028) |
| Dashboard | EmbedConfig | 1:1 | Cascade | Created when embed is first configured |
| SyncRun | DeadLetterEvent | 1:N | SetNull | DLE retained independently for debugging |

---

## 4. Row-Level Security Policies

### 4.1 RLS Setup

```sql
-- Enable RLS on all tenant-scoped tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_source_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dead_letter_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE aggregated_data_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE embed_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners too (prevent bypass)
ALTER TABLE tenants FORCE ROW LEVEL SECURITY;
ALTER TABLE data_sources FORCE ROW LEVEL SECURITY;
ALTER TABLE data_source_configs FORCE ROW LEVEL SECURITY;
ALTER TABLE field_mappings FORCE ROW LEVEL SECURITY;
ALTER TABLE sync_runs FORCE ROW LEVEL SECURITY;
ALTER TABLE dead_letter_events FORCE ROW LEVEL SECURITY;
ALTER TABLE data_points FORCE ROW LEVEL SECURITY;
ALTER TABLE aggregated_data_points FORCE ROW LEVEL SECURITY;
ALTER TABLE dashboards FORCE ROW LEVEL SECURITY;
ALTER TABLE widgets FORCE ROW LEVEL SECURITY;
ALTER TABLE embed_configs FORCE ROW LEVEL SECURITY;
ALTER TABLE query_cache FORCE ROW LEVEL SECURITY;
ALTER TABLE api_keys FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;
```

### 4.2 Tenant Context Setting

```sql
-- The application sets the tenant context before every query
-- This is done in a Prisma middleware or NestJS interceptor

-- Set current tenant (called at the start of every request)
SET LOCAL app.current_tenant_id = 'tenant_cuid_here';

-- For system-level operations (migrations, cleanup jobs), use a bypass role
-- CREATE ROLE analytics_system BYPASSRLS;
```

### 4.3 Per-Table RLS Policies

#### Tenants Table

```sql
-- Tenants can only see their own record
CREATE POLICY tenant_isolation ON tenants
  FOR ALL
  USING (id = current_setting('app.current_tenant_id', true))
  WITH CHECK (id = current_setting('app.current_tenant_id', true));
```

#### Data Sources Table

```sql
CREATE POLICY datasource_tenant_isolation ON data_sources
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));
```

#### Data Source Configs Table

```sql
-- Config isolation via join to data_sources
CREATE POLICY config_tenant_isolation ON data_source_configs
  FOR ALL
  USING (
    data_source_id IN (
      SELECT id FROM data_sources
      WHERE tenant_id = current_setting('app.current_tenant_id', true)
    )
  )
  WITH CHECK (
    data_source_id IN (
      SELECT id FROM data_sources
      WHERE tenant_id = current_setting('app.current_tenant_id', true)
    )
  );
```

#### Field Mappings Table

```sql
CREATE POLICY field_mapping_tenant_isolation ON field_mappings
  FOR ALL
  USING (
    data_source_id IN (
      SELECT id FROM data_sources
      WHERE tenant_id = current_setting('app.current_tenant_id', true)
    )
  )
  WITH CHECK (
    data_source_id IN (
      SELECT id FROM data_sources
      WHERE tenant_id = current_setting('app.current_tenant_id', true)
    )
  );
```

#### Sync Runs Table

```sql
CREATE POLICY sync_run_tenant_isolation ON sync_runs
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));
```

#### Dead Letter Events Table

```sql
CREATE POLICY dle_tenant_isolation ON dead_letter_events
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));
```

#### Data Points Table

```sql
CREATE POLICY datapoint_tenant_isolation ON data_points
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));
```

#### Aggregated Data Points Table

```sql
CREATE POLICY agg_datapoint_tenant_isolation ON aggregated_data_points
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));
```

#### Dashboards Table

```sql
CREATE POLICY dashboard_tenant_isolation ON dashboards
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));
```

#### Widgets Table

```sql
CREATE POLICY widget_tenant_isolation ON widgets
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));
```

#### Embed Configs Table

```sql
CREATE POLICY embed_config_tenant_isolation ON embed_configs
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));
```

#### Query Cache Table

```sql
CREATE POLICY query_cache_tenant_isolation ON query_cache
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));
```

#### API Keys Table

```sql
CREATE POLICY api_key_tenant_isolation ON api_keys
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));
```

#### Audit Logs Table

```sql
CREATE POLICY audit_log_tenant_isolation ON audit_logs
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));
```

### 4.4 RLS Bypass for System Operations

```sql
-- System role for background jobs (sync workers, cleanup, aggregation)
CREATE ROLE analytics_system BYPASSRLS LOGIN PASSWORD 'system_password_here';

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO analytics_system;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO analytics_system;

-- Application role (used by API server, respects RLS)
CREATE ROLE analytics_app LOGIN PASSWORD 'app_password_here';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO analytics_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO analytics_app;
```

---

## 5. Migration Strategy

### 5.1 Migration Workflow

1. **Schema changes** are made in `schema.prisma`.
2. **Generate migration:** `npx prisma migrate dev --name descriptive_name`
3. **RLS policies** are applied via a custom migration file after each schema migration that adds tenant-scoped tables.
4. **CI validation:** `npx prisma migrate deploy` runs in the CI pipeline (Stage 4) before API deployment.
5. **Rollback:** Prisma does not support down migrations natively. Rollback SQL files are maintained manually in `prisma/rollbacks/` for each migration.

### 5.2 Initial Migration Order

| Order | Migration | Description |
|-------|-----------|-------------|
| 1 | `001_create_enums` | Create all enum types |
| 2 | `002_create_tenants` | Create tenants table with theme fields |
| 3 | `003_create_api_keys` | Create api_keys table |
| 4 | `004_create_data_sources` | Create data_sources, data_source_configs, field_mappings |
| 5 | `005_create_sync_tables` | Create sync_runs, dead_letter_events |
| 6 | `006_create_data_points` | Create data_points, aggregated_data_points |
| 7 | `007_create_dashboards` | Create dashboards, widgets |
| 8 | `008_create_embed_configs` | Create embed_configs |
| 9 | `009_create_query_cache` | Create query_cache |
| 10 | `010_create_audit_logs` | Create audit_logs |
| 11 | `011_enable_rls` | Enable RLS on all tables, create policies |
| 12 | `012_create_roles` | Create analytics_system and analytics_app roles |
| 13 | `013_create_indexes` | Create composite indexes for query performance |

### 5.3 Seeding

```typescript
// prisma/seed.ts — Development seed data

async function seed() {
  // 1. Create a demo tenant (Free tier)
  const demoTenant = await prisma.tenant.create({
    data: {
      name: 'Demo Company',
      email: 'demo@example.com',
      passwordHash: await hash('DemoPass123'),
      emailVerified: true,
      tier: 'FREE',
    },
  });

  // 2. Create a demo data source (REST API)
  const demoSource = await prisma.dataSource.create({
    data: {
      tenantId: demoTenant.id,
      name: 'Sample Sales API',
      connectorType: 'REST_API',
      syncSchedule: 'HOURLY',
    },
  });

  // 3. Create field mappings
  // 4. Create a demo dashboard with widgets
  // 5. Generate sample data points
}
```

---

## 6. Index Strategy

### 6.1 Query Patterns and Indexes

| Query Pattern | Table | Index | Notes |
|--------------|-------|-------|-------|
| List data sources for tenant | data_sources | `(tenant_id)` | RLS + explicit filter |
| Find next sync to run | data_sources | `(next_sync_at)` | Scheduler polls for due syncs |
| List sync runs for data source | sync_runs | `(data_source_id)` | Ordered by createdAt |
| List sync runs for tenant | sync_runs | `(tenant_id)` | Admin view |
| Find sync runs by status | sync_runs | `(status)` | Worker finds running syncs |
| Time-range data query | data_points | `(tenant_id, data_source_id, timestamp)` | Widget queries |
| Deduplication check | data_points | `UNIQUE (data_source_id, source_hash)` | Idempotent sync |
| Aggregation lookup | aggregated_data_points | `(tenant_id, data_source_id, period, period_start)` | Time-bucket queries |
| List dashboards for tenant | dashboards | `(tenant_id)` | Admin view |
| List widgets for dashboard | widgets | `(dashboard_id)` | Dashboard rendering |
| Cache lookup | query_cache | `UNIQUE (widget_id, query_hash)` | Cache hit/miss |
| Cache eviction | query_cache | `(expires_at)` | Lazy cleanup |
| Audit log range query | audit_logs | `(tenant_id, created_at)` | Audit log viewer |
| API key lookup | api_keys | `(key_hash)` | Authentication |

---

## 7. API Endpoint Summary

### 7.1 Auth Module

| Method | Path | Description | Auth | Reference |
|--------|------|-------------|------|-----------|
| POST | `/api/auth/register` | Register new tenant | Public | §PRD FR-026 |
| POST | `/api/auth/login` | Login, returns JWT | Public | §PRD FR-026 |
| POST | `/api/auth/verify-email` | Verify email via token | Public | §PRD FR-026 |
| POST | `/api/auth/forgot-password` | Request password reset | Public | §PRD FR-026 |
| POST | `/api/auth/reset-password` | Reset password via token | Public | §PRD FR-026 |
| GET | `/api/auth/me` | Get current tenant profile | JWT | §PRD FR-026 |

### 7.2 Data Sources Module

| Method | Path | Description | Auth | Reference |
|--------|------|-------------|------|-----------|
| GET | `/api/data-sources` | List tenant's data sources | JWT | §PRD FR-001 |
| POST | `/api/data-sources` | Create data source | JWT | §PRD FR-001 |
| GET | `/api/data-sources/:id` | Get data source details | JWT | §PRD FR-001 |
| PUT | `/api/data-sources/:id` | Update data source | JWT | §PRD FR-001 |
| DELETE | `/api/data-sources/:id` | Delete data source | JWT | §PRD FR-001, §BRD BR-022 |
| POST | `/api/data-sources/:id/test` | Test connection | JWT | §PRD FR-001, §BRD BR-021 |
| POST | `/api/data-sources/:id/sync` | Trigger manual sync | JWT | §PRD FR-007 |
| PUT | `/api/data-sources/:id/field-mappings` | Update field mappings | JWT | §PRD FR-006 |
| POST | `/api/data-sources/:id/resume-sync` | Resume paused sync | JWT | §BRD BR-031 |

### 7.3 Dashboards Module

| Method | Path | Description | Auth | Reference |
|--------|------|-------------|------|-----------|
| GET | `/api/dashboards` | List tenant's dashboards | JWT | §PRD FR-010 |
| POST | `/api/dashboards` | Create dashboard | JWT | §PRD FR-010 |
| GET | `/api/dashboards/:id` | Get dashboard with widgets | JWT | §PRD FR-010 |
| PUT | `/api/dashboards/:id` | Update dashboard | JWT | §PRD FR-010, §BRD BR-026 |
| DELETE | `/api/dashboards/:id` | Delete dashboard | JWT | §PRD FR-010 |
| POST | `/api/dashboards/:id/publish` | Publish dashboard | JWT | §PRD FR-010 |
| POST | `/api/dashboards/:id/archive` | Archive dashboard | JWT | §PRD FR-010 |
| POST | `/api/dashboards/:id/revert-to-draft` | Revert to draft | JWT | §PRD FR-010 |

### 7.4 Widgets Module

| Method | Path | Description | Auth | Reference |
|--------|------|-------------|------|-----------|
| POST | `/api/dashboards/:dashboardId/widgets` | Add widget to dashboard | JWT | §PRD FR-012, §BRD BR-028 |
| PUT | `/api/dashboards/:dashboardId/widgets/:id` | Update widget | JWT | §PRD FR-013 |
| DELETE | `/api/dashboards/:dashboardId/widgets/:id` | Remove widget | JWT | §PRD FR-012 |
| GET | `/api/dashboards/:dashboardId/widgets/:id/data` | Query widget data (admin preview) | JWT | §PRD FR-013 |

### 7.5 Embed Module

| Method | Path | Description | Auth | Reference |
|--------|------|-------------|------|-----------|
| GET | `/api/embed/dashboards/:id` | Get embedded dashboard data | API Key | §PRD FR-022 |
| GET | `/api/embed/dashboards/:id/widgets/:widgetId/data` | Get widget data for embed | API Key | §PRD FR-022 |
| GET | `/api/sse/:dashboardId` | SSE connection for real-time updates | API Key | §PRD FR-030 |

### 7.6 Webhook Ingestion

| Method | Path | Description | Auth | Reference |
|--------|------|-------------|------|-----------|
| POST | `/api/webhooks/:sourceId/:secret` | Receive webhook data | Webhook secret | §PRD FR-005 |

### 7.7 Theme Module

| Method | Path | Description | Auth | Reference |
|--------|------|-------------|------|-----------|
| GET | `/api/theme` | Get tenant's theme settings | JWT | §PRD FR-024 |
| PUT | `/api/theme` | Update theme settings | JWT | §PRD FR-024 |
| POST | `/api/theme/logo` | Upload logo | JWT | §PRD FR-025 |
| DELETE | `/api/theme/logo` | Remove logo | JWT | §PRD FR-025 |

### 7.8 API Keys Module

| Method | Path | Description | Auth | Reference |
|--------|------|-------------|------|-----------|
| GET | `/api/api-keys` | List API keys (masked) | JWT | §PRD FR-028 |
| POST | `/api/api-keys` | Generate new API key | JWT | §PRD FR-028 |
| DELETE | `/api/api-keys/:id` | Revoke API key | JWT | §PRD FR-028 |

### 7.9 Sync History Module

| Method | Path | Description | Auth | Reference |
|--------|------|-------------|------|-----------|
| GET | `/api/sync-runs` | List sync runs (paginated, filterable) | JWT | §PRD FR-009 |
| GET | `/api/sync-runs/:id` | Get sync run details | JWT | §PRD FR-009 |
| GET | `/api/sync-runs/:id/dead-letter-events` | Get dead letter events for sync run | JWT | §PRD FR-009 |

### 7.10 Billing Module

| Method | Path | Description | Auth | Reference |
|--------|------|-------------|------|-----------|
| GET | `/api/billing/usage` | Get current usage and limits | JWT | §PRD FR-029 |
| POST | `/api/billing/checkout` | Create Stripe Checkout session for upgrade | JWT | §PRD FR-029 |
| POST | `/api/billing/portal` | Create Stripe Customer Portal session | JWT | §PRD FR-029 |
| POST | `/api/billing/webhook` | Stripe webhook handler | Stripe signature | §PRD FR-029 |

### 7.11 Admin / Tenant Module

| Method | Path | Description | Auth | Reference |
|--------|------|-------------|------|-----------|
| GET | `/api/tenant/overview` | Get admin dashboard overview data | JWT | §PRD FR-027 |
| GET | `/api/tenant/export` | Export all tenant data as JSON | JWT | §BRD BR-043 |
| POST | `/api/tenant/request-deletion` | Request account deletion | JWT | §BRD BR-044 |

### 7.12 Health Check

| Method | Path | Description | Auth | Reference |
|--------|------|-------------|------|-----------|
| GET | `/health` | Health check with dependency statuses | Public | §SRS-1 NFR-024 |

---

## 8. Connector-Specific Config Schemas

### 8.1 REST API Config (decrypted)

```typescript
interface RestApiConfig {
  url: string;                    // e.g., "https://api.example.com/v1/sales"
  method: 'GET' | 'POST';
  headers: Record<string, string>;// e.g., { "Authorization": "Bearer xxx" }
  queryParams: Record<string, string>;
  authType: 'none' | 'api_key' | 'bearer' | 'basic';
  authCredentials: {
    apiKeyHeader?: string;        // e.g., "X-API-Key"
    apiKeyValue?: string;
    bearerToken?: string;
    basicUsername?: string;
    basicPassword?: string;
  };
  jsonPath: string;               // e.g., "$.data.records"
  paginationType: 'none' | 'cursor' | 'offset' | 'link_header';
  paginationConfig: {
    cursorParam?: string;         // e.g., "cursor"
    cursorJsonPath?: string;      // e.g., "$.meta.next_cursor"
    offsetParam?: string;         // e.g., "offset"
    limitParam?: string;          // e.g., "limit"
    pageSize?: number;            // e.g., 100
  };
}
```

### 8.2 PostgreSQL Config (decrypted)

```typescript
interface PostgresqlConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  sslMode: 'disable' | 'require' | 'verify-full';
  query: string;                  // e.g., "SELECT region, product, revenue, created_at FROM sales"
}
```

### 8.3 CSV Config (decrypted)

```typescript
interface CsvConfig {
  fileUrl: string;                // Internal storage URL after upload
  delimiter: ',' | ';' | '\t';
  encoding: 'utf-8' | 'latin-1';
  hasHeader: boolean;
}
```

### 8.4 Webhook Config (decrypted)

```typescript
interface WebhookConfig {
  webhookUrl: string;             // Generated URL: /api/webhooks/:sourceId/:secret
  webhookSecret: string;          // Generated secret for URL
  signatureHeader: string | null; // e.g., "X-Signature-256"
  signatureSecret: string | null; // HMAC secret for payload verification
  expectedSchema: {               // Expected fields in the payload
    field: string;
    type: FieldType;
  }[];
}
```

---

## 9. Document References

| Document | Section | Relationship |
|----------|---------|-------------|
| §PVD | Key Entities | Schema implements all listed entities |
| §BRD | Tenant Isolation (BR-001 to BR-004) | RLS policies enforce these rules |
| §BRD | Data Retention (BR-005 to BR-009) | Cleanup jobs reference retention rules |
| §BRD | Embed Security (BR-015 to BR-019) | EmbedConfig and ApiKey models |
| §PRD | All Modules | API endpoints serve all functional requirements |
| §SRS-1 | Architecture | Schema lives in `apps/api/src/prisma/` |
| §SRS-3 | Domain Logic | Query engine operates on this data model |
| §SRS-4 | Security | Auth models and RLS policies |
