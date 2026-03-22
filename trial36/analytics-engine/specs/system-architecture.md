# System Architecture Specification

## Overview

Analytics Engine is a multi-tenant data analytics platform built as a Turborepo monorepo.
It provides dashboard management, data pipeline orchestration, and report generation
capabilities through a secure REST API and a modern web interface.

## Architecture Layers

### Presentation Layer (apps/web)

- **Framework**: Next.js ^15.0.0 with App Router
- **Rendering**: Server Components by default, Client Components where interactivity is needed
- **Styling**: CSS custom properties with dark mode via `prefers-color-scheme`
- **Components**: 8 shared UI components (Button, Badge, Card, Input, Label, Alert, Skeleton, Table)
- **Server Actions**: `'use server'` functions for data fetching with `response.ok` checks

See [Frontend Spec](frontend.md) for component details.

### Application Layer (apps/api)

- **Framework**: NestJS ^11.0.0
- **Authentication**: JWT-based with Passport.js strategy
- **Authorization**: Role-based (ADMIN, MANAGER, ANALYST, VIEWER)
- **Validation**: class-validator with ValidationPipe (whitelist + forbidNonWhitelisted)
- **Rate Limiting**: @nestjs/throttler with global guard and per-controller overrides

See [API Spec](api.md) for endpoint details and [Auth Spec](auth.md) for authentication flow.

### Data Layer (Prisma + PostgreSQL)

- **ORM**: Prisma ^6.0.0
- **Database**: PostgreSQL 16
- **Models**: Tenant, User, Dashboard, Pipeline, PipelineRun, Report
- **Security**: Row Level Security enabled and forced on all tables
- **Naming**: snake_case table and column names via @@map/@map

### Shared Layer (packages/shared)

- **Package**: @analytics-engine/shared
- **Types**: Tenant, User, UserRole, Dashboard, Pipeline, PipelineRun, Report, PaginatedResult
- **Constants**: ALLOWED_REGISTRATION_ROLES, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, BCRYPT_SALT_ROUNDS, PIPELINE_STATUS_TRANSITIONS
- **Utilities**: paginate, isAllowedRegistrationRole, sanitizeInput, maskSensitive, formatBytes, generateId

## Deployment

### Docker

- 3-stage Dockerfile (deps, build, production)
- Base image: node:20-alpine
- Runs as non-root `node` user
- HEALTHCHECK configured for API liveness

### CI/CD

- GitHub Actions workflow for lint, test, build
- PostgreSQL service container for integration tests
- `pnpm audit --audit-level=high` security gate

## VERIFY Tags

- `AE-ARCH-001`: Turborepo monorepo structure with apps/ and packages/ <!-- VERIFY: AE-ARCH-001 -->
- `AE-ARCH-002`: Server Components as default rendering strategy <!-- VERIFY: AE-ARCH-002 -->
- `AE-ARCH-003`: Shared package consumed by both apps <!-- VERIFY: AE-ARCH-003 -->
- `AE-ARCH-004`: Docker multi-stage build with non-root user <!-- VERIFY: AE-ARCH-004 -->
- `AE-ARCH-005`: CI pipeline with security audit step <!-- VERIFY: AE-ARCH-005 -->
