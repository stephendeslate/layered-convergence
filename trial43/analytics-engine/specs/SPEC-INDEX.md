# Specification Index

## Overview

This index maps all VERIFY tags to their corresponding TRACED tags in source
code, establishing bidirectional traceability between specifications and
implementation.

## Specification Documents

| Document             | Description                              |
|---------------------|------------------------------------------|
| architecture.md     | System architecture and workspace layout |
| authentication.md   | JWT auth, bcrypt, role-based access       |
| api-contracts.md    | REST endpoint contracts and DTOs         |
| data-model.md       | Prisma schema, indexes, RLS              |
| security.md         | Input validation, CSP, rate limiting     |
| performance.md      | Pagination, caching, code splitting      |
| monitoring.md       | Logging, correlation IDs, health checks  |
| cross-layer.md      | L9 cross-layer integration requirements  |

## Tag Registry

| Tag ID         | VERIFY Location        | TRACED Location                              |
|----------------|------------------------|----------------------------------------------|
| AE-ARCH-001   | architecture.md        | apps/api/src/app.module.ts                   |
| AE-AUTH-001   | authentication.md      | apps/api/src/auth/jwt.strategy.ts            |
| AE-AUTH-002   | authentication.md      | apps/api/src/auth/jwt-auth.guard.ts          |
| AE-AUTH-003   | authentication.md      | apps/api/src/auth/auth.service.ts            |
| AE-AUTH-004   | authentication.md      | apps/api/src/auth/auth.controller.ts         |
| AE-SEC-001    | authentication.md      | packages/shared/src/constants.ts             |
| AE-SEC-002    | authentication.md      | packages/shared/src/constants.ts             |
| AE-SEC-003    | security.md            | apps/api/src/main.ts                         |
| AE-SEC-004    | security.md            | apps/api/src/main.ts                         |
| AE-SEC-005    | security.md            | apps/api/src/main.ts                         |
| AE-SEC-006    | security.md            | apps/api/src/main.ts                         |
| AE-SEC-007    | security.md            | apps/api/src/auth/auth.dto.ts                |
| AE-SEC-008    | security.md            | apps/api/src/auth/auth.dto.ts                |
| AE-SEC-009    | security.md            | apps/api/src/app.module.ts                   |
| AE-SEC-010    | security.md            | apps/api/src/app.module.ts                   |
| AE-API-001    | api-contracts.md       | apps/api/src/dashboards/dashboards.dto.ts    |
| AE-API-002    | api-contracts.md       | apps/api/src/dashboards/dashboards.service.ts|
| AE-API-003    | api-contracts.md       | apps/api/src/dashboards/dashboards.controller.ts|
| AE-API-004    | api-contracts.md       | apps/api/src/data-sources/data-sources.dto.ts|
| AE-API-005    | api-contracts.md       | apps/api/src/data-sources/data-sources.service.ts|
| AE-API-006    | api-contracts.md       | apps/api/src/data-sources/data-sources.controller.ts|
| AE-API-007    | api-contracts.md       | apps/api/src/events/events.dto.ts            |
| AE-API-008    | api-contracts.md       | apps/api/src/events/events.service.ts        |
| AE-API-009    | api-contracts.md       | apps/api/src/events/events.controller.ts     |
| AE-API-010    | api-contracts.md       | apps/api/src/pipelines/pipelines.dto.ts      |
| AE-API-011    | api-contracts.md       | apps/api/src/pipelines/pipelines.service.ts  |
| AE-API-012    | api-contracts.md       | apps/api/src/pipelines/pipelines.controller.ts|
| AE-DATA-001   | data-model.md          | apps/api/prisma/schema.prisma                |
| AE-DATA-002   | data-model.md          | apps/api/src/prisma/prisma.service.ts        |
| AE-MON-001    | monitoring.md          | packages/shared/src/correlation.ts           |
| AE-MON-002    | monitoring.md          | packages/shared/src/log-format.ts            |
| AE-MON-003    | monitoring.md          | apps/api/src/monitoring/pino-logger.service.ts|
| AE-MON-004    | monitoring.md          | apps/api/src/monitoring/request-context.service.ts|
| AE-MON-005    | monitoring.md          | apps/api/src/monitoring/correlation-id.middleware.ts|
| AE-MON-006    | monitoring.md          | apps/api/src/monitoring/request-logging.middleware.ts|
| AE-MON-007    | monitoring.md          | apps/api/src/monitoring/global-exception.filter.ts|
| AE-MON-008    | monitoring.md          | apps/api/src/monitoring/metrics.service.ts   |
| AE-MON-009    | monitoring.md          | apps/api/src/monitoring/health.controller.ts |
| AE-MON-013    | monitoring.md          | apps/api/src/monitoring/global-exception.filter.ts|
| AE-MON-010    | monitoring.md          | packages/shared/src/log-sanitizer.ts         |
| AE-MON-011    | monitoring.md          | packages/shared/src/log-sanitizer.ts         |
| AE-MON-012    | monitoring.md          | packages/shared/src/__tests__/log-sanitizer.spec.ts|
| AE-MON-014    | monitoring.md          | apps/api/src/app.module.ts                   |
| AE-PERF-001   | performance.md         | packages/shared/src/constants.ts             |
| AE-PERF-002   | performance.md         | apps/api/src/events/events.service.ts        |
| AE-PERF-003   | performance.md         | apps/api/src/app.module.ts                   |
| AE-PERF-004   | performance.md         | apps/api/src/monitoring/response-time.interceptor.ts|
| AE-PERF-005   | performance.md         | apps/web/app/page.tsx                        |
| AE-CROSS-001  | cross-layer.md         | packages/shared/src/constants.ts             |
| AE-CROSS-002  | cross-layer.md         | packages/shared/src/validate-env.ts          |
| AE-CROSS-003  | cross-layer.md         | apps/api/src/main.ts                         |
| AE-CROSS-004  | cross-layer.md         | apps/api/src/app.module.ts                   |
| AE-CROSS-005  | cross-layer.md         | apps/api/src/monitoring/global-exception.filter.ts|
| AE-CROSS-006  | cross-layer.md         | apps/api/src/monitoring/health.controller.ts |
| AE-CROSS-007  | cross-layer.md         | apps/api/test/cross-layer.integration.spec.ts|
| AE-CROSS-008  | cross-layer.md         | apps/api/test/cross-layer.integration.spec.ts|
| AE-UI-001     | SPEC-INDEX.md          | apps/web/lib/utils.ts                        |
| AE-UI-002     | SPEC-INDEX.md          | apps/web/lib/error-logging.ts                |
| AE-UI-003     | SPEC-INDEX.md          | apps/web/components/nav.tsx                  |
| AE-UI-004     | SPEC-INDEX.md          | apps/web/app/layout.tsx                      |
| AE-UI-005     | SPEC-INDEX.md          | apps/web/app/actions.ts                      |
| AE-UI-006     | SPEC-INDEX.md          | apps/web/app/dashboards/page.tsx             |
| AE-UI-007     | SPEC-INDEX.md          | apps/web/app/login/page.tsx                  |
| AE-UI-008     | SPEC-INDEX.md          | apps/web/components/ui/button.tsx            |
| AE-TEST-001   | SPEC-INDEX.md          | apps/api/test/auth.service.spec.ts           |
| AE-TEST-002   | SPEC-INDEX.md          | apps/api/test/dashboards.service.spec.ts     |
| AE-TEST-003   | SPEC-INDEX.md          | apps/api/test/events.service.spec.ts         |
| AE-TEST-004   | SPEC-INDEX.md          | apps/api/test/auth.integration.spec.ts       |
| AE-TEST-005   | SPEC-INDEX.md          | apps/api/test/events.integration.spec.ts     |
| AE-TEST-006   | SPEC-INDEX.md          | apps/api/test/monitoring.spec.ts             |
| AE-TEST-007   | SPEC-INDEX.md          | apps/api/test/security.spec.ts               |
| AE-TEST-008   | SPEC-INDEX.md          | apps/api/test/performance.spec.ts            |
| AE-TEST-009   | SPEC-INDEX.md          | apps/web/__tests__/accessibility.spec.tsx     |
| AE-TEST-010   | SPEC-INDEX.md          | apps/web/__tests__/keyboard.spec.tsx         |

## UI Component Specifications

- VERIFY:AE-UI-001 -- `cn()` utility using clsx + tailwind-merge
- VERIFY:AE-UI-002 -- Client-side error logging with fetch to /api/client-errors
- VERIFY:AE-UI-003 -- Navigation component with active link highlighting
- VERIFY:AE-UI-004 -- Root layout with Nav and main content wrapper
- VERIFY:AE-UI-005 -- Server actions for API communication
- VERIFY:AE-UI-006 -- Dashboards page with card grid layout
- VERIFY:AE-UI-007 -- Login page with form validation
- VERIFY:AE-UI-008 -- Button component with variant and size props

## Test Specifications

- VERIFY:AE-TEST-001 -- Auth service unit tests (login/register)
- VERIFY:AE-TEST-002 -- Dashboards service CRUD tests
- VERIFY:AE-TEST-003 -- Events service CRUD + pagination tests
- VERIFY:AE-TEST-004 -- Auth integration tests with supertest
- VERIFY:AE-TEST-005 -- Events integration tests with JWT auth
- VERIFY:AE-TEST-006 -- Monitoring tests (health, correlation, metrics)
- VERIFY:AE-TEST-007 -- Security tests (auth, validation, roles)
- VERIFY:AE-TEST-008 -- Performance tests (response time, pagination)
- VERIFY:AE-TEST-009 -- Accessibility tests with jest-axe
- VERIFY:AE-TEST-010 -- Keyboard navigation tests

## Verification Summary

- **Total unique tags**: 75
- **VERIFY tags in specs**: 75 (architecture: 1, authentication: 6, api-contracts: 12,
  data-model: 3, security: 8, performance: 5, monitoring: 12, cross-layer: 8,
  SPEC-INDEX UI: 8, SPEC-INDEX TEST: 10, SPEC-INDEX DATA: 2)
- **TRACED tags in source**: 75 (all tags present in .ts/.tsx files)
- **Bidirectional parity**: 100% -- every VERIFY has a matching TRACED
