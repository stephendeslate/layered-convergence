# Software Requirements Specification — Communications & Security (SRS-4)

## Analytics Engine — Embeddable Multi-Tenant Analytics Platform

| Field          | Value                          |
|----------------|--------------------------------|
| Version        | 1.0                            |
| Date           | 2026-03-20                     |
| Status         | Draft                          |
| Owner          | Engineering Team               |
| Classification | Internal                       |

---

## 1. Authentication Flows

### 1.1 Admin Portal Authentication (JWT)

#### 1.1.1 Registration Flow

```
Client (web)                    API                         Database
    │                            │                            │
    │  POST /api/auth/register   │                            │
    │  { email, password, name } │                            │
    │───────────────────────────▶│                            │
    │                            │  Validate input (Zod)      │
    │                            │  Check email uniqueness     │
    │                            │───────────────────────────▶│
    │                            │◀───────────────────────────│
    │                            │  Hash password (bcrypt, 12) │
    │                            │  Generate emailVerifyToken   │
    │                            │  Create Tenant record       │
    │                            │───────────────────────────▶│
    │                            │◀───────────────────────────│
    │                            │  Enqueue welcome email      │
    │                            │  with verification link     │
    │  201 { message }           │                            │
    │◀───────────────────────────│                            │
```

**Validation rules:**
- Email: valid format, max 255 chars, case-insensitive (lowercased before storage)
- Password: min 8 chars, at least 1 uppercase, at least 1 number
- Name (organization): min 2 chars, max 100 chars

#### 1.1.2 Login Flow

```
Client (web)                    API                         Database         Redis
    │                            │                            │               │
    │  POST /api/auth/login      │                            │               │
    │  { email, password }       │                            │               │
    │───────────────────────────▶│                            │               │
    │                            │  Find tenant by email       │               │
    │                            │───────────────────────────▶│               │
    │                            │◀───────────────────────────│               │
    │                            │  Verify emailVerified=true  │               │
    │                            │  Compare bcrypt hash        │               │
    │                            │  Generate JWT (24h expiry)  │               │
    │                            │  Store session in Redis     │               │
    │                            │──────────────────────────────────────────▶│
    │  200 { token }             │                            │               │
    │  Set-Cookie: session=JWT   │                            │               │
    │  (httpOnly, secure, same)  │                            │               │
    │◀───────────────────────────│                            │               │
```

**JWT Payload:**

```typescript
interface JwtPayload {
  sub: string;           // Tenant ID (cuid)
  email: string;         // Tenant email
  tier: SubscriptionTier;// Current tier
  iat: number;           // Issued at (Unix timestamp)
  exp: number;           // Expiry (iat + 24 hours)
}
```

**JWT Configuration:**
- Algorithm: HS256
- Secret: `JWT_SECRET` env var (min 256 bits)
- Expiry: 24 hours
- Delivered via: `Set-Cookie` header (httpOnly, Secure, SameSite=Lax) AND response body (for API clients)

#### 1.1.3 Email Verification Flow

```
Client                          API                         Database
    │                            │                            │
    │  GET /api/auth/verify-email│                            │
    │  ?token=xxx                │                            │
    │───────────────────────────▶│                            │
    │                            │  Find tenant by token       │
    │                            │───────────────────────────▶│
    │                            │◀───────────────────────────│
    │                            │  Check token not expired    │
    │                            │  (24h from creation)        │
    │                            │  Set emailVerified=true     │
    │                            │  Clear emailVerifyToken     │
    │                            │───────────────────────────▶│
    │  302 Redirect to /login    │                            │
    │◀───────────────────────────│                            │
```

#### 1.1.4 Password Reset Flow

```
1. POST /api/auth/forgot-password { email }
   - Generate reset token (crypto.randomBytes(32).toString('hex'))
   - Store hashed token + expiry (1 hour) on Tenant record
   - Enqueue password_reset email with reset link
   - Return 200 (always, even if email not found — prevent enumeration)

2. POST /api/auth/reset-password { token, newPassword }
   - Find tenant by hashed token
   - Verify token not expired (1 hour)
   - Hash new password (bcrypt, 12 rounds)
   - Update passwordHash, clear reset token
   - Invalidate all existing sessions in Redis
   - Return 200
```

### 1.2 Embed Authentication (API Key)

#### 1.2.1 API Key Generation

```
1. Admin requests: POST /api/api-keys { type: "EMBED", name: "Production" }
2. System generates: crypto.randomBytes(32).toString('base64url')
3. System stores: SHA-256 hash of the key (never store plaintext)
4. System returns: the full key ONCE in the response
5. System stores: keyPrefix = last 4 chars (for display in UI)
```

#### 1.2.2 Embed Request Authentication

```
Client (embed iframe)           API                         Redis           Database
    │                            │                            │               │
    │  GET /api/embed/dashboards │                            │               │
    │  /:id?key=embed_xxx        │                            │               │
    │  Origin: https://myapp.com │                            │               │
    │───────────────────────────▶│                            │               │
    │                            │  Extract API key            │               │
    │                            │  (query param or header)    │               │
    │                            │  SHA-256 hash the key       │               │
    │                            │  Check Redis cache          │               │
    │                            │───────────────────────────▶│               │
    │                            │  Cache miss → query DB      │               │
    │                            │──────────────────────────────────────────▶│
    │                            │◀──────────────────────────────────────────│
    │                            │  Verify: type=EMBED,        │               │
    │                            │  isActive=true,             │               │
    │                            │  not expired                │               │
    │                            │  Cache in Redis (60s TTL)   │               │
    │                            │───────────────────────────▶│               │
    │                            │  Verify Origin is in        │               │
    │                            │  allowedOrigins              │               │
    │                            │  Set RLS tenant context      │               │
    │  200 { dashboard data }    │                            │               │
    │  CSP: frame-ancestors ...  │                            │               │
    │◀───────────────────────────│                            │               │
```

**API Key Extraction Priority:**
1. `X-API-Key` header
2. `key` query parameter

**Validation Steps:**
1. Key exists and is not empty
2. SHA-256 hash matches a record in `api_keys` table
3. `type` is `EMBED` (not `ADMIN`)
4. `isActive` is `true`
5. `expiresAt` is null or in the future
6. `revokedAt` is null
7. Request `Origin` header is in the dashboard's `allowedOrigins` array

---

## 2. Embed Security

### 2.1 Allowed Origins Enforcement

```typescript
function validateOrigin(
  requestOrigin: string | undefined,
  allowedOrigins: string[]
): boolean {
  // If no Origin header (e.g., direct browser navigation), deny
  if (!requestOrigin) return false;

  // Exact match against configured origins
  // Origins include protocol: "https://myapp.com", "https://staging.myapp.com"
  return allowedOrigins.includes(requestOrigin);
}
```

**Rules:**
- Origins MUST include protocol (e.g., `https://myapp.com`, not `myapp.com`)
- Wildcard origins are NOT supported (security risk)
- `localhost` origins are allowed only in development/staging environments
- Empty `allowedOrigins` array means embed is disabled (returns 403)

### 2.2 Content Security Policy

Every embed response includes the following headers:

```
Content-Security-Policy: frame-ancestors 'self' https://myapp.com https://staging.myapp.com;
X-Frame-Options: ALLOW-FROM https://myapp.com
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

The `frame-ancestors` directive is dynamically generated from the tenant's `allowedOrigins` configuration.

### 2.3 postMessage Security

```typescript
// In the embed iframe:
window.addEventListener('message', (event: MessageEvent) => {
  // 1. Verify origin
  if (!allowedOrigins.includes(event.origin)) {
    return; // Silently ignore messages from unauthorized origins
  }

  // 2. Validate message schema
  const parsed = postMessageSchema.safeParse(event.data);
  if (!parsed.success) {
    return; // Silently ignore malformed messages
  }

  // 3. Process message
  switch (parsed.data.type) {
    case 'setFilter':
      applyFilter(parsed.data.payload);
      // Send acknowledgment
      event.source?.postMessage(
        { type: 'filterApplied', payload: parsed.data.payload },
        { targetOrigin: event.origin }
      );
      break;
    // ... other message types
  }
});
```

**postMessage Schema:**

```typescript
const postMessageSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('setFilter'),
    payload: z.object({
      field: z.string(),
      value: z.union([z.string(), z.number(), z.array(z.string())]),
    }),
  }),
  z.object({
    type: z.literal('setDateRange'),
    payload: z.object({
      start: z.string().datetime(),
      end: z.string().datetime(),
    }),
  }),
  z.object({
    type: z.literal('refresh'),
    payload: z.object({}),
  }),
]);
```

**Outgoing events (iframe → host):**

```typescript
const outgoingEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('filterApplied'),
    payload: z.object({ field: z.string(), value: z.unknown() }),
  }),
  z.object({
    type: z.literal('widgetClick'),
    payload: z.object({ widgetId: z.string(), dataPoint: z.record(z.unknown()) }),
  }),
  z.object({
    type: z.literal('dashboardLoaded'),
    payload: z.object({ dashboardId: z.string(), widgetCount: z.number() }),
  }),
  z.object({
    type: z.literal('error'),
    payload: z.object({ code: z.string(), message: z.string() }),
  }),
]);
```

---

## 3. Data Encryption

### 3.1 Connection Config Encryption (AES-256-GCM)

Connector configurations contain sensitive credentials (database passwords, API tokens). These MUST be encrypted at rest (§BRD BR-020).

```typescript
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'); // 32 bytes

function encryptConfig(plaintext: object): { encrypted: Buffer; iv: Buffer; tag: Buffer } {
  const iv = randomBytes(16); // 128-bit IV
  const cipher = createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);

  const plaintextBuffer = Buffer.from(JSON.stringify(plaintext), 'utf8');
  const encrypted = Buffer.concat([cipher.update(plaintextBuffer), cipher.final()]);
  const tag = cipher.getAuthTag(); // 128-bit authentication tag

  return { encrypted, iv, tag };
}

function decryptConfig(encrypted: Buffer, iv: Buffer, tag: Buffer): object {
  const decipher = createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return JSON.parse(decrypted.toString('utf8'));
}
```

**Storage in Prisma:**
- `configEncrypted`: `Bytes` — the AES-256-GCM ciphertext
- `configIv`: `Bytes` — the 16-byte initialization vector
- `configTag`: `Bytes` — the 16-byte GCM authentication tag

**Key Management:**
- `ENCRYPTION_KEY` is a 256-bit key stored as a hex string in environment variables
- Key rotation procedure: re-encrypt all configs with new key, deploy, then revoke old key
- Key is NEVER logged or included in error messages

### 3.2 Password Hashing

```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### 3.3 API Key Hashing

```typescript
import { createHash, randomBytes } from 'crypto';

function generateApiKey(): { key: string; hash: string; prefix: string } {
  const key = randomBytes(32).toString('base64url'); // 43 chars
  const hash = createHash('sha256').update(key).digest('hex');
  const prefix = key.slice(-4);
  return { key, hash, prefix };
}

function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}
```

---

## 4. SSE Event Definitions

### 4.1 Event Types and Schemas

#### Heartbeat

```typescript
interface HeartbeatEvent {
  id: string;          // UUID
  type: 'heartbeat';
  data: '{}';
}
// Sent every 30 seconds to keep the connection alive
```

#### Widget Update

```typescript
interface WidgetUpdateEvent {
  id: string;
  type: 'widget:update';
  data: JSON.stringify({
    widgetId: string;
    data: {
      labels: string[];
      series: { name: string; data: (number | null)[] }[];
    };
    timestamp: string; // ISO 8601
  });
}
// Sent when a sync completes and new data is available for a widget
```

#### Sync Status

```typescript
interface SyncStatusEvent {
  id: string;
  type: 'sync:status';
  data: JSON.stringify({
    dataSourceId: string;
    syncRunId: string;
    status: 'RUNNING' | 'COMPLETED' | 'FAILED';
    rowsSynced: number;
    rowsFailed: number;
    timestamp: string;
  });
}
// Sent on every sync state transition
```

#### Sync Error

```typescript
interface SyncErrorEvent {
  id: string;
  type: 'sync:error';
  data: JSON.stringify({
    dataSourceId: string;
    syncRunId: string;
    error: string;
    consecutiveFails: number;
    syncPaused: boolean;
    timestamp: string;
  });
}
// Sent when a sync fails
```

#### Cache Invalidated

```typescript
interface CacheInvalidatedEvent {
  id: string;
  type: 'cache:invalidated';
  data: JSON.stringify({
    widgetIds: string[];
    reason: 'sync_completed' | 'manual_refresh' | 'config_changed';
    timestamp: string;
  });
}
// Sent when cached widget data is evicted
```

### 4.2 SSE Endpoint Implementation

```typescript
// GET /api/sse/:dashboardId?key=:apiKey

@Sse('sse/:dashboardId')
async sseEndpoint(
  @Param('dashboardId') dashboardId: string,
  @Query('key') apiKey: string,
  @Req() request: Request,
): Observable<MessageEvent> {
  // 1. Authenticate via API key (same flow as embed)
  const tenant = await this.authService.validateEmbedKey(apiKey);

  // 2. Verify dashboard belongs to tenant and is published
  const dashboard = await this.dashboardService.findPublished(dashboardId, tenant.id);

  // 3. Verify origin
  const origin = request.headers.origin;
  this.embedService.validateOrigin(origin, dashboard.embedConfig.allowedOrigins);

  // 4. Check SSE connection limit
  await this.sseService.checkConnectionLimit(tenant.id, dashboardId);

  // 5. Subscribe to Redis channel
  const channel = `dashboard:${dashboardId}`;

  return new Observable(subscriber => {
    // Heartbeat interval
    const heartbeat = setInterval(() => {
      subscriber.next({
        id: randomUUID(),
        type: 'heartbeat',
        data: '{}',
      });
    }, 30_000);

    // Redis subscription
    const redisSubscriber = this.redis.duplicate();
    redisSubscriber.subscribe(channel);
    redisSubscriber.on('message', (ch, message) => {
      if (ch === channel) {
        const event = JSON.parse(message);
        subscriber.next({
          id: randomUUID(),
          type: event.type,
          data: JSON.stringify(event.payload),
        });
      }
    });

    // Cleanup on disconnect
    request.on('close', () => {
      clearInterval(heartbeat);
      redisSubscriber.unsubscribe(channel);
      redisSubscriber.quit();
      this.sseService.decrementConnection(tenant.id, dashboardId);
    });
  });
}
```

---

## 5. Email Templates

### 5.1 Welcome Email

| Field | Value |
|-------|-------|
| Trigger | Tenant registration (§PRD FR-026) |
| Subject | `Welcome to Analytics Engine — Verify your email` |
| From | `noreply@analyticsengine.dev` |

```
Hi {{tenantName}},

Welcome to Analytics Engine! We're excited to help you embed analytics into your product.

Please verify your email address by clicking the link below:

{{verificationUrl}}

This link expires in 24 hours.

Once verified, you can:
1. Connect your first data source
2. Build a dashboard
3. Generate an embed code

If you didn't create this account, please ignore this email.

— The Analytics Engine Team
```

### 5.2 Sync Failure Alert

| Field | Value |
|-------|-------|
| Trigger | Sync fails 3 consecutive times (§BRD BR-031) |
| Subject | `[Action Required] Sync paused for "{{dataSourceName}}"` |
| From | `alerts@analyticsengine.dev` |

```
Hi {{tenantName}},

The data source "{{dataSourceName}}" has failed to sync 3 consecutive times and has been automatically paused.

Last error:
{{errorMessage}}

Last 3 sync attempts:
{{#syncRuns}}
- {{startedAt}}: {{status}} — {{errorMessage}}
{{/syncRuns}}

To resume syncing:
1. Review the error details above
2. Check your data source configuration (connection credentials, endpoint URL, etc.)
3. Go to Settings → Data Sources → {{dataSourceName}} → Click "Resume Sync"

If you need help, reply to this email.

— The Analytics Engine Team
```

### 5.3 Usage Limit Warning

| Field | Value |
|-------|-------|
| Trigger | Tenant reaches 80% of any tier limit |
| Subject | `You're approaching your {{limitType}} limit` |
| From | `noreply@analyticsengine.dev` |

```
Hi {{tenantName}},

You've used {{currentUsage}} of your {{tierLimit}} {{limitType}} on the {{tierName}} plan.

Current usage:
- Dashboards: {{dashboardCount}} / {{dashboardLimit}}
- Data Sources: {{dataSourceCount}} / {{dataSourceLimit}}
- API Calls (this month): {{apiCallCount}} / {{apiCallLimit}}

To continue growing, consider upgrading to {{nextTierName}}:
{{upgradeUrl}}

— The Analytics Engine Team
```

### 5.4 Password Reset Email

| Field | Value |
|-------|-------|
| Trigger | POST /api/auth/forgot-password |
| Subject | `Reset your Analytics Engine password` |
| From | `noreply@analyticsengine.dev` |

```
Hi {{tenantName}},

We received a request to reset your password. Click the link below to set a new password:

{{resetUrl}}

This link expires in 1 hour.

If you didn't request a password reset, please ignore this email. Your password will remain unchanged.

— The Analytics Engine Team
```

### 5.5 Email Verification

| Field | Value |
|-------|-------|
| Trigger | Resend verification email |
| Subject | `Verify your Analytics Engine email` |
| From | `noreply@analyticsengine.dev` |

```
Hi {{tenantName}},

Please verify your email address by clicking the link below:

{{verificationUrl}}

This link expires in 24 hours.

— The Analytics Engine Team
```

---

## 6. Audit Actions

### 6.1 Audit Log Schema

Every state change in the system is recorded in the `audit_logs` table (§SRS-2):

```typescript
interface AuditLogEntry {
  tenantId: string;
  action: AuditAction;       // From enum (§SRS-2 §1.1)
  resourceType: string;      // "DataSource", "Dashboard", "Widget", etc.
  resourceId: string | null; // ID of affected resource
  metadata: object | null;   // Additional context
  ipAddress: string | null;  // From request
  userAgent: string | null;  // From request header
}
```

### 6.2 Audit Action Definitions

| Action | Resource Type | Metadata | When |
|--------|--------------|----------|------|
| `TENANT_CREATED` | Tenant | `{ tier: "FREE" }` | Registration |
| `TENANT_UPDATED` | Tenant | `{ changedFields: ["name", "email"] }` | Profile update |
| `TENANT_DELETED` | Tenant | `{ requestedAt, scheduledDeletionAt }` | Deletion request |
| `DATASOURCE_CREATED` | DataSource | `{ connectorType, syncSchedule }` | Create data source |
| `DATASOURCE_UPDATED` | DataSource | `{ changedFields: [...] }` | Update data source |
| `DATASOURCE_DELETED` | DataSource | `{ name, connectorType }` | Delete data source |
| `DATASOURCE_TEST_CONNECTION` | DataSource | `{ success: true/false, error?: string }` | Test connection |
| `DASHBOARD_CREATED` | Dashboard | `{ name }` | Create dashboard |
| `DASHBOARD_UPDATED` | Dashboard | `{ changedFields: [...] }` | Update dashboard |
| `DASHBOARD_PUBLISHED` | Dashboard | `{ widgetCount }` | Publish |
| `DASHBOARD_ARCHIVED` | Dashboard | `{}` | Archive |
| `DASHBOARD_REVERTED_TO_DRAFT` | Dashboard | `{ previousStatus }` | Revert to draft |
| `DASHBOARD_DELETED` | Dashboard | `{ name, status }` | Delete |
| `WIDGET_CREATED` | Widget | `{ type, dashboardId }` | Add widget |
| `WIDGET_UPDATED` | Widget | `{ changedFields: [...] }` | Update widget |
| `WIDGET_DELETED` | Widget | `{ type, dashboardId }` | Remove widget |
| `SYNC_STARTED` | SyncRun | `{ triggeredBy, dataSourceId }` | Sync begins |
| `SYNC_COMPLETED` | SyncRun | `{ rowsSynced, rowsFailed, duration }` | Sync succeeds |
| `SYNC_FAILED` | SyncRun | `{ error, consecutiveFails }` | Sync fails |
| `SYNC_PAUSED` | DataSource | `{ consecutiveFails: 3 }` | Auto-pause after 3 failures |
| `SYNC_RESUMED` | DataSource | `{}` | Manual resume |
| `EMBED_CONFIG_UPDATED` | EmbedConfig | `{ allowedOrigins, isEnabled }` | Update embed settings |
| `API_KEY_CREATED` | ApiKey | `{ type, name, keyPrefix }` | Generate key |
| `API_KEY_REVOKED` | ApiKey | `{ keyPrefix }` | Revoke key |
| `THEME_UPDATED` | Tenant | `{ changedFields: [...] }` | Update theme |
| `TIER_UPGRADED` | Tenant | `{ from: "FREE", to: "PRO" }` | Subscription upgrade |
| `TIER_DOWNGRADED` | Tenant | `{ from: "PRO", to: "FREE" }` | Subscription downgrade |
| `DATA_EXPORTED` | Tenant | `{ format: "JSON", sizeBytes }` | Data export |
| `ACCOUNT_DELETION_REQUESTED` | Tenant | `{ scheduledDeletionAt }` | Deletion request |

### 6.3 Audit Logging Implementation

```typescript
// NestJS interceptor that automatically logs audit events

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const auditMeta = this.reflector.get<AuditMetadata>('audit', context.getHandler());
    if (!auditMeta) return next.handle();

    const request = context.switchToHttp().getRequest();
    const tenantId = request.user?.sub;

    return next.handle().pipe(
      tap(async (response) => {
        await this.auditService.log({
          tenantId,
          action: auditMeta.action,
          resourceType: auditMeta.resourceType,
          resourceId: response?.data?.id ?? request.params.id,
          metadata: auditMeta.buildMetadata?.(request, response) ?? null,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
        });
      }),
    );
  }
}

// Usage via decorator:
@Audit({
  action: 'DASHBOARD_PUBLISHED',
  resourceType: 'Dashboard',
  buildMetadata: (req, res) => ({ widgetCount: res.data.widgets.length }),
})
@Post('dashboards/:id/publish')
async publishDashboard(@Param('id') id: string) { ... }
```

---

## 7. Rate Limiting

### 7.1 Rate Limiter Implementation

Rate limiting uses Redis sliding window counters (§BRD BR-010 through BR-014):

```typescript
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly redis: Redis,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.user?.sub ?? request.tenantId; // From JWT or API key
    const limitType = this.reflector.get<'admin' | 'embed' | 'webhook'>('rateLimit', context.getHandler());

    const tier = request.user?.tier ?? request.tenantTier;
    const limit = RATE_LIMITS[tier][limitType];
    const windowMs = limitType === 'webhook' ? 1000 : 60_000; // 1s for webhook, 60s for others

    const key = `ratelimit:${tenantId}:${limitType}`;
    const now = Date.now();

    // Sliding window using sorted set
    const pipeline = this.redis.pipeline();
    pipeline.zremrangebyscore(key, 0, now - windowMs); // Remove expired entries
    pipeline.zadd(key, now, `${now}:${Math.random()}`); // Add current request
    pipeline.zcard(key);                                  // Count requests in window
    pipeline.expire(key, Math.ceil(windowMs / 1000) + 1); // Set TTL

    const results = await pipeline.exec();
    const requestCount = results![2][1] as number;

    // Set rate limit headers
    const response = context.switchToHttp().getResponse();
    response.setHeader('X-RateLimit-Limit', limit);
    response.setHeader('X-RateLimit-Remaining', Math.max(0, limit - requestCount));
    response.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000));

    if (requestCount > limit) {
      throw new HttpException({
        error: {
          code: 'RATE_LIMITED',
          message: `Rate limit exceeded. Limit: ${limit} requests per ${windowMs / 1000} seconds.`,
          details: { limit, remaining: 0, resetAt: Math.ceil((now + windowMs) / 1000) },
        },
      }, 429);
    }

    return true;
  }
}
```

### 7.2 Rate Limit Configuration

```typescript
const RATE_LIMITS: Record<SubscriptionTier, Record<string, number>> = {
  FREE: {
    admin: 100,       // 100 req/min (§BRD BR-011)
    embed: 500,       // 500 req/min (§BRD BR-012)
    webhook: 10,      // 10 events/sec (§BRD BR-014)
  },
  PRO: {
    admin: 1_000,
    embed: 5_000,
    webhook: 100,
  },
  ENTERPRISE: {
    admin: 10_000,
    embed: 50_000,
    webhook: 1_000,
  },
};
```

---

## 8. OWASP Top 10 Compliance Checklist

| # | Vulnerability | Status | Implementation |
|---|--------------|--------|----------------|
| A01 | Broken Access Control | Addressed | RLS enforces tenant isolation at DB level (§SRS-2 §4). API guards verify JWT/API key on every request. Resource ownership checked before every mutation. |
| A02 | Cryptographic Failures | Addressed | Passwords hashed with bcrypt (12 rounds). Connection configs encrypted with AES-256-GCM (§3.1). API keys stored as SHA-256 hashes. TLS 1.2+ enforced for all connections (§BRD BR-041). |
| A03 | Injection | Addressed | Prisma parameterized queries prevent SQL injection. Zod validation on all inputs. JSON paths validated before evaluation. No raw SQL in application code (except RLS setup). |
| A04 | Insecure Design | Addressed | Threat modeling completed for embed system (origin validation, CSP, postMessage schema). Multi-tenant isolation is database-enforced, not application-enforced. |
| A05 | Security Misconfiguration | Addressed | Helmet.js for HTTP security headers. CORS restricted per tenant. CSP frame-ancestors configured per tenant. No default credentials. No debug endpoints in production. |
| A06 | Vulnerable Components | Addressed | `npm audit` in CI pipeline (§SRS-1 §4.1 Stage 1). Dependabot enabled. No components with known critical CVEs in production. |
| A07 | Identification & Auth Failures | Addressed | bcrypt with 12 rounds. JWT with 24h expiry. Email verification required. Rate limiting on auth endpoints (10 attempts/min). No credential exposure in error messages or logs. |
| A08 | Software & Data Integrity Failures | Addressed | Stripe webhook signature verification. Webhook HMAC validation for data sources. CI/CD pipeline integrity via signed commits. Dependencies pinned with lockfile. |
| A09 | Security Logging & Monitoring Failures | Addressed | Audit logging for all state changes (§6). Structured request logging with correlation IDs. Error tracking (§SRS-1 NFR-022). Failed auth attempts logged and rate-limited. |
| A10 | Server-Side Request Forgery (SSRF) | Addressed | REST API connector URLs validated against allowlist (no internal IPs: 10.x, 172.16.x, 192.168.x, 127.x, ::1). DNS resolution checked before connecting. PostgreSQL connector restricted to non-localhost hosts in production. |

---

## 9. SSRF Prevention Detail

```typescript
import { isIP } from 'net';
import { lookup } from 'dns/promises';

const BLOCKED_IP_RANGES = [
  /^127\./,           // Loopback
  /^10\./,            // Private Class A
  /^172\.(1[6-9]|2\d|3[01])\./, // Private Class B
  /^192\.168\./,      // Private Class C
  /^169\.254\./,      // Link-local
  /^0\./,             // Current network
  /^::1$/,            // IPv6 loopback
  /^fc00:/,           // IPv6 unique local
  /^fe80:/,           // IPv6 link-local
];

async function validateUrl(url: string): Promise<void> {
  const parsed = new URL(url);

  // Block non-HTTP(S) protocols
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP and HTTPS protocols are allowed');
  }

  // Resolve hostname to IP
  const hostname = parsed.hostname;
  let ip: string;

  if (isIP(hostname)) {
    ip = hostname;
  } else {
    const resolved = await lookup(hostname);
    ip = resolved.address;
  }

  // Check against blocked ranges
  for (const range of BLOCKED_IP_RANGES) {
    if (range.test(ip)) {
      throw new Error('Connection to internal network addresses is not allowed');
    }
  }
}
```

---

## 10. CORS Configuration

```typescript
// apps/api/src/main.ts

app.enableCors({
  origin: (origin, callback) => {
    // Admin portal: allow only the web app origin
    if (!origin || origin === process.env.WEB_APP_URL) {
      callback(null, true);
      return;
    }

    // Embed requests: origin validated per-tenant in the embed guard
    // CORS preflight is allowed; actual request validation happens in the guard
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Request-ID'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  maxAge: 86400, // 24 hours
});
```

---

## 11. Request Validation

### 11.1 NestJS Validation Pipe

```typescript
// Global validation pipe using Zod
app.useGlobalPipes(new ZodValidationPipe());

// Custom pipe that transforms Zod errors into consistent error responses
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata) {
    const schema = metadata.metatype?.schema; // Zod schema attached to DTO
    if (!schema) return value;

    const result = schema.safeParse(value);
    if (!result.success) {
      throw new HttpException({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: result.error.issues.map(issue => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        },
      }, 400);
    }

    return result.data;
  }
}
```

### 11.2 Input Sanitization

- All string inputs are trimmed
- HTML tags are stripped from user-provided text fields (name, description, title)
- SQL keywords are NOT stripped (Prisma handles parameterization)
- JSON fields (dimensions, metrics, config) are validated against typed Zod schemas

---

## 12. Stripe Webhook Security

```typescript
// POST /api/billing/webhook

@Post('billing/webhook')
async handleStripeWebhook(
  @Req() request: RawBodyRequest<Request>,
  @Headers('stripe-signature') signature: string,
) {
  // 1. Verify webhook signature
  const event = this.stripe.webhooks.constructEvent(
    request.rawBody!,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!,
  );

  // 2. Idempotency: check if event already processed
  const processed = await this.redis.sismember('stripe:processed', event.id);
  if (processed) return { received: true };

  // 3. Process event
  switch (event.type) {
    case 'checkout.session.completed':
      await this.billingService.handleCheckoutCompleted(event.data.object);
      break;
    case 'customer.subscription.updated':
      await this.billingService.handleSubscriptionUpdated(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await this.billingService.handleSubscriptionDeleted(event.data.object);
      break;
    case 'invoice.payment_failed':
      await this.billingService.handlePaymentFailed(event.data.object);
      break;
  }

  // 4. Mark as processed (TTL: 7 days)
  await this.redis.sadd('stripe:processed', event.id);
  await this.redis.expire('stripe:processed', 604800);

  return { received: true };
}
```

---

## 13. Security Headers (Helmet.js)

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: false, // Managed per-route for embed endpoints
  crossOriginEmbedderPolicy: false, // Allow embedding
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin resources for embed
  hsts: { maxAge: 31536000, includeSubDomains: true },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  frameguard: false, // Managed per-route (embed needs ALLOW-FROM)
}));
```

---

## 14. Document References

| Document | Section | Relationship |
|----------|---------|-------------|
| §PVD | Pillar 3 (Secure Multi-Tenant Isolation) | Security architecture implements this pillar |
| §BRD | Embed Security (BR-015 to BR-019) | Embed auth and CSP implement these rules |
| §BRD | Data Source Management (BR-020) | Config encryption implements this rule |
| §BRD | API Rate Limits (BR-010 to BR-014) | Rate limiter implements these rules |
| §BRD | Regulatory (BR-039 to BR-046) | Encryption, audit logging, and GDPR controls |
| §PRD | Auth (FR-026) | Registration, login, and password reset flows |
| §PRD | Embed (FR-021 to FR-023) | Embed security and postMessage API |
| §SRS-1 | Deployment | TLS, CORS, and security headers at infrastructure level |
| §SRS-2 | Data Model | ApiKey, AuditLog, and encrypted config models |
| §SRS-3 | Domain Logic | Connector decryption and sync security |
