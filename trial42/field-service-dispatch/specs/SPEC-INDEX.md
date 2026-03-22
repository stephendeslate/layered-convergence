# Specification Index — Field Service Dispatch

## Overview

This document serves as the index for all specification documents in the
Field Service Dispatch (FD) project. All specs use the FD- prefix for
VERIFY/TRACED tags.

## Specification Documents

| Document | Description | Path |
|----------|-------------|------|
| Architecture | System architecture and module structure | [architecture.md](./architecture.md) |
| Data Model | Database schema and entity relationships | [data-model.md](./data-model.md) |
| API Contracts | REST API endpoints and request/response formats | [api-contracts.md](./api-contracts.md) |
| Authentication | JWT auth flow, role-based access, guards | [authentication.md](./authentication.md) |
| Security | CSP, rate limiting, input validation, CORS | [security.md](./security.md) |
| Performance | Response time, pagination, caching, indexing | [performance.md](./performance.md) |
| Monitoring | Logging, health checks, correlation IDs, metrics | [monitoring.md](./monitoring.md) |

## VERIFY Tag Registry

<!-- VERIFY:FD-BOOTSTRAP — main.ts bootstrap with Helmet, CORS, ValidationPipe -->
<!-- VERIFY:FD-APP-MODULE — AppModule with global providers and middleware -->
<!-- VERIFY:FD-CORS-CONFIG — CORS from CORS_ORIGIN env, credentials true -->
<!-- VERIFY:FD-VALIDATION-PIPE — whitelist + forbidNonWhitelisted + transform -->
<!-- VERIFY:FD-PRISMA-SERVICE — PrismaClient lifecycle management -->
<!-- VERIFY:FD-PUBLIC-DECORATOR — @Public() metadata decorator -->
<!-- VERIFY:FD-RESPONSE-TIME-INTERCEPTOR — X-Response-Time via perf_hooks -->
<!-- VERIFY:FD-AUTH-CONTROLLER — Auth register/login endpoints -->
<!-- VERIFY:FD-AUTH-SERVICE — Auth business logic with bcrypt -->
<!-- VERIFY:FD-JWT-STRATEGY — Passport JWT strategy -->
<!-- VERIFY:FD-JWT-AUTH-GUARD — Guard with @Public() bypass -->
<!-- VERIFY:FD-REGISTER-DTO — Registration DTO with validation -->
<!-- VERIFY:FD-ROLE-RESTRICTION — @IsIn excluding ADMIN -->
<!-- VERIFY:FD-WORK-ORDERS-CONTROLLER — Full CRUD for work orders -->
<!-- VERIFY:FD-WORK-ORDERS-SERVICE — Work orders business logic -->
<!-- VERIFY:FD-TECHNICIANS-CONTROLLER — Full CRUD for technicians -->
<!-- VERIFY:FD-TECHNICIANS-SERVICE — Technicians business logic -->
<!-- VERIFY:FD-SCHEDULES-CONTROLLER — Full CRUD for schedules -->
<!-- VERIFY:FD-SCHEDULES-SERVICE — Schedules business logic -->
<!-- VERIFY:FD-SERVICE-AREAS-CONTROLLER — Full CRUD for service areas -->
<!-- VERIFY:FD-SERVICE-AREAS-SERVICE — Service areas business logic -->
<!-- VERIFY:FD-HEALTH-ENDPOINT — GET /health status endpoint -->
<!-- VERIFY:FD-HEALTH-READY — GET /health/ready with DB check -->
<!-- VERIFY:FD-METRICS-SERVICE — In-memory operational metrics -->
<!-- VERIFY:FD-METRICS-ENDPOINT — GET /metrics operational data -->
<!-- VERIFY:FD-PINO-LOGGER — Structured JSON logging via Pino -->
<!-- VERIFY:FD-CORRELATION-MIDDLEWARE — X-Correlation-ID middleware -->
<!-- VERIFY:FD-REQUEST-LOGGING — Request logging middleware -->
<!-- VERIFY:FD-GLOBAL-EXCEPTION-FILTER — Global error handling as APP_FILTER -->
<!-- VERIFY:FD-EXCEPTION-BODY-SANITIZE — Request body sanitization in logs -->
<!-- VERIFY:FD-REQUEST-CONTEXT — Request-scoped context service -->
<!-- VERIFY:FD-FRONTEND-ERROR-ENDPOINT — POST /errors for frontend errors -->
<!-- VERIFY:FD-FRONTEND-ERROR-LOGGING — Frontend error boundary logging -->
<!-- VERIFY:FD-LOG-SANITIZER — T42: Sensitive field redaction utility -->
<!-- VERIFY:FD-LOG-FORMAT — Structured log entry formatting -->
<!-- VERIFY:FD-SHARED-EXPORTS — Shared package barrel exports -->
<!-- VERIFY:FD-BCRYPT-SALT — BCRYPT_SALT_ROUNDS = 12 -->
<!-- VERIFY:FD-ALLOWED-ROLES — Registration roles excluding ADMIN -->
<!-- VERIFY:FD-MAX-PAGE-SIZE — MAX_PAGE_SIZE = 100 -->
<!-- VERIFY:FD-NORMALIZE-PAGE — Page parameter normalization -->
<!-- VERIFY:FD-CORRELATION-ID-SHARED — UUID correlation ID generator -->
<!-- VERIFY:FD-ENV-VALIDATION — Environment variable validation -->
<!-- VERIFY:FD-SEED-BCRYPT — Seed imports BCRYPT_SALT_ROUNDS from shared -->
<!-- VERIFY:FD-ENV-VALIDATE-STARTUP — Env validation at app startup -->
<!-- VERIFY:FD-THROTTLER-CONFIG — ThrottlerModule 100/60s default -->
<!-- VERIFY:FD-APP-FILTER-REGISTRATION — GlobalExceptionFilter as APP_FILTER -->
<!-- VERIFY:FD-APP-INTERCEPTOR-REGISTRATION — ResponseTimeInterceptor as APP_INTERCEPTOR -->
<!-- VERIFY:FD-APP-GUARD-REGISTRATION — ThrottlerGuard as APP_GUARD -->
<!-- VERIFY:FD-CN-UTILITY — cn() with clsx + tailwind-merge -->
<!-- VERIFY:FD-NAV-COMPONENT — Navigation in root layout -->
<!-- VERIFY:FD-ROOT-LAYOUT — Root layout with Nav -->
<!-- VERIFY:FD-HOME-PAGE — Home page with dashboard cards -->
<!-- VERIFY:FD-WORK-ORDERS-PAGE — Work orders list page -->
<!-- VERIFY:FD-LOGIN-PAGE — Login form page -->
<!-- VERIFY:FD-SERVER-ACTIONS — Server actions checking response.ok -->
<!-- VERIFY:FD-API-CLIENT — API client with correlation IDs -->
<!-- VERIFY:FD-NEXT-CONFIG — Next.js configuration -->
<!-- VERIFY:FD-CREATE-WORK-ORDER-DTO — Work order creation validation -->
<!-- VERIFY:FD-AUTH-SERVICE-SPEC — Auth service unit tests -->
<!-- VERIFY:FD-WORK-ORDERS-SERVICE-SPEC — Work orders unit tests -->
<!-- VERIFY:FD-TECHNICIANS-SERVICE-SPEC — Technicians unit tests -->
<!-- VERIFY:FD-AUTH-INTEGRATION-SPEC — Auth integration tests -->
<!-- VERIFY:FD-DOMAIN-INTEGRATION-SPEC — Domain integration tests -->
<!-- VERIFY:FD-MONITORING-SPEC — Monitoring integration tests -->
<!-- VERIFY:FD-SECURITY-SPEC — Security integration tests -->
<!-- VERIFY:FD-PERFORMANCE-SPEC — Performance integration tests -->
<!-- VERIFY:FD-ACCESSIBILITY-SPEC — Accessibility tests with jest-axe -->
<!-- VERIFY:FD-KEYBOARD-SPEC — Keyboard navigation tests -->
<!-- VERIFY:FD-LOG-SANITIZER-TEST — Log sanitizer unit tests -->

## Cross-References

- Security spec references authentication.md and api-contracts.md
- Performance spec references architecture.md and data-model.md
- Monitoring spec references architecture.md and security.md
