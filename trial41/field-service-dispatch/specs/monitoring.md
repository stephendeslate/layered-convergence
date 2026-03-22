# Monitoring Specification

## Overview

The FSD platform implements comprehensive monitoring with structured logging,
correlation IDs, health endpoints, metrics collection, and error tracking.

See [architecture.md](./architecture.md) for system structure.
See [security.md](./security.md) for security-related monitoring.

## Structured Logging

Pino logger integrated as an injectable NestJS service. All log output is
JSON-formatted. Log levels: error, warn, info, debug. No console.log in
production code.

<!-- VERIFY: FD-PINO-LOGGER — apps/api/src/monitoring/pino-logger.service.ts provides structured JSON logging -->

## Correlation IDs

Every request gets a unique correlation ID via middleware:
- If client sends X-Correlation-ID header, preserve it
- Otherwise generate a UUID v4
- Correlation ID appears in all log entries for that request
- Returned to client via X-Correlation-ID response header

<!-- VERIFY: FD-CORRELATION-ID — apps/api/src/monitoring/correlation-id.middleware.ts generates/preserves IDs -->

## Request Context Service (T41 Variation)

RequestContextService is a request-scoped NestJS provider that stores:
- Correlation ID (always set)
- User ID (if authenticated)
- Tenant ID (if authenticated)

The GlobalExceptionFilter and request logging middleware read from this service
instead of parsing headers directly. Exported from MonitoringModule for use
by domain modules.

<!-- VERIFY: FD-REQUEST-CONTEXT — apps/api/src/monitoring/request-context.service.ts is request-scoped -->
<!-- VERIFY: FD-MONITORING-MODULE — apps/api/src/monitoring/monitoring.module.ts exports RequestContextService -->

## Request Logging

Request logging middleware logs for every request:
- HTTP method, URL, status code, duration in ms
- Correlation ID from RequestContextService
- User ID and tenant ID from RequestContextService

<!-- VERIFY: FD-REQUEST-LOGGING — apps/api/src/monitoring/request-logging.middleware.ts uses structured logger -->

## Health Endpoints

### GET /health
Returns basic health status (no auth required):
```json
{ "status": "ok", "timestamp": "...", "uptime": 123.45, "version": "1.0.0" }
```

### GET /health/ready
Checks database connectivity via Prisma $queryRaw (no auth required):
```json
{ "status": "ok", "timestamp": "...", "database": "connected" }
```

Both endpoints exempt from authentication guards and rate limiting.

<!-- VERIFY: FD-HEALTH-ENDPOINT — apps/api/src/monitoring/health.controller.ts has /health and /health/ready -->

## Metrics

### GET /metrics
Returns in-memory operational metrics:
- requestCount — total requests processed
- errorCount — total errors
- averageResponseTime — mean response time in ms
- uptime — seconds since process start

No external dependencies required.

<!-- VERIFY: FD-METRICS — apps/api/src/monitoring/metrics.service.ts tracks in-memory metrics -->

## Error Tracking

GlobalExceptionFilter registered as APP_FILTER in AppModule (FM#94 fix).
Logs unhandled exceptions with:
- Full stack trace (server-side only)
- Correlation ID from RequestContextService
- Request context (method, URL)

Returns sanitized error to client — no stack traces in production responses.

<!-- VERIFY: FD-GLOBAL-EXCEPTION-FILTER — apps/api/src/monitoring/global-exception.filter.ts catches all exceptions -->
<!-- VERIFY: FD-APP-FILTER — apps/api/src/app.module.ts registers GlobalExceptionFilter as APP_FILTER -->

## Frontend Error Boundary Logging

Error boundaries in Next.js log errors to the API via POST /errors endpoint.
Falls back to structured console.error if API is unavailable.

<!-- VERIFY: FD-ERROR-BOUNDARY-LOGGING — apps/web/lib/error-logging.ts logs errors with structured format -->

## Monitoring Tests

Integration tests use supertest against real AppModule (FM#95 fix).
Tests cover health endpoints, correlation ID propagation, and error sanitization.

<!-- VERIFY: FD-MONITORING-TEST — apps/api/test/monitoring.spec.ts has supertest integration tests -->
