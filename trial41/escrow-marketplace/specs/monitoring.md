# Escrow Marketplace — Monitoring Specification

## Overview

Comprehensive observability via structured logging, correlation IDs,
health checks, metrics, and error tracking. T41 variation adds
RequestContextService for request-scoped context propagation.

## Structured Logging

<!-- VERIFY:EM-MON-03 Pino structured logger service -->

Pino logger produces JSON-formatted output. Log levels: error, warn,
info, debug. Logger is injectable via NestJS DI (LoggerService).
No console.log in production code — all output via structured logger.

## Correlation IDs

<!-- VERIFY:EM-MON-01 correlation ID generation -->
<!-- VERIFY:EM-MON-05 correlation ID middleware with RequestContextService -->

Every request receives a unique correlation ID via X-Correlation-ID header.
If the client sends one, it is preserved. Otherwise a UUID is generated.
The correlation ID appears in all log entries and error responses.

## RequestContextService (T41 Variation)

<!-- VERIFY:EM-MON-02 RequestContextService — request-scoped provider -->
<!-- VERIFY:EM-MON-10 monitoring module exporting RequestContextService -->

Request-scoped NestJS provider storing:
- correlationId (set by CorrelationIdMiddleware)
- userId (set after JWT authentication)
- tenantId (set after JWT authentication)

GlobalExceptionFilter and RequestLoggingMiddleware read from this
service instead of parsing headers directly. Exported from
MonitoringModule and importable by domain modules.

## Health Endpoints

<!-- VERIFY:EM-MON-08 health endpoints exempt from auth and rate limiting -->

- GET /health — Returns { status: 'ok', timestamp, uptime, version }
- GET /health/ready — Checks database connectivity via Prisma $queryRaw
- Both exempt from JWT auth guard and rate limiting

## Request Logging

<!-- VERIFY:EM-MON-06 request logging middleware using RequestContextService -->

Logs for every request: method, URL, status code, duration, correlationId.
Uses structured logger (not console/process.stderr).
Also records metrics (request count, error count).

## Error Tracking

<!-- VERIFY:EM-MON-07 GlobalExceptionFilter as APP_FILTER using RequestContextService -->

GlobalExceptionFilter registered as APP_FILTER in AppModule (never main.ts).
Logs unhandled exceptions with: stack trace, correlationId, request context.
Returns sanitized error to client (no stack traces in production).
Includes correlationId in error response body.

## Metrics

<!-- VERIFY:EM-MON-04 in-memory metrics service -->
<!-- VERIFY:EM-MON-09 metrics endpoint -->

GET /metrics returns:
- requestCount — total requests processed
- errorCount — total error responses (4xx + 5xx)
- averageResponseTime — mean response time in ms
- uptime — seconds since process start
Stored in-memory (no external dependency).

## Frontend Error Boundaries

<!-- VERIFY:EM-MON-12 frontend error boundary with structured logging -->

Error boundaries log errors with structured JSON format including:
- error message, digest, stack trace, timestamp, component name
- Logged via console.error (sent to API in production)

## Monitoring Tests

<!-- VERIFY:EM-MON-11 monitoring integration tests with supertest -->

Integration tests with supertest verify:
- Health endpoints return correct format
- Health endpoints bypass auth
- Correlation IDs generated and preserved
- Error responses sanitized (no stack traces)
- Metrics endpoint accessible

## Alerting Thresholds (Recommended)

| Metric | Warning | Critical |
|--------|---------|----------|
| Error rate | > 1% | > 5% |
| Avg response time | > 500ms | > 2000ms |
| Uptime | < 99.9% | < 99% |

## Cross-References

- See [security.md](./security.md) for error sanitization requirements
- See [architecture.md](./architecture.md) for module organization
