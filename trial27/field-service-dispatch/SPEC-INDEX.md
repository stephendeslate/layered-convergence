# Specification Index: Field Service Dispatch

## Document Inventory

| # | Document | Description | VERIFY Tags |
|---|----------|-------------|-------------|
| 1 | [PRODUCT_VISION.md](specs/PRODUCT_VISION.md) | Product vision, users, dispatch flow | FD-001 to FD-006 |
| 2 | [SYSTEM_ARCHITECTURE.md](specs/SYSTEM_ARCHITECTURE.md) | Architecture, modules, deployment | FD-007 to FD-013 |
| 3 | [DATA_MODEL.md](specs/DATA_MODEL.md) | Entity definitions, state machines | FD-014 to FD-020, FD-023 |
| 4 | [API_CONTRACT.md](specs/API_CONTRACT.md) | Endpoints, schemas, validation | FD-021 to FD-024 |
| 5 | [SECURITY_MODEL.md](specs/SECURITY_MODEL.md) | Auth, RLS, threat model | FD-025 to FD-030 |
| 6 | [TESTING_STRATEGY.md](specs/TESTING_STRATEGY.md) | Test pyramid, coverage | FD-031 to FD-035 |
| 7 | [UI_SPECIFICATION.md](specs/UI_SPECIFICATION.md) | Pages, components, accessibility | FD-036 to FD-041 |

## Tag Inventory (41 total)

| Tag | Spec | Traced In |
|-----|------|-----------|
| FD-001 | PRODUCT_VISION | backend/prisma/rls.sql |
| FD-002 | PRODUCT_VISION | backend/src/auth/auth.dto.ts |
| FD-003 | PRODUCT_VISION | backend/src/auth/auth.controller.ts |
| FD-004 | PRODUCT_VISION | backend/src/work-order/work-order.service.ts |
| FD-005 | PRODUCT_VISION | backend/src/route/route.service.ts |
| FD-006 | PRODUCT_VISION | backend/src/invoice/invoice.service.ts |
| FD-007 | SYSTEM_ARCHITECTURE | backend/prisma/schema.prisma |
| FD-008 | SYSTEM_ARCHITECTURE | backend/src/work-order/work-order.controller.ts |
| FD-009 | SYSTEM_ARCHITECTURE | backend/src/auth/jwt.strategy.ts |
| FD-010 | SYSTEM_ARCHITECTURE | backend/src/company/company.service.ts |
| FD-011 | SYSTEM_ARCHITECTURE | frontend/lib/actions.ts |
| FD-012 | SYSTEM_ARCHITECTURE | frontend/app/loading.tsx |
| FD-013 | SYSTEM_ARCHITECTURE | frontend/app/error.tsx |
| FD-014 | DATA_MODEL | backend/prisma/schema.prisma |
| FD-015 | DATA_MODEL | backend/prisma/schema.prisma |
| FD-016 | DATA_MODEL | backend/prisma/schema.prisma |
| FD-017 | DATA_MODEL | backend/prisma/schema.prisma |
| FD-018 | DATA_MODEL | backend/prisma/schema.prisma |
| FD-019 | DATA_MODEL | backend/prisma/schema.prisma |
| FD-020 | DATA_MODEL | backend/prisma/schema.prisma |
| FD-021 | API_CONTRACT | backend/src/auth/auth.controller.ts |
| FD-022 | API_CONTRACT | backend/src/work-order/work-order.controller.ts |
| FD-023 | API_CONTRACT | backend/prisma/schema.prisma |
| FD-024 | API_CONTRACT | backend/src/main.ts |
| FD-025 | SECURITY_MODEL | backend/src/main.ts |
| FD-026 | SECURITY_MODEL | backend/src/auth/auth.service.ts |
| FD-027 | SECURITY_MODEL | backend/src/auth/auth.service.ts |
| FD-028 | SECURITY_MODEL | backend/prisma/rls.sql |
| FD-029 | SECURITY_MODEL | backend/src/company/company.service.ts |
| FD-030 | SECURITY_MODEL | backend/src/main.ts |
| FD-031 | TESTING_STRATEGY | backend/src/auth/auth.service.spec.ts |
| FD-032 | TESTING_STRATEGY | backend/src/auth/auth.service.spec.ts |
| FD-033 | TESTING_STRATEGY | backend/src/work-order/work-order.service.spec.ts |
| FD-034 | TESTING_STRATEGY | backend/src/route/route.service.spec.ts |
| FD-035 | TESTING_STRATEGY | backend/src/test/integration.spec.ts |
| FD-036 | UI_SPECIFICATION | frontend/components/nav.tsx |
| FD-037 | UI_SPECIFICATION | frontend/app/layout.tsx |
| FD-038 | UI_SPECIFICATION | frontend/app/register/page.tsx |
| FD-039 | UI_SPECIFICATION | frontend/components/ui/button.tsx |
| FD-040 | UI_SPECIFICATION | frontend/__tests__/accessibility.test.tsx |
| FD-041 | UI_SPECIFICATION | frontend/__tests__/keyboard-navigation.test.tsx |

## Dependency Graph

```
PRODUCT_VISION --> SYSTEM_ARCHITECTURE --> DATA_MODEL
                                      --> API_CONTRACT
                                      --> SECURITY_MODEL
                   TESTING_STRATEGY <---> UI_SPECIFICATION
```
