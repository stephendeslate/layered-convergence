# Software Requirements Specification — Part 4: Security & Infrastructure
# Escrow Marketplace

**Version:** 1.0 | **Date:** 2026-03-20

---

## 1. Authentication & Authorization [VERIFY:AUTH]

### 1.1 JWT Authentication
- Email/password registration and login
- JWT Bearer token with userId, role, email
- Token expiry: 24 hours
- AuthGuard on all protected routes

### 1.2 Role-Based Access Control
| Role | Permissions |
|------|------------|
| BUYER | Create transactions, view own transactions, release funds, raise disputes |
| PROVIDER | View incoming transactions, payouts, onboarding, submit dispute evidence |
| ADMIN | All operations, dispute resolution, analytics, webhook logs |

### 1.3 Resource Ownership
- Buyers can only access their own transactions
- Providers can only access transactions where they are the provider
- Admins can access all transactions
- `findFirstOrThrow` with userId/role scope → 404 on unauthorized access

## 2. User Data Isolation [VERIFY:TENANT_ISOLATION]

### 2.1 Application-Level (Primary)
- Every service method scopes queries by userId and role
- `findFirstOrThrow` for single-record lookups → 404 on cross-user access
- Transaction queries: `WHERE buyerId = :userId OR providerId = :userId`
- Payout queries: `WHERE providerId = :userId`

### 2.2 Database-Level (Defense-in-Depth)
- RLS policies on all user-scoped tables
- **Note:** Prisma connects as DB owner → bypasses RLS

### 2.3 Tenant Isolation Tests (Required from C2)
```typescript
it('should return 404 when buyer accesses another buyer\'s transaction', async () => {
  await request(app.getHttpServer())
    .get(`/api/transactions/${otherBuyerTransaction.id}`)
    .set('Authorization', `Bearer ${buyerAToken}`)
    .expect(404);
});
```

## 3. Stripe Security [VERIFY:STRIPE_SECURITY]

### 3.1 Webhook Verification
- All Stripe webhooks verified with signing secret
- `stripe.webhooks.constructEvent(body, sig, secret)`
- Raw body required (not parsed JSON)

### 3.2 Idempotency [VERIFY:WEBHOOK_IDEMPOTENCY]
- WebhookLog stores Stripe event ID
- Duplicate events: return 200, skip processing
- Prevents double-processing of retried webhooks

### 3.3 Test Mode Only [VERIFY:STRIPE_TEST_MODE]
- All Stripe operations use test API keys
- `sk_test_` and `pk_test_` prefixes only
- Demo banner on all UI pages
- No live keys in codebase or environment

## 4. State Machine Security [VERIFY:STATE_MACHINE]

### 4.1 Transition Validation
- Only valid transitions accepted (see SRS-3)
- Invalid transitions throw BadRequestException
- State machine defined in packages/shared (single source of truth)
- Imported by API service — no duplicate definitions

### 4.2 Authorization per Transition
| Transition | Authorized Role |
|-----------|----------------|
| CREATED → PAYMENT_PENDING | System (payment creation) |
| HELD → RELEASED | BUYER (confirms delivery) |
| HELD → DISPUTED | BUYER (raises dispute) |
| HELD → EXPIRED | System (auto-release timer) |
| DISPUTED → RESOLVED_* | ADMIN only |

## 5. Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| Auth endpoints | 10 | 1 minute |
| Transaction creation | 20 | 1 minute |
| Stripe webhooks | 100 | 1 minute |
| General API | 120 | 1 minute |

## 6. Infrastructure

### 6.1 CI Pipeline [VERIFY:CI]
```yaml
name: CI
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx prisma migrate deploy
      - run: npm run test
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
```

### 6.2 ESLint Configuration [VERIFY:ESLINT]
- `@typescript-eslint/no-explicit-any: "error"`
- `$queryRawUnsafe` banned via no-restricted-syntax

### 6.3 E2E Test Configuration [VERIFY:E2E_CONFIG]
- `fileParallelism: false` in vitest.e2e.config.ts
- `testTimeout: 30000`
- E2E tests use real PostgreSQL (no mocked Prisma)

## 7. Prisma Exception Filter
- Maps P2025 (NotFoundError) to HTTP 404
- Maps P2002 (UniqueConstraintViolation) to HTTP 409
- Other Prisma errors → 500
