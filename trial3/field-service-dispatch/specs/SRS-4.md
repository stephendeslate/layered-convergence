# Software Requirements Specification — Part 4: Security & Infrastructure
# Field Service Dispatch

**Version:** 1.0 | **Date:** 2026-03-20

---

## 1. Authentication & Authorization [VERIFY:AUTH]

### 1.1 JWT Authentication
- Email/password registration and login
- JWT Bearer token with userId, companyId, role
- Token expiry: 24 hours
- AuthGuard on all protected routes

### 1.2 Role-Based Access Control
| Role | Permissions |
|------|------------|
| ADMIN | All company-scoped operations |
| DISPATCHER | Work orders, technicians, routes, analytics |
| TECHNICIAN | Own work orders, status updates, GPS, photos |

### 1.3 Customer Portal Access
- No authentication required
- Access via tracking token in URL
- Token scoped to single work order
- No access to other work orders or company data

### 1.4 WebSocket Authentication
- Socket.io connection includes JWT in auth header
- Gateway validates JWT before allowing connection
- Technicians join company room on connect
- Customers join tracking room via tracking token

## 2. Company Data Isolation [VERIFY:TENANT_ISOLATION]

### 2.1 Application-Level (Primary)
- Every service method includes `companyId` in WHERE clause
- `findFirstOrThrow` for single-record lookups → 404 on cross-company access
- `findMany` always filtered by companyId
- companyId extracted from JWT, never from request body

### 2.2 Database-Level (Defense-in-Depth)
- RLS policies on all company-scoped tables
- **Note:** Prisma connects as DB owner → bypasses RLS

### 2.3 Tenant Isolation Tests (Required from C2)
```typescript
it('should return 404 when accessing another company\'s work order', async () => {
  await request(app.getHttpServer())
    .get(`/api/work-orders/${companyBWorkOrderId}`)
    .set('Authorization', `Bearer ${companyAToken}`)
    .expect(404);
});

it('should return 404 when accessing another company\'s technician', async () => {
  await request(app.getHttpServer())
    .get(`/api/technicians/${companyBTechnicianId}`)
    .set('Authorization', `Bearer ${companyAToken}`)
    .expect(404);
});
```

## 3. Route Ordering [VERIFY:ROUTE_ORDERING]

### 3.1 Convention
In all NestJS controllers, define routes in this order:
1. Static routes (`/stats`, `/available`)
2. Static-prefix routes (`/tracking/:token`)
3. Parameterized routes (`/:id`)

### 3.2 Verification
```bash
grep -n '@Get\|@Post\|@Patch\|@Delete' apps/api/src/**/*.controller.ts
```
Review output to ensure no parameterized route appears before a static route in the same controller.

## 4. Map Security [VERIFY:NO_GOOGLE_MAPS]

### 4.1 No Google Maps
- ZERO references to Google Maps API in codebase
- All map functionality uses Leaflet + OpenStreetMap
- OpenRouteService for routing (not Google Directions)

### 4.2 Verification
```bash
grep -ri 'google.maps\|googleapis.com/maps\|@googlemaps' . --include='*.ts' --include='*.tsx' | wc -l
# Must be 0
```

## 5. Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| Auth endpoints | 10 | 1 minute |
| GPS updates | 60 | 1 minute (per technician) |
| Work order CRUD | 60 | 1 minute |
| Route optimization | 10 | 1 minute |
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
        image: postgis/postgis:16-3.4
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
- E2E tests use real PostgreSQL + PostGIS
- No mocked Prisma in E2E files

## 7. Prisma Exception Filter
- Maps P2025 (NotFoundError) to HTTP 404
- Maps P2002 (UniqueConstraintViolation) to HTTP 409
- Other Prisma errors → 500

## 8. PostGIS Setup
- Use Railway PostGIS template (not default PostgreSQL)
- `CREATE EXTENSION postgis` in migration
- Geospatial queries for nearest technician calculation
