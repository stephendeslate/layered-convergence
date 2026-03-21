# Specification Index: Analytics Engine

## Document Inventory

| # | Document | Description | VERIFY Tags |
|---|----------|-------------|-------------|
| 1 | [PRODUCT_VISION.md](specs/PRODUCT_VISION.md) | Product vision, users, value proposition | AE-001 to AE-006 |
| 2 | [SYSTEM_ARCHITECTURE.md](specs/SYSTEM_ARCHITECTURE.md) | Architecture, components, deployment | AE-007 to AE-013 |
| 3 | [DATA_MODEL.md](specs/DATA_MODEL.md) | Entity definitions, relationships | AE-014 to AE-020 |
| 4 | [API_CONTRACT.md](specs/API_CONTRACT.md) | Endpoints, schemas, error codes | AE-021 to AE-024 |
| 5 | [SECURITY_MODEL.md](specs/SECURITY_MODEL.md) | Auth, RLS, threat model | AE-025 to AE-030 |
| 6 | [TESTING_STRATEGY.md](specs/TESTING_STRATEGY.md) | Test pyramid, coverage | AE-031 to AE-035 |
| 7 | [UI_SPECIFICATION.md](specs/UI_SPECIFICATION.md) | Pages, components, accessibility | AE-036 to AE-041 |

## Tag Inventory (41 total)

| Tag | Spec | Traced In |
|-----|------|-----------|
| AE-001 | PRODUCT_VISION | backend/prisma/rls.sql |
| AE-002 | PRODUCT_VISION | backend/src/auth/auth.dto.ts |
| AE-003 | PRODUCT_VISION | backend/src/auth/auth.controller.ts |
| AE-004 | PRODUCT_VISION | backend/src/analytics/analytics.service.ts |
| AE-005 | PRODUCT_VISION | backend/src/analytics/analytics.service.ts |
| AE-006 | PRODUCT_VISION | backend/src/analytics/analytics.service.ts |
| AE-007 | SYSTEM_ARCHITECTURE | backend/prisma/schema.prisma |
| AE-008 | SYSTEM_ARCHITECTURE | backend/src/analytics/analytics.controller.ts |
| AE-009 | SYSTEM_ARCHITECTURE | backend/src/auth/jwt.strategy.ts |
| AE-010 | SYSTEM_ARCHITECTURE | backend/src/tenant/tenant.service.ts |
| AE-011 | SYSTEM_ARCHITECTURE | frontend/lib/actions.ts |
| AE-012 | SYSTEM_ARCHITECTURE | frontend/app/loading.tsx |
| AE-013 | SYSTEM_ARCHITECTURE | frontend/app/error.tsx |
| AE-014 | DATA_MODEL | backend/prisma/schema.prisma |
| AE-015 | DATA_MODEL | backend/prisma/schema.prisma |
| AE-016 | DATA_MODEL | backend/prisma/schema.prisma |
| AE-017 | DATA_MODEL | backend/prisma/schema.prisma |
| AE-018 | DATA_MODEL | backend/prisma/schema.prisma |
| AE-019 | DATA_MODEL | backend/prisma/schema.prisma |
| AE-020 | DATA_MODEL | backend/prisma/schema.prisma |
| AE-021 | API_CONTRACT | backend/prisma/schema.prisma |
| AE-022 | API_CONTRACT | backend/prisma/schema.prisma |
| AE-023 | API_CONTRACT | backend/prisma/schema.prisma |
| AE-024 | API_CONTRACT | backend/src/main.ts |
| AE-025 | SECURITY_MODEL | backend/src/main.ts |
| AE-026 | SECURITY_MODEL | backend/src/auth/auth.service.ts |
| AE-027 | SECURITY_MODEL | backend/src/auth/auth.service.ts |
| AE-028 | SECURITY_MODEL | backend/prisma/rls.sql |
| AE-029 | SECURITY_MODEL | backend/src/tenant/tenant.service.ts |
| AE-030 | SECURITY_MODEL | backend/src/main.ts |
| AE-031 | TESTING_STRATEGY | backend/src/auth/auth.service.spec.ts |
| AE-032 | TESTING_STRATEGY | backend/src/auth/auth.service.spec.ts |
| AE-033 | TESTING_STRATEGY | backend/src/analytics/analytics.service.spec.ts |
| AE-034 | TESTING_STRATEGY | backend/src/tenant/tenant.service.spec.ts |
| AE-035 | TESTING_STRATEGY | backend/src/test/integration.spec.ts |
| AE-036 | UI_SPECIFICATION | frontend/components/nav.tsx |
| AE-037 | UI_SPECIFICATION | frontend/app/layout.tsx |
| AE-038 | UI_SPECIFICATION | frontend/app/register/page.tsx |
| AE-039 | UI_SPECIFICATION | frontend/components/ui/button.tsx |
| AE-040 | UI_SPECIFICATION | frontend/__tests__/accessibility.test.tsx |
| AE-041 | UI_SPECIFICATION | frontend/__tests__/keyboard-navigation.test.tsx |

## Dependency Graph

```
PRODUCT_VISION --> SYSTEM_ARCHITECTURE --> DATA_MODEL
                                      --> API_CONTRACT
                                      --> SECURITY_MODEL
                   TESTING_STRATEGY <---> UI_SPECIFICATION
```
