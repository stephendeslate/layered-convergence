# Specification Index — Field Service Dispatch

## Project Overview

Field Service Dispatch (FSD) is a multi-tenant platform for managing field
service operations including work orders, technician dispatch, scheduling,
and service area management. Built as a Turborepo monorepo with NestJS 11
backend and Next.js 15 frontend.

## Specification Documents

### 1. [Architecture](./architecture.md)
System architecture, monorepo structure, domain model overview,
backend/frontend design decisions, and integration points.

### 2. [Data Model](./data-model.md)
Entity definitions (Tenant, User, WorkOrder, Technician, Schedule,
ServiceArea), indexing strategy, enum mapping, and seed data requirements.

### 3. [Security](./security.md)
Authentication (JWT + bcrypt), authorization (role-based),
input validation (DTOs), HTTP security headers (Helmet/CSP),
rate limiting (ThrottlerModule), CORS, and env validation.

### 4. [Performance](./performance.md)
Response time tracking (APP_INTERCEPTOR), pagination clamping
(MAX_PAGE_SIZE), Prisma query optimization, Cache-Control headers,
database connection pooling, and frontend bundle optimization.

### 5. [Monitoring](./monitoring.md)
Structured logging (Pino), correlation IDs, RequestContextService
(T41 variation), health endpoints (/health, /health/ready),
metrics (/metrics), error tracking (APP_FILTER), and frontend
error boundary logging.

### 6. [API](./api.md)
RESTful endpoint documentation for all controllers: auth,
work orders, technicians, schedules, service areas, health, and metrics.
Server Actions integration.

### 7. [Testing](./testing.md)
Test coverage: 3+ unit tests, 2+ integration tests (supertest),
security tests, performance tests, monitoring tests, accessibility
tests (jest-axe), and keyboard navigation tests (userEvent).

## Cross-Reference Matrix

| Spec | References |
|------|-----------|
| architecture.md | data-model.md, security.md, monitoring.md, performance.md |
| data-model.md | architecture.md, security.md |
| security.md | architecture.md, monitoring.md |
| performance.md | architecture.md, data-model.md |
| monitoring.md | architecture.md, security.md |
| api.md | security.md, data-model.md |
| testing.md | security.md, monitoring.md |

## Layer Coverage

- **L0-2**: Framework versions, shadcn/ui, Server Actions, loading/error states
- **L3**: 7 specs + index, 35+ VERIFY tags, bidirectional parity
- **L4**: Dockerfile, CI/CD, migrations, seed, docker-compose
- **L5**: Turborepo monorepo, pnpm workspaces, shared package
- **L6**: Helmet CSP, ThrottlerModule, CORS, DTO validation, env validation
- **L7**: ResponseTimeInterceptor, pagination, query optimization, caching
- **L8**: Pino logging, correlation IDs, health checks, metrics, error tracking

## T41 Variation

RequestContextService — request-scoped provider storing correlation ID,
user ID, and tenant ID. Used by GlobalExceptionFilter and request logging
middleware. Exported from MonitoringModule for domain module consumption.
