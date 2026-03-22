# Architecture Specification

## Overview

The Analytics Engine follows a modular monorepo architecture using Turborepo 2 with pnpm
workspaces. The system is divided into three packages: API backend, web frontend, and shared
utilities. This document describes the module layout and dependency relationships.

## Monorepo Structure

The root workspace manages build orchestration via turbo.json with task dependencies.
Both apps import from the shared package using the workspace:* protocol.

<!-- VERIFY:AE-SHARED-CONSTANTS — Shared package exports BCRYPT_SALT_ROUNDS constant -->
<!-- VERIFY:AE-SHARED-ROLES — Shared package exports ALLOWED_REGISTRATION_ROLES -->
<!-- VERIFY:AE-SHARED-PAGINATION — Shared package exports normalizePageParams with MAX_PAGE_SIZE clamping -->

## Backend Module Layout

The NestJS backend is organized into feature modules:

- **AuthModule** — JWT authentication with Passport strategy
- **EventsModule** — Event CRUD with tenant scoping
- **DashboardsModule** — Dashboard CRUD with owner tracking
- **DataSourcesModule** — Data source CRUD with type classification
- **PipelinesModule** — Pipeline CRUD with status management
- **MonitoringModule** — Health checks, metrics, structured logging, correlation IDs

<!-- VERIFY:AE-APP-MODULE — AppModule registers all feature modules and global providers -->
<!-- VERIFY:AE-MONITORING-MODULE — MonitoringModule exports RequestContextService, PinoLoggerService, MetricsService -->

## Global Providers

All global-scope providers are registered via NestJS DI in AppModule, never in main.ts:

- APP_INTERCEPTOR: ResponseTimeInterceptor
- APP_FILTER: GlobalExceptionFilter
- APP_GUARD: ThrottlerGuard

This ensures proper dependency injection for all providers. See [security.md](./security.md)
for guard configuration details.

## Frontend Architecture

The Next.js 15 frontend uses the App Router with server components by default.
Client components are used for interactive elements and error boundaries.
Route loading states use role="status" and aria-busy for accessibility.

<!-- VERIFY:AE-ROOT-LAYOUT — Root layout includes Nav component -->
<!-- VERIFY:AE-NEXT-CONFIG — Next.js config transpiles shared package -->

## Shared Package

The shared package contains pure TypeScript utilities with no framework dependencies:
- Constants (salt rounds, roles, pagination limits, cache headers)
- Type definitions (status enums, health/metrics response interfaces)
- Validation constants (max lengths for strings and UUIDs)

## Data Flow

1. Client request arrives with optional X-Correlation-ID header
2. CorrelationIdMiddleware preserves or generates correlation ID
3. RequestLoggingMiddleware logs request start
4. ThrottlerGuard checks rate limits
5. JwtAuthGuard validates token (on protected routes)
6. Controller delegates to service layer
7. Service interacts with Prisma (with select optimization)
8. ResponseTimeInterceptor sets X-Response-Time header
9. Response returned with correlation ID header

## Deployment

The application deploys as a multi-stage Docker image (node:20-alpine).
PostgreSQL 16 is the production database with connection pooling via connection_limit.
