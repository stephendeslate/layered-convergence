# Monitoring Specification -- Field Service Dispatch

## Structured Logging

### Pino Logger

PinoLoggerService is a NestJS injectable LoggerService backed by Pino:
- All output is JSON-formatted (no console.log in API)
- Log levels: error, warn, info, debug
- Integrated with formatLogEntry() from shared package

### Log Sanitization

sanitizeLogContext() from packages/shared redacts sensitive fields:
- Redacted keys: password, passwordHash, token, accessToken, secret, authorization
- Case-insensitive key matching
- Deep nested object sanitization
- Used by formatLogEntry() before JSON serialization
- Used by GlobalExceptionFilter to sanitize request bodies

### formatLogEntry()

Produces JSON string with:
- timestamp (ISO 8601)
- level (error/warn/info/debug)
- message
- context fields (sanitized via sanitizeLogContext)

## Correlation IDs

### Flow

1. CorrelationIdMiddleware checks for X-Correlation-ID header
2. If present, preserves client-provided correlation ID
3. If absent, generates UUID via createCorrelationId() from shared
4. Sets X-Correlation-ID response header
5. Stores in RequestContextService for downstream use

### RequestContextService

Request-scoped NestJS provider storing:
- correlationId -- set by CorrelationIdMiddleware
- userId -- set by auth guard (if authenticated)
- tenantId -- set by auth guard (if authenticated)

Available to: GlobalExceptionFilter, RequestLoggingMiddleware, domain services

## Health Endpoints

### GET /health
- Returns: { status: 'ok', timestamp, uptime, version }
- version from APP_VERSION in shared package
- No database dependency
- Exempt from auth and rate limiting
- Dockerfile HEALTHCHECK targets this endpoint

### GET /health/ready
- Returns: { status: 'ok'|'error', database, timestamp }
- Checks database via Prisma $queryRaw`SELECT 1`
- Used for Kubernetes readiness probes

## Request Logging

RequestLoggingMiddleware logs for every request:
- HTTP method and URL
- Response status code
- Request duration in milliseconds
- Correlation ID from RequestContextService

## Error Tracking

### GlobalExceptionFilter

Registered as APP_FILTER in AppModule (never via main.ts):
- Catches all unhandled exceptions
- Logs full stack trace with correlation ID
- Sanitizes request body before logging
- Returns sanitized error to client (no stack traces)
- Includes correlationId in error response body (FM#98 -- L9)

### Frontend Error Reporting

- POST /errors endpoint accepts { message, stack, componentStack }
- Error boundaries in Next.js call logFrontendError()
- Sends error details to API for centralized logging

## Metrics

### GET /metrics
- requestCount -- total requests processed
- errorCount -- total unhandled errors
- averageResponseTime -- mean response time in ms
- uptime -- seconds since service start

All metrics stored in-memory (no external dependency).

## Cross-References

- See [architecture.md](./architecture.md) for module structure
- See [security.md](./security.md) for error sanitization details
- See [cross-layer.md](./cross-layer.md) for full integration chain
