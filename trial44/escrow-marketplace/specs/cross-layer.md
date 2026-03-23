# Cross-Layer Integration

## Overview

Layer 9 (Cross-Layer Integration) documents how all architectural layers
interact end-to-end. This spec covers the middleware ordering, guard and
interceptor chain, shared package bindings, and filter pipeline that
ensures consistent behavior across the entire request lifecycle.

## Middleware Ordering

The NestJS request pipeline processes in this exact order:

1. **Helmet middleware** (main.ts) — Sets security headers (CSP, X-Content-Type-Options)
2. **CORS middleware** (main.ts) — Validates origin against CORS_ORIGIN env var
3. **CorrelationIdMiddleware** (MonitoringModule) — Assigns or preserves X-Correlation-ID
4. **RequestLoggingMiddleware** (MonitoringModule) — Logs method, URL, correlationId
5. **ThrottlerGuard** (APP_GUARD) — Rate limits: 100/60s default, 5/60s auth
6. **JwtAuthGuard** (APP_GUARD) — Authenticates via JWT, skips @Public() routes
7. **ValidationPipe** (main.ts) — Validates DTOs: whitelist, forbidNonWhitelisted, transform
8. **ResponseTimeInterceptor** (APP_INTERCEPTOR) — Wraps handler, measures duration
9. **Controller handler** — Business logic execution
10. **GlobalExceptionFilter** (APP_FILTER) — Catches errors, returns sanitized response

## Guard Chain

### APP_GUARD Registration (AppModule)

Both guards are registered as APP_GUARD in AppModule providers:

- VERIFY: EM-GUARD-001 — ThrottlerGuard as APP_GUARD (rate limiting)
- VERIFY: EM-GUARD-002 — JwtAuthGuard as APP_GUARD (authentication)

Guards execute in registration order. ThrottlerGuard runs first to
reject rate-limited requests before authentication overhead.

### Fail-Closed Architecture

JwtAuthGuard as APP_GUARD means ALL routes require authentication by
default. Routes that should be public must explicitly opt out:

- Auth endpoints: @Public() on login and register
- Health endpoints: @Public() on /health and /health/ready
- Metrics endpoint: @Public() on /metrics

This is a fail-closed design: forgetting to add @Public() results in
a 401, not an accidental security hole.

### @Public() Decorator

The @Public() decorator sets metadata via Reflector:
- Key: IS_PUBLIC_KEY (exported from public.decorator.ts)
- JwtAuthGuard checks this metadata in canActivate()
- If IS_PUBLIC_KEY is true, the guard returns true without JWT validation

## Interceptor Chain

### APP_INTERCEPTOR Registration

- VERIFY: EM-PERF-001 — ResponseTimeInterceptor as APP_INTERCEPTOR
- Uses performance.now() from Node.js perf_hooks
- Adds X-Response-Time header to every response
- Records timing in MetricsService for /metrics endpoint

## Filter Chain

### APP_FILTER Registration

- VERIFY: EM-FILT-001 — GlobalExceptionFilter as APP_FILTER
- Catches all unhandled exceptions across the application
- Returns correlationId in error response body for client tracking
- Sanitizes request body before logging (redacts passwords, tokens)
- Production responses exclude stack traces
- Non-production responses include stack traces for debugging

## Shared Package Bindings

The @escrow-marketplace/shared package provides cross-cutting utilities
used by both API and web applications:

- VERIFY: EM-SHRD-001 — Shared exports >= 8 utilities
- VERIFY: EM-CONST-001 — BCRYPT_SALT_ROUNDS used by auth and seed
- VERIFY: EM-CONST-002 — MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE used by services and web
- VERIFY: EM-CONST-003 — ALLOWED_REGISTRATION_ROLES used by auth DTO
- VERIFY: EM-CONST-004 — APP_VERSION used by health endpoint
- VERIFY: EM-CORR-001 — createCorrelationId used by middleware and web API layer
- VERIFY: EM-PAGE-001 — Pagination utilities used by all domain services
- VERIFY: EM-LOGF-001 — formatLogEntry used by logger and web error boundaries
- VERIFY: EM-LSAN-001 — sanitizeLogContext used by formatLogEntry and filter
- VERIFY: EM-ENV-002 — validateEnvVars used by main.ts at startup

## End-to-End Request Flow Example

A typical authenticated request (e.g., POST /listings):

1. Helmet sets security headers
2. CORS validates origin
3. CorrelationIdMiddleware assigns/preserves correlation ID
4. RequestLoggingMiddleware logs incoming request
5. ThrottlerGuard checks rate limit (100/60s)
6. JwtAuthGuard validates Bearer token, attaches user to request
7. ValidationPipe validates CreateListingDto fields
8. ResponseTimeInterceptor starts timer
9. ListingsController.create() calls ListingsService
10. ListingsService uses PrismaService to insert listing
11. ResponseTimeInterceptor adds X-Response-Time header
12. Response returned with correlation ID and timing headers

If any step fails (e.g., invalid JWT at step 6):
- GlobalExceptionFilter catches the 401 UnauthorizedException
- Logs error with correlationId from RequestContextService
- Returns sanitized error response with correlationId field

## Cross-Layer Test Coverage

- VERIFY: EM-TXLR-001 — Cross-layer integration test validates full pipeline
- Tests register + login + create listing flow end-to-end
- Verifies guard chain rejects unauthenticated requests
- Verifies response headers (X-Correlation-ID, X-Response-Time)
- Verifies validation layer rejects invalid payloads
- Verifies health endpoint returns APP_VERSION from shared
- Verifies error responses include correlationId field

## Cross-References

See [architecture.md](./architecture.md) for module structure.
See [security.md](./security.md) for guard and validation details.
See [monitoring.md](./monitoring.md) for middleware and filter details.
See [authentication.md](./authentication.md) for JWT and @Public() details.
