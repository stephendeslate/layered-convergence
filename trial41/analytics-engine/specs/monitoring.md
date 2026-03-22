# Monitoring Specification

## Overview

The Analytics Engine implements comprehensive observability via structured logging,
correlation ID propagation, health endpoints, operational metrics, and error tracking.
All monitoring components are encapsulated in the MonitoringModule.

## Structured Logging

<!-- VERIFY:AE-PINO-LOGGER — PinoLoggerService provides structured JSON logging injectable via NestJS DI -->

The PinoLoggerService wraps the Pino logger library to provide structured JSON output.
All log entries include timestamps in ISO format. Log levels: error, warn, info, debug.
The logger is injectable via NestJS DI and used by middleware and filters.

No console.log statements are used in production code.

## Correlation IDs

<!-- VERIFY:AE-CORRELATION-ID-MIDDLEWARE — CorrelationIdMiddleware preserves or generates X-Correlation-ID -->

Every request receives a unique correlation ID via the CorrelationIdMiddleware:
- If the client sends X-Correlation-ID, it is preserved
- Otherwise, a new UUID is generated
- The ID is set on the response header and stored in RequestContextService

## T41 Variation: RequestContextService

<!-- VERIFY:AE-REQUEST-CONTEXT-SERVICE — RequestContextService stores correlationId, userId, tenantId per request -->

The RequestContextService is a request-scoped NestJS provider that stores:
- Correlation ID (always present)
- User ID (set if authenticated, null otherwise)
- Tenant ID (set if authenticated, null otherwise)

The GlobalExceptionFilter and RequestLoggingMiddleware read from this service
instead of parsing headers directly. The service is exported from MonitoringModule
and importable by domain modules.

See [architecture.md](./architecture.md) for the module dependency graph.

## Health Endpoints

<!-- VERIFY:AE-HEALTH-CONTROLLER — HealthController provides /health, /health/ready, and /metrics endpoints -->

### GET /health
Returns: { status: 'ok', timestamp: ISO string, uptime: seconds, version: string }
Exempt from auth guards and rate limiting via @SkipThrottle().

### GET /health/ready
Checks database connectivity via Prisma $queryRaw(Prisma.sql`SELECT 1`).
Returns: { status: 'ok'|'error', database: 'connected'|'disconnected', timestamp }

## Metrics Endpoint

<!-- VERIFY:AE-METRICS-SERVICE — MetricsService tracks request count, error count, avg response time in memory -->

### GET /metrics
Returns operational metrics stored in memory (no external dependency):
- requestCount: total requests processed
- errorCount: total 4xx/5xx responses
- avgResponseTimeMs: average response duration
- uptime: seconds since application start

## Request Logging

<!-- VERIFY:AE-REQUEST-LOGGING-MIDDLEWARE — RequestLoggingMiddleware logs method, URL, status, duration, correlationId -->

Every request is logged on completion with:
- HTTP method and URL
- Response status code
- Duration in milliseconds
- Correlation ID, user ID, tenant ID from RequestContextService

## Error Tracking

<!-- VERIFY:AE-GLOBAL-EXCEPTION-FILTER — GlobalExceptionFilter registered as APP_FILTER, logs stack+context, sanitizes response -->

The GlobalExceptionFilter catches all unhandled exceptions:
- Logs full stack trace, correlation ID, and request context via PinoLoggerService
- Returns sanitized error response (no stack traces in production)
- 500 errors return generic "Internal server error" message
- Registered as APP_FILTER in AppModule (never via main.ts useGlobalFilters)

## Frontend Error Boundaries

<!-- VERIFY:AE-ERROR-BOUNDARY — Error boundary components log structured errors with component stack -->
<!-- VERIFY:AE-FRONTEND-ERROR-LOGGING — Frontend error logging uses structured JSON format -->

Next.js error.tsx files in each route:
- Display user-friendly error messages with role="alert"
- Focus heading element on mount via useRef for accessibility
- Log errors using logErrorBoundary with structured format

## Alerting Thresholds (Recommended)

- Error rate > 5% of requests: WARNING
- Error rate > 10% of requests: CRITICAL
- Average response time > 500ms: WARNING
- Average response time > 2000ms: CRITICAL
- Health endpoint returns non-ok: CRITICAL
- Database readiness check fails: CRITICAL

## Test Coverage

<!-- VERIFY:AE-MONITORING-TEST — monitoring.spec.ts has supertest integration tests for health, correlation IDs, error sanitization -->

Monitoring integration tests validate:
- Health endpoint returns required fields (status, timestamp, uptime, version)
- Readiness endpoint checks database connectivity
- Metrics endpoint returns operational metrics
- Correlation ID preservation when client-sent
- Correlation ID generation when not provided
- Error response sanitization (no stack traces)
- Request count tracking across multiple requests

## Additional Test Coverage

<!-- VERIFY:AE-EVENTS-UNIT-TEST — Events service unit tests cover CRUD operations -->
<!-- VERIFY:AE-DASHBOARDS-UNIT-TEST — Dashboards service unit tests cover CRUD operations -->
<!-- VERIFY:AE-EVENTS-INTEGRATION-TEST — Events integration tests use supertest with real AppModule -->
<!-- VERIFY:AE-PRISMA-SERVICE — PrismaService extends PrismaClient with lifecycle hooks -->

## Frontend Test Coverage

<!-- VERIFY:AE-ACCESSIBILITY-TEST — Accessibility tests use jest-axe on real shadcn/ui components -->
<!-- VERIFY:AE-KEYBOARD-TEST — Keyboard tests use userEvent for tab navigation and activation -->
<!-- VERIFY:AE-UI-BUTTON — Button component uses cn() with clsx+tailwind-merge -->
<!-- VERIFY:AE-UI-CARD — Card component family uses cn() for class merging -->
<!-- VERIFY:AE-UI-INPUT — Input component uses cn() for class merging -->
<!-- VERIFY:AE-NAV-COMPONENT — Nav component provides site-wide navigation links -->
<!-- VERIFY:AE-CN-UTILITY — cn() utility uses clsx + tailwind-merge -->
<!-- VERIFY:AE-SERVER-ACTIONS — Server actions use 'use server' and check response.ok -->
<!-- VERIFY:AE-SHARED-ERROR-CODES — Shared package exports ERROR_CODES constant -->
<!-- VERIFY:AE-SHARED-HEALTH — Shared package exports HealthResponse, ReadinessResponse, MetricsResponse interfaces -->
