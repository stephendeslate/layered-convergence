# Cross-Layer Integration Specification

## Overview

Layer 9 (Cross-Layer Integration) ensures that all architectural layers work
together cohesively. This specification documents how middleware, guards,
interceptors, filters, and the shared package interact across the full
request lifecycle.

## VERIFY:AE-CROSS-001 -- APP_VERSION in Shared Package

`APP_VERSION` is defined in `packages/shared/src/constants.ts` and exported
from the shared package index. It defaults to `process.env.APP_VERSION ?? '1.0.0'`.
This constant is consumed by the health controller and referenced in CLAUDE.md.

## VERIFY:AE-CROSS-002 -- validateEnvVars in Shared Package

`validateEnvVars` is exported from `packages/shared/src/validate-env.ts`. It
accepts an array of required variable names and throws if any are missing.
Called during API bootstrap in `main.ts` to fail fast on misconfiguration.

## VERIFY:AE-CROSS-003 -- Bootstrap Validation

`main.ts` calls `validateEnvVars(['DATABASE_URL', 'JWT_SECRET'])` before
creating the NestJS application. This ensures critical configuration is
present at startup rather than failing at runtime.

## VERIFY:AE-CROSS-004 -- Guard Chain (APP_GUARD)

Two guards are registered as `APP_GUARD` in `AppModule`:
1. **ThrottlerGuard** -- rate limiting (runs first)
2. **JwtAuthGuard** -- authentication (runs second)

The `@Public()` decorator bypasses `JwtAuthGuard` via Reflector metadata.
Rate limiting still applies to public routes.

## VERIFY:AE-CROSS-005 -- Error Response with Correlation ID

The `GlobalExceptionFilter` (registered as `APP_FILTER`) retrieves the
correlation ID from `RequestContextService` and includes it in every error
response. This enables end-to-end request tracing even for failed requests.

## VERIFY:AE-CROSS-006 -- Health Endpoint with APP_VERSION

The `/health` endpoint returns `APP_VERSION` from the shared package in its
response body: `{ status: 'ok', version: APP_VERSION }`. This verifies that
the shared package constant flows correctly to the API runtime.

## Middleware Ordering

The request lifecycle follows this order:

```
1. CorrelationIdMiddleware  -- Generate/propagate X-Correlation-ID
2. RequestLoggingMiddleware -- Log request start with correlation ID
3. ThrottlerGuard           -- Rate limit check (APP_GUARD #1)
4. JwtAuthGuard             -- Authentication check (APP_GUARD #2)
5. ValidationPipe           -- DTO validation (global pipe)
6. Controller handler       -- Business logic execution
7. ResponseTimeInterceptor  -- Set X-Response-Time header (APP_INTERCEPTOR)
8. GlobalExceptionFilter    -- Catch and sanitize errors (APP_FILTER)
```

## Shared Package Bindings

The shared package (`@analytics-engine/shared`) provides cross-cutting
utilities consumed by both `apps/api` and `apps/web`:

| Export              | Consumer(s)       | Purpose                          |
|---------------------|-------------------|----------------------------------|
| BCRYPT_SALT_ROUNDS  | api (auth)        | Password hashing cost factor     |
| ALLOWED_ROLES       | api (auth dto)    | Registration role whitelist      |
| MAX_PAGE_SIZE       | api (services)    | Pagination upper bound           |
| DEFAULT_PAGE_SIZE   | api (services)    | Pagination default               |
| APP_VERSION         | api (health)      | Version in health response       |
| clampPageSize       | api (services)    | Clamp page size to max           |
| calculateSkip       | api (services)    | Calculate pagination offset      |
| createCorrelationId | api (middleware)   | Generate request trace IDs       |
| formatLogEntry      | api (logger)      | Structured log formatting        |
| sanitizeLogContext  | api (logger)      | Remove sensitive fields from logs|
| validateEnvVars     | api (bootstrap)   | Fail-fast env validation         |

## VERIFY:AE-CROSS-007 -- Cross-Layer Integration Test

`apps/api/test/cross-layer.integration.spec.ts` exercises the full integration:
1. Register a new user (auth + validation + shared constants)
2. Login with existing user (auth + bcrypt + JWT)
3. Create a dashboard (auth guard + controller + service + prisma)
4. Verify X-Correlation-ID header (middleware chain)
5. Verify X-Response-Time header (interceptor)
6. Trigger validation error (ValidationPipe + exception filter)
7. Verify correlationId in error response (filter + context service)
8. Verify /health returns APP_VERSION (shared package binding)

## VERIFY:AE-CROSS-008 -- End-to-End Flow Verification

The cross-layer test verifies that a single request passes through all layers:
middleware -> guards -> pipes -> controller -> service -> interceptor -> filter.
Error responses include correlation IDs. Health returns shared constants.
This confirms no layer is bypassed or misconfigured.

## Guard/Interceptor/Filter Registration

All cross-cutting concerns are registered in `AppModule.providers`:

```typescript
{ provide: APP_GUARD, useClass: ThrottlerGuard }
{ provide: APP_GUARD, useClass: JwtAuthGuard }
{ provide: APP_FILTER, useClass: GlobalExceptionFilter }
{ provide: APP_INTERCEPTOR, useClass: ResponseTimeInterceptor }
```

This centralized registration ensures consistent behavior across all routes.
