# Specification Index — Field Service Dispatch

## Tag Inventory

| Tag ID | Spec Document | Description |
|--------|--------------|-------------|
| FD-COMPANY-ISOLATION | PRODUCT_VISION.md | Company model with company_id foreign keys |
| FD-ROLES | PRODUCT_VISION.md | UserRole enum with 4 roles |
| FD-WORKORDER-FSM | PRODUCT_VISION.md | WorkOrder entity with WorkOrderStatus enum |
| FD-ROUTE-FSM | PRODUCT_VISION.md | Route entity with RouteStatus enum |
| FD-INVOICE-FSM | PRODUCT_VISION.md | Invoice entity with InvoiceStatus enum |
| FD-TECHNICIAN-ENTITY | PRODUCT_VISION.md | Technician with specialties and GPS |
| FD-CUSTOMER-ENTITY | PRODUCT_VISION.md | Customer with contact info |
| FD-GPS-ENTITY | PRODUCT_VISION.md | GpsEvent with Decimal coordinates |
| FD-TECH-STACK | PRODUCT_VISION.md | NestJS + Next.js + PostgreSQL |
| FD-SERVER-ACTIONS | SYSTEM_ARCHITECTURE.md | Server Actions with response.ok check |
| FD-VALIDATION-PIPE | SYSTEM_ARCHITECTURE.md | ValidationPipe whitelist + forbidNonWhitelisted |
| FD-EXECUTE-RAW | SYSTEM_ARCHITECTURE.md | $executeRaw with Prisma.sql |
| FD-PRISMA-MAP | SYSTEM_ARCHITECTURE.md | @@map on all models |
| FD-AUTH-FLOW | SYSTEM_ARCHITECTURE.md | AuthService with bcrypt and JWT |
| FD-DOCKERFILE | SYSTEM_ARCHITECTURE.md | Multi-stage Dockerfile with HEALTHCHECK + LABEL |
| FD-CI-PIPELINE | SYSTEM_ARCHITECTURE.md | CI workflow with lint+test+build+typecheck+migration-check |
| FD-RLS | SYSTEM_ARCHITECTURE.md | ENABLE + FORCE ROW LEVEL SECURITY |
| FD-ENV-FAILFAST | SYSTEM_ARCHITECTURE.md | JWT_SECRET and CORS_ORIGIN fail-fast |
| FD-COMPANY-MODEL | DATA_MODEL.md | Company model with slug unique |
| FD-USER-MODEL | DATA_MODEL.md | User model with bcrypt salt 12 |
| FD-WORKORDER-MODEL | DATA_MODEL.md | WorkOrder model with status and priority |
| FD-DECIMAL-FIELDS | DATA_MODEL.md | Decimal type for Invoice.amount and GPS coords |
| FD-GPS-MODEL | DATA_MODEL.md | GpsEvent with Decimal(10,7) coordinates |
| FD-ENUM-MAP | DATA_MODEL.md | All enums have @@map |
| FD-COLUMN-MAP | DATA_MODEL.md | @map on multi-word columns |
| FD-REGISTER-ENDPOINT | API_CONTRACT.md | POST /auth/register with role restriction |
| FD-LOGIN-ENDPOINT | API_CONTRACT.md | POST /auth/login with JWT |
| FD-WORKORDERS-LIST | API_CONTRACT.md | GET /work-orders with company filtering |
| FD-CORS-CONFIG | API_CONTRACT.md | CORS from environment variable |
| FD-BCRYPT-SALT | SECURITY_MODEL.md | bcrypt.hash with salt 12 |
| FD-ADMIN-EXCLUDED | SECURITY_MODEL.md | @IsIn excludes ADMIN |
| FD-RLS-ENFORCEMENT | SECURITY_MODEL.md | ENABLE + FORCE RLS in migration SQL |
| FD-NO-RAW-UNSAFE | SECURITY_MODEL.md | Zero $executeRawUnsafe |
| FD-SECRET-MANAGEMENT | SECURITY_MODEL.md | Environment-based secrets |
| FD-NO-AS-ANY | SECURITY_MODEL.md | Zero as any in codebase |
| FD-NO-CONSOLE-LOG | SECURITY_MODEL.md | Zero console.log in production |
| FD-UNIT-TESTS | TESTING_STRATEGY.md | Service specs with mocked Prisma |
| FD-INTEGRATION-TESTS | TESTING_STRATEGY.md | Supertest + AppModule tests |
| FD-ACCESSIBILITY-TESTS | TESTING_STRATEGY.md | jest-axe with real components |
| FD-KEYBOARD-TESTS | TESTING_STRATEGY.md | userEvent Tab/Enter/Space |
| FD-SEED-TRANSITIONS | TESTING_STRATEGY.md | Seed data with state transitions + CANCELLED/OVERDUE |
| FD-SHADCN-COMPONENTS | UI_SPECIFICATION.md | 8 shadcn components |
| FD-DARK-MODE | UI_SPECIFICATION.md | prefers-color-scheme dark mode |
| FD-CN-UTILITY | UI_SPECIFICATION.md | cn function with clsx + twMerge |
| FD-SKIP-LINK | UI_SPECIFICATION.md | Skip-to-content in layout |
| FD-SELECT-COMPONENT | UI_SPECIFICATION.md | shadcn Select in register |
| FD-LOADING-STATES | UI_SPECIFICATION.md | loading.tsx in all routes |
| FD-ERROR-STATES | UI_SPECIFICATION.md | error.tsx with focus management |
| FD-NAV-ARIA | UI_SPECIFICATION.md | Nav with aria-label |

## Traceability Matrix

| VERIFY Tag | TRACED Location |
|-----------|----------------|
| FD-COMPANY-ISOLATION | <!-- TRACED:FD-COMPANY-ISOLATION --> backend/prisma/schema.prisma (Company model with FK relations) |
| FD-ROLES | <!-- TRACED:FD-ROLES --> backend/prisma/schema.prisma (UserRole enum) |
| FD-WORKORDER-FSM | <!-- TRACED:FD-WORKORDER-FSM --> backend/src/work-order/work-order.service.ts (VALID_TRANSITIONS) |
| FD-ROUTE-FSM | <!-- TRACED:FD-ROUTE-FSM --> backend/src/route/route.service.ts (VALID_TRANSITIONS) |
| FD-INVOICE-FSM | <!-- TRACED:FD-INVOICE-FSM --> backend/src/invoice/invoice.service.ts (VALID_TRANSITIONS) |
| FD-TECHNICIAN-ENTITY | <!-- TRACED:FD-TECHNICIAN-ENTITY --> backend/prisma/schema.prisma (Technician model) |
| FD-CUSTOMER-ENTITY | <!-- TRACED:FD-CUSTOMER-ENTITY --> backend/prisma/schema.prisma (Customer model) |
| FD-GPS-ENTITY | <!-- TRACED:FD-GPS-ENTITY --> backend/prisma/schema.prisma (GpsEvent model with Decimal) |
| FD-TECH-STACK | <!-- TRACED:FD-TECH-STACK --> backend/package.json + frontend/package.json |
| FD-SERVER-ACTIONS | <!-- TRACED:FD-SERVER-ACTIONS --> frontend/lib/actions.ts (response.ok check) |
| FD-VALIDATION-PIPE | <!-- TRACED:FD-VALIDATION-PIPE --> backend/src/main.ts (ValidationPipe config) |
| FD-EXECUTE-RAW | <!-- TRACED:FD-EXECUTE-RAW --> backend/src/work-order/work-order.service.ts ($executeRaw + $queryRaw) |
| FD-PRISMA-MAP | <!-- TRACED:FD-PRISMA-MAP --> backend/prisma/schema.prisma (@@map on all models) |
| FD-AUTH-FLOW | <!-- TRACED:FD-AUTH-FLOW --> backend/src/auth/auth.service.ts (bcrypt + JWT) |
| FD-DOCKERFILE | <!-- TRACED:FD-DOCKERFILE --> backend/Dockerfile (multi-stage + HEALTHCHECK + LABEL) |
| FD-CI-PIPELINE | <!-- TRACED:FD-CI-PIPELINE --> backend/.github/workflows/ci.yml |
| FD-RLS | <!-- TRACED:FD-RLS --> backend/prisma/migrations/00000000000000_init/migration.sql |
| FD-ENV-FAILFAST | <!-- TRACED:FD-ENV-FAILFAST --> backend/src/main.ts (throw on missing env) |
| FD-COMPANY-MODEL | <!-- TRACED:FD-COMPANY-MODEL --> backend/prisma/schema.prisma (Company) |
| FD-USER-MODEL | <!-- TRACED:FD-USER-MODEL --> backend/src/auth/auth.service.ts (bcrypt salt 12) |
| FD-WORKORDER-MODEL | <!-- TRACED:FD-WORKORDER-MODEL --> backend/prisma/schema.prisma (WorkOrder) |
| FD-DECIMAL-FIELDS | <!-- TRACED:FD-DECIMAL-FIELDS --> backend/prisma/schema.prisma (Decimal 20,2 + 10,7) |
| FD-GPS-MODEL | <!-- TRACED:FD-GPS-MODEL --> backend/prisma/schema.prisma (GpsEvent) |
| FD-ENUM-MAP | <!-- TRACED:FD-ENUM-MAP --> backend/prisma/schema.prisma (@@map on enums) |
| FD-COLUMN-MAP | <!-- TRACED:FD-COLUMN-MAP --> backend/prisma/schema.prisma (@map on columns) |
| FD-REGISTER-ENDPOINT | <!-- TRACED:FD-REGISTER-ENDPOINT --> backend/src/auth/auth.controller.ts |
| FD-LOGIN-ENDPOINT | <!-- TRACED:FD-LOGIN-ENDPOINT --> backend/src/auth/auth.controller.ts |
| FD-WORKORDERS-LIST | <!-- TRACED:FD-WORKORDERS-LIST --> backend/src/work-order/work-order.controller.ts |
| FD-CORS-CONFIG | <!-- TRACED:FD-CORS-CONFIG --> backend/src/main.ts (enableCors) |
| FD-BCRYPT-SALT | <!-- TRACED:FD-BCRYPT-SALT --> backend/src/auth/auth.service.ts (salt 12) |
| FD-ADMIN-EXCLUDED | <!-- TRACED:FD-ADMIN-EXCLUDED --> backend/src/auth/dto/register.dto.ts (@IsIn) |
| FD-RLS-ENFORCEMENT | <!-- TRACED:FD-RLS-ENFORCEMENT --> backend/prisma/migrations/00000000000000_init/migration.sql |
| FD-NO-RAW-UNSAFE | <!-- TRACED:FD-NO-RAW-UNSAFE --> codebase-wide (zero occurrences) |
| FD-SECRET-MANAGEMENT | <!-- TRACED:FD-SECRET-MANAGEMENT --> backend/src/app.module.ts (no fallback) |
| FD-NO-AS-ANY | <!-- TRACED:FD-NO-AS-ANY --> codebase-wide (zero occurrences) |
| FD-NO-CONSOLE-LOG | <!-- TRACED:FD-NO-CONSOLE-LOG --> codebase-wide (zero occurrences) |
| FD-UNIT-TESTS | <!-- TRACED:FD-UNIT-TESTS --> backend/src/auth/auth.service.spec.ts + work-order + invoice |
| FD-INTEGRATION-TESTS | <!-- TRACED:FD-INTEGRATION-TESTS --> backend/src/test/integration.spec.ts |
| FD-ACCESSIBILITY-TESTS | <!-- TRACED:FD-ACCESSIBILITY-TESTS --> frontend/__tests__/accessibility.test.tsx |
| FD-KEYBOARD-TESTS | <!-- TRACED:FD-KEYBOARD-TESTS --> frontend/__tests__/keyboard-navigation.test.tsx |
| FD-SEED-TRANSITIONS | <!-- TRACED:FD-SEED-TRANSITIONS --> backend/prisma/seed.ts |
| FD-SHADCN-COMPONENTS | <!-- TRACED:FD-SHADCN-COMPONENTS --> frontend/components/ui/ (8 files) |
| FD-DARK-MODE | <!-- TRACED:FD-DARK-MODE --> frontend/app/globals.css |
| FD-CN-UTILITY | <!-- TRACED:FD-CN-UTILITY --> frontend/lib/utils.ts |
| FD-SKIP-LINK | <!-- TRACED:FD-SKIP-LINK --> frontend/app/layout.tsx |
| FD-SELECT-COMPONENT | <!-- TRACED:FD-SELECT-COMPONENT --> frontend/app/register/page.tsx |
| FD-LOADING-STATES | <!-- TRACED:FD-LOADING-STATES --> frontend/app/**/loading.tsx |
| FD-ERROR-STATES | <!-- TRACED:FD-ERROR-STATES --> frontend/app/**/error.tsx |
| FD-NAV-ARIA | <!-- TRACED:FD-NAV-ARIA --> frontend/components/nav.tsx |

## Summary
- Total VERIFY tags: 49
- Total TRACED tags: 49
- Orphaned VERIFY tags: 0
- Orphaned TRACED tags: 0
