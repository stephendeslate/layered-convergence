# Security Specification

## Overview

Security is implemented across multiple layers: input validation, authentication,
rate limiting, HTTP headers, and error sanitization.

## VERIFY:AE-SEC-003 -- Helmet CSP

Helmet is configured in `main.ts` with Content Security Policy:
- `defaultSrc`: `'self'`
- `scriptSrc`: `'self'`
- `styleSrc`: `'self'`, `'unsafe-inline'`

## VERIFY:AE-SEC-004 -- CORS Configuration

CORS is enabled with `origin` set from `CORS_ORIGIN` environment variable
(defaults to `http://localhost:3000`). Credentials are enabled.

## VERIFY:AE-SEC-005 -- ValidationPipe

Global ValidationPipe configured with:
- `whitelist: true` -- strips unrecognized properties
- `forbidNonWhitelisted: true` -- rejects requests with unknown properties
- `transform: true` -- auto-transforms payloads to DTO instances

## VERIFY:AE-SEC-006 -- Environment Variable Validation

`validateEnvVars` from shared package is called during bootstrap in `main.ts`.
Validates that required environment variables (`DATABASE_URL`, `JWT_SECRET`) are
present before the application starts.

## VERIFY:AE-SEC-007 -- DTO String Validation

All DTO string fields include `@IsString()` and `@MaxLength()` decorators.
UUID fields use `@MaxLength(36)`. This prevents oversized payloads and ensures
type safety at the validation boundary.

## VERIFY:AE-SEC-008 -- Registration Role Validation

`RegisterDto.role` uses `@IsIn(ALLOWED_REGISTRATION_ROLES)` to restrict
self-registration to non-admin roles. The constant is imported from the shared
package for consistency.

## VERIFY:AE-SEC-009 -- ThrottlerGuard

ThrottlerGuard is registered as `APP_GUARD` with named configurations:
- `default`: 100 requests per 60 seconds
- `auth`: 5 requests per 60 seconds (applied to auth endpoints via `@Throttle`)

## VERIFY:AE-SEC-010 -- JwtAuthGuard as APP_GUARD

JwtAuthGuard is registered as `APP_GUARD`, enforcing authentication globally.
Only routes decorated with `@Public()` bypass JWT validation.

## Error Response Sanitization

The `GlobalExceptionFilter` ensures:
- No stack traces in production responses
- Sanitized error messages
- Correlation ID included in error responses for debugging
- Consistent error response shape: `{ statusCode, message, correlationId, timestamp }`

## Password Security

Bcrypt with 12 salt rounds. Passwords never exposed in responses.
`findFirst` used for email lookup with justification comments.

## No Unsafe Patterns

- No `as any` type assertions
- No `console.log` in production code
- No `|| 'value'` fallback for environment variables (use `?? 'value'`)

## Cross-References

- See [authentication.md](./authentication.md) for JWT strategy and guard registration details
- See [monitoring.md](./monitoring.md) for error response sanitization via GlobalExceptionFilter
- See [cross-layer.md](./cross-layer.md) for how security layers integrate with the full request pipeline
