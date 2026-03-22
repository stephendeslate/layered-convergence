# Monitoring Specification

## Overview

Layer 8 introduces structured logging, request correlation, health endpoints,
and in-memory operational metrics. This is the T40 variation of the Layered
Convergence methodology.

## Structured Logging (Pino)

- VERIFY: FD-MON-001 — createCorrelationId() exported from shared uses crypto.randomUUID()
- VERIFY: FD-MON-002 — formatLogEntry() exported from shared returns JSON string with timestamp, level, message
- VERIFY: FD-MON-003 — Monitoring test suite validates correlation ID format and log entry structure
- VERIFY: FD-MON-004 — Log entries contain ISO 8601 timestamp, level, message, and optional context fields

Pino is configured in main.ts as the NestJS logger. All structured log output
goes to stderr via process.stderr.write() to separate from stdout data output.

## Correlation IDs

- VERIFY: FD-MON-005 — CorrelationMiddleware preserves client X-Correlation-ID or generates new UUID v4
- Response headers include X-Correlation-ID for client-side tracing
- Correlation ID propagated to request logger and exception filter

## Request Logging

- VERIFY: FD-MON-006 — RequestLoggerMiddleware logs method, URL, statusCode, duration, correlationId
- Logging occurs on response 'finish' event for accurate duration measurement
- Uses formatLogEntry() from shared package for consistent format

## Exception Handling

- VERIFY: FD-MON-007 — GlobalExceptionFilter logs unhandled exceptions with stack trace and correlation ID
- Production mode returns sanitized "Internal server error" for 500s
- Non-production mode returns detailed error information
- Error count tracked via MetricsService

## In-Memory Metrics

- VERIFY: FD-MON-008 — MetricsService tracks requestCount, errorCount, totalResponseTime, uptime
- Metrics updated by ResponseTimeInterceptor on each request
- No external metrics backend required (in-memory only)

## Health Endpoints

- VERIFY: FD-MON-009 — GET /health returns status, timestamp, uptime, version (no auth, no throttle)
- GET /health/ready checks database connectivity via Prisma $queryRaw`SELECT 1`
- VERIFY: FD-MON-010 — GET /metrics returns in-memory operational statistics

All health/metrics endpoints exempt from ThrottlerGuard via @SkipThrottle().

## Error Boundaries (Frontend)

- VERIFY: FD-MON-011 — Frontend error.tsx boundaries log structured JSON to stderr
- Each route has its own error boundary for granular error isolation
- Error boundaries display user-friendly message with retry button

## T40 Variation

The key T40 variation is that `createCorrelationId()` and `formatLogEntry()` are
exported from `packages/shared/src/index.ts` and consumed by the backend monitoring
middleware. This centralizes logging format in the shared package.

## Dockerfile HEALTHCHECK

The Dockerfile HEALTHCHECK uses `curl -f http://localhost:3000/health` which maps
to the HealthController's GET /health endpoint. This path must remain in sync.

## Cross-References

- Request pipeline ordering and endpoint definitions: see [API Specification](api.md)
- Dockerfile HEALTHCHECK and Docker Compose integration: see [Infrastructure Specification](infrastructure.md)
