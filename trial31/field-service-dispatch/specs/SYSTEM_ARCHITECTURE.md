# System Architecture — Field Service Dispatch

## Backend Architecture

### NestJS Application
The backend is structured into feature modules: AuthModule, WorkOrderModule, InvoiceModule,
RouteModule. Each module follows a consistent pattern with its own service (business logic),
controller (HTTP routing), and spec file (unit tests). PrismaService is provided globally
through AppModule and injected into each feature module.

### Server Actions
The Next.js frontend uses Server Actions with `'use server'` directive. All fetch calls check `response.ok` before processing data to prevent silent failures.
<!-- VERIFY:FD-SERVER-ACTIONS -->

### Validation Pipeline
NestJS ValidationPipe is configured globally with `whitelist: true` and `forbidNonWhitelisted: true`. This strips unknown properties and rejects requests containing them.
<!-- VERIFY:FD-VALIDATION-PIPE -->

### Raw SQL Usage
All raw SQL queries use `$executeRaw` and `$queryRaw` with `Prisma.sql` tagged template literals. The codebase has zero occurrences of `$executeRawUnsafe`.
<!-- VERIFY:FD-EXECUTE-RAW -->

### Prisma Model Mapping
All Prisma models use `@@map` for snake_case table names. All multi-word columns use `@map` for snake_case column names.
<!-- VERIFY:FD-PRISMA-MAP -->

### Authentication Flow
AuthService handles registration (bcrypt hash with salt 12) and login (bcrypt compare + JWT signing). JwtModule is registered globally with `process.env.JWT_SECRET` and no hardcoded fallback.
<!-- VERIFY:FD-AUTH-FLOW -->

## Infrastructure

### Dockerfile
Multi-stage build (deps -> build -> production) using node:20-alpine. Includes `USER node` for non-root execution, `HEALTHCHECK` for container orchestration, and `LABEL` metadata (maintainer, version, description) per T31 variation.
<!-- VERIFY:FD-DOCKERFILE -->

### CI/CD Pipeline
GitHub Actions workflow with 5 jobs: lint, test, build, typecheck (`tsc --noEmit` per T31 variation), and migration-check. Uses pnpm as package manager.
<!-- VERIFY:FD-CI-PIPELINE -->

### Row Level Security
All 8 database tables have both `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY` in the migration SQL. This ensures RLS cannot be bypassed by table owners.
<!-- VERIFY:FD-RLS -->

### Environment Validation
`main.ts` performs fail-fast validation: throws immediately if `JWT_SECRET` or `CORS_ORIGIN` environment variables are missing. No fallback defaults for security-sensitive values.
<!-- VERIFY:FD-ENV-FAILFAST -->

## Cross-References
- See PRODUCT_VISION.md for domain entity definitions
- See SECURITY_MODEL.md for security constraints and threat mitigations
