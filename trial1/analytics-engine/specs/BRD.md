# Business Requirements Document (BRD)

## Analytics Engine — Embeddable Multi-Tenant Analytics Platform

| Field          | Value                          |
|----------------|--------------------------------|
| Version        | 1.0                            |
| Date           | 2026-03-20                     |
| Status         | Draft                          |
| Owner          | Product Team                   |
| Classification | Internal                       |

---

## 1. Business Rules

### 1.1 Tenant Isolation

| ID | Rule | Testable Criteria |
|----|------|-------------------|
| BR-001 | Every data row (DataPoint, Dashboard, Widget, DataSource, SyncRun, EmbedConfig, QueryCache) MUST be scoped to exactly one Tenant via a `tenantId` foreign key. | Query any tenant-scoped table without setting RLS context — zero rows returned. |
| BR-002 | PostgreSQL Row-Level Security (RLS) MUST be enabled on all tenant-scoped tables. Application-level WHERE clauses are a secondary safeguard, not the primary isolation mechanism. | Execute raw SQL as a tenant role — only that tenant's rows are visible. |
| BR-003 | A tenant MUST NOT be able to read, write, or reference resources belonging to another tenant, even via direct API manipulation (e.g., passing another tenant's dashboard ID). | API call with valid JWT for Tenant A referencing Tenant B's resource returns 404 (not 403). |
| BR-004 | Tenant deletion MUST cascade-delete all associated resources (dashboards, widgets, data sources, data points, sync runs, embed configs, query cache entries). | After tenant deletion, querying any child table for that tenant returns zero rows. |

### 1.2 Data Retention

| ID | Rule | Testable Criteria |
|----|------|-------------------|
| BR-005 | Raw DataPoint records MUST be retained for the duration specified by the tenant's subscription tier: Free = 30 days, Pro = 365 days, Enterprise = unlimited (or custom). | Query DataPoints older than retention period for a Free tenant — zero rows returned. |
| BR-006 | Aggregated data (time-bucketed rollups) MUST be retained indefinitely regardless of tier. | Aggregated records exist beyond the raw retention window. |
| BR-007 | SyncRun history MUST be retained for 90 days on all tiers. Records older than 90 days are soft-deleted (marked as archived). | SyncRun records older than 90 days have `archivedAt` set. |
| BR-008 | QueryCache entries MUST expire after a configurable TTL (default: 5 minutes). Stale cache entries are evicted lazily on next query. | Cache entry older than TTL returns cache miss on next query. |
| BR-009 | DeadLetterEvent records MUST be retained for 30 days, then hard-deleted by a scheduled cleanup job. | No DeadLetterEvent records exist older than 30 days. |

### 1.3 API Rate Limits

| ID | Rule | Testable Criteria |
|----|------|-------------------|
| BR-010 | API rate limits MUST be enforced per tenant, not per user or per IP. | Two users in the same tenant share one rate limit bucket. |
| BR-011 | Rate limits by tier: Free = 100 req/min, Pro = 1,000 req/min, Enterprise = 10,000 req/min. | 101st request in a minute from a Free tenant returns HTTP 429. |
| BR-012 | Embed API (iframe data fetches) rate limits: Free = 500 req/min, Pro = 5,000 req/min, Enterprise = 50,000 req/min. Embed limits are separate from admin API limits. | Embed requests and admin requests have independent counters. |
| BR-013 | Rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`) MUST be included on every API response. | Response headers contain all three rate limit fields. |
| BR-014 | Webhook ingestion rate limits: Free = 10 events/sec, Pro = 100 events/sec, Enterprise = 1,000 events/sec. | 11th webhook event per second from a Free tenant returns HTTP 429. |

### 1.4 Embed Security

| ID | Rule | Testable Criteria |
|----|------|-------------------|
| BR-015 | Embedded dashboards MUST only be loadable from origins listed in the tenant's `allowedOrigins` configuration. | Loading embed iframe from an unlisted origin returns HTTP 403. |
| BR-016 | Embed API requests MUST authenticate via API key passed as a query parameter or `X-API-Key` header. JWT tokens are NOT valid for embed access. | Embed request with JWT but no API key returns HTTP 401. |
| BR-017 | API keys MUST be rotatable without downtime. The system MUST support two active keys per tenant simultaneously during rotation. | After generating a new key, both old and new keys work. After revoking the old key, only the new key works. |
| BR-018 | The embed iframe response MUST include `Content-Security-Policy: frame-ancestors <allowedOrigins>` header. | CSP header matches the tenant's configured allowed origins. |
| BR-019 | Embed API keys MUST be distinct from admin API keys. An embed key MUST NOT grant access to admin endpoints. | Embed API key used on admin endpoint returns HTTP 401. |

### 1.5 Data Source Management

| ID | Rule | Testable Criteria |
|----|------|-------------------|
| BR-020 | Connection credentials (database passwords, API tokens) MUST be encrypted at rest using AES-256-GCM. | Reading the `config` column from DataSourceConfig returns ciphertext, not plaintext. |
| BR-021 | A data source MUST be testable before saving. The "Test Connection" action MUST verify connectivity and return success/failure within 10 seconds. | Test connection to an invalid host returns failure within 10 seconds. |
| BR-022 | Deleting a data source MUST cascade-delete all associated sync runs, data points, and invalidate any widgets that reference it. | After deletion, widgets referencing the deleted source display "Data source removed" state. |
| BR-023 | Each data source MUST have a configurable sync schedule: manual only, every 15 minutes, hourly, daily, or weekly. | Setting schedule to "hourly" causes BullMQ to enqueue a sync job every 60 minutes. |
| BR-024 | Data source limits by tier: Free = 1, Pro = 10, Enterprise = unlimited. | Creating a 2nd data source on a Free tenant returns HTTP 403 with a tier upgrade message. |

### 1.6 Dashboard and Widget Rules

| ID | Rule | Testable Criteria |
|----|------|-------------------|
| BR-025 | Dashboard limits by tier: Free = 1, Pro = unlimited, Enterprise = unlimited. | Creating a 2nd dashboard on a Free tenant returns HTTP 403. |
| BR-026 | A published dashboard MUST NOT be editable. The admin must revert it to draft status before making changes. | PUT request to a published dashboard returns HTTP 409 with message "Dashboard must be in draft status to edit." |
| BR-027 | An archived dashboard MUST NOT be viewable via the embed API. | Embed request for an archived dashboard returns HTTP 404. |
| BR-028 | Widget display limits per dashboard: maximum 20 widgets. | Adding a 21st widget returns HTTP 422 with message "Maximum 20 widgets per dashboard." |
| BR-029 | Each widget MUST reference exactly one data source. Cross-source widgets are not supported in v1.0. | Widget creation with no dataSourceId returns HTTP 400. |

### 1.7 Sync and Ingestion Rules

| ID | Rule | Testable Criteria |
|----|------|-------------------|
| BR-030 | A sync run MUST be idempotent. Re-running the same sync with the same source data MUST NOT create duplicate DataPoint records. | Two consecutive syncs of identical data result in the same row count. |
| BR-031 | Sync runs that fail 3 consecutive times MUST trigger an email alert to the tenant admin and pause automatic scheduling until manually resumed. | After 3 failures, the data source's `syncPaused` flag is true and an email is queued. |
| BR-032 | Webhook payloads exceeding 1 MB MUST be rejected with HTTP 413. | POST to webhook endpoint with 1.1 MB body returns HTTP 413. |
| BR-033 | CSV uploads exceeding 50 MB MUST be rejected with HTTP 413. Free tier limit is 5 MB. | Upload of 6 MB CSV on Free tier returns HTTP 413. |
| BR-034 | Every failed ingestion event MUST be written to the DeadLetterEvent table with the original payload, error message, and timestamp. | After a failed sync, a DeadLetterEvent row exists with the correct error message. |

---

## 2. Subscription Tiers

### 2.1 Tier Comparison

| Feature | Free | Pro ($49/mo) | Enterprise (custom) |
|---------|------|-------------|---------------------|
| Dashboards | 1 | Unlimited | Unlimited |
| Data sources | 1 | 10 | Unlimited |
| Data retention (raw) | 30 days | 365 days | Custom |
| Sync frequency (minimum) | Hourly | 15 minutes | 15 minutes |
| API rate limit | 100 req/min | 1,000 req/min | 10,000 req/min |
| Embed rate limit | 500 req/min | 5,000 req/min | 50,000 req/min |
| Webhook rate limit | 10 events/sec | 100 events/sec | 1,000 events/sec |
| CSV upload size | 5 MB | 50 MB | 50 MB |
| White-label (remove branding) | No | Yes | Yes |
| Custom domain for embed | No | No | Yes |
| Priority sync queue | No | No | Yes |
| Email alerts on sync failure | Yes (basic) | Yes (detailed) | Yes (detailed + webhook) |
| SSE real-time updates | Yes | Yes | Yes |
| Support | Community | Email (48h) | Dedicated (4h SLA) |

### 2.2 Tier Enforcement Rules

| ID | Rule | Testable Criteria |
|----|------|-------------------|
| BR-035 | Tier limits MUST be enforced at the API layer before any database write. | Attempt to exceed a limit returns 403 before any INSERT is executed. |
| BR-036 | Upgrading a tier MUST immediately unlock the new limits without requiring a page refresh or re-login. | After upgrade, creating a second dashboard succeeds on the next API call. |
| BR-037 | Downgrading a tier MUST NOT delete existing resources that exceed the new limit. Resources become read-only until the tenant deletes them or upgrades again. | After downgrade from Pro to Free with 5 dashboards, all 5 are readable but none are editable. New dashboard creation is blocked. |
| BR-038 | The "Powered by Analytics Engine" badge MUST appear on all Free tier embeds. It MUST NOT appear on Pro or Enterprise embeds. | Free tier embed HTML contains the badge element. Pro tier embed HTML does not. |

---

## 3. External Dependencies

### 3.1 Dependency Risk Matrix

| Dependency | Purpose | Risk Rating | Failure Impact | Mitigation |
|------------|---------|-------------|----------------|------------|
| **PostgreSQL 16** (Railway) | Primary data store, RLS enforcement | Critical | Total system outage | Railway managed backups; point-in-time recovery; connection pooling via PgBouncer |
| **Redis** (Railway) | BullMQ job queue, rate limiting, SSE pub/sub, session cache | High | Job scheduling stops, rate limits unenforced, SSE offline | Redis Sentinel for HA; graceful degradation (sync runs on-demand, rate limits fail-open briefly) |
| **Vercel** | Frontend hosting (Next.js) | High | Admin portal and embed UI unavailable | Static assets cached at CDN edge; embed iframe serves cached HTML |
| **Railway** | API hosting, PostgreSQL, Redis | Critical | Full backend outage | Multi-region deployment (future); health checks with automatic restart |
| **Stripe** | Subscription billing | Medium | Cannot process upgrades/downgrades | Webhook retry with idempotency keys; manual billing fallback; 30-day grace period |
| **SMTP Provider** (e.g., Resend) | Transactional emails (sync alerts, welcome) | Low | Email notifications delayed | Queue emails in BullMQ; retry up to 3 times; emails are non-blocking |

### 3.2 Integration Contracts

| Dependency | Integration Method | Health Check | Timeout |
|------------|--------------------|--------------|---------|
| PostgreSQL | Prisma ORM (connection pool) | `SELECT 1` every 30s | 5s connect, 30s query |
| Redis | ioredis client | `PING` every 10s | 3s connect, 5s command |
| Stripe | Stripe SDK + webhooks | Webhook signature verification | 10s API call |
| SMTP | REST API (Resend SDK) | N/A (fire-and-forget with retry) | 10s per send |

---

## 4. Regulatory and Compliance

### 4.1 Data Handling

| ID | Rule | Testable Criteria |
|----|------|-------------------|
| BR-039 | Analytics Engine MUST NOT store personally identifiable information (PII) in DataPoint records unless the tenant explicitly configures a field as PII-containing. | Default schema mapping marks no fields as PII. |
| BR-040 | PII-flagged fields MUST be encrypted at rest and excluded from aggregation rollups. | Aggregated data does not contain PII field values. |
| BR-041 | All data in transit MUST use TLS 1.2 or higher. HTTP connections MUST redirect to HTTPS. | HTTP request receives 301 redirect to HTTPS. |
| BR-042 | Database backups MUST be encrypted at rest. | Railway backup configuration confirms encryption enabled. |

### 4.2 GDPR Considerations

| ID | Rule | Testable Criteria |
|----|------|-------------------|
| BR-043 | Tenants MUST be able to export all their data (dashboards, data sources, data points) in JSON format via an API endpoint. | GET `/api/tenants/:id/export` returns a complete JSON archive. |
| BR-044 | Tenants MUST be able to request full account deletion. Deletion MUST complete within 30 days and remove all data including backups (after backup rotation). | After deletion request, all tenant data is purged within 30 days. |
| BR-045 | A Data Processing Agreement (DPA) MUST be available for Enterprise tenants. | DPA document exists and is downloadable from the admin portal. |
| BR-046 | Audit logs MUST record all data access events (who accessed what data, when) and be retained for 1 year. | Audit log entries exist for every API call that reads or writes tenant data. |

### 4.3 Data Residency

| ID | Rule | Testable Criteria |
|----|------|-------------------|
| BR-047 | v1.0 deploys to a single region (US). Data residency selection is out of scope but the schema MUST include a `region` field on the Tenant model for future use. | Tenant model has a `region` field with default value `us-east-1`. |

---

## 5. Business Metrics and Reporting

### 5.1 Internal Analytics

The platform MUST track the following metrics for internal business reporting:

| Metric | Granularity | Storage |
|--------|-------------|---------|
| Tenant signup count | Daily | Internal dashboard |
| Tier distribution (Free/Pro/Enterprise) | Real-time | Internal dashboard |
| Total sync runs (success/failure) | Hourly | Aggregated in PostgreSQL |
| Embed page views per tenant | Daily | Aggregated in PostgreSQL |
| API request volume per tenant | Per-minute | Redis (rolling window) |
| P95 dashboard load time | Per-minute | Application metrics |
| Revenue (MRR, churn) | Monthly | Stripe reporting |

### 5.2 Tenant-Facing Usage Metrics

| ID | Rule | Testable Criteria |
|----|------|-------------------|
| BR-048 | Each tenant MUST be able to view their current usage against tier limits (dashboards, data sources, API calls, storage). | Admin portal displays current usage with progress bars against tier limits. |
| BR-049 | Usage data MUST update within 5 minutes of the actual event. | After creating a dashboard, the usage count increments within 5 minutes. |

---

## 6. Service Level Objectives

| Metric | Target | Measurement Window |
|--------|--------|--------------------|
| API availability | 99.9% | Monthly |
| Embed availability | 99.95% | Monthly |
| Dashboard load time (P95) | < 2 seconds | Weekly |
| Sync job start latency | < 30 seconds from scheduled time | Per-job |
| Data freshness (webhook) | < 10 seconds from receipt to widget update | Per-event |
| Data freshness (scheduled) | Within sync interval + 60 seconds | Per-sync |
| Incident response time | < 1 hour (critical), < 4 hours (high) | Per-incident |

---

## 7. Glossary of Business Terms

| Term | Definition |
|------|-----------|
| **Tenant** | A registered organization (customer) of Analytics Engine. Each tenant is fully isolated. |
| **Data Source** | A configured connection to an external system (API, database, file, or webhook) that provides data. |
| **Connector** | The implementation that extracts data from a specific type of external system. |
| **Sync Run** | A single execution of a data source connector that extracts, transforms, and loads data. |
| **Dashboard** | A collection of widgets arranged in a grid layout, viewable via the embed system. |
| **Widget** | A single visualization (chart, table, KPI card) on a dashboard, bound to one data source. |
| **Embed** | The iframe-based system that renders dashboards on third-party websites. |
| **Dead Letter Event** | A failed record captured during ingestion for later debugging and reprocessing. |
| **Field Mapping** | The configuration that maps source data fields to standardized dimensions and metrics. |
| **Dimension** | A categorical field used for grouping and filtering (e.g., region, product name, date). |
| **Metric** | A numeric field used for aggregation (e.g., revenue, order count, page views). |
| **Aggregation** | Pre-computed rollups of raw data into time buckets (hourly, daily, weekly, monthly). |
| **RLS** | Row-Level Security — a PostgreSQL feature that restricts row access at the database level. |
| **White-label** | Removing Analytics Engine branding so the embed appears as part of the tenant's product. |
| **Tier** | Subscription level (Free, Pro, Enterprise) that determines feature access and resource limits. |

---

## 8. Acceptance Testing Strategy

### 8.1 Business Rule Test Categories

| Category | BR Range | Test Type | Environment |
|----------|----------|-----------|-------------|
| Tenant isolation | BR-001 to BR-004 | Integration (cross-tenant queries) | CI with test DB |
| Data retention | BR-005 to BR-009 | Integration (time-based cleanup) | CI with mocked clock |
| Rate limiting | BR-010 to BR-014 | Integration (burst traffic) | CI with Redis |
| Embed security | BR-015 to BR-019 | Integration (origin validation, CSP) | CI with HTTP assertions |
| Encryption | BR-020 | Unit (encrypt/decrypt roundtrip) | CI |
| Data source rules | BR-021 to BR-024 | Integration (CRUD + tier limits) | CI with test DB |
| Dashboard rules | BR-025 to BR-029 | Integration (state machine + limits) | CI with test DB |
| Sync rules | BR-030 to BR-034 | Integration (idempotency, failure handling) | CI with mock connectors |
| Tier enforcement | BR-035 to BR-038 | Integration (upgrade/downgrade flows) | CI with test DB |
| Regulatory | BR-039 to BR-047 | Integration (export, deletion, audit) | CI with test DB |
| Usage tracking | BR-048 to BR-049 | Integration (usage counters) | CI with test DB |

### 8.2 Critical Path Tests

These tests MUST pass before any production deployment:

1. **Tenant isolation smoke test:** Create two tenants, create resources for each, verify Tenant A cannot access Tenant B's resources via direct API calls with manipulated IDs.
2. **Sync idempotency test:** Run the same sync twice with identical source data. Verify no duplicate DataPoints are created.
3. **Embed origin test:** Request an embedded dashboard from an unauthorized origin. Verify HTTP 403 response.
4. **Tier limit test:** On a Free tier tenant, attempt to create resources beyond Free limits. Verify HTTP 403 with upgrade message.
5. **Rate limit test:** Send requests at 2x the tier limit rate. Verify HTTP 429 after the limit is exceeded and that rate limit headers are present.
6. **Config encryption test:** Create a data source with credentials. Query the database directly. Verify the config column contains ciphertext, not plaintext.
7. **Dashboard state machine test:** Publish a dashboard, attempt to edit it via PUT. Verify HTTP 409. Archive it, attempt to load via embed API. Verify HTTP 404.
8. **Sync failure escalation test:** Simulate 3 consecutive sync failures. Verify the data source is paused, an email job is enqueued, and the admin dashboard shows an alert.
9. **API key rotation test:** Generate a new embed key, verify both old and new keys work. Revoke the old key, verify only the new key works within 60 seconds.
10. **Data export test:** Request a full data export. Verify the JSON archive contains all tenant resources (data sources, dashboards, widgets, data points).

### 8.3 Test Data Requirements

| Requirement | Volume | Purpose |
|-------------|--------|---------|
| Minimum 2 tenants | Always | Cross-tenant isolation testing |
| 10,000+ DataPoints per tenant | Performance tests | Query engine benchmarking |
| 100+ concurrent SSE connections | Load tests | SSE scalability verification |
| Sync runs with mixed statuses | Functional tests | State machine coverage |
| All 7 widget types configured | Functional tests | Widget rendering coverage |
| Multiple API keys per tenant | Auth tests | Key rotation and revocation |

---

## 9. Document References

| Document | Section | Relationship |
|----------|---------|-------------|
| §PVD | Problem Space | Business rules derive from product vision |
| §PRD | Functional Requirements | Each FR traces to one or more BRs |
| §SRS-2 | Data Model | Schema implements BR-001 through BR-004 (tenant isolation) |
| §SRS-4 | Security | Security controls implement BR-015 through BR-020 |
| §SRS-3 | Domain Logic | Sync rules implement BR-030 through BR-034 |
| §WIREFRAMES | UI Layouts | Admin views implement BR-048 (usage display) |
| §SPEC-INDEX | Cross-References | Maps BRs to implementation modules |
