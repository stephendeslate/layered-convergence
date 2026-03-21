# System Requirements Specification — Security & Compliance (SRS-4)
# Marketplace Payment Hold & Conditional Release Platform

**Version:** 1.0
**Date:** 2026-03-20
**Status:** Approved

---

## 1. Security Architecture Overview

### 1.1 Defense-in-Depth Layers

```
Layer 1: Network (CORS, HTTPS, rate limiting)
Layer 2: Authentication (JWT validation)
Layer 3: Authorization (Role-based access)
Layer 4: Database (Row-Level Security)
Layer 5: Application (Input validation, state machine)
Layer 6: External (Stripe signature verification)
```

### 1.2 Trust Boundaries

```
┌──────────────────────────────────────────┐
│ Trusted Zone (Server)                    │
│                                          │
│  NestJS API ──→ PostgreSQL (RLS)        │
│       │                                  │
│       ├──→ Redis (BullMQ)               │
│       │                                  │
│       └──→ Stripe API (TLS)            │
│                                          │
└──────────────────────────────────────────┘
         ▲                    ▲
         │ HTTPS              │ HTTPS + Signature
         │                    │
    ┌────┴────┐         ┌────┴────┐
    │ Browser │         │ Stripe  │
    │ (Client)│         │Webhooks │
    └─────────┘         └─────────┘
```

---

## 2. Row-Level Security (RLS)

### 2.1 RLS Strategy

RLS is implemented as defense-in-depth. The application layer performs its own
authorization checks (guards, ownership validation), but RLS provides a
database-level safety net ensuring data isolation even if application logic
has bugs.

[VERIFY:migration] All tenant-scoped tables have RLS enabled
[VERIFY:migration] CREATE POLICY exists for: transactions, disputes, payouts,
  transaction_state_history, stripe_connected_accounts

### 2.2 RLS Implementation

#### Session Variable Setup

Before each database query, the application sets PostgreSQL session variables:

```sql
SET LOCAL app.current_user_id = '<user-uuid>';
SET LOCAL app.current_user_role = '<BUYER|PROVIDER|ADMIN>';
```

[VERIFY:grep] PrismaService sets session variables before queries

#### Policy: Transactions

```sql
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY transactions_isolation_policy ON transactions
  FOR ALL
  USING (
    current_setting('app.current_user_role', true) = 'ADMIN'
    OR buyer_id = current_setting('app.current_user_id', true)::uuid
    OR provider_id = current_setting('app.current_user_id', true)::uuid
  );
```

[VERIFY:migration] Policy exists in migration file
[VERIFY:test] Buyer A cannot read Buyer B's transactions

#### Policy: Disputes

```sql
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY disputes_isolation_policy ON disputes
  FOR ALL
  USING (
    current_setting('app.current_user_role', true) = 'ADMIN'
    OR raised_by_id = current_setting('app.current_user_id', true)::uuid
    OR transaction_id IN (
      SELECT id FROM transactions
      WHERE buyer_id = current_setting('app.current_user_id', true)::uuid
         OR provider_id = current_setting('app.current_user_id', true)::uuid
    )
  );
```

[VERIFY:migration] Policy exists in migration file

#### Policy: Payouts

```sql
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY payouts_isolation_policy ON payouts
  FOR ALL
  USING (
    current_setting('app.current_user_role', true) = 'ADMIN'
    OR provider_id = current_setting('app.current_user_id', true)::uuid
  );
```

[VERIFY:migration] Policy exists in migration file

#### Policy: Transaction State History

```sql
ALTER TABLE transaction_state_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY state_history_isolation_policy ON transaction_state_history
  FOR ALL
  USING (
    current_setting('app.current_user_role', true) = 'ADMIN'
    OR transaction_id IN (
      SELECT id FROM transactions
      WHERE buyer_id = current_setting('app.current_user_id', true)::uuid
         OR provider_id = current_setting('app.current_user_id', true)::uuid
    )
  );
```

[VERIFY:migration] Policy exists in migration file

#### Policy: Connected Accounts

```sql
ALTER TABLE stripe_connected_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY connected_accounts_isolation_policy ON stripe_connected_accounts
  FOR ALL
  USING (
    current_setting('app.current_user_role', true) = 'ADMIN'
    OR user_id = current_setting('app.current_user_id', true)::uuid
  );
```

[VERIFY:migration] Policy exists in migration file

### 2.3 RLS Bypass for Migrations and Seeding

The database superuser (used for migrations and seeding) bypasses RLS policies.
Application connections use a non-superuser role with RLS enforced.

[VERIFY:runtime] Application database user is not a superuser

---

## 3. Webhook Signature Verification

### 3.1 Implementation

Webhook signature verification uses Stripe's official SDK method:

```typescript
const event = stripe.webhooks.constructEvent(
  rawBody,         // Raw request body (Buffer)
  signature,       // stripe-signature header
  webhookSecret,   // STRIPE_WEBHOOK_SECRET env var
);
```

[VERIFY:grep] `constructEvent` is used in webhook controller
[VERIFY:grep] No webhook processing occurs without signature verification
[VERIFY:test] Invalid signature returns 400

### 3.2 Raw Body Handling

NestJS must be configured to provide the raw request body for webhook
signature verification. Standard JSON parsing destroys the raw bytes needed
for signature verification.

```typescript
// main.ts — enable raw body for webhooks
app.useBodyParser('raw', {
  type: 'application/json',
  limit: '10mb',
});
```

Or use a custom middleware that preserves the raw body:

```typescript
// Use rawBody option in NestFactory.create
const app = await NestFactory.create(AppModule, {
  rawBody: true,
});
```

[VERIFY:grep] Raw body is accessible in webhook controller
[VERIFY:test] Webhook signature verification works with raw body

### 3.3 Webhook Secret Management

- `STRIPE_WEBHOOK_SECRET` stored as environment variable
- Never logged or exposed in error messages
- Different secrets for development and production
- Stripe CLI generates a local webhook secret for development

[VERIFY:grep] STRIPE_WEBHOOK_SECRET is not logged

---

## 4. Stripe Key Management

### 4.1 Key Validation

The application validates Stripe keys at startup:

```typescript
if (process.env.NODE_ENV === 'production') {
  if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_')) {
    throw new Error(
      'CRITICAL: Live Stripe keys detected. This is a demo application. '
      + 'Use test mode keys only (sk_test_...).'
    );
  }
}

// Always validate key format
if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
  console.warn(
    'WARNING: Stripe secret key does not start with sk_test_. '
    + 'This demo application should only use test mode keys.'
  );
}
```

[VERIFY:grep] Stripe key validation exists in application startup
[VERIFY:test] Application warns/errors on non-test Stripe keys

### 4.2 Key Storage

| Key | Storage | Exposure |
|-----|---------|----------|
| STRIPE_SECRET_KEY | Environment variable | Server-side only |
| STRIPE_PUBLISHABLE_KEY | Environment variable | Client-side (public) |
| STRIPE_WEBHOOK_SECRET | Environment variable | Server-side only |

[VERIFY:grep] STRIPE_SECRET_KEY is never sent to client
[VERIFY:grep] No Stripe secret key in frontend code

---

## 5. Authentication Security

### 5.1 JWT Configuration

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Algorithm | HS256 | Sufficient for single-service architecture |
| Access token expiry | 15 minutes | Limits exposure window |
| Refresh token expiry | 7 days | Balance between security and UX |
| Secret length | 256 bits minimum | Prevents brute force |
| Payload | sub, email, role | Minimal claims |

[VERIFY:grep] JWT expiry is configured (not infinite)
[VERIFY:grep] JWT secret is loaded from environment variable

### 5.2 Password Hashing

| Parameter | Value |
|-----------|-------|
| Algorithm | bcrypt |
| Salt rounds | 12 |
| Minimum length | 8 characters |

[VERIFY:grep] bcrypt is used for password hashing
[VERIFY:grep] Salt rounds >= 10

### 5.3 Token Refresh Flow

```
1. Client sends refresh token
2. Server validates refresh token signature and expiry
3. Server verifies user still exists and is active
4. Server generates new access + refresh token pair
5. Old refresh token is invalidated (rotation)
```

[VERIFY:test] Expired tokens return 401
[VERIFY:test] Invalid tokens return 401

---

## 6. Rate Limiting

### 6.1 Rate Limit Configuration

| Route Group | Limit | Window | Rationale |
|-------------|-------|--------|-----------|
| Auth (login/register) | 10 requests | 60 seconds | Prevent brute force |
| Payment creation | 30 requests | 60 seconds | Prevent payment spam |
| General API | 100 requests | 60 seconds | General protection |
| Webhooks | No limit | — | Stripe must not be rate-limited |

### 6.2 Implementation

Rate limiting uses `@nestjs/throttler`:

```typescript
// app.module.ts — MUST be registered globally
ThrottlerModule.forRoot([{
  ttl: 60000,    // 60 seconds
  limit: 100,    // 100 requests per window
}]),
```

Route-specific overrides:
```typescript
// auth.controller.ts
@Throttle({ default: { ttl: 60000, limit: 10 } })
@Post('login')
async login() { ... }

// transactions.controller.ts
@Throttle({ default: { ttl: 60000, limit: 30 } })
@Post()
async create() { ... }
```

[VERIFY:grep] ThrottlerModule is registered in AppModule
[VERIFY:grep] @Throttle or @UseGuards(ThrottlerGuard) appears on auth routes
[VERIFY:grep] @Throttle or @UseGuards(ThrottlerGuard) appears on payment routes
[VERIFY:test] Rate-limited endpoint returns 429 after exceeding limit

### 6.3 Rate Limit Headers

Responses include rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1679000000
```

---

## 7. CORS Configuration

### 7.1 CORS Policy

```typescript
app.enableCors({
  origin: process.env.CORS_ORIGINS?.split(',') ?? ['http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,  // 24 hours preflight cache
});
```

[VERIFY:grep] CORS is configured with environment-based origins
[VERIFY:grep] CORS origin is not set to '*' in production code

### 7.2 CORS Rules

- Origins are configured via `CORS_ORIGINS` environment variable
- Comma-separated list for multiple origins
- Default: `http://localhost:3001` (development frontend)
- Credentials are enabled for cookie-based auth
- Wildcard (`*`) is NEVER used

---

## 8. PCI Compliance Approach

### 8.1 SAQ-A Eligibility

The platform qualifies for SAQ-A (simplest PCI compliance level) because:

1. **No card data storage** — Stripe.js tokenizes card data client-side
2. **No card data processing** — Server only handles PaymentIntent IDs
3. **No card data transmission** — Card numbers never reach our servers
4. **Stripe Elements** — PCI-compliant card input component

[VERIFY:grep] No raw card number fields in frontend code
[VERIFY:grep] No card number storage in database schema

### 8.2 Stripe.js Integration

```typescript
// Frontend — card collection
const { error } = await stripe.confirmPayment({
  elements,           // Stripe Elements (PCI-compliant UI)
  clientSecret,       // From server
  confirmParams: {
    return_url: `${APP_URL}/transactions/{id}/confirm`,
  },
});
```

The server creates a PaymentIntent and returns the `client_secret`.
The client uses Stripe.js to confirm the payment using the Elements UI.
No card data passes through the platform's servers.

---

## 9. Input Validation

### 9.1 DTO Validation Strategy

All API endpoints use `class-validator` decorators on DTOs:

```typescript
// Example: CreateTransactionDto
export class CreateTransactionDto {
  @IsUUID()
  providerId: string;

  @IsInt()
  @Min(100)
  amount: number;

  @IsString()
  @MinLength(3)
  @MaxLength(500)
  description: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(90)
  holdPeriodDays?: number;
}
```

[VERIFY:grep] All DTO classes have class-validator decorators
[VERIFY:grep] ValidationPipe is enabled globally
[VERIFY:test] Invalid input returns 400

### 9.2 Global Validation Pipe

```typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,          // Strip unknown properties
    forbidNonWhitelisted: true,  // Reject unknown properties
    transform: true,          // Transform to DTO types
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

[VERIFY:grep] ValidationPipe is configured with whitelist: true
[VERIFY:grep] forbidNonWhitelisted is true

### 9.3 SQL Injection Prevention

- **Prisma ORM** — All queries are parameterized by default
- **$queryRaw** — Used with tagged template literals (safe)
- **$queryRawUnsafe** — BANNED via ESLint rule

[VERIFY:grep] No usage of $queryRawUnsafe in codebase
[VERIFY:ci] ESLint rule bans $queryRawUnsafe

---

## 10. Error Handling Security

### 10.1 Error Response Sanitization

- Production errors do NOT expose stack traces
- Database errors are mapped to generic messages
- Stripe errors are sanitized (no API keys in messages)
- Internal server errors return generic "Internal Server Error"

```typescript
// http-exception.filter.ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = 500;
    let message = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();
      message = typeof responseBody === 'string'
        ? responseBody
        : (responseBody as any).message;
    }

    // Never expose internal details in production
    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

[VERIFY:grep] Exception filter exists
[VERIFY:test] Internal errors don't expose stack traces

### 10.2 Logging Security

- Stripe secret keys are never logged
- User passwords are never logged
- Request bodies are logged at DEBUG level only
- Webhook payloads are logged but sensitive fields are redacted

[VERIFY:grep] No console.log of Stripe keys
[VERIFY:grep] No logging of password fields

---

## 11. Data Protection

### 11.1 Sensitive Data Handling

| Data | Storage | Protection |
|------|---------|------------|
| Passwords | PostgreSQL | bcrypt hash (never plaintext) |
| Card numbers | Never stored | Stripe.js tokenization |
| Stripe account IDs | PostgreSQL | Not sensitive (Stripe-managed) |
| Transaction amounts | PostgreSQL | Integer (cents), encrypted at rest |
| Webhook payloads | PostgreSQL | RLS-protected |
| JWT secrets | Environment | Never in code or logs |

[VERIFY:grep] Password is never stored in plaintext
[VERIFY:grep] No credit card fields in database schema

### 11.2 Data Retention

- Webhook logs: Retained for 90 days (configurable)
- Transaction history: Retained indefinitely (audit requirement)
- User data: Retained until account deletion
- Stripe data: Managed by Stripe (separate retention policy)

---

## 12. API Security Headers

### 12.1 Security Headers

```typescript
// Applied via Helmet middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://js.stripe.com"],
      frameSrc: ["https://js.stripe.com", "https://hooks.stripe.com"],
      connectSrc: ["'self'", "https://api.stripe.com"],
    },
  },
  crossOriginEmbedderPolicy: false,  // Required for Stripe.js
}));
```

[VERIFY:grep] Helmet or security headers are configured

### 12.2 Headers Applied

| Header | Value | Purpose |
|--------|-------|---------|
| X-Content-Type-Options | nosniff | Prevent MIME sniffing |
| X-Frame-Options | DENY | Prevent clickjacking |
| X-XSS-Protection | 0 | Modern browsers handle XSS |
| Strict-Transport-Security | max-age=31536000 | Enforce HTTPS |
| Content-Security-Policy | See above | Restrict resource loading |

---

## 13. Dependency Security

### 13.1 Package Security

- Use `npm audit` in CI pipeline
- Pin major versions in package.json
- Regular dependency updates
- No known vulnerable packages at build time

[VERIFY:ci] npm audit runs in CI

### 13.2 Banned Patterns

| Pattern | Reason | ESLint Rule |
|---------|--------|------------|
| `$queryRawUnsafe` | SQL injection risk | `no-restricted-properties` |
| `as any` | Type safety escape | `@typescript-eslint/no-explicit-any` (warn) |
| `eval()` | Code injection | `no-eval` |
| `dangerouslySetInnerHTML` | XSS risk | React default warning |

[VERIFY:ci] ESLint bans $queryRawUnsafe
[VERIFY:ci] ESLint warns on `as any`

---

## 14. Operational Security

### 14.1 Environment Isolation

| Environment | Stripe Keys | Database | Purpose |
|-------------|-------------|----------|---------|
| Development | sk_test_... | Local PostgreSQL | Developer testing |
| CI/Test | sk_test_... | CI PostgreSQL | Automated testing |
| Production | sk_test_... (DEMO!) | Railway PostgreSQL | Demo deployment |

Note: This is a demo application. Even "production" uses test-mode Stripe keys.

[VERIFY:runtime] Production Stripe keys start with sk_test_

### 14.2 Secret Management

| Secret | Storage Location | Access |
|--------|-----------------|--------|
| JWT_SECRET | Environment variable | API server only |
| JWT_REFRESH_SECRET | Environment variable | API server only |
| STRIPE_SECRET_KEY | Environment variable | API server only |
| STRIPE_WEBHOOK_SECRET | Environment variable | API server only |
| DATABASE_URL | Environment variable | API server only |
| REDIS_URL | Environment variable | API server only |

[VERIFY:grep] No hardcoded secrets in source code

---

## 15. Security Verification Matrix

### 15.1 Verification Tags Summary

| Claim | Tag | How to Verify |
|-------|-----|---------------|
| RLS on all tenant tables | [VERIFY:migration] | grep CREATE POLICY in migrations |
| Webhook sig verification | [VERIFY:grep] | grep constructEvent in webhook controller |
| Rate limiting wired up | [VERIFY:grep] | grep ThrottlerModule in app.module |
| Rate limiting on routes | [VERIFY:grep] | grep @Throttle in controllers |
| No $queryRawUnsafe | [VERIFY:grep] | grep queryRawUnsafe returns 0 results |
| JWT configured | [VERIFY:grep] | grep JWT_SECRET usage |
| CORS configured | [VERIFY:grep] | grep enableCors in main.ts |
| Validation pipe global | [VERIFY:grep] | grep ValidationPipe in main.ts |
| Password hashing | [VERIFY:grep] | grep bcrypt in auth service |
| No hardcoded secrets | [VERIFY:grep] | grep for key patterns |
| Demo banner | [VERIFY:grep] | grep "Demo application" in frontend |
| Test mode only | [VERIFY:grep] | grep sk_test_ validation |
| ESLint bans unsafe | [VERIFY:ci] | ESLint config has rule |
| Smoke tests pass | [VERIFY:test] | CI runs tests |
| User isolation | [VERIFY:test] | E2E test for cross-user access |
| Invalid webhook sig | [VERIFY:test] | Test returns 400 |
| Rate limit 429 | [VERIFY:test] | Test hits rate limit |
| Auth required | [VERIFY:test] | Test unauthenticated request |
| Invalid input 400 | [VERIFY:test] | Test invalid DTO |

### 15.2 Security Audit Checklist

Pre-deployment security audit should verify:

- [ ] All [VERIFY:migration] tags confirmed
- [ ] All [VERIFY:grep] tags confirmed with evidence
- [ ] All [VERIFY:test] tags confirmed with passing tests
- [ ] All [VERIFY:ci] tags confirmed in CI pipeline
- [ ] All [VERIFY:runtime] tags documented for runtime checks
- [ ] No known vulnerabilities in npm audit
- [ ] Demo banner visible on all pages
- [ ] Stripe test mode keys confirmed
- [ ] CORS restricted to allowed origins
- [ ] Rate limiting active on critical routes

---

## 16. Threat Model

### 16.1 Identified Threats

| Threat | Severity | Mitigation |
|--------|----------|------------|
| SQL injection | Critical | Prisma ORM (parameterized), ban $queryRawUnsafe |
| XSS | High | React escaping, CSP headers, no dangerouslySetInnerHTML |
| CSRF | Medium | SameSite cookies, CORS restrictions |
| Brute force auth | Medium | Rate limiting on auth endpoints |
| Webhook forgery | Critical | Stripe signature verification |
| Data leakage (cross-tenant) | Critical | RLS + application-level authorization |
| JWT theft | High | Short expiry (15min), httpOnly cookies |
| Stripe key exposure | Critical | Environment variables, never in client |
| Payment manipulation | Critical | Server-side amount calculation, Stripe validation |
| Dispute abuse | Medium | Rate limiting, admin review requirement |

### 16.2 Accepted Risks (Demo)

| Risk | Acceptance Reason |
|------|-------------------|
| No HTTPS in local dev | Development convenience |
| localStorage for tokens | Demo simplicity (httpOnly cookies better) |
| No account lockout | Demo scope limitation |
| No 2FA | Demo scope limitation |
| No audit log encryption | Demo scope limitation |
