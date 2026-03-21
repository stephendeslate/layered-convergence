# API Layer

**Project:** analytics-engine
**Layer:** 5 — Monorepo
**Version:** 1.0.0
**Cross-references:** auth.md, database.md, system-architecture.md

---

## Overview

The API is built with NestJS 11 and provides RESTful endpoints for managing
dashboards, pipelines, reports, and widgets. All endpoints require JWT
authentication and are scoped to the authenticated user's tenant.

## Application Bootstrap

The main.ts file performs fail-fast validation of required environment
variables before starting the NestJS application. Both JWT_SECRET and
CORS_ORIGIN must be configured or the application will throw immediately.

- VERIFY: AE-API-001 — main.ts validates JWT_SECRET and CORS_ORIGIN at startup
- VERIFY: AE-API-002 — AppModule imports Auth, Dashboards, and Pipelines modules
- VERIFY: AE-API-003 — PrismaService uses $executeRaw with Prisma.sql only

## Module Structure

### Dashboards Module
Provides CRUD operations for analytics dashboards. Each dashboard
belongs to a tenant and can contain multiple widgets.

- VERIFY: AE-DASH-001 — DashboardsModule registers controller, service, prisma
- VERIFY: AE-DASH-002 — DashboardsController with create, findAll, findOne
- VERIFY: AE-DASH-003 — DashboardsService uses generateId for entity creation

### Pipelines Module
Manages data pipeline configurations with status transitions.
Pipelines follow a state machine pattern defined in shared constants.

- VERIFY: AE-PIPE-001 — PipelinesModule registers controller, service, prisma
- VERIFY: AE-PIPE-002 — PipelinesController with create, findAll, updateStatus
- VERIFY: AE-PIPE-003 — PipelinesService validates status transitions

## Server Actions

The Next.js frontend uses server actions to communicate with the API.
All server actions use the 'use server' directive and check response.ok.

- VERIFY: AE-ACTION-001 — Dashboard server actions with 'use server' + response.ok
- VERIFY: AE-ACTION-002 — Pipeline server actions with 'use server' + response.ok

## Error Handling

All services throw appropriate NestJS exceptions:
- NotFoundException for missing resources
- ConflictException for duplicate entries
- BadRequestException for invalid state transitions
- UnauthorizedException for invalid credentials

## Request Validation

Global ValidationPipe with whitelist and transform options ensures
all incoming DTOs are validated and transformed before reaching
service methods. Unknown properties are stripped automatically.
