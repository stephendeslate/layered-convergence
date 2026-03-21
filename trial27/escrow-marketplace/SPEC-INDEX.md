# Specification Index: Escrow Marketplace

## Document Inventory

| # | Document | Description | VERIFY Tags |
|---|----------|-------------|-------------|
| 1 | [PRODUCT_VISION.md](specs/PRODUCT_VISION.md) | Product vision, users, escrow flow | EM-001 to EM-006 |
| 2 | [SYSTEM_ARCHITECTURE.md](specs/SYSTEM_ARCHITECTURE.md) | Architecture, modules, deployment | EM-007 to EM-013 |
| 3 | [DATA_MODEL.md](specs/DATA_MODEL.md) | Entity definitions, state machines | EM-014 to EM-020 |
| 4 | [API_CONTRACT.md](specs/API_CONTRACT.md) | Endpoints, schemas, validation | EM-021 to EM-024 |
| 5 | [SECURITY_MODEL.md](specs/SECURITY_MODEL.md) | Auth, RLS, threat model | EM-025 to EM-030 |
| 6 | [TESTING_STRATEGY.md](specs/TESTING_STRATEGY.md) | Test pyramid, coverage | EM-031 to EM-035 |
| 7 | [UI_SPECIFICATION.md](specs/UI_SPECIFICATION.md) | Pages, components, accessibility | EM-036 to EM-041 |

## Tag Inventory (41 total)

| Tag | Spec | Traced In |
|-----|------|-----------|
| EM-001 | PRODUCT_VISION | backend/prisma/rls.sql |
| EM-002 | PRODUCT_VISION | backend/src/auth/auth.dto.ts |
| EM-003 | PRODUCT_VISION | backend/src/auth/auth.controller.ts |
| EM-004 | PRODUCT_VISION | backend/src/transaction/transaction.service.ts |
| EM-005 | PRODUCT_VISION | backend/src/dispute/dispute.service.ts |
| EM-006 | PRODUCT_VISION | backend/src/payout/payout.service.ts |
| EM-007 | SYSTEM_ARCHITECTURE | backend/prisma/schema.prisma |
| EM-008 | SYSTEM_ARCHITECTURE | backend/src/transaction/transaction.controller.ts |
| EM-009 | SYSTEM_ARCHITECTURE | backend/src/auth/jwt.strategy.ts |
| EM-010 | SYSTEM_ARCHITECTURE | backend/src/transaction/transaction.service.ts |
| EM-011 | SYSTEM_ARCHITECTURE | frontend/lib/actions.ts |
| EM-012 | SYSTEM_ARCHITECTURE | frontend/app/loading.tsx |
| EM-013 | SYSTEM_ARCHITECTURE | frontend/app/error.tsx |
| EM-014 | DATA_MODEL | backend/prisma/schema.prisma |
| EM-015 | DATA_MODEL | backend/prisma/schema.prisma |
| EM-016 | DATA_MODEL | backend/prisma/schema.prisma |
| EM-017 | DATA_MODEL | backend/prisma/schema.prisma |
| EM-018 | DATA_MODEL | backend/prisma/schema.prisma |
| EM-019 | DATA_MODEL | backend/prisma/schema.prisma |
| EM-020 | DATA_MODEL | backend/prisma/schema.prisma |
| EM-021 | API_CONTRACT | backend/src/auth/auth.controller.ts |
| EM-022 | API_CONTRACT | backend/src/transaction/transaction.controller.ts |
| EM-023 | API_CONTRACT | backend/prisma/schema.prisma |
| EM-024 | API_CONTRACT | backend/src/main.ts |
| EM-025 | SECURITY_MODEL | backend/src/main.ts |
| EM-026 | SECURITY_MODEL | backend/src/auth/auth.service.ts |
| EM-027 | SECURITY_MODEL | backend/src/auth/auth.service.ts |
| EM-028 | SECURITY_MODEL | backend/prisma/rls.sql |
| EM-029 | SECURITY_MODEL | backend/src/transaction/transaction.service.ts |
| EM-030 | SECURITY_MODEL | backend/src/main.ts |
| EM-031 | TESTING_STRATEGY | backend/src/auth/auth.service.spec.ts |
| EM-032 | TESTING_STRATEGY | backend/src/auth/auth.service.spec.ts |
| EM-033 | TESTING_STRATEGY | backend/src/transaction/transaction.service.spec.ts |
| EM-034 | TESTING_STRATEGY | backend/src/dispute/dispute.service.spec.ts |
| EM-035 | TESTING_STRATEGY | backend/src/test/integration.spec.ts |
| EM-036 | UI_SPECIFICATION | frontend/components/nav.tsx |
| EM-037 | UI_SPECIFICATION | frontend/app/layout.tsx |
| EM-038 | UI_SPECIFICATION | frontend/app/register/page.tsx |
| EM-039 | UI_SPECIFICATION | frontend/components/ui/button.tsx |
| EM-040 | UI_SPECIFICATION | frontend/__tests__/accessibility.test.tsx |
| EM-041 | UI_SPECIFICATION | frontend/__tests__/keyboard-navigation.test.tsx |

## Dependency Graph

```
PRODUCT_VISION --> SYSTEM_ARCHITECTURE --> DATA_MODEL
                                      --> API_CONTRACT
                                      --> SECURITY_MODEL
                   TESTING_STRATEGY <---> UI_SPECIFICATION
```
