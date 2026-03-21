# System Requirements Specification — Part 4: Security, Performance & Compliance
# Embeddable Analytics Dashboard Engine

## Document Info
- **Version:** 1.0
- **Last Updated:** 2026-03-20
- **Status:** Approved

---

## 1. Row-Level Security (RLS)

### 1.1 RLS Policy Requirements

Every tenant-scoped table MUST have RLS policies defined in migration SQL.
[VERIFY:migration]

**Tenant-scoped tables:**
| Table | Policy Scope |
|-------|-------------|
| dashboards | Direct tenantId column [VERIFY:migration] |
| widgets | Joined via dashboard.tenantId [VERIFY:migration] |
| data_sources | Direct tenantId column [VERIFY:migration] |
| data_source_configs | Joined via data_source.tenantId [VERIFY:migration] |
| sync_runs | Joined via data_source.tenantId [VERIFY:migration] |
| data_points | Direct tenantId column [VERIFY:migration] |
| embed_configs | Joined via dashboard.tenantId [VERIFY:migration] |
| query_cache | Direct tenantId column [VERIFY:migration] |
| dead_letter_events | Direct tenantId column [VERIFY:migration] |

### 1.2 RLS Policy SQL

```sql
-- Enable RLS on all tenant-scoped tables
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_source_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE embed_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE dead_letter_events ENABLE ROW LEVEL SECURITY;

-- Dashboards: direct tenantId
CREATE POLICY tenant_isolation_dashboards ON dashboards
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

-- Data Sources: direct tenantId
CREATE POLICY tenant_isolation_data_sources ON data_sources
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

-- DataPoints: direct tenantId
CREATE POLICY tenant_isolation_data_points ON data_points
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

-- Query Cache: direct tenantId
CREATE POLICY tenant_isolation_query_cache ON query_cache
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

-- Dead Letter Events: direct tenantId
CREATE POLICY tenant_isolation_dead_letter_events ON dead_letter_events
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

-- Widgets: joined via dashboard
CREATE POLICY tenant_isolation_widgets ON widgets
  USING ("dashboardId" IN (
    SELECT id FROM dashboards
    WHERE "tenantId" = current_setting('app.current_tenant_id', true)
  ));

-- Data Source Configs: joined via data_source
CREATE POLICY tenant_isolation_data_source_configs ON data_source_configs
  USING ("dataSourceId" IN (
    SELECT id FROM data_sources
    WHERE "tenantId" = current_setting('app.current_tenant_id', true)
  ));

-- Sync Runs: joined via data_source
CREATE POLICY tenant_isolation_sync_runs ON sync_runs
  USING ("dataSourceId" IN (
    SELECT id FROM data_sources
    WHERE "tenantId" = current_setting('app.current_tenant_id', true)
  ));

-- Embed Configs: joined via dashboard
CREATE POLICY tenant_isolation_embed_configs ON embed_configs
  USING ("dashboardId" IN (
    SELECT id FROM dashboards
    WHERE "tenantId" = current_setting('app.current_tenant_id', true)
  ));
```
[VERIFY:migration]

### 1.3 RLS Context Setting

The tenant context middleware sets the RLS context on each request:
[VERIFY:grep]

```typescript
// In tenant-context middleware
async function setTenantContext(tenantId: string): Promise<void> {
  await prisma.$executeRaw`SET LOCAL app.current_tenant_id = ${tenantId}`;
}
```

**Requirements:**
- SET LOCAL scopes the setting to the current transaction [VERIFY:grep]
- Must be called within a transaction [VERIFY:grep]
- Must be called before any tenant-scoped queries [VERIFY:grep]
- If tenant ID is missing, the request MUST be rejected (401) [VERIFY:test]

### 1.4 RLS Bypass Prevention

- Application database user must NOT be a superuser [VERIFY:runtime]
- `ALTER TABLE ... FORCE ROW LEVEL SECURITY` ensures RLS applies even to table
  owners [VERIFY:migration]
- No `BYPASSRLS` privilege on the application role [VERIFY:runtime]

---

## 2. Authentication & Authorization

### 2.1 JWT Authentication (Admin Endpoints)

**Implementation:** [VERIFY:grep]
- JWT tokens issued on login with tenant ID in payload
- Token expiry: 24 hours
- Secret: environment variable `JWT_SECRET` (minimum 32 characters)
- Algorithm: HS256

**Token Payload:**
```json
{
  "sub": "tenantId",
  "iat": 1711000000,
  "exp": 1711086400
}
```

**Guard Implementation:** [VERIFY:grep]
- `@UseGuards(AuthGuard)` on all admin routes
- Guard extracts and validates JWT from `Authorization: Bearer <token>` header
- Invalid/expired tokens return 401 [VERIFY:test]
- Missing token returns 401 [VERIFY:test]

### 2.2 API Key Authentication (Embed Endpoints)

**Implementation:** [VERIFY:grep]
- API keys prefixed with `ak_live_` for identification
- Keys stored as SHA-256 hashes in the database [VERIFY:grep]
- Raw key shown only once at creation
- Key validation: hash incoming key, compare with stored hash

**Guard Implementation:** [VERIFY:grep]
- `@UseGuards(ApiKeyGuard)` on embed and SSE routes
- Guard extracts key from `X-API-Key` header or `apiKey` query parameter
- Invalid keys return 401 [VERIFY:test]
- Missing key returns 401 [VERIFY:test]

### 2.3 API Key Regeneration

- Old key is immediately invalidated [VERIFY:test]
- New key is generated and hashed
- Active embeds using the old key will fail on next request
- Admin is warned about impact before regeneration

---

## 3. Input Validation

### 3.1 DTO Validation Requirements

Every request DTO MUST use class-validator decorators. [VERIFY:grep]

**Required Decorators:**
| Field Type | Validators |
|------------|-----------|
| String (required) | `@IsString()`, `@IsNotEmpty()` |
| String (optional) | `@IsString()`, `@IsOptional()` |
| Number | `@IsNumber()`, `@Min()` / `@Max()` |
| Boolean | `@IsBoolean()` |
| Enum | `@IsEnum(EnumType)` |
| URL | `@IsUrl()` |
| Email | `@IsEmail()` |
| Array | `@IsArray()`, `@ValidateNested()` |
| Nested object | `@ValidateNested()`, `@Type()` |
| Cron expression | `@Matches(cronRegex)` |

### 3.2 Global Validation Pipe

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,         // Strip unknown properties
    forbidNonWhitelisted: true,  // Reject unknown properties
    transform: true,         // Auto-transform to DTO types
  }),
);
```
[VERIFY:grep]

### 3.3 DTO Examples

**CreateDashboardDto:** [VERIFY:grep]
```typescript
export class CreateDashboardDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;
}
```

**CreateDataSourceDto:** [VERIFY:grep]
```typescript
export class CreateDataSourceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ConnectorType)
  type: ConnectorType;

  @ValidateNested()
  @Type(() => DataSourceConfigDto)
  config: DataSourceConfigDto;
}
```

### 3.4 Request Size Limits

| Endpoint | Max Body Size |
|----------|---------------|
| Default | 1MB |
| CSV upload | 10MB |
| Webhook ingestion | 1MB |

[VERIFY:grep]

---

## 4. Rate Limiting

### 4.1 Rate Limiter Registration

The rate limiter MUST be registered in the app module AND applied to routes.
[VERIFY:grep]

```typescript
// Module registration
@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),
  ],
})
export class AppModule {}
```
[VERIFY:grep]

### 4.2 Route-Level Application

```typescript
// Applied to auth routes with stricter limits
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 10, ttl: 60000 } })
@Controller('api/v1/auth')
export class AuthController {}
```
[VERIFY:grep]

### 4.3 Rate Limit Verification

- ThrottlerModule appears in imports of AppModule [VERIFY:grep]
- ThrottlerGuard appears as `@UseGuards(ThrottlerGuard)` on controllers [VERIFY:grep]
- Rate limit exceeded returns 429 status code [VERIFY:test]

---

## 5. CORS Configuration

### 5.1 CORS Policy

```typescript
app.enableCors({
  origin: (origin, callback) => {
    // Allow requests from known embed origins
    // No wildcard '*' on SSE endpoints
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origin not allowed'));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true,
});
```
[VERIFY:grep]

### 5.2 SSE CORS

SSE endpoints MUST NOT use wildcard `*` for CORS origin. [VERIFY:grep]

The SSE endpoint validates the request origin against the embed config's
`allowedOrigins` list:

```typescript
if (!embedConfig.allowedOrigins.includes(requestOrigin)) {
  throw new ForbiddenException('Origin not allowed');
}
```
[VERIFY:grep]

---

## 6. Content Security Policy (CSP)

### 6.1 Embed CSP Headers

The embed renderer sets CSP headers dynamically based on embed config:

```typescript
const csp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",  // Required for Tailwind
  `frame-ancestors ${embedConfig.allowedOrigins.join(' ')}`,
].join('; ');

response.setHeader('Content-Security-Policy', csp);
```
[VERIFY:grep]

### 6.2 CSP Requirements

- `frame-ancestors` set per tenant's allowedOrigins [VERIFY:grep]
- No wildcard `*` in frame-ancestors [VERIFY:grep]
- `script-src` restricted to `'self'` [VERIFY:grep]
- `default-src` set to `'self'` [VERIFY:grep]

---

## 7. Embed Security

### 7.1 postMessage Security

All postMessage calls MUST specify target origin: [VERIFY:grep]

```typescript
// CORRECT: Specify target origin
window.parent.postMessage(data, targetOrigin);

// FORBIDDEN: Never use wildcard
// window.parent.postMessage(data, '*');  // BANNED
```
[VERIFY:grep]

### 7.2 Message Validation

```typescript
window.addEventListener('message', (event) => {
  // Validate origin
  if (!allowedOrigins.includes(event.origin)) {
    return; // Ignore messages from unknown origins
  }

  // Validate message structure
  if (!isValidMessage(event.data)) {
    return; // Ignore malformed messages
  }

  // Process message
  handleMessage(event.data);
});
```
[VERIFY:grep]

### 7.3 Embed URL Security

- Embed URLs use embed IDs, not direct dashboard IDs [VERIFY:grep]
- Embed IDs are CUIDs (not sequential, not guessable) [VERIFY:grep]
- API key required for every embed request [VERIFY:test]

---

## 8. Encryption

### 8.1 Connection Config Encryption

Database connection strings and API credentials are encrypted at rest
using AES-256-GCM: [VERIFY:grep]

```typescript
const ALGORITHM = 'aes-256-gcm';
```

**Requirements:**
- Encryption key from environment variable (`ENCRYPTION_KEY`) [VERIFY:grep]
- Key must be 32 bytes (64 hex characters) [VERIFY:grep]
- IV generated randomly per encryption (16 bytes) [VERIFY:grep]
- Auth tag included for integrity verification [VERIFY:grep]
- No plaintext credentials in database [VERIFY:test]
- No `Buffer.from` placeholder — real crypto operations [VERIFY:grep]

### 8.2 API Key Storage

- API keys stored as SHA-256 hashes [VERIFY:grep]
- Raw key displayed only once at creation [VERIFY:grep]
- Key comparison uses hash, never raw value [VERIFY:grep]

### 8.3 Webhook Secret Storage

- Webhook secrets generated using `crypto.randomBytes(32)` [VERIFY:grep]
- Stored as hex strings in database [VERIFY:grep]
- Used for HMAC signature verification [VERIFY:grep]

---

## 9. SQL Injection Prevention

### 9.1 Prisma Safety

- `$queryRawUnsafe` is BANNED via ESLint rule [VERIFY:grep]
- All raw queries use tagged template literals: `$queryRaw\`...\`` [VERIFY:grep]
- Prisma ORM queries are parameterized by default [VERIFY:grep]

### 9.2 ESLint Rule

```javascript
// ESLint config
{
  rules: {
    'no-restricted-properties': ['error', {
      object: 'prisma',
      property: '$queryRawUnsafe',
      message: 'Use $queryRaw tagged template instead of $queryRawUnsafe'
    }]
  }
}
```
[VERIFY:grep]

---

## 10. Performance Requirements

### 10.1 Response Time Targets

| Endpoint | Target | Measurement |
|----------|--------|-------------|
| Dashboard render (API) | < 200ms | 95th percentile |
| Query (cached) | < 50ms | 95th percentile |
| Query (uncached) | < 500ms | 95th percentile |
| Embed load (full) | < 3s | Page load complete |
| SSE event delivery | < 100ms | From publish to client |
| Webhook ingestion | < 1s | From receipt to stored |

### 10.2 Throughput Targets

| Operation | Target |
|-----------|--------|
| Data ingestion | > 100 rows/second per connector |
| Query execution | > 50 queries/second |
| SSE connections | > 100 concurrent per dashboard |
| Webhook events | > 100/minute per endpoint |

### 10.3 Database Performance

**Indexing Strategy:** [VERIFY:migration]
- Composite index on `(tenantId, dataSourceId, timestamp)` for DataPoints
- Index on `timestamp` for time-range queries
- Index on `queryHash` for cache lookups
- Index on `status` for sync run filtering

**Connection Pooling:**
- Prisma connection pool: 10 connections default
- Separate connections for RLS context
- Pool size configurable via environment variable

### 10.4 Caching Performance

- Redis query cache reduces database load by ~80% for repeated queries
- Cache hit ratio target: > 70% for dashboard views
- Cache invalidation within 1 second of new data

---

## 11. Error Handling & Resilience

### 11.1 Circuit Breaker Pattern

External connector calls (REST API, PostgreSQL) use circuit breaker logic:

```
Closed State:
  - Normal operation
  - Track failure count
  - If failures exceed threshold (5): open circuit

Open State:
  - All calls fail immediately
  - After cooldown period (60s): move to half-open

Half-Open State:
  - Allow one test call
  - If success: close circuit
  - If failure: re-open circuit
```

### 11.2 Retry Strategy

| Operation | Max Retries | Backoff |
|-----------|-------------|---------|
| REST API fetch | 3 | Exponential (5s, 10s, 20s) |
| PostgreSQL query | 2 | Linear (5s, 10s) |
| BullMQ job | 3 | Exponential (5s, 10s, 20s) |
| SSE reconnection | Unlimited | Exponential (1s, 2s, 4s, max 30s) |

### 11.3 Error Logging

- All errors logged with structured JSON
- Request ID included for tracing
- Stack traces logged server-side only
- Client receives sanitized error messages
- No secrets or credentials in error messages [VERIFY:grep]

---

## 12. Monitoring & Observability

### 12.1 Health Check Endpoints

```
GET /health          → { status: 'ok', uptime: 12345 }
GET /health/db       → { status: 'ok', latency: 5 }
GET /health/redis    → { status: 'ok', latency: 2 }
```
[VERIFY:grep]

### 12.2 Sync Monitoring

- Every sync run logged with: status, duration, row count, error count
- Sync history queryable via API
- Failed syncs generate DLQ entries
- Sync duration tracked for performance monitoring

---

## 13. Data Privacy

### 13.1 Data Isolation

- Tenant data isolated via PostgreSQL RLS [VERIFY:migration]
- No cross-tenant data access possible via application queries [VERIFY:test]
- Tenant context must be set before any data query [VERIFY:grep]

### 13.2 Data Retention

- DataPoints: retained indefinitely (tenant manages lifecycle)
- SyncRuns: last 1000 per data source
- DeadLetterEvents: retained for 30 days
- QueryCache: TTL-based (60-300 seconds)
- Audit log: not implemented in MVP

### 13.3 Credential Security

- Connection strings encrypted at rest (AES-256-GCM) [VERIFY:grep]
- API keys stored as hashes (SHA-256) [VERIFY:grep]
- JWT secrets from environment variables [VERIFY:grep]
- No credentials in logs [VERIFY:grep]
- Connection details masked in API responses [VERIFY:grep]

---

## 14. Compliance Checklist

### 14.1 Security Controls

| Control | Status | Verification |
|---------|--------|-------------|
| RLS on all tenant tables | PLANNED | [VERIFY:migration] |
| JWT authentication for admin | PLANNED | [VERIFY:grep] |
| API key authentication for embed | PLANNED | [VERIFY:grep] |
| Input validation on all DTOs | PLANNED | [VERIFY:grep] |
| Rate limiting registered and applied | PLANNED | [VERIFY:grep] |
| CORS restricted (no wildcard on SSE) | PLANNED | [VERIFY:grep] |
| CSP frame-ancestors per tenant | PLANNED | [VERIFY:grep] |
| postMessage target origin specified | PLANNED | [VERIFY:grep] |
| Connection config encrypted | PLANNED | [VERIFY:grep] |
| API keys stored as hashes | PLANNED | [VERIFY:grep] |
| No $queryRawUnsafe | PLANNED | [VERIFY:grep] |
| No `as any` | PLANNED | [VERIFY:grep] |
| Webhook signature verification | PLANNED | [VERIFY:grep] |
| File size limits enforced | PLANNED | [VERIFY:grep] |
| SQL injection prevention | PLANNED | [VERIFY:grep] |

### 14.2 Testing Controls

| Control | Status | Verification |
|---------|--------|-------------|
| Tenant isolation E2E test | PLANNED | [VERIFY:test] |
| Auth flow E2E tests | PLANNED | [VERIFY:test] |
| Rate limit E2E test | PLANNED | [VERIFY:test] |
| Invalid input returns 400 | PLANNED | [VERIFY:test] |
| Missing auth returns 401 | PLANNED | [VERIFY:test] |
| Wrong tenant returns 403/empty | PLANNED | [VERIFY:test] |
| Pipeline lifecycle integration test | PLANNED | [VERIFY:test] |
| Dashboard CRUD integration test | PLANNED | [VERIFY:test] |

### 14.3 CI Controls

| Control | Status | Verification |
|---------|--------|-------------|
| ESLint runs in CI | PLANNED | [VERIFY:ci] |
| Tests run in CI | PLANNED | [VERIFY:ci] |
| No echo/no-op CI stages | PLANNED | [VERIFY:ci] |
| TypeScript strict mode | PLANNED | [VERIFY:grep] |
| $queryRawUnsafe banned | PLANNED | [VERIFY:ci] |

---

## 15. Dependency Security

### 15.1 Dependency Policy

- All dependencies must be MIT, BSD, ISC, or Apache-2.0 licensed
- No dependencies with known critical CVEs
- Lock file (`pnpm-lock.yaml`) committed to repository
- Regular dependency updates via Dependabot or manual review

### 15.2 Key Dependencies Security Assessment

| Dependency | License | Risk | Notes |
|------------|---------|------|-------|
| NestJS | MIT | Low | Well-maintained, large community |
| Prisma | Apache-2.0 | Low | Database abstraction, prevents SQL injection |
| Next.js | MIT | Low | Server-side rendering, React framework |
| Recharts | MIT | Low | Charting library, no server-side risk |
| BullMQ | MIT | Low | Job queue, Redis-backed |
| class-validator | MIT | Low | Input validation |
| ioredis | MIT | Low | Redis client |

---

## 16. Disaster Recovery

### 16.1 Data Loss Prevention

- PostgreSQL WAL for point-in-time recovery
- Database backups via Railway (automated daily)
- Dead letter queue preserves failed ingestion data

### 16.2 Service Recovery

- Health check endpoints for automated monitoring
- BullMQ job persistence across restarts
- SSE client reconnection with exponential backoff
- Stateless API servers (horizontal scaling ready)
