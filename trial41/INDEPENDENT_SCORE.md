# Trial 41 -- Independent Scoring

Scorer: Claude Opus 4.6 (independent, no builder scores seen)
Date: 2026-03-21

---

## Project: Analytics Engine (AE)

| Dim | Score | Evidence/Issues |
|-----|-------|-----------------|
| SV | 9 | 8 spec docs (7 req), SPEC-INDEX 73 lines (>= 55), all specs >= 55 lines (min 64, max 136). 67 VERIFY tags (>= 35), correct AE- prefix, 100% VERIFY<->TRACED parity (67/67), TRACED only in .ts/.tsx. Cross-refs in all 7 non-index specs (api-contracts->data-model, architecture->security, authentication->security, data-model->api-contracts, monitoring->architecture, performance->monitoring, security->authentication). |
| TA-U | 9 | 3 unit test files: auth.service.spec.ts, dashboards.service.spec.ts, events.service.spec.ts. All have real assertions with mocked Prisma. |
| TA-I | 9 | 2 integration test files: auth.integration.spec.ts and events.integration.spec.ts. Both import AppModule and use supertest with real HTTP assertions. |
| CD | 8 | No `as any`, no `console.log` in api/src. All 6 models + 4 enums have @@map with @map on enum values. Decimal @db.Decimal(12,2) for cost fields. cn() uses clsx+tailwind-merge. BCRYPT_SALT_ROUNDS imported from shared in seed. DTOs have @IsString()+@MaxLength() on strings, @MaxLength(UUID_MAX_LENGTH) on UUIDs. @IsIn(ALLOWED_REGISTRATION_ROLES) from shared. Minor gap: web app has only 2 source files importing from shared (actions.ts, error-logging.ts) -- needs >= 3. |
| FC | 9 | Full CRUD on all 4 domain controllers (dashboards, data-sources, events, pipelines): Post, Get, Get/:id, Put/:id, Delete/:id. Auth register+login+profile present. |
| CQ | 9 | Clean code. GlobalExceptionFilter as APP_FILTER in AppModule. PinoLoggerService injectable via DI (@Injectable). findFirst justified with comments throughout. No dead code. JwtAuthGuard via per-controller @UseGuards (valid approach). |
| DA | 9 | @@map on all models/enums. RLS (ENABLE+FORCE) on all tables in migration. 16 @@index entries covering tenant FKs, status, composites. Seed has error/failure states (FAILED event, ERROR pipeline), console.error+process.exit(1), $disconnect. |
| UI | 9 | 8 shadcn/ui components (alert, badge, button, card, input, label, skeleton, table). Dark mode via @media prefers-color-scheme. loading.tsx in all 6 routes with role="status"+aria-busy="true". error.tsx in all 6 routes with role="alert"+useRef+focus. Server Actions with 'use server'+response.ok. Nav in layout.tsx. |
| AX | 9 | jest-axe tests importing real components (Button, Card, Input, Label, Alert, Badge, Table). Keyboard tests with userEvent (tab, enter, focus). Solid coverage across 7 component types. |
| ST | 10 | 67 VERIFY in specs/*.md only, 67 TRACED in .ts/.tsx only. 100% parity both directions. Correct AE- prefix throughout. No TRACED in non-ts files. |
| II | 8 | Multi-stage Dockerfile (node:20-alpine, deps->build->production, USER node, HEALTHCHECK /health, LABEL maintainer, COPY turbo.json). CI has lint+typecheck+test+build+audit (pnpm turbo run). docker-compose with PG16+healthcheck+named volume. docker-compose.test.yml. .env.example with connection_limit. Turbo in root devDeps. Helmet+CSP (default-src self). ThrottlerModule 100/60 global, 5/60 auth via @Throttle. CORS from env (no fallback, credentials true, explicit methods). Env validation at startup (main.ts checks DATABASE_URL, JWT_SECRET, CORS_ORIGIN). Minor: web app only 2 files importing from shared (needs >= 3). |
| PF | 9 | ResponseTimeInterceptor as APP_INTERCEPTOR in AppModule using performance.now() from perf_hooks, setting X-Response-Time. normalizePageParams with MAX_PAGE_SIZE clamping. 16 @@index on tenant FKs+status+composites. include/select in services (26 usages). next/dynamic in page.tsx. Cache-Control on all 4 list endpoints. connection_limit in DATABASE_URL. performance.spec.ts with supertest+AppModule. |

**AE Total: 109/120**

---

## Project: Escrow Marketplace (EM)

| Dim | Score | Evidence/Issues |
|-----|-------|-----------------|
| SV | 9 | 8 spec docs (7 req), SPEC-INDEX 68 lines (>= 55), all specs >= 55 lines (min 68, max 107). 59 VERIFY tags (>= 35), correct EM- prefix, 100% VERIFY<->TRACED parity (59/59), TRACED only in .ts/.tsx. Excellent cross-refs in all 7 non-index specs with dedicated Cross-References sections. |
| TA-U | 9 | 3 unit test files: auth.service.spec.ts, listing.service.spec.ts, escrow.service.spec.ts. Real assertions with mocked Prisma. (auth.spec.ts is integration, not counted here.) |
| TA-I | 9 | 2+ integration test files with supertest+AppModule: auth.spec.ts (auth integration, tests register+login validation), security.spec.ts (tests /listings domain endpoint + auth). Also monitoring.spec.ts and performance.spec.ts with supertest. Auth and domain coverage satisfied. |
| CD | 9 | No `as any`, no `console.log` in api/src. All 6 models + 5 enums have @@map with @map on enum values. Decimal @db.Decimal(12,2) for price, amount, balance fields. cn() uses clsx+tailwind-merge. BCRYPT_SALT_ROUNDS from shared. DTOs have @IsString()+@MaxLength() on strings, @MaxLength(36) on UUIDs. @IsIn(ALLOWED_REGISTRATION_ROLES) from shared. Web has 3 files importing from shared (actions.ts, api.ts, dashboard-stats.tsx). |
| FC | 9 | Full CRUD on all 4 domain controllers (listings, transactions, escrows, disputes): Post, Get, Get/:id, Put/:id, Delete/:id. Auth register+login present. Separate MetricsController for /metrics. |
| CQ | 9 | Clean code. GlobalExceptionFilter as APP_FILTER in AppModule. LoggerService injectable via DI (@Injectable). findFirst justified with comments. ValidationPipe as APP_PIPE in AppModule. JwtAuthGuard as APP_GUARD with @Public() decorator for open routes. |
| DA | 9 | @@map on all models/enums. RLS (ENABLE+FORCE) on all tables in migration. 14 @@index entries covering tenant FKs, status, composites. Seed has error/failure states (CANCELLED listing), console.error+process.exit(1), $disconnect. |
| UI | 9 | 8 shadcn/ui components (alert, badge, button, card, input, separator, skeleton, table). Dark mode via @media prefers-color-scheme. loading.tsx in all 5 routes with role="status"+aria-busy="true". error.tsx in all 5 routes via shared ErrorBoundaryContent component with role="alert"+useRef+focus+structured JSON logging. Server Actions with 'use server'+response.ok. Nav in layout.tsx. |
| AX | 8 | jest-axe tests importing real components (Button, Card, Input, Badge, Alert). Keyboard tests with userEvent. Good but tests fewer component variants than AE/FD (5 vs 6-7 components tested). |
| ST | 10 | 59 VERIFY in specs/*.md only, 59 TRACED in .ts/.tsx only. 100% parity both directions. Correct EM- prefix. No TRACED in non-ts files. |
| II | 9 | Multi-stage Dockerfile (node:20-alpine, 3 stages, USER node, HEALTHCHECK /health, LABEL maintainer, COPY turbo.json). CI has separate jobs for lint, test, build, typecheck (pnpm turbo run). docker-compose with PG16+healthcheck+named volume. docker-compose.test.yml. .env.example with connection_limit. Turbo in root devDeps. Helmet+CSP. ThrottlerModule 100/60 global, 5/60 auth via @Throttle. CORS from env (no fallback, credentials true, explicit headers). Env validation via validateEnv() at startup. Web app 3 files importing from shared. |
| PF | 9 | ResponseTimeInterceptor as APP_INTERCEPTOR using performance.now() from perf_hooks, setting X-Response-Time. normalizePageParams with clamping. 14 @@index entries. include/select in services (27 usages). next/dynamic in page.tsx. Cache-Control on all 4 list endpoints. connection_limit in DATABASE_URL. performance.spec.ts with supertest+AppModule. |

**EM Total: 110/120**

---

## Project: Field Service Dispatch (FD)

| Dim | Score | Evidence/Issues |
|-----|-------|-----------------|
| SV | 9 | 8 spec docs (7 req + testing.md extra), SPEC-INDEX 72 lines (>= 55), all specs >= 55 lines (min 62, max 108). 55 VERIFY tags (>= 35), correct FD- prefix, 100% VERIFY<->TRACED parity (55/55), TRACED only in .ts/.tsx. Excellent cross-refs across all non-index specs (api->security+data-model, architecture->data-model+security+monitoring+performance, data-model->architecture+security, monitoring->architecture+security, performance->architecture+data-model, security->architecture+monitoring, testing->security+monitoring). |
| TA-U | 9 | 3 unit test files: auth.spec.ts (unit, mocked Prisma+JwtService), technician.spec.ts, work-order.spec.ts. All have real assertions. |
| TA-I | 7 | security.spec.ts (supertest+AppModule, tests /auth/register and /work-orders endpoints) and monitoring.spec.ts (supertest+AppModule, tests /health, /metrics, correlation IDs, error sanitization). Both are proper integration tests with supertest+AppModule. However, auth.spec.ts is purely a unit test (no supertest, no AppModule) -- there is no dedicated auth integration test file. The requirement specifies 2 integration test files: auth + domain. FD's security.spec.ts partially covers auth endpoints but is not an auth integration test file. |
| CD | 8 | No `as any`, no `console.log` in api/src. All 6 models + 4 enums have @@map with @map on enum values. Decimal for GPS coords and radius (no money fields in this dispatch domain -- appropriate). cn() uses clsx+tailwind-merge. BCRYPT_SALT_ROUNDS from shared. DTOs have @IsString()+@MaxLength() on strings, @MaxLength(36) on UUIDs. @IsIn(ALLOWED_REGISTRATION_ROLES) from shared. Minor gap: web app has only 2 source files importing from shared (needs >= 3). |
| FC | 9 | Full CRUD on all 4 domain controllers (work-orders, technicians, schedules, service-areas): Post, Get, Get/:id, Put/:id, Delete/:id. Auth register+login+profile present. tenantId from JWT context (not DTO) -- valid approach. |
| CQ | 9 | Clean code. GlobalExceptionFilter as APP_FILTER in AppModule (FM#94 fix applied correctly -- comment explicitly references this). PinoLoggerService injectable via DI (@Injectable). findFirst justified with comments. Env validation via validateEnvVars() from shared (DATABASE_URL, JWT_SECRET, CORS_ORIGIN). JwtAuthGuard as APP_GUARD with @Public() for open routes. |
| DA | 9 | @@map on all models/enums. RLS (ENABLE+FORCE) on all tables in migration. 17 @@index entries (most of any project) covering tenant FKs, status, composites, technicianId, workOrderId. Seed has error/failure states (suspended technician, FAILED+cancelled work orders, cancelled schedule), console.error+process.exit(1), $disconnect. |
| UI | 9 | 8 shadcn/ui components (alert, badge, button, card, input, label, skeleton, table). Dark mode via @media prefers-color-scheme. loading.tsx in all 6 routes with role="status"+aria-busy="true". error.tsx in all 6 routes with role="alert"+useRef+focus. Server Actions with 'use server'+response.ok. Nav in layout via next/dynamic. |
| AX | 9 | jest-axe tests importing real components (Button, Card, Input, Label, Alert, Badge). Keyboard tests with userEvent (tab, enter, focus). Good coverage. |
| ST | 10 | 55 VERIFY in specs/*.md only, 55 TRACED in .ts/.tsx only. 100% parity both directions. Correct FD- prefix. No TRACED in non-ts files. |
| II | 8 | Multi-stage Dockerfile (node:20-alpine, 3 stages, USER node, HEALTHCHECK /health, LABEL maintainer, COPY turbo.json). CI has separate jobs for lint, typecheck, test, build, audit (pnpm turbo run). docker-compose with PG16+healthcheck+named volume. docker-compose.test.yml. .env.example with connection_limit. Turbo in root devDeps. Helmet+CSP. ThrottlerModule 100/60 global, 5/60 auth via @Throttle. CORS from env (no fallback, credentials true, explicit methods). Env validation at startup via shared validateEnvVars(). Minor: web app only 2 files importing from shared (needs >= 3). |
| PF | 9 | ResponseTimeInterceptor as APP_INTERCEPTOR in AppModule using performance.now() from perf_hooks. normalizePageParams with MAX_PAGE_SIZE clamping. 17 @@index entries (highest). include/select in services (23 usages). next/dynamic in layout.tsx for Nav. Cache-Control on all 4 list endpoints. connection_limit in DATABASE_URL. performance.spec.ts with supertest+AppModule. |

**FD Total: 107/120**

---

## L8 Monitoring-Specific Assessment

### Analytics Engine
- **Pino logger:** PinoLoggerService @Injectable, uses `pino` package, JSON output. **PASS**
- **Correlation IDs:** CorrelationIdMiddleware generates UUID (v4), preserves client-sent X-Correlation-ID. **PASS**
- **Health endpoints:** GET /health (status+timestamp+uptime+version), GET /health/ready ($queryRaw Prisma.sql). @SkipThrottle on controller. Auth exempt via per-controller guards (no JwtAuthGuard on health controller). **PASS**
- **Request logging middleware:** Logs method/URL/status/duration via RequestContextService. **PASS**
- **Global exception filter:** APP_FILTER in AppModule, uses RequestContextService for context, sanitized responses. **PASS**
- **Metrics endpoint:** GET /metrics returns request count, error count, avg response time, uptime. **PASS**
- **Frontend error boundary:** logErrorBoundary function with structured JSON console.error including component stack. **PASS**
- **monitoring.md:** 136 lines. **PASS**
- **monitoring.spec.ts:** Supertest integration tests for health, health/ready, metrics, correlation ID propagation (both client-sent and generated), error sanitization, request count tracking. **PASS**
- **T41 variation (RequestContextService):** Request-scoped (@Injectable({ scope: Scope.REQUEST })), stores correlationId/userId/tenantId, used by GlobalExceptionFilter (line 40: requestContext.toLogContext()) and RequestLoggingMiddleware (line 33: requestContext.toLogContext()), exported from MonitoringModule. **PASS**

### Escrow Marketplace
- **Pino logger:** LoggerService @Injectable, uses `pino` package, JSON output. **PASS**
- **Correlation IDs:** CorrelationIdMiddleware uses generateCorrelationId from shared package. **PASS**
- **Health endpoints:** GET /health, GET /health/ready (Prisma.sql). @SkipThrottle + @Public on controller. **PASS**
- **Request logging middleware:** Uses RequestContextService for structured logging. **PASS**
- **Global exception filter:** APP_FILTER in AppModule, uses RequestContextService, returns sanitized errors with correlationId. **PASS**
- **Metrics endpoint:** GET /metrics via separate MetricsController. **PASS**
- **Frontend error boundary:** ErrorBoundaryContent component with console.error(JSON.stringify(...)) including message, stack, digest, component info. **PASS**
- **monitoring.md:** 107 lines. **PASS**
- **monitoring.spec.ts:** Supertest integration tests covering health, health/ready, correlation ID (generation, preservation, uniqueness), error sanitization (no stack traces, correlationId in responses), metrics (request count, error count, avg response time, uptime). **PASS**
- **T41 variation (RequestContextService):** Request-scoped, stores correlationId/userId/tenantId, used by GlobalExceptionFilter (line 37: requestContext.toLogContext()) and RequestLoggingMiddleware (line 21: requestContext.toLogContext()), exported from MonitoringModule. **PASS**

### Field Service Dispatch
- **Pino logger:** PinoLoggerService @Injectable, uses `pino` package, JSON output. **PASS**
- **Correlation IDs:** CorrelationIdMiddleware generates UUID (v4), preserves client-sent. **PASS**
- **Health endpoints:** GET /health, GET /health/ready ($queryRaw Prisma.sql). @Public + @SkipThrottle on controller. **PASS**
- **Request logging middleware:** Uses RequestContextService (line 20: requestContext.toLogContext()). **PASS**
- **Global exception filter:** APP_FILTER in AppModule (explicit FM#94 fix comment). Uses RequestContextService (line 36: requestContext.toLogContext()). **PASS**
- **Metrics endpoint:** GET /metrics via health controller. **PASS**
- **Frontend error boundary:** logErrorToApi function with structured JSON console.error + POST to /errors API endpoint. **PASS**
- **monitoring.md:** 108 lines. **PASS**
- **monitoring.spec.ts:** Supertest integration tests for health (required fields, auth exemption), metrics (operational metrics), correlation ID propagation (client-sent + generated), error sanitization (no stack traces, correlationId in responses), structured logging verification, and T41-specific RequestContextService tests. **PASS**
- **T41 variation (RequestContextService):** Request-scoped, stores correlationId/userId/tenantId, used by GlobalExceptionFilter and RequestLoggingMiddleware, exported from MonitoringModule. Has dedicated test coverage for T41 variation (lines 128-148). **PASS**

---

## Summary

| Project | SV | TA-U | TA-I | CD | FC | CQ | DA | UI | AX | ST | II | PF | Total | Key Issues |
|---------|-----|------|------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-------|------------|
| AE | 9 | 9 | 9 | 8 | 9 | 9 | 9 | 9 | 9 | 10 | 8 | 9 | **109** | Web app only 2 files importing from shared (needs >= 3) |
| EM | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 8 | 10 | 9 | 9 | **110** | Slightly fewer a11y component test variants; otherwise cleanest project |
| FD | 9 | 9 | 7 | 8 | 9 | 9 | 9 | 9 | 9 | 10 | 8 | 9 | **107** | auth.spec.ts is unit test only (no supertest+AppModule); web app only 2 files importing from shared |

**Ranking: EM (110) > AE (109) > FD (107)**

All three projects are strong in Trial 41 and represent significant improvement over Trial 40's FD (which scored 84 in T40). All three projects:
- Correctly implement the T41 variation (RequestContextService with request-scoped DI, used by filter+middleware, exported from MonitoringModule)
- Have GlobalExceptionFilter as APP_FILTER in AppModule (FM#94 fixed across the board)
- Have supertest-based monitoring.spec.ts with real integration tests (FM#95 fixed)
- Achieve 100% VERIFY<->TRACED parity with zero orphans in either direction
- Pass all L8 monitoring checks comprehensively (Pino logger, correlation IDs, health endpoints, request logging, error tracking, metrics, frontend error boundaries)

Key differentiators:
- EM leads slightly at 110 due to having 3 web files importing from shared and a clean integration test structure
- AE is close behind at 109, with the only gap being 2 (not 3) web files importing from shared
- FD at 107 loses points primarily for auth.spec.ts being a unit test rather than an integration test, and the web shared import gap
