# System Requirements Specification — Part 3: Business Logic
# Embeddable Analytics Dashboard Engine

## Document Info
- **Version:** 1.0
- **Last Updated:** 2026-03-20
- **Status:** Approved

---

## 1. State Machines

### 1.1 SyncRun State Machine

```
                    ┌─────────┐
                    │ pending  │
                    └────┬────┘
                         │ start()
                         ▼
                    ┌─────────┐
            ┌───── │ running  │ ─────┐
            │      └─────────┘      │
            │ fail()           complete()
            ▼                       ▼
      ┌──────────┐          ┌───────────┐
      │  failed   │          │ completed  │
      └──────────┘          └───────────┘
```

**States:**
| State | Description | Transitions |
|-------|-------------|-------------|
| `pending` | Sync run created, waiting for worker | → `running` |
| `running` | Worker is executing the connector | → `completed`, → `failed` |
| `completed` | Sync finished successfully | Terminal |
| `failed` | Sync encountered an error | Terminal |

**Transitions:**
| From | To | Trigger | Side Effects |
|------|-----|---------|-------------|
| pending | running | Worker picks up job | Set `startedAt` timestamp |
| running | completed | All rows processed | Set `completedAt`, set `rowsIngested` count |
| running | failed | Error during processing | Set `completedAt`, set `errorLog` |

**Implementation (packages/shared):**
```typescript
export enum SyncStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export const SYNC_TRANSITIONS: Record<SyncStatus, SyncStatus[]> = {
  [SyncStatus.PENDING]: [SyncStatus.RUNNING],
  [SyncStatus.RUNNING]: [SyncStatus.COMPLETED, SyncStatus.FAILED],
  [SyncStatus.COMPLETED]: [],
  [SyncStatus.FAILED]: [],
};

export function canTransition(from: SyncStatus, to: SyncStatus): boolean {
  return SYNC_TRANSITIONS[from].includes(to);
}
```

### 1.2 DataSource Lifecycle

```
                    ┌──────────┐
                    │  active   │
                    └─────┬────┘
                          │ deactivate()
                          ▼
                    ┌──────────┐
                    │ inactive  │
                    └─────┬────┘
                          │ activate()
                          ▼
                    ┌──────────┐
                    │  active   │
                    └──────────┘
```

Active data sources have their sync schedules running. Inactive data sources
have their BullMQ repeatable jobs removed.

### 1.3 EmbedConfig Lifecycle

```
                    ┌──────────┐
                    │  active   │ ◄─── create()
                    └─────┬────┘
                          │ deactivate()
                          ▼
                    ┌──────────┐
                    │ inactive  │ ──── activate() ──► active
                    └──────────┘
```

Active embed configs serve dashboard data. Inactive configs return 404.

---

## 2. Pipeline Processing Logic

### 2.1 Ingestion Pipeline Overview

The ingestion pipeline processes data through a sequence of stages:

```
1. Connect    → Establish connection to data source
2. Fetch      → Retrieve raw data from source
3. Map        → Apply schema mapping (source → dimensions/metrics)
4. Transform  → Apply transform steps (rename, cast, derive, filter)
5. Validate   → Validate data types and required fields
6. Store      → Create DataPoint records
7. Aggregate  → Queue aggregation job
8. Notify     → Publish SSE update
```

### 2.2 Pipeline Execution

```typescript
async function executePipeline(
  dataSourceId: string,
  syncRunId: string,
): Promise<void> {
  const syncRun = await transitionSync(syncRunId, SyncStatus.RUNNING);

  try {
    // 1. Load config
    const config = await loadDataSourceConfig(dataSourceId);

    // 2. Create connector instance
    const connector = ConnectorFactory.create(config.type, config.connectionConfig);

    // 3. Fetch raw data
    const rawData = await connector.fetch();

    // 4. Apply schema mapping
    const mappedData = SchemaMapper.map(rawData, config.fieldMapping);

    // 5. Apply transforms
    const transformedData = TransformEngine.apply(mappedData, config.transformSteps);

    // 6. Validate
    const { valid, invalid } = Validator.validate(transformedData);

    // 7. Store valid records
    const rowsIngested = await storeDataPoints(dataSourceId, valid);

    // 8. Store invalid records in DLQ
    await storeDeadLetterEvents(dataSourceId, invalid);

    // 9. Queue aggregation
    await queueAggregation(dataSourceId);

    // 10. Publish SSE update
    await publishUpdate(dataSourceId);

    // 11. Complete sync run
    await transitionSync(syncRunId, SyncStatus.COMPLETED, { rowsIngested });

  } catch (error) {
    await transitionSync(syncRunId, SyncStatus.FAILED, {
      errorLog: error.message,
    });
    throw error;
  }
}
```

### 2.3 Connector Framework

#### Base Connector Interface

```typescript
export interface ConnectorConfig {
  type: ConnectorType;
  connectionConfig: Record<string, unknown>;
}

export interface FetchResult {
  data: Record<string, unknown>[];
  metadata?: {
    totalRows?: number;
    hasMore?: boolean;
    cursor?: string;
  };
}

export interface Connector {
  validate(config: Record<string, unknown>): Promise<boolean>;
  fetch(config: Record<string, unknown>): Promise<FetchResult>;
}
```

#### REST API Connector

```
1. Build HTTP request from config (url, method, headers, params)
2. Send request using fetch/axios
3. Extract data array from response using responsePath (JSONPath)
4. If pagination configured:
   a. Check for nextCursor in response
   b. Fetch next page if cursor exists
   c. Concatenate results
5. Return FetchResult with data array
```

**Error Handling:**
- HTTP 4xx: Log error, mark sync as failed, store error details
- HTTP 5xx: Retry up to 3 times with exponential backoff
- Timeout: 30-second request timeout
- Parse error: Store raw response in DLQ

#### PostgreSQL Connector

```
1. Create read-only connection from connectionString
2. Replace template variables in query (e.g., {{lastSyncDate}})
3. Execute query with parameterized values
4. Map result rows to data array
5. Close connection
6. Return FetchResult
```

**Security:**
- Connection string is decrypted from encrypted storage
- Connection is read-only (SET default_transaction_read_only = on)
- Query timeout: 60 seconds
- Connection string is never logged

#### CSV Connector

```
1. Read uploaded CSV file from storage
2. Parse with configured delimiter and encoding
3. Detect or use configured headers
4. Map rows to data array
5. Return FetchResult
```

**Validation:**
- File size limit: 10MB
- Row count limit: 100,000 rows
- UTF-8 encoding validation
- Header detection from first row

#### Webhook Connector

```
1. Receive POST request at /api/v1/ingest/:webhookId
2. Verify webhook signature (if configured)
3. Validate payload against expected schema
4. Wrap single event as data array
5. Process through pipeline immediately
6. Return 202 Accepted
```

**Security:**
- Webhook URL includes unique ID (not guessable)
- Optional HMAC signature verification
- Payload size limit: 1MB
- Rate limit: 100 requests/minute per webhook

### 2.4 Connector Factory

```typescript
export class ConnectorFactory {
  static create(type: ConnectorType): Connector {
    switch (type) {
      case ConnectorType.REST_API:
        return new RestApiConnector();
      case ConnectorType.POSTGRESQL:
        return new PostgresqlConnector();
      case ConnectorType.CSV:
        return new CsvConnector();
      case ConnectorType.WEBHOOK:
        return new WebhookConnector();
      default:
        throw new Error(`Unknown connector type: ${type}`);
    }
  }
}
```

---

## 3. Schema Mapping Engine

### 3.1 Mapping Process

```
Input: Raw data record + FieldMapping[]
Output: { dimensions: Record<string, unknown>, metrics: Record<string, number> }
```

**Algorithm:**
```
for each mapping in fieldMappings:
  1. Extract value from source record using mapping.source
     - If mapping.jsonPath defined, use JSONPath to extract
     - Otherwise, use direct field access
  2. Cast value to mapping.dataType
     - string: String(value)
     - number: parseFloat(value), reject NaN
     - date: new Date(value), reject Invalid Date
     - boolean: Boolean(value)
  3. Place value in output:
     - If mapping.type === 'dimension': output.dimensions[mapping.target] = value
     - If mapping.type === 'metric': output.metrics[mapping.target] = value
```

### 3.2 JSONPath Support

For nested API responses, JSONPath expressions extract values:

```json
// Source data:
{
  "analytics": {
    "metrics": {
      "views": 1250
    }
  }
}

// Mapping: { source: "views", jsonPath: "$.analytics.metrics.views", target: "pageViews" }
// Result: { metrics: { pageViews: 1250 } }
```

Supported JSONPath operators:
- `$.field` — root field access
- `$.parent.child` — nested access
- `$.array[0]` — array index access
- `$.array[*].field` — array map

### 3.3 Type Casting

| From | To String | To Number | To Date | To Boolean |
|------|-----------|-----------|---------|------------|
| string | identity | parseFloat | new Date() | truthy check |
| number | String() | identity | new Date(ms) | !== 0 |
| boolean | String() | 0 or 1 | reject | identity |
| null | "null" | 0 | reject | false |
| undefined | reject | reject | reject | false |

---

## 4. Transform Engine

### 4.1 Transform Pipeline

Transforms are applied sequentially to each data record:

```
Record → Transform 1 → Record' → Transform 2 → Record'' → ... → Final Record
```

### 4.2 Transform Implementations

#### Rename Transform
```typescript
function applyRename(record: DataRecord, step: RenameStep): DataRecord {
  const value = record[step.source];
  delete record[step.source];
  record[step.target] = value;
  return record;
}
```

#### Cast Transform
```typescript
function applyCast(record: DataRecord, step: CastStep): DataRecord {
  const value = record[step.field];
  switch (step.toType) {
    case 'number':
      record[step.field] = parseFloat(String(value));
      if (isNaN(record[step.field] as number)) {
        throw new TransformError(`Cannot cast '${value}' to number`);
      }
      break;
    case 'string':
      record[step.field] = String(value);
      break;
    case 'date':
      const date = new Date(String(value));
      if (isNaN(date.getTime())) {
        throw new TransformError(`Cannot cast '${value}' to date`);
      }
      record[step.field] = date.toISOString();
      break;
    case 'boolean':
      record[step.field] = Boolean(value);
      break;
  }
  return record;
}
```

#### Derive Transform
```typescript
function applyDerive(record: DataRecord, step: DeriveStep): DataRecord {
  // Parse expression and evaluate with record values
  // e.g., "bounces / sessions * 100"
  const result = evaluateExpression(step.expression, record);
  record[step.field] = result;
  return record;
}
```

Expression evaluation supports:
- Arithmetic operators: `+`, `-`, `*`, `/`
- Field references: field names resolve to record values
- Numeric literals: `100`, `3.14`
- Parentheses for grouping: `(a + b) * c`

**Security:** Expressions are parsed with a whitelist-based parser. No
`eval()`, no `Function()`, no arbitrary code execution.

#### Filter Transform
```typescript
function applyFilter(record: DataRecord, step: FilterStep): DataRecord | null {
  const value = record[step.field];
  const matches = compareValues(value, step.operator, step.value);
  return matches ? record : null; // null = filtered out
}
```

### 4.3 Transform Error Handling

- Errors in transform steps are captured per-record
- Records that fail transforms are sent to the dead letter queue
- The pipeline continues processing remaining records
- Error count is tracked in the SyncRun

---

## 5. Data Aggregation

### 5.1 Aggregation Strategy

Raw DataPoints are aggregated into time buckets for efficient querying:

```
Raw DataPoints (per-event) → Aggregation Job → Time-Bucketed Summaries
```

Aggregation runs as a BullMQ job triggered after each ingestion:

```
Job Input: { dataSourceId, tenantId, syncRunId }
Job Output: Aggregated data stored in query-optimized format
```

### 5.2 Time Buckets

| Bucket | Resolution | Use Case |
|--------|------------|----------|
| hourly | 1 hour | Real-time dashboards, last 24h view |
| daily | 1 day | Weekly/monthly trends |
| weekly | 1 week | Long-term trends, quarterly reports |

### 5.3 Aggregation Algorithm

```
For each time bucket (hourly, daily, weekly):
  1. Query raw DataPoints within the bucket's time range
  2. Group by dimension values
  3. For each metric:
     - SUM: sum of all values
     - COUNT: number of records
     - AVG: sum / count
     - MIN: minimum value
     - MAX: maximum value
  4. Store aggregated result
```

**SQL for hourly aggregation:**
```sql
SELECT
  date_trunc('hour', timestamp) as bucket,
  dimensions->>'page' as page,
  SUM((metrics->>'pageViews')::numeric) as pageViews_sum,
  COUNT(*) as record_count,
  AVG((metrics->>'pageViews')::numeric) as pageViews_avg,
  MIN((metrics->>'pageViews')::numeric) as pageViews_min,
  MAX((metrics->>'pageViews')::numeric) as pageViews_max
FROM data_points
WHERE data_source_id = $1
  AND timestamp >= $2
  AND timestamp < $3
GROUP BY bucket, page
ORDER BY bucket
```

### 5.4 Incremental Aggregation

After each sync run, only the affected time buckets are re-aggregated:

```
1. Determine the time range of newly ingested data
2. Identify affected buckets (hourly buckets covering the range)
3. Re-aggregate only those buckets
4. Update or insert aggregated records
```

This avoids re-processing the entire dataset on each ingestion.

### 5.5 Aggregation Cache Invalidation

When aggregation completes:
1. Identify all cache keys for the affected data source
2. Delete those cache entries from Redis
3. Publish SSE update to connected clients

---

## 6. Query Engine

### 6.1 Query Processing

```
Query Request → Cache Check → Build SQL → Execute → Format → Cache → Response
```

### 6.2 Query Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| dataSourceId | Yes | Which data source to query |
| metrics | Yes | Which metrics to include (array) |
| dimensions | No | Which dimensions to group by (array) |
| dateRange | No | Time range filter (start, end) |
| groupBy | No | Time grouping (hour, day, week) |
| filters | No | Additional filters (array) |
| limit | No | Max rows to return (default 100) |

### 6.3 Query Building

```typescript
function buildQuery(params: QueryParams): { sql: string; values: unknown[] } {
  const selectClauses: string[] = [];
  const whereClauses: string[] = [];
  const groupByClauses: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  // Time grouping
  if (params.groupBy) {
    selectClauses.push(`date_trunc($${paramIndex}, timestamp) as period`);
    values.push(params.groupBy);
    paramIndex++;
    groupByClauses.push('period');
  }

  // Dimensions
  for (const dim of params.dimensions ?? []) {
    selectClauses.push(`dimensions->>'${dim}' as "${dim}"`);
    groupByClauses.push(`dimensions->>'${dim}'`);
  }

  // Metrics (aggregated)
  for (const metric of params.metrics) {
    selectClauses.push(
      `SUM((metrics->>'${metric}')::numeric) as "${metric}"`
    );
  }

  // Data source filter
  whereClauses.push(`data_source_id = $${paramIndex}`);
  values.push(params.dataSourceId);
  paramIndex++;

  // Date range filter
  if (params.dateRange) {
    whereClauses.push(`timestamp >= $${paramIndex}`);
    values.push(params.dateRange.start);
    paramIndex++;
    whereClauses.push(`timestamp < $${paramIndex}`);
    values.push(params.dateRange.end);
    paramIndex++;
  }

  // Additional filters
  for (const filter of params.filters ?? []) {
    const op = filterOperatorToSQL(filter.operator);
    whereClauses.push(`dimensions->>'${filter.field}' ${op} $${paramIndex}`);
    values.push(filter.value);
    paramIndex++;
  }

  const sql = `
    SELECT ${selectClauses.join(', ')}
    FROM data_points
    WHERE ${whereClauses.join(' AND ')}
    ${groupByClauses.length > 0 ? 'GROUP BY ' + groupByClauses.join(', ') : ''}
    ORDER BY ${params.groupBy ? 'period' : '1'} ASC
    LIMIT $${paramIndex}
  `;
  values.push(params.limit ?? 100);

  return { sql, values };
}
```

### 6.4 Cache Strategy

```
Cache Key: hash(tenantId + dataSourceId + queryParams)
Cache TTL: 60s (real-time) / 300s (static)
```

**Cache flow:**
```
1. Compute cache key from query params
2. Check Redis for cached result
3. If hit and not expired: return cached result
4. If miss: execute query, store result in Redis with TTL
5. Return result with meta.cached = true/false
```

**Invalidation:**
- On new data ingestion: delete cache entries for the affected data source
- On aggregation completion: delete cache entries for affected queries
- Manual: admin can flush cache for a data source

---

## 7. Connector Implementations

### 7.1 REST API Connector

**Fetch Flow:**
```
1. Decrypt connection config
2. Build URL from config.url + config.queryParams
3. Set headers from config.headers
4. Send HTTP request (GET or POST)
5. Parse JSON response
6. Extract data array using config.responsePath
7. If pagination:
   a. Extract cursor from response using config.pagination.cursorPath
   b. If cursor exists, fetch next page with cursor param
   c. Concatenate results (max 10 pages to prevent infinite loops)
8. Return FetchResult
```

**Error Handling:**
| Error | Action |
|-------|--------|
| HTTP 400-499 | Fail sync, log error |
| HTTP 500-599 | Retry 3 times, then fail |
| Timeout | Retry once, then fail |
| JSON parse error | Fail, store raw response |
| Network error | Retry 3 times, then fail |

### 7.2 PostgreSQL Connector

**Fetch Flow:**
```
1. Decrypt connection string from config
2. Create pg client with read-only transaction
3. Set statement timeout (60s)
4. Replace template variables in query:
   - {{lastSyncDate}} → last successful sync date or epoch
5. Execute parameterized query
6. Map rows to records
7. Close connection
8. Return FetchResult
```

**Security Measures:**
- Connection uses `default_transaction_read_only = on`
- Statement timeout prevents long-running queries
- Connection string is decrypted only in memory
- No logging of connection credentials
- Parameterized queries prevent SQL injection

### 7.3 CSV Connector

**Fetch Flow:**
```
1. Read file from upload storage
2. Detect encoding (default UTF-8)
3. Parse CSV with configured delimiter
4. Use first row as headers (if config.hasHeader)
5. Map remaining rows to records using headers
6. Validate row count (max 100,000)
7. Return FetchResult
```

**Validation:**
- File must be valid CSV (parseable)
- Row count within limit
- Required columns present (based on field mapping)

### 7.4 Webhook Connector

**Receive Flow:**
```
1. Look up data source by webhook ID
2. Verify signature if configured:
   a. Compute HMAC of request body using webhook secret
   b. Compare with signature header value
   c. Reject if mismatch (401)
3. Validate payload structure
4. Wrap event in array format for pipeline
5. Process through ingestion pipeline
6. Return 202 Accepted
```

**Signature Verification:**
```typescript
function verifyWebhookSignature(
  body: Buffer,
  signature: string,
  secret: string,
  algorithm: string,
): boolean {
  const computed = crypto
    .createHmac(algorithm, secret)
    .update(body)
    .digest('hex');
  return crypto.timingConstant(
    Buffer.from(signature),
    Buffer.from(computed),
  );
}
```

---

## 8. Caching Strategy

### 8.1 Cache Layers

| Layer | Technology | TTL | Purpose |
|-------|-----------|-----|---------|
| Query result cache | Redis | 60-300s | Cache query responses |
| Aggregation cache | Redis | Until invalidated | Cache aggregated data |
| Embed config cache | In-memory | 60s | Cache embed configurations |

### 8.2 Redis Cache Implementation

```typescript
export class CacheService {
  constructor(private redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  generateKey(tenantId: string, queryParams: unknown): string {
    const hash = crypto
      .createHash('sha256')
      .update(tenantId + JSON.stringify(queryParams))
      .digest('hex');
    return `query:${hash}`;
  }
}
```

### 8.3 Cache Invalidation Rules

| Event | Invalidation |
|-------|-------------|
| New data ingested | Delete cache for affected data source |
| Aggregation completed | Delete cache for affected queries |
| Data source config changed | Delete all cache for data source |
| Widget config changed | No invalidation (query params change) |
| Dashboard layout changed | No invalidation (layout only) |

---

## 9. SSE Protocol

### 9.1 Connection Lifecycle

```
1. Client connects: GET /api/v1/sse/dashboard/:dashboardId
2. Server validates API key
3. Server sends 'connected' event with dashboard ID
4. Server adds connection to tenant-scoped pool
5. On data update:
   a. Server publishes 'update' event with widget data
6. Every 30 seconds: Server sends 'heartbeat' event
7. On disconnect: Server removes connection from pool
```

### 9.2 Event Types

| Event | Payload | Trigger |
|-------|---------|---------|
| `connected` | `{ dashboardId, timestamp }` | Client connects |
| `update` | `{ widgetId, data }` | New data ingested |
| `heartbeat` | `{ timestamp }` | Every 30 seconds |
| `error` | `{ message }` | Processing error |

### 9.3 Connection Management

```typescript
export class SseService {
  private connections = new Map<string, Map<string, Response>>();

  addConnection(dashboardId: string, clientId: string, res: Response): void {
    if (!this.connections.has(dashboardId)) {
      this.connections.set(dashboardId, new Map());
    }
    this.connections.get(dashboardId)!.set(clientId, res);
  }

  removeConnection(dashboardId: string, clientId: string): void {
    this.connections.get(dashboardId)?.delete(clientId);
    if (this.connections.get(dashboardId)?.size === 0) {
      this.connections.delete(dashboardId);
    }
  }

  publishUpdate(dashboardId: string, data: unknown): void {
    const clients = this.connections.get(dashboardId);
    if (!clients) return;

    const event = `event: update\ndata: ${JSON.stringify(data)}\n\n`;
    for (const [, res] of clients) {
      res.write(event);
    }
  }

  sendHeartbeat(): void {
    const event = `event: heartbeat\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`;
    for (const [, clients] of this.connections) {
      for (const [, res] of clients) {
        res.write(event);
      }
    }
  }
}
```

### 9.4 SSE Integration with Pipeline

```
Ingestion Pipeline Completes
         │
         ▼
Aggregation Job Runs
         │
         ▼
Cache Invalidated for DataSource
         │
         ▼
Find Dashboards with Widgets Using This DataSource
         │
         ▼
For Each Dashboard:
  - Re-query widget data
  - Publish SSE 'update' event to connected clients
```

---

## 10. Encryption

### 10.1 Connection Config Encryption

Database connection strings and API credentials stored in DataSourceConfig
are encrypted at rest using AES-256-GCM:

```typescript
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'); // 32 bytes

export function encrypt(plaintext: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(ciphertext: string): string {
  const [ivHex, authTagHex, encrypted] = ciphertext.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

### 10.2 API Key Hashing

API keys are stored as hashes. The raw key is only shown once at creation:

```typescript
import { createHash } from 'crypto';

export function hashApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex');
}

export function generateApiKey(): string {
  const bytes = randomBytes(32);
  return `ak_live_${bytes.toString('hex')}`;
}
```

### 10.3 Webhook Secret Generation

```typescript
export function generateWebhookSecret(): string {
  return `whsec_${randomBytes(32).toString('hex')}`;
}
```

---

## 11. Rate Limiting

### 11.1 Rate Limit Configuration

| Endpoint | Limit | Window |
|----------|-------|--------|
| Auth endpoints | 10 requests | 1 minute |
| Dashboard CRUD | 60 requests | 1 minute |
| Data source CRUD | 60 requests | 1 minute |
| Query endpoint | 120 requests | 1 minute |
| Webhook ingestion | 100 requests | 1 minute |
| SSE connection | 10 connections | per dashboard |
| Embed API | 120 requests | 1 minute |

### 11.2 Implementation

Rate limiting uses `@nestjs/throttler`:

```typescript
@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),
  ],
})
export class AppModule {}

// Applied globally or per-route:
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 10, ttl: 60000 } })
@Controller('auth')
export class AuthController {}
```

### 11.3 Rate Limit Headers

Response headers include rate limit information:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1711000000
```

---

## 12. Dead Letter Queue

### 12.1 DLQ Entry Structure

```typescript
interface DeadLetterEntry {
  id: string;
  dataSourceId: string;
  tenantId: string;
  payload: Record<string, unknown>;     // Original data record
  errorReason: string;                  // Why processing failed
  stage: 'mapping' | 'transform' | 'validation' | 'storage';
  retriedAt: Date | null;
  createdAt: Date;
}
```

### 12.2 DLQ Processing

```
Failed record detected during pipeline
         │
         ▼
Create DeadLetterEvent with:
  - Original payload
  - Error reason (human-readable)
  - Stage where failure occurred
  - Timestamp
         │
         ▼
Increment SyncRun error count
Continue processing remaining records
```

### 12.3 DLQ Retry

```
Admin requests retry for DLQ event
         │
         ▼
Load original payload
         │
         ▼
Re-run through pipeline from the failed stage
         │
         ├── Success: Mark as retried, create DataPoint
         │
         └── Failure: Update error reason, keep in DLQ
```

---

## 13. Sync Scheduling

### 13.1 BullMQ Job Configuration

```typescript
// Create repeatable job
await syncQueue.add(
  'sync',
  { dataSourceId, tenantId },
  {
    repeat: {
      pattern: config.syncSchedule, // cron expression
    },
    jobId: `sync:${dataSourceId}`,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
);
```

### 13.2 Schedule Management

| Action | Effect |
|--------|--------|
| Create data source with schedule | Add repeatable job |
| Update schedule | Remove old job, add new job |
| Deactivate data source | Remove repeatable job |
| Activate data source | Add repeatable job |
| Delete data source | Remove repeatable job |

### 13.3 Manual Sync Trigger

```typescript
// Trigger immediate sync (non-repeatable)
await syncQueue.add(
  'sync',
  { dataSourceId, tenantId, manual: true },
  {
    jobId: `sync:${dataSourceId}:manual:${Date.now()}`,
    attempts: 1,
  },
);
```
