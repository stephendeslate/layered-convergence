# Security Specification

## Overview

The Escrow Marketplace implements defense-in-depth security across multiple layers:
HTTP headers, rate limiting, CORS, input validation, authentication, and data masking.

## Helmet CSP

Content Security Policy is configured via Helmet middleware in main.ts:
- default-src: 'self'
- script-src: 'self'
- style-src: 'self' 'unsafe-inline'
- img-src: 'self' data:
- frame-ancestors: 'none'

- VERIFY: EM-SEC-001 — Helmet CSP with restrictive directives in main.ts

## CORS Configuration

CORS origin is loaded from CORS_ORIGIN environment variable with no hardcoded fallback.
If CORS_ORIGIN is not set, the application throws an error at startup.
Credentials are enabled, with explicit methods and headers configured.

- VERIFY: EM-SEC-002 — CORS restricted to CORS_ORIGIN env var with no fallback

## Rate Limiting

ThrottlerModule is configured with a global limit of 100 requests per 60 seconds.
Auth endpoints (register, login) have stricter limits of 5 requests per 60 seconds
via @Throttle decorator. ThrottlerGuard is registered as APP_GUARD.

- VERIFY: EM-SEC-003 — ThrottlerModule with APP_GUARD and per-endpoint overrides

## Input Validation

ValidationPipe is configured with whitelist (strips unknown properties),
forbidNonWhitelisted (rejects requests with unknown properties), and transform.
All DTO string fields have @IsString() and @MaxLength() decorators.
All UUID fields have @MaxLength(36).

- VERIFY: EM-SEC-004 — ValidationPipe with whitelist, forbidNonWhitelisted, transform

## Data Masking

The maskSensitive utility masks all but the last N characters of sensitive strings.
Used for audit logging where PII must be obscured.

- VERIFY: EM-SEC-005 — maskSensitive utility for PII protection in logs

## XSS Prevention

The sanitizeInput utility strips HTML tags from user input. Combined with
ValidationPipe whitelist, this prevents XSS injection attacks.

- VERIFY: EM-SEC-006 — sanitizeInput strips HTML tags for XSS prevention

## Zero-Tolerance Rules

- No `as any` — proper types required everywhere
- No `$executeRawUnsafe` — use Prisma.sql template literals
- No `dangerouslySetInnerHTML` — use React text content
- No raw `<select>` elements in pages
- No Float for money — use Decimal(12,2)
- No hardcoded secret fallbacks

## Cross-References

- See auth.md for bcrypt hashing and JWT secret management
- See api.md for DTO validation decorators on all endpoints
