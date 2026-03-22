# Trial 40 — Independent Scoring

Scorer: Claude Opus 4.6 (independent, no builder scores seen)
Date: 2026-03-21

---

## Project: Analytics Engine (AE)

| Dim | Score | Evidence/Issues |
|-----|-------|-----------------|
| SV | 9 | 8 spec docs (7 req), SPEC-INDEX 61 lines, all specs >= 55 lines, 67 VERIFY tags (>= 35), correct AE- prefix, 100% VERIFY<->TRACED parity (67/67), multiple cross-refs between specs (infrastructure->security, data-model->api, monitoring->infrastructure, etc.) |
| TA-U | 9 | 3 unit test files in src/: auth.service.spec.ts, dashboards.service.spec.ts, events.service.spec.ts. Real assertions with mocked Prisma. |
| TA-I | 9 | 2 integration test files: auth.integration.spec.ts and domain.integration.spec.ts. Both import AppModule and use supertest. |
| CD | 9 | No `as any`, no `console.log` in api/src, all 10 models+enums have @@map, enum values have @map, Decimal for money (cost field), cn() uses clsx+tailwind-merge, BCRYPT_SALT_ROUNDS imported from shared in seed. |
| FC | 9 | Full CRUD on all 4 domain controllers (dashboards, data-sources, events, pipelines): Get, GetAll, Post, Put, Delete. Auth register+login present. |
| CQ | 9 | Clean code, proper error handling in GlobalExceptionFilter, findFirst justified, no dead code observed. |
| DA | 9 | @@map on all models/enums, RLS (ENABLE+FORCE) in migration, 13 @@index entries covering tenant FKs, status, composites. Seed has error/failure states, console.error+process.exit(1). |
| UI | 9 | 8 shadcn/ui components, cn() utility correct, dark mode via @media prefers-color-scheme, loading.tsx in all 4 routes with role="status"+aria-busy, error.tsx with role="alert"+useRef+focus, Server Actions with 'use server'+response.ok, Nav in layout.tsx. |
| AX | 8 | jest-axe tests importing real components (Button, Card, Badge, Alert, Input, Label). Keyboard tests with userEvent. Tests are solid but limited to component-level axe checks. |
| ST | 10 | 67 VERIFY in specs/*.md only, 67 TRACED in .ts/.tsx only. 100% parity. Correct AE- prefix throughout. No TRACED in non-ts files. |
| II | 8 | Multi-stage Dockerfile correct (node:20-alpine, deps->build->production, USER node, HEALTHCHECK /health matches endpoint, LABEL maintainer). CI has lint+test+build+typecheck+migration-check+audit. docker-compose with PG16+healthcheck+named volume. docker-compose.test.yml exists. .env.example present. Turborepo+pnpm with turbo in root devDeps. Helmet+CSP. ThrottlerModule 100/60 global, 5/60 auth. CORS from env (no fallback). Env validation at startup. Missing: CI `build` step not explicitly visible (only lint+typecheck+test+migration-check+audit shown in first 60 lines). |
| PF | 8 | ResponseTimeInterceptor as APP_INTERCEPTOR in AppModule. Pagination via normalizePageParams with MAX_PAGE_SIZE clamping. @@index on tenant FKs+status+composites. include/select in services. next/dynamic for bundle optimization. Cache-Control on list endpoints. connection_limit in DATABASE_URL. performance.spec.ts exists. |

**AE Total: 108/120**

---

## Project: Escrow Marketplace (EM)

| Dim | Score | Evidence/Issues |
|-----|-------|-----------------|
| SV | 9 | 8 spec docs (7 req), SPEC-INDEX 59 lines, all specs >= 55 lines, 85 VERIFY tags (>= 35), correct EM- prefix, 100% VERIFY<->TRACED parity (85/85). Excellent cross-refs between specs (api->auth, auth->security, data-model->security, frontend->api, infrastructure->monitoring, monitoring->api, security->auth). |
| TA-U | 9 | 3 unit test files in test/: auth.service.spec.ts, listings.service.spec.ts, transactions.service.spec.ts. Real assertions with mocked Prisma. |
| TA-I | 9 | 2 integration test files: auth.integration.spec.ts and domain.integration.spec.ts. Both import AppModule and use supertest. |
| CD | 9 | No `as any`, no `console.log` in api/src, all 10 models+enums have @@map, Decimal for money (balance, price, amount fields), cn() uses clsx+tailwind-merge, BCRYPT_SALT_ROUNDS imported from shared in seed. |
| FC | 9 | Full CRUD on all 4 domain controllers (listings, transactions, escrows, disputes). Auth register+login present. |
| CQ | 8 | Clean code overall. GlobalExceptionFilter properly registered as APP_FILTER. Minor: EM health controller uses @Controller('health') making metrics endpoint at /health/metrics (unusual path but functional). |
| DA | 9 | @@map on all models/enums, RLS in migration, 12 @@index entries covering tenant FKs+status+composites. Seed has error/failure states with console.error+process.exit(1). |
| UI | 8 | 8 shadcn/ui components, cn() correct, dark mode via @media, loading.tsx in all routes with role="status"+aria-busy, error.tsx with role="alert"+useRef+focus. Server Actions with 'use server'+response.ok, Nav in layout. Minor: only root error.tsx has structured error logging (process.stderr.write), other error.tsx files have no logging at all. |
| AX | 8 | jest-axe tests rendering real components (Button, Badge, Card, Input, Label, Alert, Skeleton, Table). Keyboard tests with userEvent. Good coverage. |
| ST | 10 | 85 VERIFY in specs/*.md only, 85 TRACED in .ts/.tsx only. 100% parity. Correct EM- prefix. No TRACED in non-ts files. |
| II | 9 | Multi-stage Dockerfile (node:20-alpine, 3 stages, USER node, HEALTHCHECK /health, LABEL maintainer). CI has lint+typecheck+test+audit+build+migration steps. docker-compose with PG16+healthcheck+named volume. docker-compose.test.yml. .env.example. Turbo in root devDeps. Helmet+CSP. ThrottlerModule 100/60+5/60 auth. CORS from env. Env validation at startup. pnpm audit in CI. |
| PF | 8 | ResponseTimeInterceptor as APP_INTERCEPTOR in AppModule. normalizePageParams with MAX_PAGE_SIZE clamping. @@index on tenant FKs+status+composites. include in services. next/dynamic. Cache-Control on list endpoints. connection_limit in DATABASE_URL. performance.spec.ts exists. |

**EM Total: 107/120**

---

## Project: Field Service Dispatch (FD)

| Dim | Score | Evidence/Issues |
|-----|-------|-----------------|
| SV | 5 | 11 spec docs (7 req, fine), but SPEC-INDEX only 42 lines (needs >= 55, FAIL). 52 VERIFY vs 68 TRACED = parity BROKEN (16 orphaned TRACED tags: FD-SA-004, FD-SCHED-004, FD-SCHED-005, FD-SEED-001, FD-SHARED-001 through FD-SHARED-011, FD-TECH-004). Zero cross-references between specs. |
| TA-U | 9 | 3 unit test files: auth.service.spec.ts, technicians.service.spec.ts, work-orders.service.spec.ts. All in test/ but are proper unit tests with mocked Prisma and real assertions. |
| TA-I | 9 | 2 integration test files: auth.integration.spec.ts and domain.integration.spec.ts. Both import AppModule and use supertest. |
| CD | 8 | No `as any`, no `console.log` in api/src, all 10 models+enums have @@map, Decimal for GPS fields, cn() uses clsx+tailwind-merge, BCRYPT_SALT_ROUNDS from shared. Minor: CreateWorkOrderDto missing tenantId field. RegisterDto missing name field. |
| FC | 8 | Full CRUD on all 4 domain controllers (work-orders, technicians, schedules, service-areas) with @Patch instead of @Put (acceptable). Auth register+login present. Minor: missing name field in register may break user creation. |
| CQ | 6 | GlobalExceptionFilter registered via main.ts useGlobalFilters (NOT APP_FILTER in AppModule — violates FM#93). APP_FILTER imported in app.module.ts but unused. Pino logger not injectable via DI (created directly in main.ts). FD GlobalExceptionFilter constructor takes PinoLogger interface but registration uses `new GlobalExceptionFilter(logger)` bypassing DI entirely. |
| DA | 8 | @@map on all models/enums, RLS in migration, 12 @@index. Seed has error states with console.error+process.exit(1). FD health/ready uses template literal $queryRaw without Prisma.sql wrapper (less safe, though still parameterized). |
| UI | 4 | 8 shadcn/ui components, cn() correct, dark mode via @media. BUT: loading.tsx files have NO role="status" or aria-busy="true" (all 5 loading files fail). error.tsx files have NO role="alert", NO useRef, NO focus management (all 5 error files fail). Has Server Actions with 'use server'+response.ok. Nav in layout. |
| AX | 8 | jest-axe tests rendering real components. Keyboard tests with userEvent. Tests themselves are fine but the actual error.tsx/loading.tsx components lack accessibility attributes. |
| ST | 4 | 52 VERIFY, 68 TRACED = 16 orphaned TRACED tags with no matching VERIFY. Parity BROKEN. Correct FD- prefix. No TRACED in non-ts files. |
| II | 7 | Multi-stage Dockerfile (node:20-alpine, 3 stages, USER node, HEALTHCHECK /health, LABEL maintainer). CI has separate jobs for lint, typecheck, test, build, audit. docker-compose with PG16+healthcheck+named volume. docker-compose.test.yml. .env.example. Turbo in root devDeps. Helmet+CSP. ThrottlerModule 100/60+5/60 auth. CORS from env. Env validation at startup. Issue: FD main.ts validates JWT_SECRET and CORS_ORIGIN but does not validate DATABASE_URL at startup. |
| PF | 8 | ResponseTimeInterceptor as APP_INTERCEPTOR in AppModule (correct). normalizePageParams with MAX_PAGE_SIZE. @@index on tenant FKs+status+composites. include in services. next/dynamic. Cache-Control on list endpoints. connection_limit in DATABASE_URL. performance.spec.ts exists. |

**FD Total: 84/120**

---

## L8 Monitoring-Specific Assessment

### Analytics Engine
- Pino logger: Injectable via PinoLoggerService, uses `pino` package, JSON output. **PASS**
- Correlation IDs: Middleware generates UUID via createCorrelationId from shared, preserves client-sent. **PASS**
- Health: GET /health returns status+timestamp+uptime+version. GET /health/ready uses $queryRaw(Prisma.sql). @SkipThrottle, no auth guard (per-controller). **PASS**
- Request logging middleware: Present, logs method/URL/status/duration/correlationId. **PASS**
- Global exception filter: APP_FILTER in AppModule, logs stack+correlationId, sanitized responses. **PASS**
- Metrics: GET /metrics returns request count, error count, avg response time, uptime. **PASS**
- Frontend error boundary: formatLogEntry used in error.tsx, structured with component stack. **PASS**
- monitoring.md: 73 lines. **PASS**
- monitoring.spec.ts: Tests health, correlation, log format, error sanitization with supertest. **PASS**
- T40 variation: createCorrelationId + formatLogEntry exported from shared and used in backend. **PASS**

### Escrow Marketplace
- Pino logger: AppLoggerService injectable via DI, uses formatLogEntry, JSON output. **PASS**
- Correlation IDs: Middleware generates via createCorrelationId from shared. **PASS**
- Health: GET /health, GET /health/ready via checkDatabaseHealth (wraps $queryRaw). @SkipThrottle. **PASS**
- Request logging middleware: Present. **PASS**
- Global exception filter: APP_FILTER in AppModule. **PASS**
- Metrics: GET /health/metrics (at /health/metrics due to controller prefix). **MINOR ISSUE** (works but unusual path)
- Frontend error boundary: Only root error.tsx has stderr logging; other route error.tsx files have NO logging. **PARTIAL**
- monitoring.md: 96 lines. **PASS**
- monitoring.spec.ts: 14 tests covering health, correlation, logging, error sanitization with supertest. **PASS**
- T40 variation: Both functions exported and used. **PASS**

### Field Service Dispatch
- Pino logger: Created in main.ts, NOT injectable via DI. **FAIL**
- Correlation IDs: Middleware uses createCorrelationId from shared. **PASS**
- Health: GET /health, GET /health/ready. @SkipThrottle. **PASS**
- Request logging middleware: Present, uses formatLogEntry. **PASS**
- Global exception filter: Registered via main.ts useGlobalFilters, NOT APP_FILTER. **FAIL (FM#93 analog)**
- Metrics: GET /metrics. **PASS**
- Frontend error boundary: Has structured logging but NO role="alert", NO focus management. **PARTIAL**
- monitoring.md: 67 lines. **PASS**
- monitoring.spec.ts: Only unit tests (createCorrelationId, formatLogEntry, MetricsService). No supertest tests for health, correlation propagation, or error sanitization. **FAIL** (missing required test coverage)
- T40 variation: Both functions exported and used. **PASS**

---

## Summary

| Project | SV | TA-U | TA-I | CD | FC | CQ | DA | UI | AX | ST | II | PF | Total | Key Issues |
|---------|-----|------|------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-------|------------|
| AE | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 8 | 10 | 8 | 8 | **108** | Strongest project overall; minor gaps in CI visibility |
| EM | 9 | 9 | 9 | 9 | 9 | 8 | 9 | 8 | 8 | 10 | 9 | 8 | **107** | Metrics at /health/metrics; partial error boundary logging |
| FD | 5 | 9 | 9 | 8 | 8 | 6 | 8 | 4 | 8 | 4 | 7 | 8 | **84** | SPEC-INDEX < 55 lines; 16 orphaned TRACED; no spec cross-refs; loading.tsx missing a11y attrs; error.tsx missing role="alert"/useRef/focus; GlobalExceptionFilter in main.ts not AppModule; Pino not DI-injectable; monitoring tests lack supertest |

**Ranking: AE (108) > EM (107) > FD (84)**

FD has significant structural issues in spec traceability (broken parity), UI accessibility (loading/error missing required attributes), code quality (GlobalExceptionFilter registration), and monitoring test coverage. AE and EM are close, with AE slightly ahead due to complete error boundary logging and slightly better code organization.
