# Specification Index — Analytics Engine

## Tag Inventory

| Tag ID | Spec Document | Description |
|--------|--------------|-------------|
| AE-TENANT-ISOLATION | PRODUCT_VISION.md | Tenant model with tenant_id foreign keys |
| AE-PIPELINE-FSM | PRODUCT_VISION.md | Pipeline entity with PipelineStatus enum |
| AE-SYNCRUN-FSM | PRODUCT_VISION.md | SyncRun entity with SyncRunStatus enum |
| AE-EMBED-TOKEN | PRODUCT_VISION.md | Embed entity with token and expiresAt |
| AE-ROLES | PRODUCT_VISION.md | UserRole enum with 4 roles |
| AE-TECH-STACK | PRODUCT_VISION.md | NestJS + Next.js + PostgreSQL |
| AE-SERVER-ACTIONS | SYSTEM_ARCHITECTURE.md | Server Actions with response.ok check |
| AE-VALIDATION-PIPE | SYSTEM_ARCHITECTURE.md | ValidationPipe whitelist + forbidNonWhitelisted |
| AE-EXECUTE-RAW | SYSTEM_ARCHITECTURE.md | $executeRaw with Prisma.sql |
| AE-PRISMA-MAP | SYSTEM_ARCHITECTURE.md | @@map on all models |
| AE-AUTH-FLOW | SYSTEM_ARCHITECTURE.md | AuthService with bcrypt and JWT |
| AE-DOCKERFILE | SYSTEM_ARCHITECTURE.md | Multi-stage Dockerfile with HEALTHCHECK + LABEL |
| AE-CI-PIPELINE | SYSTEM_ARCHITECTURE.md | CI workflow with lint+test+build+typecheck+migration-check |
| AE-RLS | SYSTEM_ARCHITECTURE.md | ENABLE + FORCE ROW LEVEL SECURITY |
| AE-ENV-FAILFAST | SYSTEM_ARCHITECTURE.md | JWT_SECRET and CORS_ORIGIN fail-fast |
| AE-TENANT-MODEL | DATA_MODEL.md | Tenant model with slug unique |
| AE-USER-MODEL | DATA_MODEL.md | User model with bcrypt salt 12 |
| AE-DATASOURCE-MODEL | DATA_MODEL.md | DataSource model with tenant scope |
| AE-DECIMAL-FIELDS | DATA_MODEL.md | Decimal type for DataPoint.value |
| AE-PIPELINE-MODEL | DATA_MODEL.md | Pipeline model with PipelineStatus |
| AE-ENUM-MAP | DATA_MODEL.md | All enums have @@map |
| AE-COLUMN-MAP | DATA_MODEL.md | @map on multi-word columns |
| AE-REGISTER-ENDPOINT | API_CONTRACT.md | POST /auth/register with role restriction |
| AE-LOGIN-ENDPOINT | API_CONTRACT.md | POST /auth/login with JWT |
| AE-PIPELINES-LIST | API_CONTRACT.md | GET /pipelines with tenant filtering |
| AE-CORS-CONFIG | API_CONTRACT.md | CORS from environment variable |
| AE-BCRYPT-SALT | SECURITY_MODEL.md | bcrypt.hash with salt 12 |
| AE-ADMIN-EXCLUDED | SECURITY_MODEL.md | @IsIn excludes ADMIN |
| AE-RLS-ENFORCEMENT | SECURITY_MODEL.md | ENABLE + FORCE RLS in migration SQL |
| AE-NO-RAW-UNSAFE | SECURITY_MODEL.md | Zero $executeRawUnsafe |
| AE-SECRET-MANAGEMENT | SECURITY_MODEL.md | Environment-based secrets |
| AE-NO-AS-ANY | SECURITY_MODEL.md | Zero as any in codebase |
| AE-NO-CONSOLE-LOG | SECURITY_MODEL.md | Zero console.log in production |
| AE-UNIT-TESTS | TESTING_STRATEGY.md | Service specs with mocked Prisma |
| AE-INTEGRATION-TESTS | TESTING_STRATEGY.md | Supertest + AppModule tests |
| AE-ACCESSIBILITY-TESTS | TESTING_STRATEGY.md | jest-axe with real components |
| AE-KEYBOARD-TESTS | TESTING_STRATEGY.md | userEvent Tab/Enter/Space |
| AE-SEED-TRANSITIONS | TESTING_STRATEGY.md | Seed data with state transitions + FAILED |
| AE-SHADCN-COMPONENTS | UI_SPECIFICATION.md | 8 shadcn components |
| AE-DARK-MODE | UI_SPECIFICATION.md | prefers-color-scheme dark mode |
| AE-CN-UTILITY | UI_SPECIFICATION.md | cn function with clsx + twMerge |
| AE-SKIP-LINK | UI_SPECIFICATION.md | Skip-to-content in layout |
| AE-SELECT-COMPONENT | UI_SPECIFICATION.md | shadcn Select in register |
| AE-LOADING-STATES | UI_SPECIFICATION.md | loading.tsx in all routes |
| AE-ERROR-STATES | UI_SPECIFICATION.md | error.tsx with focus management |
| AE-NAV-ARIA | UI_SPECIFICATION.md | Nav with aria-label |

## Traceability Matrix

| VERIFY Tag | TRACED Location |
|-----------|----------------|
| AE-TENANT-ISOLATION | <!-- TRACED:AE-TENANT-ISOLATION --> backend/prisma/schema.prisma (Tenant model with FK relations) |
| AE-PIPELINE-FSM | <!-- TRACED:AE-PIPELINE-FSM --> backend/prisma/schema.prisma (PipelineStatus enum) |
| AE-SYNCRUN-FSM | <!-- TRACED:AE-SYNCRUN-FSM --> backend/prisma/schema.prisma (SyncRunStatus enum) |
| AE-EMBED-TOKEN | <!-- TRACED:AE-EMBED-TOKEN --> backend/prisma/schema.prisma (Embed model with token + expiresAt) |
| AE-ROLES | <!-- TRACED:AE-ROLES --> backend/prisma/schema.prisma (UserRole enum) |
| AE-TECH-STACK | <!-- TRACED:AE-TECH-STACK --> backend/package.json + frontend/package.json |
| AE-SERVER-ACTIONS | <!-- TRACED:AE-SERVER-ACTIONS --> frontend/lib/actions.ts (response.ok check) |
| AE-VALIDATION-PIPE | <!-- TRACED:AE-VALIDATION-PIPE --> backend/src/main.ts (ValidationPipe config) |
| AE-EXECUTE-RAW | <!-- TRACED:AE-EXECUTE-RAW --> backend/src/pipeline/pipeline.service.ts ($executeRaw) |
| AE-PRISMA-MAP | <!-- TRACED:AE-PRISMA-MAP --> backend/prisma/schema.prisma (@@map on all models) |
| AE-AUTH-FLOW | <!-- TRACED:AE-AUTH-FLOW --> backend/src/auth/auth.service.ts (bcrypt + JWT) |
| AE-DOCKERFILE | <!-- TRACED:AE-DOCKERFILE --> backend/Dockerfile (multi-stage + HEALTHCHECK + LABEL) |
| AE-CI-PIPELINE | <!-- TRACED:AE-CI-PIPELINE --> backend/.github/workflows/ci.yml |
| AE-RLS | <!-- TRACED:AE-RLS --> backend/prisma/migrations/00000000000000_init/migration.sql |
| AE-ENV-FAILFAST | <!-- TRACED:AE-ENV-FAILFAST --> backend/src/main.ts (throw on missing env) |
| AE-TENANT-MODEL | <!-- TRACED:AE-TENANT-MODEL --> backend/prisma/schema.prisma (Tenant) |
| AE-USER-MODEL | <!-- TRACED:AE-USER-MODEL --> backend/src/auth/auth.service.ts (bcrypt salt 12) |
| AE-DATASOURCE-MODEL | <!-- TRACED:AE-DATASOURCE-MODEL --> backend/prisma/schema.prisma (DataSource) |
| AE-DECIMAL-FIELDS | <!-- TRACED:AE-DECIMAL-FIELDS --> backend/prisma/schema.prisma (Decimal 20,6) |
| AE-PIPELINE-MODEL | <!-- TRACED:AE-PIPELINE-MODEL --> backend/prisma/schema.prisma (Pipeline) |
| AE-ENUM-MAP | <!-- TRACED:AE-ENUM-MAP --> backend/prisma/schema.prisma (@@map on enums) |
| AE-COLUMN-MAP | <!-- TRACED:AE-COLUMN-MAP --> backend/prisma/schema.prisma (@map on columns) |
| AE-REGISTER-ENDPOINT | <!-- TRACED:AE-REGISTER-ENDPOINT --> backend/src/auth/auth.controller.ts |
| AE-LOGIN-ENDPOINT | <!-- TRACED:AE-LOGIN-ENDPOINT --> backend/src/auth/auth.controller.ts |
| AE-PIPELINES-LIST | <!-- TRACED:AE-PIPELINES-LIST --> backend/src/pipeline/pipeline.controller.ts |
| AE-CORS-CONFIG | <!-- TRACED:AE-CORS-CONFIG --> backend/src/main.ts (enableCors) |
| AE-BCRYPT-SALT | <!-- TRACED:AE-BCRYPT-SALT --> backend/src/auth/auth.service.ts (salt 12) |
| AE-ADMIN-EXCLUDED | <!-- TRACED:AE-ADMIN-EXCLUDED --> backend/src/auth/dto/register.dto.ts (@IsIn) |
| AE-RLS-ENFORCEMENT | <!-- TRACED:AE-RLS-ENFORCEMENT --> backend/prisma/migrations/00000000000000_init/migration.sql |
| AE-NO-RAW-UNSAFE | <!-- TRACED:AE-NO-RAW-UNSAFE --> codebase-wide (zero occurrences) |
| AE-SECRET-MANAGEMENT | <!-- TRACED:AE-SECRET-MANAGEMENT --> backend/src/app.module.ts (no fallback) |
| AE-NO-AS-ANY | <!-- TRACED:AE-NO-AS-ANY --> codebase-wide (zero occurrences) |
| AE-NO-CONSOLE-LOG | <!-- TRACED:AE-NO-CONSOLE-LOG --> codebase-wide (zero occurrences) |
| AE-UNIT-TESTS | <!-- TRACED:AE-UNIT-TESTS --> backend/src/auth/auth.service.spec.ts + pipeline + dashboard |
| AE-INTEGRATION-TESTS | <!-- TRACED:AE-INTEGRATION-TESTS --> backend/src/test/integration.spec.ts |
| AE-ACCESSIBILITY-TESTS | <!-- TRACED:AE-ACCESSIBILITY-TESTS --> frontend/__tests__/accessibility.test.tsx |
| AE-KEYBOARD-TESTS | <!-- TRACED:AE-KEYBOARD-TESTS --> frontend/__tests__/keyboard-navigation.test.tsx |
| AE-SEED-TRANSITIONS | <!-- TRACED:AE-SEED-TRANSITIONS --> backend/prisma/seed.ts |
| AE-SHADCN-COMPONENTS | <!-- TRACED:AE-SHADCN-COMPONENTS --> frontend/components/ui/ (8 files) |
| AE-DARK-MODE | <!-- TRACED:AE-DARK-MODE --> frontend/app/globals.css |
| AE-CN-UTILITY | <!-- TRACED:AE-CN-UTILITY --> frontend/lib/utils.ts |
| AE-SKIP-LINK | <!-- TRACED:AE-SKIP-LINK --> frontend/app/layout.tsx |
| AE-SELECT-COMPONENT | <!-- TRACED:AE-SELECT-COMPONENT --> frontend/app/register/page.tsx |
| AE-LOADING-STATES | <!-- TRACED:AE-LOADING-STATES --> frontend/app/**/loading.tsx |
| AE-ERROR-STATES | <!-- TRACED:AE-ERROR-STATES --> frontend/app/**/error.tsx |
| AE-NAV-ARIA | <!-- TRACED:AE-NAV-ARIA --> frontend/components/nav.tsx |

## Summary
- Total VERIFY tags: 46
- Total TRACED tags: 46
- Orphaned VERIFY tags: 0
- Orphaned TRACED tags: 0
