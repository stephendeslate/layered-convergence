# Security Specification

## Overview

Security hardening is applied across all layers of the application,
covering HTTP headers, rate limiting, input validation, SQL injection
prevention, and XSS protection.

## HTTP Security Headers

<!-- VERIFY: FD-SEC-001 — Helmet with Content Security Policy -->

Helmet.js is configured with a Content Security Policy that restricts
resource loading:

- **default-src**: 'self' only
- **script-src**: 'self' only (no unsafe-inline or unsafe-eval)
- **style-src**: 'self' with 'unsafe-inline' for dynamic styles
- **img-src**: 'self' and data: URIs
- **frame-ancestors**: 'none'

Additional headers set by Helmet:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Strict-Transport-Security (HSTS)
- Referrer-Policy: no-referrer

## Rate Limiting

<!-- VERIFY: FD-SEC-002 — Rate limiting via ThrottlerModule registered as APP_GUARD -->

Two tiers of rate limiting are implemented:

1. **Global**: 100 requests per 60 seconds (all endpoints)
2. **Auth**: 5 requests per 60 seconds (login and register only)

The global throttler is registered as an APP_GUARD in AppModule so it
applies to all routes by default. Auth endpoints use @Throttle decorator
to override with stricter limits.

## CORS

<!-- VERIFY: FD-SEC-003 — CORS from environment with explicit headers and methods -->

CORS is configured from the CORS_ORIGIN environment variable with no
fallback value. Allowed headers include Content-Type, Authorization,
and X-Requested-With. Credentials are enabled. Allowed methods are
GET, POST, PUT, DELETE, and PATCH.

## Input Validation

All DTOs use class-validator decorators with explicit constraints:

- @IsString() on all text fields
- @MaxLength() on all string fields (prevents oversized payloads)
- @MaxLength(36) on all UUID fields
- @IsEnum() on status and priority fields
- @IsIn(ALLOWED_REGISTRATION_ROLES) on registration role
- @IsOptional() only where field is truly optional

The global ValidationPipe is configured with:
- whitelist: true (strips unknown properties)
- forbidNonWhitelisted: true (rejects unknown properties)
- transform: true (auto-type conversion)

## SQL Injection Prevention

All raw SQL queries use Prisma.sql tagged template literals for
parameterized queries. The codebase has zero uses of
$executeRawUnsafe or string concatenation in queries.

## XSS Prevention

<!-- VERIFY: FD-SEC-006 — Strip HTML tags from user input to prevent XSS -->

User input is sanitized via the shared sanitizeInput function which
strips HTML tags using a regex pattern. This is applied:
- Before database writes in auth service (email fields)
- Before database writes in technician service (name fields)
- Before database writes in work orders service (title, description)
- In server actions before forwarding to the API
- No use of dangerouslySetInnerHTML anywhere in the frontend

## Zero Tolerance Rules

The following patterns are explicitly prohibited:

- `as any` — Breaks type safety
- `console.log` — Use structured logger (console.error for seed only)
- `$executeRawUnsafe` — SQL injection vector
- `dangerouslySetInnerHTML` — XSS vector
- Raw `<select>` — Use accessible component instead
- `Float` for GPS — Use Decimal(10, 7) exclusively

## Cross-References

- See [Auth](./auth.md) for authentication and role-based access
- See [Infrastructure](./infrastructure.md) for CI security audit
