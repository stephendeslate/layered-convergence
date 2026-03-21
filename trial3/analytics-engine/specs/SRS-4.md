# Software Requirements Specification — Part 4: Security & Infrastructure
# Analytics Engine

**Version:** 1.0 | **Date:** 2026-03-20

---

## 1. Authentication & Authorization [VERIFY:AUTH]

### 1.1 Admin API Authentication
- JWT Bearer token for tenant admin operations
- Token contains: tenantId, role
- Token validated via NestJS AuthGuard

### 1.2 Embed API Authentication
- API key in `X-API-Key` header
- API key maps to tenant → scopes all queries to that tenant
- No session/cookie auth for embed endpoints

### 1.3 Webhook Ingestion Authentication
- Webhook token in URL path (`/api/ingest/:webhookToken`)
- Token maps to specific DataSource → tenant
- Rate limited: 100 req/min per tenant

## 2. Tenant Data Isolation [VERIFY:RLS]

### 2.1 Application-Level (Primary)
- Every service method includes `tenantId` in WHERE clause
- `findFirstOrThrow` for single-record lookups → 404 on cross-tenant access
- `findMany` always filtered by tenantId

### 2.2 Database-Level (Defense-in-Depth)
- RLS policies on all tenant-scoped tables
- Policies use `current_setting('app.current_tenant_id')`
- **Note:** Prisma connects as DB owner → bypasses RLS
- RLS protects against direct SQL access, not Prisma queries

### 2.3 Tenant Isolation Tests (Required from C2) [VERIFY:TENANT_ISOLATION]
```typescript
// Minimum test: create resource as Tenant A, access as Tenant B → 404
it('should return 404 when accessing another tenant\'s dashboard', async () => {
  const response = await request(app.getHttpServer())
    .get(`/api/tenants/${tenantA.id}/dashboards/${tenantBDashboard.id}`)
    .set('Authorization', `Bearer ${tenantAToken}`)
    .expect(404);
});
```

## 3. Data Source Credential Security [VERIFY:ENCRYPTION]

### 3.1 Encryption at Rest
- DataSourceConfig.connectionConfig encrypted at application level
- AES-256-GCM encryption with key from environment variable
- Encrypted before Prisma write, decrypted after Prisma read
- Connection strings NEVER logged

### 3.2 Credential Access
- Only the pipeline execution service decrypts credentials
- API responses redact connection strings (show masked version)

## 4. Embed Security [VERIFY:EMBED_SECURITY]

### 4.1 Origin Validation
- EmbedConfig.allowedOrigins checked against request Origin header
- Empty allowedOrigins = allow all (development mode only)
- CSP `frame-ancestors` header set per embed request

### 4.2 CSP Headers
```
Content-Security-Policy: frame-ancestors 'self' https://allowed-origin.com;
X-Frame-Options: DENY (for non-embed routes)
```

### 4.3 postMessage Security
- Embed validates origin of incoming messages
- Only processes messages from allowedOrigins

## 5. Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| Webhook ingestion | 100 | 1 minute |
| Embed data | 60 | 1 minute |
| Admin API | 120 | 1 minute |
| SSE connections | 10 concurrent | per tenant |

## 6. Infrastructure

### 6.1 CI Pipeline [VERIFY:CI]
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint  # Real ESLint execution
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx prisma migrate deploy
      - run: npm run test  # Real test execution
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build  # Real build
```

### 6.2 ESLint Configuration [VERIFY:ESLINT]
```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "no-restricted-syntax": [
      "error",
      {
        "selector": "CallExpression[callee.property.name='$queryRawUnsafe']",
        "message": "$queryRawUnsafe is banned. Use $queryRaw with tagged template literals."
      }
    ]
  }
}
```

### 6.3 E2E Test Configuration [VERIFY:E2E_CONFIG]
```typescript
// vitest.e2e.config.ts
export default defineConfig({
  test: {
    fileParallelism: false,  // Shared DB — no parallel test files
    testTimeout: 30000,      // E2E with real DB is slower
    include: ['test/**/*.e2e-spec.ts'],
  },
});
```

## 7. Prisma Exception Filter

```typescript
// Maps Prisma NotFoundError to HTTP 404
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    if (exception.code === 'P2025') {
      // findFirstOrThrow / findUniqueOrThrow not found
      return response.status(404).json({
        statusCode: 404,
        message: 'Resource not found',
        error: 'Not Found',
      });
    }
    // Other Prisma errors → 500
  }
}
```
