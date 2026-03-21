# System Architecture — Analytics Engine

## Overview

The system follows a monorepo architecture with Turborepo and pnpm workspaces.
The backend uses NestJS 11 with Prisma ORM, and the frontend uses Next.js 15.

See also: [PRODUCT_VISION.md](PRODUCT_VISION.md), [SECURITY_MODEL.md](SECURITY_MODEL.md)

## Monorepo Structure

```
analytics-engine/
  turbo.json          # Turborepo pipeline configuration
  pnpm-workspace.yaml # Workspace definition
  apps/
    api/              # NestJS 11 backend
    web/              # Next.js 15 frontend
  packages/
    shared/           # Shared types, constants, utilities
```

## Backend Architecture

### Module Organization
- [VERIFY:AE-SA-001] NestJS modules defined and imported in app.module.ts -> Implementation: apps/api/src/app.module.ts:1
- [VERIFY:AE-SA-002] PrismaModule is global for dependency injection -> Implementation: apps/api/src/prisma/prisma.module.ts:4
- [VERIFY:AE-SA-003] JwtAuthGuard protects authenticated endpoints -> Implementation: apps/api/src/auth/jwt-auth.guard.ts:2
- Each domain entity has its own module with controller, service, and DTOs

### Data Access Patterns
- [VERIFY:AE-SA-004] All findFirst calls include justification comments -> Implementation: apps/api/src/pipeline/pipeline.service.ts:4
- [VERIFY:AE-SA-005] All Prisma models use @@map for SQL table names -> Implementation: apps/api/prisma/schema.prisma:8

### Frontend Architecture
- [VERIFY:AE-SA-006] 8 shadcn/ui components in components/ui/ -> Implementation: apps/web/components/ui/button.tsx:1
- [VERIFY:AE-SA-007] Skip-to-content link in root layout for accessibility -> Implementation: apps/web/app/layout.tsx:2

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend Framework | NestJS | ^11.0.0 |
| Frontend Framework | Next.js | ^15.0.0 |
| ORM | Prisma | ^6.0.0 |
| Database | PostgreSQL | 16 |
| Authentication | JWT + Passport | ^11.0.0 |
| UI Components | shadcn/ui | custom |
| CSS | Tailwind CSS | ^4.0.0 |
| Build System | Turborepo | ^2.0.0 |
| Package Manager | pnpm | ^9.0.0 |

## Shared Package

The `packages/shared` workspace provides:
- TypeScript type definitions for all entities
- Constants for roles, statuses, and validation rules
- `validateTransition()` utility for state machine enforcement
- `formatCurrency()` utility for number formatting

Both `apps/api` and `apps/web` depend on `@analytics-engine/shared` via workspace protocol.

## Deployment Architecture

- Multi-stage Docker build (deps -> build -> production)
- node:20-alpine base image for minimal footprint
- PostgreSQL 16 with Row-Level Security
- CI/CD via GitHub Actions with turbo-integrated pipeline

## Error Handling

- Global ValidationPipe with whitelist and forbidNonWhitelisted
- Structured error responses with HTTP status codes
- State machine violations return 400 Bad Request
- Authentication failures return 401 Unauthorized
