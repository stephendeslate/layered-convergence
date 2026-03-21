# Specification Index — Analytics Engine

**Last Updated:** 2026-03-21

## Specification Documents

| # | Document | Description | Last Updated | VERIFY Tags |
|---|----------|-------------|--------------|-------------|
| 1 | [PRODUCT_VISION.md](specs/PRODUCT_VISION.md) | Product vision, target users, value proposition, success metrics | 2026-03-21 | 3 |
| 2 | [SYSTEM_ARCHITECTURE.md](specs/SYSTEM_ARCHITECTURE.md) | System architecture, modules, deployment model | 2026-03-21 | 5 |
| 3 | [DATA_MODEL.md](specs/DATA_MODEL.md) | Entity definitions, relationships, constraints | 2026-03-21 | 7 |
| 4 | [API_CONTRACT.md](specs/API_CONTRACT.md) | Endpoint definitions, request/response schemas, error codes | 2026-03-21 | 8 |
| 5 | [SECURITY_MODEL.md](specs/SECURITY_MODEL.md) | Authentication, authorization, RLS, threat model | 2026-03-21 | 9 |
| 6 | [TESTING_STRATEGY.md](specs/TESTING_STRATEGY.md) | Test pyramid, coverage targets, test categories | 2026-03-21 | 7 |
| 7 | [UI_SPECIFICATION.md](specs/UI_SPECIFICATION.md) | Page inventory, components, accessibility, user flows | 2026-03-21 | 15 |

## Dependency Graph

```
PRODUCT_VISION
  └── SYSTEM_ARCHITECTURE
        ├── DATA_MODEL
        │     └── API_CONTRACT
        ├── SECURITY_MODEL
        │     └── DATA_MODEL
        ├── TESTING_STRATEGY
        └── UI_SPECIFICATION
              └── API_CONTRACT
```

## Traceability Summary

- **Total VERIFY tags:** 54
- **Total TRACED tags:** 54
- **Bidirectional coverage:** 100%
- **Orphan VERIFY tags:** 0
- **Orphan TRACED tags:** 0

## Tag Inventory

| Tag | Spec | Implementation File |
|-----|------|-------------------|
| PV-001 | PRODUCT_VISION | backend/prisma/schema.prisma |
| PV-002 | PRODUCT_VISION | frontend/app/page.tsx |
| PV-003 | PRODUCT_VISION | backend/prisma/rls.sql |
| SA-001 | SYSTEM_ARCHITECTURE | backend/src/prisma/prisma.service.ts |
| SA-002 | SYSTEM_ARCHITECTURE | backend/src/pipeline/pipeline.service.ts |
| SA-003 | SYSTEM_ARCHITECTURE | backend/src/sync-run/sync-run.service.ts |
| SA-004 | SYSTEM_ARCHITECTURE | backend/src/main.ts |
| SA-005 | SYSTEM_ARCHITECTURE | backend/src/main.ts |
| DM-001 | DATA_MODEL | backend/prisma/schema.prisma |
| DM-002 | DATA_MODEL | backend/prisma/schema.prisma, backend/src/auth/dto/register.dto.ts |
| DM-003 | DATA_MODEL | backend/prisma/schema.prisma |
| DM-004 | DATA_MODEL | backend/prisma/schema.prisma |
| DM-005 | DATA_MODEL | backend/prisma/schema.prisma |
| DM-006 | DATA_MODEL | backend/prisma/schema.prisma |
| DM-007 | DATA_MODEL | backend/prisma/schema.prisma |
| API-001 | API_CONTRACT | backend/src/auth/auth.controller.ts |
| API-002 | API_CONTRACT | backend/src/data-source/data-source.service.ts |
| API-003 | API_CONTRACT | backend/src/pipeline/pipeline.service.ts |
| API-004 | API_CONTRACT | backend/src/dashboard/dashboard.service.ts |
| API-005 | API_CONTRACT | backend/src/sync-run/sync-run.service.ts |
| API-006 | API_CONTRACT | frontend/lib/actions.ts |
| API-007 | API_CONTRACT | backend/src/data-source/data-source.controller.ts |
| API-008 | API_CONTRACT | backend/src/auth/dto/register.dto.ts |
| SEC-001 | SECURITY_MODEL | backend/src/auth/auth.service.ts |
| SEC-002 | SECURITY_MODEL | backend/prisma/rls.sql |
| SEC-003 | SECURITY_MODEL | backend/prisma/rls.sql |
| SEC-004 | SECURITY_MODEL | backend/src/tenant/tenant-context.service.ts |
| SEC-005 | SECURITY_MODEL | backend/src/common/constants.ts |
| SEC-006 | SECURITY_MODEL | backend/src/auth/dto/register.dto.ts |
| SEC-007 | SECURITY_MODEL | backend/src/auth/auth.service.ts |
| SEC-008 | SECURITY_MODEL | backend/src/auth/auth.service.ts |
| SEC-009 | SECURITY_MODEL | backend/src/auth/jwt.strategy.ts |
| TS-001 | TESTING_STRATEGY | backend/src/auth/auth.service.spec.ts |
| TS-002 | TESTING_STRATEGY | backend/src/pipeline/pipeline.service.spec.ts |
| TS-003 | TESTING_STRATEGY | backend/src/data-source/data-source.service.spec.ts |
| TS-004 | TESTING_STRATEGY | backend/src/dashboard/dashboard.service.spec.ts |
| TS-005 | TESTING_STRATEGY | backend/test/app.integration.spec.ts |
| TS-006 | TESTING_STRATEGY | frontend/app/keyboard.test.tsx |
| TS-007 | TESTING_STRATEGY | frontend/app/accessibility.test.tsx |
| UI-001 | UI_SPECIFICATION | frontend/app/globals.css |
| UI-002 | UI_SPECIFICATION | frontend/app/globals.css |
| UI-003 | UI_SPECIFICATION | frontend/app/globals.css |
| UI-004 | UI_SPECIFICATION | frontend/components/nav.tsx |
| UI-005 | UI_SPECIFICATION | frontend/app/layout.tsx |
| UI-006 | UI_SPECIFICATION | frontend/app/loading.tsx (+ 5 route loading files) |
| UI-007 | UI_SPECIFICATION | frontend/app/error.tsx (+ 5 route error files) |
| UI-008 | UI_SPECIFICATION | frontend/lib/actions.ts |
| UI-009 | UI_SPECIFICATION | frontend/app/login/page.tsx |
| UI-010 | UI_SPECIFICATION | frontend/app/register/page.tsx |
| UI-011 | UI_SPECIFICATION | frontend/app/data-sources/page.tsx |
| UI-012 | UI_SPECIFICATION | frontend/app/pipelines/page.tsx |
| UI-013 | UI_SPECIFICATION | frontend/app/dashboards/page.tsx |
| UI-014 | UI_SPECIFICATION | frontend/app/keyboard.test.tsx |
| UI-015 | UI_SPECIFICATION | frontend/app/accessibility.test.tsx |
