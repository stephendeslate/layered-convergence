# Specification Index — Field Service Dispatch

## Tag Inventory

| Tag ID | Spec Document | Description |
|--------|--------------|-------------|
| FSD-WORKORDER-FSM | PRODUCT_VISION.md | WorkOrder entity with WorkOrderStatus enum |
| FSD-PRIORITY-ENUM | PRODUCT_VISION.md | Priority enum with 4 levels |
| FSD-ROLES | PRODUCT_VISION.md | UserRole enum with 4 roles |
| FSD-SCHEDULE-MODEL | PRODUCT_VISION.md | Schedule entity with day/time windows |
| FSD-EQUIPMENT-MODEL | PRODUCT_VISION.md | Equipment entity with serial tracking |
| FSD-TECH-STACK | PRODUCT_VISION.md | NestJS + Next.js + PostgreSQL |
| FSD-VALIDATION-PIPE | SYSTEM_ARCHITECTURE.md | ValidationPipe whitelist + forbidNonWhitelisted |
| FSD-EXECUTE-RAW | SYSTEM_ARCHITECTURE.md | $executeRaw with Prisma.sql |
| FSD-PRISMA-MAP | SYSTEM_ARCHITECTURE.md | @@map on all models |
| FSD-AUTH-FLOW | SYSTEM_ARCHITECTURE.md | AuthService with bcrypt and JWT |
| FSD-SERVER-ACTIONS | SYSTEM_ARCHITECTURE.md | Server Actions with response.ok check |
| FSD-DOCKERFILE | SYSTEM_ARCHITECTURE.md | Multi-stage Dockerfile with HEALTHCHECK |
| FSD-CI-PIPELINE | SYSTEM_ARCHITECTURE.md | CI workflow with migration-check |
| FSD-RLS | SYSTEM_ARCHITECTURE.md | ENABLE + FORCE ROW LEVEL SECURITY |
| FSD-ENV-FAILFAST | SYSTEM_ARCHITECTURE.md | JWT_SECRET and CORS_ORIGIN fail-fast |
| FSD-USER-MODEL | DATA_MODEL.md | User model with bcrypt salt 12 |
| FSD-CUSTOMER-MODEL | DATA_MODEL.md | Customer model with address |
| FSD-SERVICEAREA-MODEL | DATA_MODEL.md | ServiceArea model with zip codes |
| FSD-WORKORDER-MODEL | DATA_MODEL.md | WorkOrder model with Decimal cost fields |
| FSD-ENUM-MAP | DATA_MODEL.md | All enums have @@map |
| FSD-COLUMN-MAP | DATA_MODEL.md | @map on multi-word columns |
| FSD-DECIMAL-FIELDS | DATA_MODEL.md | Decimal type for cost fields |
| FSD-REGISTER-ENDPOINT | API_CONTRACT.md | POST /auth/register with role restriction |
| FSD-LOGIN-ENDPOINT | API_CONTRACT.md | POST /auth/login with JWT |
| FSD-WORKORDERS-LIST | API_CONTRACT.md | GET /work-orders with technician filtering |
| FSD-CORS-CONFIG | API_CONTRACT.md | CORS from environment variable |
| FSD-BCRYPT-SALT | SECURITY_MODEL.md | bcrypt.hash with salt 12 |
| FSD-ADMIN-EXCLUDED | SECURITY_MODEL.md | @IsIn excludes ADMIN |
| FSD-RLS-ENFORCEMENT | SECURITY_MODEL.md | ENABLE + FORCE RLS in migration SQL |
| FSD-NO-RAW-UNSAFE | SECURITY_MODEL.md | Zero $executeRawUnsafe |
| FSD-SECRET-MANAGEMENT | SECURITY_MODEL.md | Environment-based secrets |
| FSD-NO-AS-ANY | SECURITY_MODEL.md | Zero as any in codebase |
| FSD-NO-CONSOLE-LOG | SECURITY_MODEL.md | Zero console.log in production |
| FSD-UNIT-TESTS | TESTING_STRATEGY.md | Service specs with mocked Prisma |
| FSD-INTEGRATION-TESTS | TESTING_STRATEGY.md | Supertest + AppModule tests |
| FSD-ACCESSIBILITY-TESTS | TESTING_STRATEGY.md | jest-axe with real components |
| FSD-KEYBOARD-TESTS | TESTING_STRATEGY.md | userEvent Tab/Enter/Space |
| FSD-SEED-TRANSITIONS | TESTING_STRATEGY.md | Seed data with 2+ transitions |
| FSD-SHADCN-COMPONENTS | UI_SPECIFICATION.md | 8 shadcn components |
| FSD-DARK-MODE | UI_SPECIFICATION.md | prefers-color-scheme dark mode |
| FSD-CN-UTILITY | UI_SPECIFICATION.md | cn function with clsx + twMerge |
| FSD-SKIP-LINK | UI_SPECIFICATION.md | Skip-to-content in layout |
| FSD-SELECT-COMPONENT | UI_SPECIFICATION.md | shadcn Select in register |
| FSD-LOADING-STATES | UI_SPECIFICATION.md | loading.tsx in all routes |
| FSD-ERROR-STATES | UI_SPECIFICATION.md | error.tsx with focus management |
| FSD-NAV-ARIA | UI_SPECIFICATION.md | Nav with aria-label |

## Traceability Matrix

| VERIFY Tag | TRACED Location |
|-----------|----------------|
| FSD-WORKORDER-FSM | <!-- TRACED:FSD-WORKORDER-FSM --> backend/src/work-order/work-order.service.ts (VALID_TRANSITIONS map) |
| FSD-PRIORITY-ENUM | <!-- TRACED:FSD-PRIORITY-ENUM --> backend/prisma/schema.prisma (Priority enum) |
| FSD-ROLES | <!-- TRACED:FSD-ROLES --> backend/prisma/schema.prisma (UserRole enum) |
| FSD-SCHEDULE-MODEL | <!-- TRACED:FSD-SCHEDULE-MODEL --> backend/prisma/schema.prisma (Schedule model) |
| FSD-EQUIPMENT-MODEL | <!-- TRACED:FSD-EQUIPMENT-MODEL --> backend/prisma/schema.prisma (Equipment model) |
| FSD-TECH-STACK | <!-- TRACED:FSD-TECH-STACK --> backend/package.json + frontend/package.json |
| FSD-VALIDATION-PIPE | <!-- TRACED:FSD-VALIDATION-PIPE --> backend/src/main.ts (ValidationPipe config) |
| FSD-EXECUTE-RAW | <!-- TRACED:FSD-EXECUTE-RAW --> backend/src/work-order/work-order.service.ts ($executeRaw) |
| FSD-PRISMA-MAP | <!-- TRACED:FSD-PRISMA-MAP --> backend/prisma/schema.prisma (@@map on all models) |
| FSD-AUTH-FLOW | <!-- TRACED:FSD-AUTH-FLOW --> backend/src/auth/auth.service.ts (bcrypt + JWT) |
| FSD-SERVER-ACTIONS | <!-- TRACED:FSD-SERVER-ACTIONS --> frontend/lib/actions.ts (response.ok check) |
| FSD-DOCKERFILE | <!-- TRACED:FSD-DOCKERFILE --> backend/Dockerfile (multi-stage + HEALTHCHECK) |
| FSD-CI-PIPELINE | <!-- TRACED:FSD-CI-PIPELINE --> backend/.github/workflows/ci.yml |
| FSD-RLS | <!-- TRACED:FSD-RLS --> backend/prisma/migrations/00000000000000_init/migration.sql |
| FSD-ENV-FAILFAST | <!-- TRACED:FSD-ENV-FAILFAST --> backend/src/main.ts (throw on missing env) |
| FSD-USER-MODEL | <!-- TRACED:FSD-USER-MODEL --> backend/src/auth/auth.service.ts (bcrypt salt 12) |
| FSD-CUSTOMER-MODEL | <!-- TRACED:FSD-CUSTOMER-MODEL --> backend/prisma/schema.prisma (Customer model) |
| FSD-SERVICEAREA-MODEL | <!-- TRACED:FSD-SERVICEAREA-MODEL --> backend/prisma/schema.prisma (ServiceArea) |
| FSD-WORKORDER-MODEL | <!-- TRACED:FSD-WORKORDER-MODEL --> backend/prisma/schema.prisma (WorkOrder) |
| FSD-ENUM-MAP | <!-- TRACED:FSD-ENUM-MAP --> backend/prisma/schema.prisma (@@map on enums) |
| FSD-COLUMN-MAP | <!-- TRACED:FSD-COLUMN-MAP --> backend/prisma/schema.prisma (@map on columns) |
| FSD-DECIMAL-FIELDS | <!-- TRACED:FSD-DECIMAL-FIELDS --> backend/prisma/schema.prisma (Decimal 20,2) |
| FSD-REGISTER-ENDPOINT | <!-- TRACED:FSD-REGISTER-ENDPOINT --> backend/src/auth/auth.controller.ts |
| FSD-LOGIN-ENDPOINT | <!-- TRACED:FSD-LOGIN-ENDPOINT --> backend/src/auth/auth.controller.ts |
| FSD-WORKORDERS-LIST | <!-- TRACED:FSD-WORKORDERS-LIST --> backend/src/work-order/work-order.controller.ts |
| FSD-CORS-CONFIG | <!-- TRACED:FSD-CORS-CONFIG --> backend/src/main.ts (enableCors) |
| FSD-BCRYPT-SALT | <!-- TRACED:FSD-BCRYPT-SALT --> backend/src/auth/auth.service.ts (salt 12) |
| FSD-ADMIN-EXCLUDED | <!-- TRACED:FSD-ADMIN-EXCLUDED --> backend/src/auth/dto/register.dto.ts (@IsIn) |
| FSD-RLS-ENFORCEMENT | <!-- TRACED:FSD-RLS-ENFORCEMENT --> backend/prisma/migrations/00000000000000_init/migration.sql |
| FSD-NO-RAW-UNSAFE | <!-- TRACED:FSD-NO-RAW-UNSAFE --> codebase-wide (zero occurrences) |
| FSD-SECRET-MANAGEMENT | <!-- TRACED:FSD-SECRET-MANAGEMENT --> backend/src/app.module.ts (no fallback) |
| FSD-NO-AS-ANY | <!-- TRACED:FSD-NO-AS-ANY --> codebase-wide (zero occurrences) |
| FSD-NO-CONSOLE-LOG | <!-- TRACED:FSD-NO-CONSOLE-LOG --> codebase-wide (zero occurrences) |
| FSD-UNIT-TESTS | <!-- TRACED:FSD-UNIT-TESTS --> backend/src/auth/auth.service.spec.ts + work-order + schedule |
| FSD-INTEGRATION-TESTS | <!-- TRACED:FSD-INTEGRATION-TESTS --> backend/src/test/integration.spec.ts |
| FSD-ACCESSIBILITY-TESTS | <!-- TRACED:FSD-ACCESSIBILITY-TESTS --> frontend/__tests__/accessibility.test.tsx |
| FSD-KEYBOARD-TESTS | <!-- TRACED:FSD-KEYBOARD-TESTS --> frontend/__tests__/keyboard-navigation.test.tsx |
| FSD-SEED-TRANSITIONS | <!-- TRACED:FSD-SEED-TRANSITIONS --> backend/prisma/seed.ts |
| FSD-SHADCN-COMPONENTS | <!-- TRACED:FSD-SHADCN-COMPONENTS --> frontend/components/ui/ (8 files) |
| FSD-DARK-MODE | <!-- TRACED:FSD-DARK-MODE --> frontend/app/globals.css |
| FSD-CN-UTILITY | <!-- TRACED:FSD-CN-UTILITY --> frontend/lib/utils.ts |
| FSD-SKIP-LINK | <!-- TRACED:FSD-SKIP-LINK --> frontend/app/layout.tsx |
| FSD-SELECT-COMPONENT | <!-- TRACED:FSD-SELECT-COMPONENT --> frontend/app/register/page.tsx |
| FSD-LOADING-STATES | <!-- TRACED:FSD-LOADING-STATES --> frontend/app/**/loading.tsx |
| FSD-ERROR-STATES | <!-- TRACED:FSD-ERROR-STATES --> frontend/app/**/error.tsx |
| FSD-NAV-ARIA | <!-- TRACED:FSD-NAV-ARIA --> frontend/components/nav.tsx |

## Summary
- Total VERIFY tags: 46
- Total TRACED tags: 46
- Orphaned VERIFY tags: 0
- Orphaned TRACED tags: 0
