# Cross-Layer Integration Specification -- Field Service Dispatch

## Overview

This specification documents how the different architectural layers
of Field Service Dispatch integrate and interact. Layer 9 (Cross-Layer
Integration) requires that all prior layers (L0-L8) work together
coherently, with verifiable integration points.

## Middleware Ordering

The request processing pipeline executes in this order:

1. **Helmet CSP** -- Applied in main.ts bootstrap, runs first
2. **CORS** -- Configured in main.ts, validates origin
3. **CorrelationIdMiddleware** -- Assigns or preserves X-Correlation-ID
4. **RequestLoggingMiddleware** -- Logs request entry with correlation ID
5. **ThrottlerGuard** (APP_GUARD) -- Rate limiting check
6. **JwtAuthGuard** -- JWT verification (skipped for @Public routes)
7. **ValidationPipe** -- DTO validation with whitelist/transform
8. **ResponseTimeInterceptor** (APP_INTERCEPTOR) -- Wraps handler with timing
9. **Route Handler** -- Controller method executes
10. **ResponseTimeInterceptor** (post) -- Sets X-Response-Time header
11. **GlobalExceptionFilter** (APP_FILTER) -- Catches any thrown exceptions

## Guard / Interceptor / Filter Chain

### Guards (pre-handler)
- ThrottlerGuard runs before JwtAuthGuard
- @SkipThrottle() on health/metrics endpoints
- @Public() decorator bypasses JWT verification
- Guards execute before interceptors

### Interceptors (wrap handler)
- ResponseTimeInterceptor wraps the entire handler execution
- Uses RxJS tap() to set response header after handler completes
- Records timing to MetricsService for aggregation

### Exception Filters (catch errors)
- GlobalExceptionFilter catches all unhandled exceptions
- Extracts correlationId from RequestContextService
- Includes correlationId in error response body (FM#98)
- Sanitizes request body before logging (redacts password/token)
- Never exposes stack traces to clients

## Error Response Integration

All error responses include a consistent structure:
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "correlationId": "uuid-here"
}
```

The correlationId field enables end-to-end request tracing:
1. Client sends X-Correlation-ID header (or server generates one)
2. Middleware stores it in RequestContextService
3. On error, GlobalExceptionFilter reads it from context
4. Error response includes correlationId for client-side correlation
5. Server logs include same correlationId for log aggregation

## Health Endpoint Integration

GET /health returns APP_VERSION from the shared package:
- APP_VERSION is defined in packages/shared/src/constants.ts
- Same value used in health endpoint response and web app footer
- Ensures version consistency across API and frontend

## Authentication Integration Chain

Full registration-to-CRUD flow:
1. POST /auth/register -- creates user, returns JWT
2. POST /auth/login -- authenticates user, returns JWT
3. GET /work-orders -- requires valid JWT in Authorization header
4. Response includes X-Correlation-ID and X-Response-Time headers
5. Validation errors return correlationId in response body

## Shared Package Integration

The shared package provides utilities used by both apps:
- **constants.ts** -- BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES, APP_VERSION
- **correlation.ts** -- createCorrelationId() used by API middleware and web client
- **log-sanitizer.ts** -- sanitizeLogContext() used by API exception filter
- **log-format.ts** -- formatLogEntry() used by API logger and web error logging
- **pagination.ts** -- normalizePageParams() used by all domain services
- **env-validation.ts** -- validateEnvVars() called at API startup

## Cross-Layer Test Coverage

The cross-layer integration test (cross-layer.integration.spec.ts) verifies:
1. Register -> login -> receive valid JWT
2. Authenticated request returns X-Correlation-ID header
3. Authenticated request returns X-Response-Time header
4. Validation error returns correlationId in response body
5. Validation error does not expose stack traces
6. Health endpoint returns APP_VERSION from shared
7. Error structure is consistent across all domain endpoints

## Cross-References

- See [architecture.md](./architecture.md) for module structure
- See [monitoring.md](./monitoring.md) for correlation ID flow
- See [security.md](./security.md) for error response sanitization
- See [authentication.md](./authentication.md) for JWT guard chain
