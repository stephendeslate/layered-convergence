# Monitoring

## Overview

The Escrow Marketplace implements comprehensive monitoring through
structured logging (Pino), correlation ID tracking, health endpoints,
request logging, error tracking, and metrics collection.

## Structured Logging

- VERIFY: EM-LOG-001 — LoggerService uses Pino with JSON output
- All log output is JSON-formatted via Pino logger
- Log levels: error, warn, info, debug
- Logger is injectable via NestJS DI
- VERIFY: EM-LOGF-001 — formatLogEntry from shared produces JSON strings
- VERIFY: EM-LOGF-002 — formatLogEntry uses sanitizeLogContext on context

## Log Sanitization (T42 Variation)

- VERIFY: EM-LSAN-001 — LogSanitizer defines sensitive key list
- VERIFY: EM-LSAN-002 — sanitizeLogContext redacts sensitive fields
- Redacted fields: password, passwordHash, token, accessToken, secret, authorization
- Case-insensitive matching on field names
- Deep sanitization: nested objects are recursively processed
- Replacement value: '[REDACTED]'
- VERIFY: EM-LSAN-003 — GlobalExceptionFilter sanitizes request body
- VERIFY: EM-LSANT-001 — Unit tests cover all sanitization cases

## Correlation IDs

- VERIFY: EM-CORR-001 — createCorrelationId from shared generates UUID v4
- VERIFY: EM-CORR-002 — CorrelationIdMiddleware preserves client ID
- Every request gets X-Correlation-ID header in response
- Client-provided X-Correlation-ID is preserved
- Otherwise, a new UUID v4 is generated
- Stored in RequestContextService for request lifecycle

## Request Context

- VERIFY: EM-RCTX-001 — RequestContextService is request-scoped
- Stores: correlationId, userId, tenantId
- Exported from MonitoringModule for use by domain modules
- Used by GlobalExceptionFilter and RequestLoggingMiddleware

## Health Endpoints

- GET /health: status, timestamp, uptime, version
- GET /health/ready: database connectivity via Prisma.$queryRaw
- Both exempt from auth guards via @Public() and rate limiting (@SkipThrottle)
- Health endpoint path matches Dockerfile HEALTHCHECK

## Request Logging

- VERIFY: EM-RLOG-001 — RequestLoggingMiddleware logs all requests
- Logs: method, URL, status code, duration, correlationId
- Uses structured logger (not console/process.stderr)
- Records response time in MetricsService

## Error Tracking

- VERIFY: EM-GEXF-001 — GlobalExceptionFilter registered as APP_FILTER
- Logs unhandled exceptions with stack trace and correlation ID
- Returns sanitized error to client (no stack traces)
- Response includes correlationId field for client-side tracking
- Request body sanitized before logging (passwords/tokens redacted)

## Metrics

- VERIFY: EM-METR-001 — MetricsService stores in-memory metrics
- GET /metrics returns: requestCount, errorCount, averageResponseTime, uptime
- No external dependencies (in-memory only)

## Frontend Error Boundaries

- VERIFY: EM-ELOG-001 — Error logging sends to API with correlation ID
- Error boundaries log via POST to API or console.error with structured format

## Test Coverage

- VERIFY: EM-TMON-001 — Monitoring integration tests with supertest
- Tests validate health endpoints, correlation ID propagation, error sanitization

## Alerting Thresholds (Recommended)

- Error rate > 5% of requests: warning
- Error rate > 10% of requests: critical
- Average response time > 500ms: warning
- Average response time > 2000ms: critical
- Health check failure: immediate alert

## Cross-References

See [architecture.md](./architecture.md) for middleware pipeline order.
See [api-contracts.md](./api-contracts.md) for endpoint specifications.
