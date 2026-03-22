# Monitoring Specification

## Overview
Analytics Engine implements structured logging, correlation IDs, health checks,
and operational metrics. This is Layer 8 of the SDD methodology.
See [performance.md](./performance.md) for response time interceptor details.

## Structured Logging

### VERIFY:AE-MON-002 — formatLogEntry outputs JSON with timestamp, level, message, and sanitized context
### VERIFY:AE-MON-003 — PinoLoggerService is injectable and uses formatLogEntry for all log output

All log output is JSON-formatted via Pino logger. No console.log in apps/api/src/.
Log levels: error, warn, info, debug. The logger is injectable via NestJS DI.

## Correlation IDs

### VERIFY:AE-MON-001 — createCorrelationId generates UUID v4 from shared package
### VERIFY:AE-MON-004 — RequestContextService is request-scoped, stores correlationId/userId/tenantId
### VERIFY:AE-MON-005 — CorrelationIdMiddleware generates UUID or preserves client X-Correlation-ID

Every request gets a unique correlation ID via middleware. If the client sends
X-Correlation-ID header, it is preserved. Otherwise, a UUID v4 is generated
using createCorrelationId from the shared package.

## Request Logging

### VERIFY:AE-MON-006 — RequestLoggingMiddleware logs method, URL, statusCode, duration, correlationId

Request logging middleware fires on response finish, capturing method, URL,
status code, duration, and correlation ID using the structured logger.

## Error Handling

### VERIFY:AE-MON-007 — GlobalExceptionFilter logs exceptions with stack trace and sanitized request body
### VERIFY:AE-MON-013 — GlobalExceptionFilter uses sanitizeLogContext on request body before logging
### VERIFY:AE-MON-014 — GlobalExceptionFilter registered as APP_FILTER in AppModule (not via main.ts)

The global exception filter catches all unhandled exceptions, logs full details
(including stack trace and correlation ID), and returns a sanitized response
to the client with no stack traces exposed.

## Health Checks

### VERIFY:AE-MON-009 — HealthController provides /health (status+uptime+version), /health/ready (DB), /metrics

Health endpoints are public (skip auth guard) and exempt from rate limiting.
- GET /health: returns status, timestamp, uptime, version
- GET /health/ready: checks database via $queryRaw
- GET /metrics: returns request/error counts, avg response time, uptime

## Metrics

### VERIFY:AE-MON-008 — MetricsService tracks requestCount, errorCount, totalResponseTime in memory

Metrics are stored in-memory with no external dependency. The ResponseTimeInterceptor
reports to MetricsService on each request.

## Trial 42 Variation: LogSanitizer

### VERIFY:AE-MON-010 — sanitizeLogContext defines SENSITIVE_KEYS list for redaction
### VERIFY:AE-MON-011 — sanitizeLogContext performs deep sanitization of nested objects and arrays
### VERIFY:AE-MON-012 — LogSanitizer unit tests cover all sensitive fields, case-insensitivity, nesting

The LogSanitizer redacts sensitive fields from log context objects:
- password, passwordHash, token, accessToken, secret, authorization
- Case-insensitive key matching
- Replaces values with '[REDACTED]'
- Recursively sanitizes nested objects and arrays

## Frontend Error Logging

### VERIFY:AE-UI-002 — logErrorBoundary uses formatLogEntry and createCorrelationId from shared

Error boundaries log errors with structured format including correlation ID.

## Monitoring Testing

### VERIFY:AE-TEST-006 — Monitoring integration tests verify health, correlation, metrics, error sanitization
### VERIFY:AE-TEST-009 — Accessibility tests use jest-axe with real component rendering
### VERIFY:AE-TEST-010 — Keyboard tests use userEvent for Tab, Enter, Space navigation

## UI Pages

### VERIFY:AE-UI-005 — Server Actions check response.ok and return error objects
### VERIFY:AE-UI-006 — DashboardsPage uses Card, Table, Badge components
### VERIFY:AE-UI-007 — LoginPage uses Card, Input, Label, Button, Alert components
