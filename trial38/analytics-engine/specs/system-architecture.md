# System Architecture Specification

## Trial 38 | Analytics Engine

### Overview

The Analytics Engine is a multi-tenant data analytics platform providing
dashboards, pipelines, and reports. It is built as a Turborepo monorepo
with three workspace packages.

### VERIFY: AE-ARCH-01 - Monorepo Structure

The project uses Turborepo 2 with pnpm workspaces. The workspace layout:

```
analytics-engine/
  apps/api/        # NestJS 11 backend
  apps/web/        # Next.js 15 frontend
  packages/shared/ # Shared types, constants, utilities
```

TRACED in: `turbo.json`, `pnpm-workspace.yaml`, root `package.json`

### VERIFY: AE-ARCH-02 - Package Manager

pnpm 9.15.4 is the required package manager, declared via `packageManager`
field in root `package.json`. Workspace dependencies use `workspace:*` protocol.

TRACED in: root `package.json`

### VERIFY: AE-ARCH-03 - Backend Framework

NestJS 11 with modular architecture. Each domain (auth, dashboards, pipelines)
is a separate NestJS module with its own controller, service, and DTOs.

TRACED in: `apps/api/src/app.module.ts`

### VERIFY: AE-ARCH-04 - Frontend Framework

Next.js 15 with App Router, React 19, and Tailwind CSS. Pages use
Server Components by default with `'use client'` only where needed.

TRACED in: `apps/web/next.config.ts`

### VERIFY: AE-ARCH-05 - Shared Package

The shared package exports TypeScript types, constants, and utility functions.
It is consumed by both apps via `workspace:*` dependency.

Key exports:
- Types: `Dashboard`, `Pipeline`, `PipelineRun`, `Report`, `UserRole`
- Constants: `BCRYPT_SALT_ROUNDS`, `ALLOWED_REGISTRATION_ROLES`
- Utilities: `slugify`, `truncateText`, `formatBytes`
- T38 Variations: `measureDuration`, `clampPageSize`

TRACED in: `packages/shared/src/index.ts`

### VERIFY: AE-ARCH-06 - Multi-Tenancy

All data is scoped by `tenantId`. Every query filters by the authenticated
user's tenant. Row-Level Security is enabled at the database level as a
defense-in-depth measure.

TRACED in: `apps/api/src/dashboards/dashboards.service.ts`,
`apps/api/src/pipelines/pipelines.service.ts`

### VERIFY: AE-ARCH-07 - API Communication

The frontend communicates with the backend via Server Actions (`'use server'`)
that call the API using `fetch`. The API base URL is configured via
`NEXT_PUBLIC_API_URL` environment variable.

TRACED in: `apps/web/app/actions.ts`

### VERIFY: AE-ARCH-08 - Global Module Pattern

PrismaModule is registered as a `@Global()` module so PrismaService is
available across all modules without explicit imports. Other modules
(AuthModule, DashboardsModule, PipelinesModule) are standard modules.

TRACED in: `apps/api/src/prisma/prisma.module.ts`
