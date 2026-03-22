# Security Specification

## Trial 38 | Analytics Engine

### Overview

Defense-in-depth security with Helmet CSP headers, request validation,
rate limiting, Row-Level Security, and secure authentication. No raw
SQL, no `as any`, no `dangerouslySetInnerHTML`, no `console.log`.

### VERIFY: AE-SEC-01 - Helmet CSP

Helmet is configured with Content Security Policy:
- `defaultSrc: ["'self'"]`
- `scriptSrc: ["'self'"]`
- `styleSrc: ["'self'", "'unsafe-inline'"]`

Applied in `main.ts` bootstrap before listening.

TRACED in: `apps/api/src/main.ts`

### VERIFY: AE-SEC-02 - Rate Limiting

ThrottlerModule is configured globally with default limits:
- Global: 100 requests per 60 seconds
- Auth endpoints: 5 requests per 60 seconds (stricter)

ThrottlerGuard is registered as `APP_GUARD` for automatic application.

TRACED in: `apps/api/src/app.module.ts`

### VERIFY: AE-SEC-03 - CORS Configuration

CORS is enabled via `app.enableCors()` with origin from `CORS_ORIGIN`
environment variable. Defaults to `http://localhost:3000` for development.
Credentials are enabled for cookie/auth header support.

TRACED in: `apps/api/src/main.ts`

### VERIFY: AE-SEC-04 - Input Validation

Global `ValidationPipe` with:
- `whitelist: true` - strips unknown properties
- `forbidNonWhitelisted: true` - rejects unknown properties
- `transform: true` - auto-transforms payloads to DTO types

All DTO properties have explicit class-validator decorators.

TRACED in: `apps/api/src/main.ts`

### VERIFY: AE-SEC-05 - SQL Injection Prevention

No `$executeRawUnsafe` is used anywhere. All raw SQL uses `Prisma.sql`
tagged template literals for parameterized queries. The PrismaService
enforces this pattern. No raw `SELECT` statements appear in application
code.

TRACED in: `apps/api/src/prisma/prisma.service.ts`

### VERIFY: AE-SEC-06 - Row-Level Security

All six tables have RLS enabled and forced:
```sql
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;
ALTER TABLE {table} FORCE ROW LEVEL SECURITY;
```

This prevents data leakage even if application-level tenant filtering
is bypassed. Applied in the initial migration.

TRACED in: `apps/api/prisma/migrations/00000000000000_init/migration.sql`

### VERIFY: AE-SEC-07 - Environment Validation

The `main.ts` bootstrap function validates that required environment
variables (`JWT_SECRET`, `DATABASE_URL`) are present before starting
the application. Missing variables cause immediate failure with a
descriptive error message.

TRACED in: `apps/api/src/main.ts`

### VERIFY: AE-SEC-08 - Type Safety

No `as any` type assertions are used in the codebase. All types are
explicitly defined or inferred. The shared package provides type
definitions consumed by both apps. TypeScript strict mode is enabled
in all `tsconfig.json` files.

TRACED in: `packages/shared/src/index.ts`
