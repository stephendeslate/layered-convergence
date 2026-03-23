# Architecture Specification

## Overview

Analytics Engine is a full-stack analytics platform built as a Turborepo 2 monorepo
with pnpm workspaces. The architecture follows a layered approach with clear
separation of concerns across three packages.

## Workspace Structure

```
analytics-engine/
  apps/
    api/          # NestJS 11 REST API with Prisma 6
    web/          # Next.js 15 frontend with React 19
  packages/
    shared/       # Shared constants, utilities, types
```

## Technology Stack

| Layer      | Technology           | Version |
|------------|---------------------|---------|
| Runtime    | Node.js             | 20 LTS  |
| API        | NestJS              | 11.x    |
| ORM        | Prisma              | 6.x     |
| Database   | PostgreSQL          | 16      |
| Frontend   | Next.js / React     | 15 / 19 |
| Styling    | Tailwind CSS        | 3.4     |
| Build      | Turborepo           | 2.x     |
| Package    | pnpm                | 9.x     |

## VERIFY:AE-ARCH-001 -- Module Registration

All domain modules (Auth, Dashboards, DataSources, Events, Pipelines, Monitoring)
are registered in `AppModule.imports`. The module wiring follows NestJS conventions
with each domain module encapsulating its own controller, service, and DTOs.

## API Architecture

The API follows a controller-service-repository pattern:

1. **Controllers** handle HTTP request/response mapping and validation
2. **Services** contain business logic and orchestrate data access
3. **PrismaService** provides the data access layer via Prisma Client

## Frontend Architecture

The web app uses Next.js 15 App Router with:

- Server Actions for API communication (`'use server'`)
- Dynamic imports with `next/dynamic` for code splitting
- Client components for interactive pages
- Route-level loading and error boundaries

## Shared Package

The shared package exports >= 8 utilities consumed by both apps:

- `BCRYPT_SALT_ROUNDS`, `ALLOWED_REGISTRATION_ROLES`, `MAX_PAGE_SIZE`,
  `DEFAULT_PAGE_SIZE`, `APP_VERSION` (constants)
- `clampPageSize`, `calculateSkip` (pagination)
- `createCorrelationId` (observability)
- `formatLogEntry` (structured logging)
- `sanitizeLogContext` (security)
- `validateEnvVars` (bootstrap validation)

## Deployment

Multi-stage Docker build with three stages:
1. **deps** -- install production dependencies
2. **build** -- compile TypeScript and build all packages
3. **production** -- minimal `node:20-alpine` image with only production artifacts
