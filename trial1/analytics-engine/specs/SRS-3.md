# Software Requirements Specification — Domain Logic (SRS-3)

## Analytics Engine — Embeddable Multi-Tenant Analytics Platform

| Field          | Value                          |
|----------------|--------------------------------|
| Version        | 1.0                            |
| Date           | 2026-03-20                     |
| Status         | Draft                          |
| Owner          | Engineering Team               |
| Classification | Internal                       |

---

## 1. Ingestion Pipeline Architecture

### 1.1 Pipeline Overview

```
External Source
      │
      ▼
┌─────────────┐    ┌──────────────┐    ┌───────────────┐    ┌──────────────┐
│  Connector   │───▶│ Schema Map   │───▶│  Transform    │───▶│    Load      │
│  (extract)   │    │ (validate)   │    │  (transform)  │    │  (DataPoint) │
└─────────────┘    └──────────────┘    └───────────────┘    └──────┬───────┘
                                                                    │
                                                              ┌─────▼───────┐
                                                              │ Aggregation  │
                                                              │ (rollup)     │
                                                              └──────┬──────┘
                                                                     │
                                                              ┌──────▼──────┐
                                                              │ Cache Inv.   │
                                                              │ + SSE Notify │
                                                              └─────────────┘
```

### 1.2 Connector Interface

Every connector implements the following interface:

```typescript
interface Connector {
  /**
   * Test connectivity to the external source.
   * MUST resolve within 10 seconds (§BRD BR-021).
   * @returns true if connection is successful
   * @throws ConnectorError with descriptive message on failure
   */
  testConnection(config: DecryptedConfig): Promise<boolean>;

  /**
   * Extract data from the external source.
   * Yields batches of raw records for memory efficiency.
   * @param config Decrypted connector configuration
   * @param lastSyncCursor Optional cursor for incremental sync
   * @yields Array of raw records (batch size: 100)
   */
  extract(
    config: DecryptedConfig,
    lastSyncCursor?: string
  ): AsyncGenerator<RawRecord[]>;
}

interface RawRecord {
  [key: string]: unknown; // Untyped key-value pairs from the source
}

interface ConnectorError {
  code: 'CONNECTION_REFUSED' | 'AUTH_FAILED' | 'TIMEOUT' | 'INVALID_RESPONSE' | 'QUERY_ERROR';
  message: string;
  retryable: boolean;
}
```

### 1.3 Connector Implementations

#### REST API Connector

```
1. Decrypt config (§SRS-4 §3.1)
2. Build HTTP request from config (url, method, headers, queryParams, auth)
3. Execute request with 30-second timeout
4. Parse response JSON
5. Extract data array using jsonPath (e.g., $.data.records)
6. If pagination is configured:
   a. cursor: extract next cursor from response, repeat with cursor param
   b. offset: increment offset by pageSize, repeat until empty response
   c. link_header: follow "next" link header, repeat until no next link
7. Yield batch of records (100 at a time)
8. On HTTP 4xx: throw non-retryable ConnectorError
9. On HTTP 5xx or timeout: throw retryable ConnectorError
```

#### PostgreSQL Connector

```
1. Decrypt config (§SRS-4 §3.1)
2. Create connection pool (max 2 connections, read-only)
3. Execute configured SQL query with LIMIT/OFFSET pagination
   - Page size: 1000 rows
   - Total timeout: 5 minutes
4. Yield batch of records (100 at a time)
5. On connection error: throw retryable ConnectorError
6. On query error: throw non-retryable ConnectorError
7. Close connection pool after extraction completes
```

#### CSV Connector

```
1. Read uploaded file from storage (fileUrl in config)
2. Detect or use configured delimiter and encoding
3. Parse header row to determine column names
4. Stream-parse remaining rows (no full file load into memory)
5. Yield batch of records (100 at a time)
6. On parse error for a row: log error, write to dead letter, continue
```

#### Webhook Connector

```
Webhook does NOT use the extract flow. Instead:
1. API receives POST to /api/webhooks/:sourceId/:secret
2. Validate secret from URL matches stored webhook secret
3. If signatureHeader is configured, verify HMAC-SHA256 signature
4. Validate payload against expectedSchema
5. On validation success: proceed directly to Schema Map step
6. On validation failure: write to DeadLetterEvent, return 400
```

### 1.4 Schema Mapping Step

```typescript
function applyFieldMapping(
  rawRecord: RawRecord,
  fieldMappings: FieldMapping[]
): { dimensions: Record<string, unknown>; metrics: Record<string, number>; timestamp: Date } | null {
  const dimensions: Record<string, unknown> = {};
  const metrics: Record<string, number> = {};
  let timestamp: Date | null = null;

  for (const mapping of fieldMappings) {
    const rawValue = rawRecord[mapping.sourceField];

    // Skip if required field is missing
    if (rawValue === undefined || rawValue === null) {
      if (mapping.isRequired) {
        return null; // Record goes to dead letter queue
      }
      continue;
    }

    // Type coercion
    const typedValue = coerceType(rawValue, mapping.fieldType);
    if (typedValue === null) {
      return null; // Type coercion failed — dead letter
    }

    // Assign to dimensions or metrics
    if (mapping.fieldRole === 'DIMENSION') {
      dimensions[mapping.targetField] = typedValue;
    } else {
      metrics[mapping.targetField] = typedValue as number;
    }

    // Extract timestamp (first DATE dimension field, or explicit "timestamp" field)
    if (mapping.fieldType === 'DATE' && timestamp === null) {
      timestamp = typedValue as Date;
    }
  }

  // Default timestamp to now() if no date field mapped
  if (timestamp === null) {
    timestamp = new Date();
  }

  return { dimensions, metrics, timestamp };
}
```

### 1.5 Transform Engine

Transforms are applied sequentially after schema mapping:

```typescript
interface TransformStep {
  type: 'rename' | 'cast' | 'default' | 'dateFormat';
}

interface RenameTransform extends TransformStep {
  type: 'rename';
  from: string;       // Current field name
  to: string;         // New field name
}

interface CastTransform extends TransformStep {
  type: 'cast';
  field: string;
  targetType: FieldType;  // STRING, NUMBER, DATE, BOOLEAN
}

interface DefaultTransform extends TransformStep {
  type: 'default';
  field: string;
  value: string | number | boolean;  // Default value if field is null/undefined
}

interface DateFormatTransform extends TransformStep {
  type: 'dateFormat';
  field: string;
  format: string;     // e.g., "YYYY-MM-DD", "X" (unix timestamp), "ISO8601"
}
```

Transform execution:

```
For each record:
  For each transform step (in order):
    1. rename: Move value from `from` key to `to` key
    2. cast: Convert value to targetType (string→number: parseFloat; string→date: Date.parse; etc.)
    3. default: If field is null/undefined, set to default value
    4. dateFormat: Parse date string using specified format
  If any transform throws:
    Write record + error to DeadLetterEvent
    Continue to next record (do NOT abort sync)
```

### 1.6 Load Step

```typescript
async function loadDataPoints(
  records: MappedRecord[],
  dataSourceId: string,
  tenantId: string,
  syncRunId: string
): Promise<{ synced: number; failed: number }> {
  let synced = 0;
  let failed = 0;

  for (const batch of chunk(records, 100)) {
    // Generate source hash for deduplication (§BRD BR-030)
    const dataPoints = batch.map(record => ({
      tenantId,
      dataSourceId,
      dimensions: record.dimensions,
      metrics: record.metrics,
      timestamp: record.timestamp,
      sourceHash: sha256(JSON.stringify({
        dataSourceId,
        dimensions: record.dimensions,
        metrics: record.metrics,
        timestamp: record.timestamp.toISOString(),
      })),
    }));

    // Upsert (insert or skip if sourceHash already exists)
    const result = await prisma.dataPoint.createMany({
      data: dataPoints,
      skipDuplicates: true, // Idempotent: skip if sourceHash matches
    });

    synced += result.count;
    failed += batch.length - result.count;
  }

  return { synced, failed };
}
```

---

## 2. Data Aggregation Algorithm

### 2.1 Time Bucketing

Aggregation runs after each successful sync to pre-compute time-bucketed rollups. This avoids expensive real-time aggregation queries on raw DataPoints.

```
Aggregation Periods:
  HOURLY  → bucket start: truncate to hour  (e.g., 2026-03-20T14:00:00Z)
  DAILY   → bucket start: truncate to day   (e.g., 2026-03-20T00:00:00Z)
  WEEKLY  → bucket start: truncate to Monday(e.g., 2026-03-16T00:00:00Z)
  MONTHLY → bucket start: truncate to 1st   (e.g., 2026-03-01T00:00:00Z)
```

### 2.2 Aggregation Algorithm

```typescript
async function aggregateDataPoints(
  dataSourceId: string,
  tenantId: string,
  syncedTimestampRange: { from: Date; to: Date }
): Promise<void> {
  const fieldMappings = await getFieldMappings(dataSourceId);
  const metricFields = fieldMappings.filter(f => f.fieldRole === 'METRIC');
  const dimensionFields = fieldMappings.filter(f => f.fieldRole === 'DIMENSION');

  for (const period of ['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY'] as GroupingPeriod[]) {
    // 1. Query raw data points in the affected time range
    const dataPoints = await prisma.dataPoint.findMany({
      where: {
        dataSourceId,
        tenantId,
        timestamp: { gte: syncedTimestampRange.from, lte: syncedTimestampRange.to },
      },
    });

    // 2. Group by (periodStart, dimensionKey)
    const buckets = new Map<string, DataPoint[]>();

    for (const dp of dataPoints) {
      const periodStart = truncateToPeriod(dp.timestamp, period);
      const dimensionKey = buildDimensionKey(dp.dimensions, dimensionFields);
      const bucketKey = `${periodStart.toISOString()}|${dimensionKey}`;

      if (!buckets.has(bucketKey)) {
        buckets.set(bucketKey, []);
      }
      buckets.get(bucketKey)!.push(dp);
    }

    // 3. For each bucket, compute aggregations per metric
    for (const [bucketKey, points] of buckets) {
      const [periodStartStr, dimensionKey] = bucketKey.split('|');
      const periodStart = new Date(periodStartStr);

      for (const metric of metricFields) {
        const values = points
          .map(p => (p.metrics as Record<string, number>)[metric.targetField])
          .filter(v => v !== undefined && v !== null);

        if (values.length === 0) continue;

        await prisma.aggregatedDataPoint.upsert({
          where: {
            tenantId_dataSourceId_period_periodStart_dimensionKey_metricName: {
              tenantId,
              dataSourceId,
              period,
              periodStart,
              dimensionKey,
              metricName: metric.targetField,
            },
          },
          update: {
            sumValue: values.reduce((a, b) => a + b, 0),
            avgValue: values.reduce((a, b) => a + b, 0) / values.length,
            countValue: values.length,
            minValue: Math.min(...values),
            maxValue: Math.max(...values),
          },
          create: {
            tenantId,
            dataSourceId,
            period,
            periodStart,
            dimensionKey,
            metricName: metric.targetField,
            sumValue: values.reduce((a, b) => a + b, 0),
            avgValue: values.reduce((a, b) => a + b, 0) / values.length,
            countValue: values.length,
            minValue: Math.min(...values),
            maxValue: Math.max(...values),
          },
        });
      }
    }
  }
}

function buildDimensionKey(
  dimensions: Record<string, unknown>,
  dimensionFields: FieldMapping[]
): string {
  // Sort dimension fields by name for consistent key generation
  return dimensionFields
    .sort((a, b) => a.targetField.localeCompare(b.targetField))
    .map(f => `${f.targetField}=${dimensions[f.targetField] ?? 'NULL'}`)
    .join('|');
}

function truncateToPeriod(date: Date, period: GroupingPeriod): Date {
  switch (period) {
    case 'HOURLY':
      return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours());
    case 'DAILY':
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    case 'WEEKLY': {
      const day = date.getDay();
      const diff = day === 0 ? 6 : day - 1; // Monday as start of week
      const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - diff);
      return monday;
    }
    case 'MONTHLY':
      return new Date(date.getFullYear(), date.getMonth(), 1);
    default:
      return date;
  }
}
```

---

## 3. Query Engine

### 3.1 Widget Query Interface

```typescript
interface WidgetQuery {
  widgetId: string;
  dataSourceId: string;
  tenantId: string;
  dimensionField: string;
  metricFields: { field: string; aggregation: AggregationFunction }[];
  dateRange: {
    preset: DateRangePreset;
    start?: Date;     // For CUSTOM preset
    end?: Date;       // For CUSTOM preset
  };
  groupingPeriod: GroupingPeriod;
  filters?: { field: string; operator: 'eq' | 'neq' | 'gt' | 'lt' | 'in'; value: unknown }[];
}

interface WidgetQueryResult {
  labels: string[];                    // X-axis labels (date strings or dimension values)
  series: {
    name: string;                      // Metric name + aggregation (e.g., "revenue (sum)")
    data: (number | null)[];           // Values corresponding to labels
  }[];
  meta: {
    totalRows: number;
    queryTime: number;                 // milliseconds
    fromCache: boolean;
  };
}
```

### 3.2 Query Execution Flow

```
1. Check QueryCache for (widgetId, queryHash)
   - queryHash = SHA-256 of { dimensionField, metricFields, dateRange, groupingPeriod, filters }
   - If cache hit AND not expired (§BRD BR-008): return cached result
   - If cache miss or expired: continue

2. Resolve date range:
   - LAST_7_DAYS  → { start: now - 7d, end: now }
   - LAST_30_DAYS → { start: now - 30d, end: now }
   - LAST_90_DAYS → { start: now - 90d, end: now }
   - CUSTOM       → { start, end } from widget config
   - ALL_TIME     → { start: earliest data point, end: now }

3. Choose data source:
   - If groupingPeriod != NONE → query AggregatedDataPoint table (pre-computed)
   - If groupingPeriod == NONE → query DataPoint table (raw data, for TABLE widget)

4. Build query:
   For aggregated queries:
     SELECT periodStart, dimensionKey, metricName, <aggregation>Value
     FROM aggregated_data_points
     WHERE tenantId = :tenantId
       AND dataSourceId = :dataSourceId
       AND period = :groupingPeriod
       AND periodStart BETWEEN :start AND :end
       AND (dimension filters applied by parsing dimensionKey)
     ORDER BY periodStart ASC

   For raw queries (TABLE widget):
     SELECT dimensions, metrics, timestamp
     FROM data_points
     WHERE tenantId = :tenantId
       AND dataSourceId = :dataSourceId
       AND timestamp BETWEEN :start AND :end
     ORDER BY timestamp DESC
     LIMIT :pageSize OFFSET :offset

5. Transform query results into WidgetQueryResult format

6. Write result to QueryCache with TTL of 5 minutes

7. Return result
```

### 3.3 Aggregation Function Mapping

| Function | Aggregated table column | Raw table computation |
|----------|------------------------|----------------------|
| SUM | `sumValue` | `SUM(metrics->>'field')` |
| AVG | `avgValue` | `AVG(metrics->>'field')` |
| COUNT | `countValue` | `COUNT(*)` |
| MIN | `minValue` | `MIN(metrics->>'field')` |
| MAX | `maxValue` | `MAX(metrics->>'field')` |

---

## 4. Widget Rendering Logic

### 4.1 Data Transformation per Widget Type

#### Line Chart

```typescript
function transformForLineChart(result: WidgetQueryResult): RechartsLineData {
  // Labels become X-axis ticks
  // Each series becomes a <Line> component
  return {
    data: result.labels.map((label, i) => ({
      name: label,
      ...Object.fromEntries(result.series.map(s => [s.name, s.data[i]])),
    })),
    series: result.series.map(s => ({ dataKey: s.name, stroke: getSeriesColor(s.name) })),
  };
}
```

#### Bar Chart

```typescript
function transformForBarChart(result: WidgetQueryResult, config: BarConfig): RechartsBarData {
  return {
    data: result.labels.map((label, i) => ({
      name: label,
      ...Object.fromEntries(result.series.map(s => [s.name, s.data[i]])),
    })),
    series: result.series.map(s => ({ dataKey: s.name, fill: getSeriesColor(s.name) })),
    stacked: config.mode === 'stacked',
  };
}
```

#### Pie/Donut Chart

```typescript
function transformForPieChart(result: WidgetQueryResult, config: PieConfig): RechartsPieData {
  const series = result.series[0]; // Pie charts use single metric
  let data = result.labels.map((label, i) => ({
    name: label,
    value: series.data[i] ?? 0,
  }));

  // Group into "Other" if > maxSegments (default 10)
  if (data.length > (config.maxSegments ?? 10)) {
    const sorted = data.sort((a, b) => b.value - a.value);
    const top = sorted.slice(0, (config.maxSegments ?? 10) - 1);
    const otherValue = sorted.slice((config.maxSegments ?? 10) - 1).reduce((sum, d) => sum + d.value, 0);
    data = [...top, { name: 'Other', value: otherValue }];
  }

  return { data, innerRadius: config.innerRadius ?? 0 };
}
```

#### Area Chart

```typescript
function transformForAreaChart(result: WidgetQueryResult, config: AreaConfig): RechartsAreaData {
  return {
    data: result.labels.map((label, i) => ({
      name: label,
      ...Object.fromEntries(result.series.map(s => [s.name, s.data[i]])),
    })),
    series: result.series.map(s => ({
      dataKey: s.name,
      fill: getSeriesColor(s.name),
      fillOpacity: config.fillOpacity ?? 0.3,
    })),
    stacked: config.stacked ?? false,
  };
}
```

#### KPI Card

```typescript
function transformForKpiCard(result: WidgetQueryResult, config: KpiConfig): KpiCardData {
  const series = result.series[0];
  const currentValue = series.data[series.data.length - 1] ?? 0;

  // Calculate comparison (previous period)
  let previousValue: number | null = null;
  let changePercent: number | null = null;

  if (config.comparisonPeriod && series.data.length >= 2) {
    // Compare last value to the value one period ago
    const periodOffset = config.comparisonPeriod === 'week' ? 7 : config.comparisonPeriod === 'month' ? 30 : 1;
    const previousIndex = Math.max(0, series.data.length - 1 - periodOffset);
    previousValue = series.data[previousIndex] ?? 0;
    changePercent = previousValue !== 0
      ? ((currentValue - previousValue) / previousValue) * 100
      : null;
  }

  // Sparkline data (last N data points)
  const sparklineData = series.data.slice(-20).map((v, i) => ({ x: i, y: v ?? 0 }));

  return {
    value: currentValue,
    prefix: config.prefix ?? '',
    suffix: config.suffix ?? '',
    changePercent,
    changeDirection: changePercent !== null ? (changePercent >= 0 ? 'up' : 'down') : null,
    sparklineData: config.showSparkline ? sparklineData : null,
  };
}
```

#### Table

```typescript
function transformForTable(result: WidgetQueryResult, config: TableConfig): TableData {
  return {
    columns: [
      { key: 'dimension', label: result.labels[0], align: 'left' },
      ...result.series.map(s => ({ key: s.name, label: s.name, align: 'right' as const })),
    ],
    rows: result.labels.map((label, i) => ({
      dimension: label,
      ...Object.fromEntries(result.series.map(s => [s.name, s.data[i]])),
    })),
    pageSize: config.pageSize ?? 10,
    totalRows: result.meta.totalRows,
  };
}
```

#### Funnel Chart

```typescript
function transformForFunnel(result: WidgetQueryResult): FunnelData {
  const series = result.series[0];
  const stages = result.labels.map((label, i) => {
    const value = series.data[i] ?? 0;
    const prevValue = i > 0 ? (series.data[i - 1] ?? 0) : value;
    const conversionRate = prevValue > 0 ? (value / prevValue) * 100 : 100;

    return {
      name: label,
      value,
      conversionRate: i === 0 ? 100 : conversionRate,
      fill: getFunnelColor(i, result.labels.length),
    };
  });

  return { stages };
}
```

---

## 5. BullMQ Job Definitions

### 5.1 Job Queues

| Queue Name | Purpose | Concurrency | Default Attempts |
|------------|---------|-------------|-----------------|
| `sync` | Data source sync jobs | 5 | 3 |
| `aggregation` | Post-sync aggregation rollups | 3 | 2 |
| `cache-invalidation` | Evict stale query cache entries | 10 | 1 |
| `email` | Transactional email delivery | 5 | 3 |
| `cleanup` | Data retention enforcement | 1 | 1 |

### 5.2 Sync Job

```typescript
interface SyncJobData {
  dataSourceId: string;
  tenantId: string;
  syncRunId: string;
  triggeredBy: 'schedule' | 'manual';
}

// Queue options
const syncJobOptions: JobsOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000, // 5s, 10s, 20s
  },
  timeout: 300_000, // 5 minutes max
  removeOnComplete: { age: 86400 }, // Keep completed jobs for 24h
  removeOnFail: { age: 604800 },    // Keep failed jobs for 7 days
};
```

**Sync Job Processor:**

```
1. Update SyncRun status → RUNNING, set startedAt
2. Decrypt DataSourceConfig
3. Instantiate connector based on connectorType
4. Call connector.extract() — yields batches
5. For each batch:
   a. Apply field mapping (§1.4)
   b. Apply transforms (§1.5)
   c. Load into DataPoint (§1.6)
   d. Update SyncRun rowsSynced/rowsFailed counters
6. On success:
   a. Update SyncRun status → COMPLETED, set completedAt
   b. Update DataSource lastSyncAt, reset consecutiveFails to 0
   c. Enqueue aggregation job
   d. Enqueue cache-invalidation job
   e. Publish SSE event: sync:status { status: COMPLETED }
7. On failure:
   a. Update SyncRun status → FAILED, set errorMessage
   b. Increment DataSource consecutiveFails
   c. If consecutiveFails >= 3:
      - Set DataSource syncPaused = true (§BRD BR-031)
      - Enqueue email job (sync failure alert)
   d. Write to DeadLetterEvent (§BRD BR-034)
   e. Publish SSE event: sync:error { error: message }
```

### 5.3 Aggregation Job

```typescript
interface AggregationJobData {
  dataSourceId: string;
  tenantId: string;
  syncRunId: string;
  timestampRange: { from: string; to: string };
}

const aggregationJobOptions: JobsOptions = {
  attempts: 2,
  backoff: { type: 'fixed', delay: 10000 },
  timeout: 600_000, // 10 minutes max
};
```

**Aggregation Job Processor:**

```
1. Call aggregateDataPoints() (§2.2) for the affected timestamp range
2. On success: log completion
3. On failure: log error (non-critical — raw data is still queryable)
```

### 5.4 Cache Invalidation Job

```typescript
interface CacheInvalidationJobData {
  dataSourceId: string;
  tenantId: string;
  widgetIds: string[];
  dashboardIds: string[];
}
```

**Cache Invalidation Job Processor:**

```
1. Delete all QueryCache entries for the affected widgetIds
2. For each affected dashboardId:
   a. Publish SSE event: widget:update { widgetId, data: <fresh query result> }
   b. Publish SSE event: cache:invalidated { widgetIds }
3. Log invalidated cache entries count
```

### 5.5 Email Job

```typescript
interface EmailJobData {
  to: string;
  template: 'welcome' | 'sync_failure' | 'usage_limit_warning' | 'password_reset' | 'email_verification';
  variables: Record<string, string>;
}

const emailJobOptions: JobsOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 10000 },
  timeout: 30_000,
};
```

### 5.6 Cleanup Job

```typescript
interface CleanupJobData {
  type: 'data_retention' | 'dead_letter_cleanup' | 'sync_run_archive' | 'cache_eviction';
}
```

**Cleanup Job Processor:**

```
Scheduled via BullMQ repeatable job (runs daily at 02:00 UTC):

1. data_retention:
   - For each tenant:
     - Determine retention period based on tier (§BRD BR-005)
     - DELETE FROM data_points WHERE tenantId = :id AND createdAt < :cutoff
   - Log: "Deleted X data points for Y tenants"

2. dead_letter_cleanup:
   - DELETE FROM dead_letter_events WHERE createdAt < NOW() - INTERVAL '30 days' (§BRD BR-009)
   - Log: "Deleted X dead letter events"

3. sync_run_archive:
   - UPDATE sync_runs SET archivedAt = NOW() WHERE createdAt < NOW() - INTERVAL '90 days' AND archivedAt IS NULL (§BRD BR-007)
   - Log: "Archived X sync runs"

4. cache_eviction:
   - DELETE FROM query_cache WHERE expiresAt < NOW()
   - Log: "Evicted X cache entries"
```

### 5.7 Repeatable Job Schedule

| Job | Cron Expression | Description |
|-----|----------------|-------------|
| Cleanup (all types) | `0 2 * * *` | Daily at 02:00 UTC |
| Sync (per data source) | Varies per config | EVERY_15_MIN: `*/15 * * * *`, HOURLY: `0 * * * *`, DAILY: `0 0 * * *`, WEEKLY: `0 0 * * 1` |

---

## 6. State Machines

### 6.1 SyncRun State Machine

```
                  ┌──────┐
                  │ IDLE  │
                  └───┬───┘
                      │ trigger (manual or schedule)
                      ▼
                 ┌─────────┐
                 │ RUNNING  │
                 └────┬─────┘
                      │
              ┌───────┴───────┐
              │               │
              ▼               ▼
        ┌───────────┐  ┌──────────┐
        │ COMPLETED  │  │  FAILED   │
        └───────────┘  └──────────┘
```

**Transition Rules:**

| From | To | Trigger | Side Effects |
|------|----|---------|-------------|
| IDLE | RUNNING | Manual trigger or scheduled job fires | Set `startedAt = now()` |
| RUNNING | COMPLETED | All batches processed successfully | Set `completedAt = now()`; reset `consecutiveFails`; enqueue aggregation + cache invalidation; publish SSE |
| RUNNING | FAILED | Connector error or unhandled exception | Set `errorMessage`; increment `consecutiveFails`; if >= 3, pause sync + send email; write to DLE; publish SSE |

**Invariants:**
- A data source can have at most one RUNNING sync run at any time. New sync triggers while one is running are rejected with HTTP 409.
- Transition from COMPLETED or FAILED back to IDLE is implicit — the next trigger creates a new SyncRun record.

### 6.2 Dashboard State Machine

```
                 ┌────────┐
          ┌─────▶│ DRAFT   │◀─────┐
          │      └────┬────┘      │
          │           │ publish   │ revert to draft
          │           ▼           │
          │     ┌───────────┐     │
          │     │ PUBLISHED  │────┘
          │     └─────┬─────┘
          │           │ archive
          │           ▼
          │     ┌───────────┐
          └─────│ ARCHIVED   │
   revert       └───────────┘
   to draft
```

**Transition Rules:**

| From | To | Trigger | Side Effects | Constraints |
|------|----|---------|-------------|-------------|
| DRAFT | PUBLISHED | Admin clicks "Publish" | Dashboard becomes visible to embed API; audit log entry | Dashboard must have at least 1 widget |
| PUBLISHED | DRAFT | Admin clicks "Revert to Draft" | Dashboard becomes editable; embed API returns stale version until re-published | Audit log entry |
| PUBLISHED | ARCHIVED | Admin clicks "Archive" | Embed API returns 404 for this dashboard; audit log entry | — |
| ARCHIVED | DRAFT | Admin clicks "Restore" | Dashboard becomes editable; not visible to embed until published | Audit log entry |

**Invariants:**
- A PUBLISHED dashboard MUST NOT be editable (§BRD BR-026). PUT requests return HTTP 409.
- An ARCHIVED dashboard MUST NOT be viewable via the embed API (§BRD BR-027). Embed returns 404.
- Deleting a dashboard is allowed in any state. All widgets and embed config cascade-delete.

---

## 7. API Contracts for Key Endpoints

### 7.1 Create Data Source

**`POST /api/data-sources`**

Request:
```json
{
  "name": "Sales API",
  "connectorType": "REST_API",
  "syncSchedule": "HOURLY",
  "config": {
    "url": "https://api.example.com/v1/sales",
    "method": "GET",
    "headers": { "Authorization": "Bearer sk_live_xxx" },
    "queryParams": {},
    "authType": "bearer",
    "authCredentials": { "bearerToken": "sk_live_xxx" },
    "jsonPath": "$.data",
    "paginationType": "cursor",
    "paginationConfig": {
      "cursorParam": "cursor",
      "cursorJsonPath": "$.meta.next_cursor",
      "pageSize": 100
    }
  },
  "fieldMappings": [
    { "sourceField": "region", "targetField": "region", "fieldType": "STRING", "fieldRole": "DIMENSION", "isRequired": true },
    { "sourceField": "revenue", "targetField": "revenue", "fieldType": "NUMBER", "fieldRole": "METRIC", "isRequired": true },
    { "sourceField": "date", "targetField": "date", "fieldType": "DATE", "fieldRole": "DIMENSION", "isRequired": true }
  ],
  "transforms": [
    { "type": "dateFormat", "field": "date", "format": "YYYY-MM-DD" }
  ]
}
```

Response (201):
```json
{
  "data": {
    "id": "cls_abc123",
    "name": "Sales API",
    "connectorType": "REST_API",
    "syncSchedule": "HOURLY",
    "syncPaused": false,
    "consecutiveFails": 0,
    "lastSyncAt": null,
    "nextSyncAt": "2026-03-20T15:00:00Z",
    "fieldMappings": [
      { "id": "fm_1", "sourceField": "region", "targetField": "region", "fieldType": "STRING", "fieldRole": "DIMENSION" },
      { "id": "fm_2", "sourceField": "revenue", "targetField": "revenue", "fieldType": "NUMBER", "fieldRole": "METRIC" },
      { "id": "fm_3", "sourceField": "date", "targetField": "date", "fieldType": "DATE", "fieldRole": "DIMENSION" }
    ],
    "createdAt": "2026-03-20T14:30:00Z"
  }
}
```

Error (403 — tier limit):
```json
{
  "error": {
    "code": "TIER_LIMIT_EXCEEDED",
    "message": "Free tier allows 1 data source. Upgrade to Pro for up to 10.",
    "details": { "currentCount": 1, "tierLimit": 1, "currentTier": "FREE" },
    "requestId": "req_xyz789"
  }
}
```

### 7.2 Create Widget

**`POST /api/dashboards/:dashboardId/widgets`**

Request:
```json
{
  "type": "LINE",
  "title": "Revenue Over Time",
  "subtitle": "Last 30 days",
  "dataSourceId": "cls_abc123",
  "dimensionField": "date",
  "metricFields": [
    { "field": "revenue", "aggregation": "SUM" }
  ],
  "dateRangePreset": "LAST_30_DAYS",
  "groupingPeriod": "DAILY",
  "gridColumnStart": 1,
  "gridColumnSpan": 6,
  "gridRowStart": 1,
  "gridRowSpan": 2,
  "typeConfig": {
    "showPoints": true,
    "curveType": "monotone"
  }
}
```

Response (201):
```json
{
  "data": {
    "id": "wgt_def456",
    "type": "LINE",
    "title": "Revenue Over Time",
    "subtitle": "Last 30 days",
    "dataSourceId": "cls_abc123",
    "dimensionField": "date",
    "metricFields": [{ "field": "revenue", "aggregation": "SUM" }],
    "dateRangePreset": "LAST_30_DAYS",
    "groupingPeriod": "DAILY",
    "gridColumnStart": 1,
    "gridColumnSpan": 6,
    "gridRowStart": 1,
    "gridRowSpan": 2,
    "typeConfig": { "showPoints": true, "curveType": "monotone" },
    "createdAt": "2026-03-20T14:35:00Z"
  }
}
```

Error (422 — widget limit):
```json
{
  "error": {
    "code": "UNPROCESSABLE_ENTITY",
    "message": "Maximum 20 widgets per dashboard.",
    "details": { "currentCount": 20, "maxWidgets": 20 },
    "requestId": "req_abc123"
  }
}
```

### 7.3 Get Embedded Dashboard

**`GET /api/embed/dashboards/:id?key=:apiKey`**

Response (200):
```json
{
  "data": {
    "id": "dsh_ghi789",
    "name": "Sales Analytics",
    "gridColumns": 12,
    "theme": {
      "primaryColor": "#3B82F6",
      "secondaryColor": "#6366F1",
      "backgroundColor": "#FFFFFF",
      "textColor": "#1F2937",
      "fontFamily": "Inter",
      "cornerRadius": 8,
      "logoUrl": "https://storage.example.com/logos/tenant_abc/logo.png"
    },
    "widgets": [
      {
        "id": "wgt_def456",
        "type": "LINE",
        "title": "Revenue Over Time",
        "subtitle": "Last 30 days",
        "gridColumnStart": 1,
        "gridColumnSpan": 6,
        "gridRowStart": 1,
        "gridRowSpan": 2,
        "data": {
          "labels": ["2026-02-19", "2026-02-20", "..."],
          "series": [{ "name": "revenue (sum)", "data": [1500, 2300, "..."] }]
        }
      }
    ],
    "showPoweredBy": true,
    "sseUrl": "/api/sse/dsh_ghi789?key=embed_key_xxx"
  }
}
```

### 7.4 Widget Data Query

**`GET /api/embed/dashboards/:id/widgets/:widgetId/data?key=:apiKey`**

Query parameters:
- `dateStart` (optional): Override date range start
- `dateEnd` (optional): Override date range end
- `filters` (optional): JSON-encoded filter array

Response (200):
```json
{
  "data": {
    "labels": ["2026-02-19", "2026-02-20", "2026-02-21"],
    "series": [
      {
        "name": "revenue (sum)",
        "data": [1500, 2300, 1800]
      }
    ],
    "meta": {
      "totalRows": 30,
      "queryTime": 45,
      "fromCache": true
    }
  }
}
```

### 7.5 Trigger Manual Sync

**`POST /api/data-sources/:id/sync`**

Response (202):
```json
{
  "data": {
    "syncRunId": "sr_jkl012",
    "status": "RUNNING",
    "startedAt": "2026-03-20T14:40:00Z",
    "message": "Sync started. Monitor progress via SSE or GET /api/sync-runs/sr_jkl012."
  }
}
```

Error (409 — already running):
```json
{
  "error": {
    "code": "CONFLICT",
    "message": "A sync is already running for this data source.",
    "details": { "activeSyncRunId": "sr_existing" },
    "requestId": "req_mno345"
  }
}
```

---

## 8. Sync Scheduler

### 8.1 Schedule Resolution

The sync scheduler is a BullMQ repeatable job that runs every minute to check for due syncs:

```typescript
async function checkDueSyncs(): Promise<void> {
  // Use system role (bypass RLS) for cross-tenant scheduling
  const dueSources = await prisma.dataSource.findMany({
    where: {
      syncPaused: false,
      syncSchedule: { not: 'MANUAL' },
      nextSyncAt: { lte: new Date() },
    },
    select: { id: true, tenantId: true },
  });

  for (const source of dueSources) {
    // Check no active sync run exists
    const activeRun = await prisma.syncRun.findFirst({
      where: { dataSourceId: source.id, status: 'RUNNING' },
    });

    if (activeRun) continue; // Skip — already running

    // Create sync run and enqueue job
    const syncRun = await prisma.syncRun.create({
      data: {
        dataSourceId: source.id,
        tenantId: source.tenantId,
        status: 'IDLE',
      },
    });

    await syncQueue.add('sync', {
      dataSourceId: source.id,
      tenantId: source.tenantId,
      syncRunId: syncRun.id,
      triggeredBy: 'schedule',
    }, syncJobOptions);

    // Update nextSyncAt
    const nextSync = calculateNextSync(source.syncSchedule);
    await prisma.dataSource.update({
      where: { id: source.id },
      data: { nextSyncAt: nextSync },
    });
  }
}
```

---

## 9. Document References

| Document | Section | Relationship |
|----------|---------|-------------|
| §PVD | Product Pillars | Domain logic implements all 5 pillars |
| §BRD | Sync Rules (BR-030 to BR-034) | Ingestion pipeline enforces these rules |
| §BRD | Data Retention (BR-005 to BR-009) | Cleanup jobs implement retention policies |
| §PRD | Ingestion Module (FR-007 to FR-009) | Sync scheduling and tracking |
| §PRD | Widget Engine (FR-013 to FR-020) | Widget rendering logic per type |
| §SRS-1 | Job Processors | BullMQ jobs live in `apps/api/src/jobs/` |
| §SRS-2 | Data Model | All queries operate on the Prisma schema |
| §SRS-4 | Security | Config decryption referenced in connector flow |
