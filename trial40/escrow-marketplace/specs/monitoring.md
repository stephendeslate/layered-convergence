# Monitoring Specification

## Overview

Layer 8 adds observability to the Escrow Marketplace: structured logging,
correlation IDs, health endpoints, request logging, exception tracking,
and operational metrics. See [api.md](./api.md) for endpoint contracts.

## Structured Logging

- Pino-based structured JSON logging
- All log output is JSON-formatted (no console.log)
- Log levels: error, warn, info, debug
- Logger injectable via NestJS DI (AppLoggerService)
- formatLogEntry() from shared package produces JSON strings

## VERIFY Tags

- VERIFY: EM-MON-001 — createCorrelationId generates UUID v4
- VERIFY: EM-MON-002 — formatLogEntry returns JSON-formatted log string
- VERIFY: EM-MON-003 — Pino structured JSON logging in NestJS
- VERIFY: EM-MON-004 — Global exception filter as APP_FILTER
- VERIFY: EM-MON-005 — Monitoring module with health, metrics, and middleware
- VERIFY: EM-MON-006 — Health endpoints exempt from auth and rate limiting
- VERIFY: EM-MON-007 — In-memory metrics collection
- VERIFY: EM-MON-008 — Correlation ID middleware preserves or generates X-Correlation-ID
- VERIFY: EM-MON-009 — Request logging middleware with structured output
- VERIFY: EM-MON-010 — Global exception filter with sanitized error responses
- VERIFY: EM-MON-011 — Injectable Pino-based structured logger via DI

## Correlation IDs

- Every request gets X-Correlation-ID header
- If client sends one, it is preserved; otherwise UUID v4 is generated
- createCorrelationId() utility in shared package
- Correlation ID appears in all log entries for that request
- Implemented via NestJS CorrelationIdMiddleware

## Health Endpoints

### GET /health
Returns: `{ status: 'ok', timestamp, uptime, version }`
- Exempt from auth guards (@SkipThrottle)
- Exempt from rate limiting
- Dockerfile HEALTHCHECK targets this endpoint

### GET /health/ready
Returns: `{ status: 'ok'|'degraded', timestamp, database }`
- Checks database connectivity via Prisma $queryRaw
- Returns 'degraded' if DB unreachable

### GET /health/metrics
Returns: `{ requestCount, errorCount, averageResponseTimeMs, uptimeSeconds }`
- In-memory MetricsService (no external dependency)

## Request Logging Middleware

- Logs method, URL, status code, duration, correlationId
- Uses formatLogEntry() from shared (structured JSON)
- Runs on all routes via NestModule.configure()

## Global Exception Filter

- Catches all unhandled exceptions
- Logs full stack trace with correlationId and request context
- Returns sanitized error to client (no stack traces in production)
- Registered as APP_FILTER in AppModule

## Frontend Error Boundary Logging

- Error boundaries log errors with component stack
- Structured format including timestamp, message, digest
- Error details not exposed to end users

## Alerting Thresholds (Reference)

- Health endpoint response time > 500ms: warning
- Error rate > 5% of requests: alert
- Database connectivity lost: critical
- Average response time > 1000ms: warning

## Test Coverage

- VERIFY: EM-TEST-001 — Auth service unit tests
- VERIFY: EM-TEST-002 — Listings service unit tests
- VERIFY: EM-TEST-003 — Transactions service unit tests with state machine
- VERIFY: EM-TEST-004 — Auth integration tests with supertest
- VERIFY: EM-TEST-005 — Domain integration tests with supertest
- VERIFY: EM-TEST-006 — Security tests with supertest
- VERIFY: EM-TEST-007 — Performance tests for L7 features
- VERIFY: EM-TEST-008 — Monitoring tests for L8 features
- VERIFY: EM-TEST-009 — Accessibility tests with jest-axe
- VERIFY: EM-TEST-010 — Keyboard navigation tests with userEvent

Tests cover health endpoints, correlation ID propagation,
structured log format, error sanitization, and metrics tracking.
