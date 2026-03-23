# Monitoring Specification

## Overview

The monitoring subsystem provides structured logging, request tracing via
correlation IDs, health checks, metrics collection, and error sanitization.

## VERIFY:AE-MON-001 -- Correlation ID Generator

`createCorrelationId` is exported from `packages/shared/src/correlation.ts`. It
generates a UUID v4 string used as the correlation ID for request tracing.

## VERIFY:AE-MON-002 -- Log Entry Formatter

`formatLogEntry` is exported from `packages/shared/src/log-format.ts`. It
formats structured log entries with timestamp, level, message, and context.

## VERIFY:AE-MON-003 -- Pino Logger Service

`PinoLoggerService` wraps the pino logger and uses `formatLogEntry` from the
shared package to produce structured JSON log output. Supports log levels:
info, warn, error, debug.

## VERIFY:AE-MON-004 -- Request Context Service

`RequestContextService` is `REQUEST` scoped (one instance per request). It
stores the correlation ID for the current request, making it available to
services, filters, and interceptors within the request lifecycle.

## VERIFY:AE-MON-005 -- Correlation ID Middleware

The correlation ID middleware runs first in the middleware chain. It:
1. Checks for an existing `X-Correlation-ID` header from the client
2. If absent, generates a new UUID via `createCorrelationId` from shared
3. Stores the correlation ID in `RequestContextService`
4. Sets the `X-Correlation-ID` response header

## VERIFY:AE-MON-006 -- Request Logging Middleware

Logs each request with: HTTP method, URL, status code, response duration in
milliseconds, and correlation ID. Uses `PinoLoggerService` for structured output.

## VERIFY:AE-MON-007 -- Global Exception Filter

`GlobalExceptionFilter` catches all unhandled exceptions and returns a sanitized
response. Stack traces are never exposed. The response includes `correlationId`
for cross-referencing with server logs.

## VERIFY:AE-MON-008 -- Metrics Service

In-memory metrics collection tracking:
- Total request count
- Error count
- Response time histogram (min, max, avg)

Exposed via `GET /metrics` endpoint (protected by JWT).

## VERIFY:AE-MON-009 -- Health Controller

Three health endpoints:
- `GET /health` -- Basic health check, returns `{ status: 'ok', version: APP_VERSION }`
- `GET /health/ready` -- Readiness check with database connectivity verification
- `GET /metrics` -- Current metrics snapshot

## VERIFY:AE-MON-013 -- Error Response Shape

Error responses follow a consistent shape:
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "correlationId": "uuid",
  "timestamp": "ISO-8601"
}
```

## VERIFY:AE-MON-014 -- Middleware Ordering

Middleware is applied in `AppModule.configure()`:
1. CorrelationIdMiddleware (first -- generates/propagates correlation ID)
2. RequestLoggingMiddleware (second -- logs with correlation ID)

This ordering ensures correlation IDs are available for all subsequent logging.

## VERIFY:AE-MON-010 -- Log Context Sanitizer

`sanitizeLogContext` is exported from `packages/shared/src/log-sanitizer.ts`. It
removes sensitive fields (passwords, tokens, secrets) from log context objects.

## VERIFY:AE-MON-011 -- Sensitive Field Detection

The sanitizer detects keys matching patterns like `password`, `secret`, `token`,
`authorization`, and `key` (case-insensitive) and replaces their values with
`[REDACTED]`.

## VERIFY:AE-MON-012 -- Log Sanitizer Tests

Unit tests in `packages/shared/src/__tests__/log-sanitizer.spec.ts` verify that
sensitive fields are redacted and non-sensitive fields are preserved.
