# Specification Index — Escrow Marketplace

## Tag Inventory

| Tag ID | Spec Document | Description |
|--------|--------------|-------------|
| EM-TRANSACTION-FSM | PRODUCT_VISION.md | Transaction entity with TransactionStatus enum |
| EM-DISPUTE-FSM | PRODUCT_VISION.md | Dispute entity with DisputeStatus enum |
| EM-PAYOUT-MODEL | PRODUCT_VISION.md | Payout entity with Decimal amounts |
| EM-WEBHOOK-MODEL | PRODUCT_VISION.md | Webhook entity for notifications |
| EM-ROLES | PRODUCT_VISION.md | UserRole enum with 4 roles |
| EM-TECH-STACK | PRODUCT_VISION.md | NestJS + Next.js + PostgreSQL |
| EM-SERVER-ACTIONS | SYSTEM_ARCHITECTURE.md | Server Actions with response.ok |
| EM-VALIDATION-PIPE | SYSTEM_ARCHITECTURE.md | ValidationPipe whitelist + forbidNonWhitelisted |
| EM-EXECUTE-RAW | SYSTEM_ARCHITECTURE.md | $executeRaw with Prisma.sql |
| EM-PRISMA-MAP | SYSTEM_ARCHITECTURE.md | @@map on all models |
| EM-AUTH-FLOW | SYSTEM_ARCHITECTURE.md | AuthService bcrypt + JWT |
| EM-DOCKERFILE | SYSTEM_ARCHITECTURE.md | Multi-stage Dockerfile + HEALTHCHECK |
| EM-CI-PIPELINE | SYSTEM_ARCHITECTURE.md | CI with migration-check |
| EM-RLS | SYSTEM_ARCHITECTURE.md | FORCE RLS on all tables |
| EM-ENV-FAILFAST | SYSTEM_ARCHITECTURE.md | Fail-fast env checks |
| EM-USER-MODEL | DATA_MODEL.md | User model with bcrypt salt 12 |
| EM-TRANSACTION-MODEL | DATA_MODEL.md | Transaction with Decimal amount |
| EM-DISPUTE-MODEL | DATA_MODEL.md | Dispute with arbiter relation |
| EM-DECIMAL-FIELDS | DATA_MODEL.md | Decimal for monetary fields |
| EM-ENUM-MAP | DATA_MODEL.md | All enums have @@map |
| EM-COLUMN-MAP | DATA_MODEL.md | @map on multi-word columns |
| EM-REGISTER-ENDPOINT | API_CONTRACT.md | POST /auth/register with restriction |
| EM-LOGIN-ENDPOINT | API_CONTRACT.md | POST /auth/login with JWT |
| EM-TRANSACTIONS-LIST | API_CONTRACT.md | GET /transactions endpoint |
| EM-CORS-CONFIG | API_CONTRACT.md | CORS from env variable |
| EM-BCRYPT-SALT | SECURITY_MODEL.md | bcrypt salt 12 |
| EM-ADMIN-EXCLUDED | SECURITY_MODEL.md | @IsIn excludes ADMIN |
| EM-RLS-ENFORCEMENT | SECURITY_MODEL.md | FORCE RLS in migration |
| EM-NO-RAW-UNSAFE | SECURITY_MODEL.md | Zero $executeRawUnsafe |
| EM-SECRET-MANAGEMENT | SECURITY_MODEL.md | Env-based secrets |
| EM-NO-AS-ANY | SECURITY_MODEL.md | Zero as any |
| EM-NO-CONSOLE-LOG | SECURITY_MODEL.md | Zero console.log |
| EM-UNIT-TESTS | TESTING_STRATEGY.md | Service specs mocked Prisma |
| EM-INTEGRATION-TESTS | TESTING_STRATEGY.md | Supertest + AppModule |
| EM-ACCESSIBILITY-TESTS | TESTING_STRATEGY.md | jest-axe real components |
| EM-KEYBOARD-TESTS | TESTING_STRATEGY.md | userEvent tests |
| EM-SEED-TRANSITIONS | TESTING_STRATEGY.md | Seed 2+ transitions |
| EM-SHADCN-COMPONENTS | UI_SPECIFICATION.md | 8 shadcn components |
| EM-DARK-MODE | UI_SPECIFICATION.md | prefers-color-scheme |
| EM-CN-UTILITY | UI_SPECIFICATION.md | cn with clsx + twMerge |
| EM-SKIP-LINK | UI_SPECIFICATION.md | Skip-to-content |
| EM-SELECT-COMPONENT | UI_SPECIFICATION.md | shadcn Select in register |
| EM-LOADING-STATES | UI_SPECIFICATION.md | loading.tsx all routes |
| EM-ERROR-STATES | UI_SPECIFICATION.md | error.tsx with focus |
| EM-NAV-ARIA | UI_SPECIFICATION.md | Nav aria-label |

## Traceability Matrix

| VERIFY Tag | TRACED Location |
|-----------|----------------|
| EM-TRANSACTION-FSM | <!-- TRACED:EM-TRANSACTION-FSM --> backend/prisma/schema.prisma (TransactionStatus enum) |
| EM-DISPUTE-FSM | <!-- TRACED:EM-DISPUTE-FSM --> backend/prisma/schema.prisma (DisputeStatus enum) |
| EM-PAYOUT-MODEL | <!-- TRACED:EM-PAYOUT-MODEL --> backend/prisma/schema.prisma (Payout model) |
| EM-WEBHOOK-MODEL | <!-- TRACED:EM-WEBHOOK-MODEL --> backend/prisma/schema.prisma (Webhook model) |
| EM-ROLES | <!-- TRACED:EM-ROLES --> backend/prisma/schema.prisma (UserRole enum) |
| EM-TECH-STACK | <!-- TRACED:EM-TECH-STACK --> backend/package.json + frontend/package.json |
| EM-SERVER-ACTIONS | <!-- TRACED:EM-SERVER-ACTIONS --> frontend/lib/actions.ts (response.ok check) |
| EM-VALIDATION-PIPE | <!-- TRACED:EM-VALIDATION-PIPE --> backend/src/main.ts (ValidationPipe) |
| EM-EXECUTE-RAW | <!-- TRACED:EM-EXECUTE-RAW --> backend/src/transaction/transaction.service.ts |
| EM-PRISMA-MAP | <!-- TRACED:EM-PRISMA-MAP --> backend/prisma/schema.prisma (@@map all models) |
| EM-AUTH-FLOW | <!-- TRACED:EM-AUTH-FLOW --> backend/src/auth/auth.service.ts |
| EM-DOCKERFILE | <!-- TRACED:EM-DOCKERFILE --> backend/Dockerfile (multi-stage + HEALTHCHECK) |
| EM-CI-PIPELINE | <!-- TRACED:EM-CI-PIPELINE --> backend/.github/workflows/ci.yml |
| EM-RLS | <!-- TRACED:EM-RLS --> backend/prisma/migrations/00000000000000_init/migration.sql |
| EM-ENV-FAILFAST | <!-- TRACED:EM-ENV-FAILFAST --> backend/src/main.ts (fail-fast checks) |
| EM-USER-MODEL | <!-- TRACED:EM-USER-MODEL --> backend/src/auth/auth.service.ts (bcrypt 12) |
| EM-TRANSACTION-MODEL | <!-- TRACED:EM-TRANSACTION-MODEL --> backend/prisma/schema.prisma |
| EM-DISPUTE-MODEL | <!-- TRACED:EM-DISPUTE-MODEL --> backend/prisma/schema.prisma |
| EM-DECIMAL-FIELDS | <!-- TRACED:EM-DECIMAL-FIELDS --> backend/prisma/schema.prisma (Decimal(20,2)) |
| EM-ENUM-MAP | <!-- TRACED:EM-ENUM-MAP --> backend/prisma/schema.prisma (@@map on enums) |
| EM-COLUMN-MAP | <!-- TRACED:EM-COLUMN-MAP --> backend/prisma/schema.prisma (@map columns) |
| EM-REGISTER-ENDPOINT | <!-- TRACED:EM-REGISTER-ENDPOINT --> backend/src/auth/auth.controller.ts |
| EM-LOGIN-ENDPOINT | <!-- TRACED:EM-LOGIN-ENDPOINT --> backend/src/auth/auth.controller.ts |
| EM-TRANSACTIONS-LIST | <!-- TRACED:EM-TRANSACTIONS-LIST --> backend/src/transaction/transaction.controller.ts |
| EM-CORS-CONFIG | <!-- TRACED:EM-CORS-CONFIG --> backend/src/main.ts (enableCors) |
| EM-BCRYPT-SALT | <!-- TRACED:EM-BCRYPT-SALT --> backend/src/auth/auth.service.ts |
| EM-ADMIN-EXCLUDED | <!-- TRACED:EM-ADMIN-EXCLUDED --> backend/src/auth/dto/register.dto.ts (@IsIn) |
| EM-RLS-ENFORCEMENT | <!-- TRACED:EM-RLS-ENFORCEMENT --> backend/prisma/migrations/00000000000000_init/migration.sql |
| EM-NO-RAW-UNSAFE | <!-- TRACED:EM-NO-RAW-UNSAFE --> verified codebase search (zero matches) |
| EM-SECRET-MANAGEMENT | <!-- TRACED:EM-SECRET-MANAGEMENT --> backend/src/main.ts + .env.example |
| EM-NO-AS-ANY | <!-- TRACED:EM-NO-AS-ANY --> verified codebase search (zero matches) |
| EM-NO-CONSOLE-LOG | <!-- TRACED:EM-NO-CONSOLE-LOG --> verified codebase search (zero matches) |
| EM-UNIT-TESTS | <!-- TRACED:EM-UNIT-TESTS --> backend/src/transaction/transaction.service.spec.ts |
| EM-INTEGRATION-TESTS | <!-- TRACED:EM-INTEGRATION-TESTS --> backend/src/test/integration.spec.ts |
| EM-ACCESSIBILITY-TESTS | <!-- TRACED:EM-ACCESSIBILITY-TESTS --> frontend/__tests__/accessibility.test.tsx |
| EM-KEYBOARD-TESTS | <!-- TRACED:EM-KEYBOARD-TESTS --> frontend/__tests__/keyboard-navigation.test.tsx |
| EM-SEED-TRANSITIONS | <!-- TRACED:EM-SEED-TRANSITIONS --> backend/prisma/seed.ts |
| EM-SHADCN-COMPONENTS | <!-- TRACED:EM-SHADCN-COMPONENTS --> frontend/components/ui/ (8 files) |
| EM-DARK-MODE | <!-- TRACED:EM-DARK-MODE --> frontend/app/globals.css |
| EM-CN-UTILITY | <!-- TRACED:EM-CN-UTILITY --> frontend/lib/utils.ts |
| EM-SKIP-LINK | <!-- TRACED:EM-SKIP-LINK --> frontend/app/layout.tsx |
| EM-SELECT-COMPONENT | <!-- TRACED:EM-SELECT-COMPONENT --> frontend/app/register/page.tsx |
| EM-LOADING-STATES | <!-- TRACED:EM-LOADING-STATES --> frontend/app/*/loading.tsx (4 files) |
| EM-ERROR-STATES | <!-- TRACED:EM-ERROR-STATES --> frontend/app/*/error.tsx (4 files) |
| EM-NAV-ARIA | <!-- TRACED:EM-NAV-ARIA --> frontend/components/nav.tsx |

**Total VERIFY tags: 45**
**Total TRACED tags: 45**
**Orphaned VERIFY tags: 0**
**Orphaned TRACED tags: 0**
