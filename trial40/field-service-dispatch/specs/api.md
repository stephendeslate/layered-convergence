# API Specification

## Overview

The API is built with NestJS 11 and exposes REST endpoints for all domain entities.
All endpoints (except auth and health) require JWT authentication.

## Endpoints

### Work Orders

- VERIFY: FD-WO-001 — GET /work-orders returns paginated list with select optimization
- VERIFY: FD-WO-002 — POST /work-orders creates with generated ID and sanitized title
- VERIFY: FD-WO-003 — Service implements state machine transitions for status updates
- VERIFY: FD-WO-004 — PATCH /work-orders/:id/status validates allowed transitions

### Technicians

- VERIFY: FD-TECH-001 — GET /technicians returns paginated list with tenant scoping
- VERIFY: FD-TECH-002 — POST /technicians creates with generated ID and sanitized name
- VERIFY: FD-TECH-003 — Service uses findFirst for multi-tenant record isolation
- VERIFY: FD-TECH-004 — Update technician DTO with class-validator decorators

### Schedules

- VERIFY: FD-SCHED-001 — GET /schedules returns list with included work order and technician
- VERIFY: FD-SCHED-002 — POST /schedules validates work order tenant ownership before creation
- VERIFY: FD-SCHED-003 — Tenant scoping via workOrder relation for schedule queries
- VERIFY: FD-SCHED-004 — Schedules REST controller with full CRUD operations
- VERIFY: FD-SCHED-005 — Schedules module encapsulating controller and service

### Service Areas

- VERIFY: FD-SA-001 — GET /service-areas returns tenant-scoped list
- VERIFY: FD-SA-002 — POST /service-areas creates with sanitized name
- VERIFY: FD-SA-003 — Service uses sanitizeInput on all string fields
- VERIFY: FD-SA-004 — Service areas REST controller with full CRUD operations

## DTOs and Validation

All DTOs use class-validator decorators:
- `@IsString()` on all string fields
- `@MaxLength()` on all string fields to prevent oversized payloads
- `@IsOptional()` on nullable/update fields
- `@IsEnum()` for status and priority fields

## Request Pipeline

1. CorrelationMiddleware — assigns or preserves X-Correlation-ID
2. RequestLoggerMiddleware — logs request completion with duration
3. ThrottlerGuard — rate limits (100 req/60s default, 5/60s for auth)
4. ValidationPipe — whitelist, forbidNonWhitelisted
5. JWT AuthGuard — validates Bearer token
6. ResponseTimeInterceptor — measures and records response time
7. GlobalExceptionFilter — catches unhandled exceptions

## Response Format

Paginated responses follow a consistent structure:
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "totalPages": 5
}
```

## API Configuration

- VERIFY: FD-API-001 — Server actions use response.ok validation before parsing
- VERIFY: FD-API-002 — Next.js rewrites proxy /api/* to backend URL
