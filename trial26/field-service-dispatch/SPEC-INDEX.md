# Specification Index: Field Service Dispatch

## Document Inventory

| # | Document | Description | VERIFY Tags |
|---|----------|-------------|-------------|
| 1 | [PRODUCT_VISION.md](specs/PRODUCT_VISION.md) | Product vision, users, value proposition | FD-001 to FD-006 |
| 2 | [SYSTEM_ARCHITECTURE.md](specs/SYSTEM_ARCHITECTURE.md) | Architecture, components, deployment | FD-007 to FD-013 |
| 3 | [DATA_MODEL.md](specs/DATA_MODEL.md) | Entity definitions, relationships | FD-014 to FD-022 |
| 4 | [API_CONTRACT.md](specs/API_CONTRACT.md) | Endpoints, schemas, error codes | FD-023 to FD-028 |
| 5 | [SECURITY_MODEL.md](specs/SECURITY_MODEL.md) | Auth, RLS, threat model | FD-029 to FD-034 |
| 6 | [TESTING_STRATEGY.md](specs/TESTING_STRATEGY.md) | Test pyramid, coverage | FD-035 to FD-039 |
| 7 | [UI_SPECIFICATION.md](specs/UI_SPECIFICATION.md) | Pages, components, accessibility | FD-040 to FD-045 |

## Tag Inventory (45 total)

| Tag | Spec | Traced In |
|-----|------|-----------|
| FD-001 | PRODUCT_VISION | backend/src/work-order/work-order.service.ts |
| FD-002 | PRODUCT_VISION | backend/src/route/route.service.ts |
| FD-003 | PRODUCT_VISION | backend/src/invoice/invoice.service.ts |
| FD-004 | PRODUCT_VISION | backend/prisma/schema.prisma |
| FD-005 | PRODUCT_VISION | backend/prisma/rls.sql |
| FD-006 | PRODUCT_VISION | backend/src/auth/auth.dto.ts |
| FD-007 | SYSTEM_ARCHITECTURE | backend/package.json |
| FD-008 | SYSTEM_ARCHITECTURE | frontend/package.json |
| FD-009 | SYSTEM_ARCHITECTURE | backend/src/auth/jwt.strategy.ts |
| FD-010 | SYSTEM_ARCHITECTURE | backend/src/company/company.service.ts |
| FD-011 | SYSTEM_ARCHITECTURE | frontend/lib/actions.ts |
| FD-012 | SYSTEM_ARCHITECTURE | frontend/app/loading.tsx |
| FD-013 | SYSTEM_ARCHITECTURE | frontend/app/error.tsx |
| FD-014 | DATA_MODEL | backend/prisma/schema.prisma |
| FD-015 | DATA_MODEL | backend/src/auth/auth.service.ts |
| FD-016 | DATA_MODEL | backend/prisma/schema.prisma |
| FD-017 | DATA_MODEL | backend/prisma/schema.prisma |
| FD-018 | DATA_MODEL | backend/src/work-order/work-order.service.ts |
| FD-019 | DATA_MODEL | backend/src/route/route.service.ts |
| FD-020 | DATA_MODEL | backend/prisma/schema.prisma |
| FD-021 | DATA_MODEL | backend/src/invoice/invoice.service.ts |
| FD-022 | DATA_MODEL | backend/prisma/schema.prisma |
| FD-023 | API_CONTRACT | backend/src/auth/auth.dto.ts |
| FD-024 | API_CONTRACT | backend/src/work-order/work-order.controller.ts |
| FD-025 | API_CONTRACT | backend/src/work-order/work-order.service.ts |
| FD-026 | API_CONTRACT | backend/src/route/route.controller.ts |
| FD-027 | API_CONTRACT | backend/src/invoice/invoice.service.ts |
| FD-028 | API_CONTRACT | backend/src/main.ts |
| FD-029 | SECURITY_MODEL | backend/src/main.ts |
| FD-030 | SECURITY_MODEL | backend/src/auth/auth.service.ts |
| FD-031 | SECURITY_MODEL | backend/src/auth/auth.dto.ts |
| FD-032 | SECURITY_MODEL | backend/prisma/rls.sql |
| FD-033 | SECURITY_MODEL | backend/src/company/company.service.ts |
| FD-034 | SECURITY_MODEL | backend/src/main.ts |
| FD-035 | TESTING_STRATEGY | backend/src/auth/auth.service.spec.ts |
| FD-036 | TESTING_STRATEGY | backend/src/auth/auth.service.spec.ts |
| FD-037 | TESTING_STRATEGY | backend/src/test/integration.spec.ts |
| FD-038 | TESTING_STRATEGY | frontend/__tests__/accessibility.test.tsx |
| FD-039 | TESTING_STRATEGY | frontend/__tests__/keyboard-navigation.test.tsx |
| FD-040 | UI_SPECIFICATION | frontend/app/layout.tsx |
| FD-041 | UI_SPECIFICATION | frontend/app/login/page.tsx |
| FD-042 | UI_SPECIFICATION | frontend/app/register/page.tsx |
| FD-043 | UI_SPECIFICATION | frontend/components/ui/ |
| FD-044 | UI_SPECIFICATION | frontend/app/loading.tsx, frontend/app/error.tsx |
| FD-045 | UI_SPECIFICATION | frontend/app/globals.css |

## Dependency Graph

```
PRODUCT_VISION --> SYSTEM_ARCHITECTURE --> DATA_MODEL
                                      --> API_CONTRACT
                                      --> SECURITY_MODEL
                   TESTING_STRATEGY <---> UI_SPECIFICATION
```
