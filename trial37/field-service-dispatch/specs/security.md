# Security

**Project:** field-service-dispatch
**Layer:** 6 — Security
**Version:** 1.0.0

---

## Overview

Layer 6 focuses on security hardening across the entire stack. This
includes HTTP security headers via Helmet.js, rate limiting with
NestJS ThrottlerModule, CORS configuration, input validation with
DTO constraints, input sanitization to prevent XSS, and sensitive
data masking for logs and responses.

## HTTP Security Headers

Helmet.js is configured in main.ts with a Content Security Policy
that restricts script sources to self and inline, style sources to
self and inline, image sources to self and data URIs, and blocks
frame ancestors to prevent clickjacking.

- VERIFY: FD-SEC-001 — Helmet configured with CSP directives in main.ts

### CSP Directives

| Directive | Value | Purpose |
|-----------|-------|---------|
| default-src | 'self' | Restrict all resources to same origin |
| script-src | 'self' | Allow same-origin scripts |
| style-src | 'self' 'unsafe-inline' | Allow same-origin and inline styles |
| img-src | 'self' data: | Allow same-origin images and data URIs |
| frame-ancestors | 'none' | Prevent embedding in iframes |

## Rate Limiting

The ThrottlerModule is configured as a global guard to protect all
endpoints. Authentication endpoints have a stricter limit to prevent
brute-force attacks.

- VERIFY: FD-SEC-002 — ThrottlerModule with global guard (ttl: 60000, limit: 100)

### Rate Limits

| Scope | TTL (ms) | Limit | Purpose |
|-------|----------|-------|---------|
| Global | 60000 | 100 | General API protection |
| Auth controller | 60000 | 5 | Brute-force prevention |

## CORS Configuration

CORS is configured with explicit origin, allowed headers, methods,
and credentials support. The origin is read from CORS_ORIGIN env var
and validated at startup (fail-fast).

- VERIFY: FD-SEC-003 — CORS with credentials, allowedHeaders, and methods

## Input Validation

DTOs use class-validator decorators to enforce field-level constraints.
This prevents oversized payloads and enforces minimum complexity
requirements for passwords.

- VERIFY: FD-SEC-004 — DTOs use @MaxLength/@MinLength for all string fields

### Validation Rules

| Field | Min | Max | Decorator |
|-------|-----|-----|-----------|
| email | - | 255 | @MaxLength(255) |
| password | 8 | 128 | @MinLength(8), @MaxLength(128) |
| name | - | 100 | @MaxLength(100) |
| role | - | 100 | @MaxLength(100) |

## Parameterized Queries

All database queries use Prisma's query builder or $executeRaw with
Prisma.sql tagged template literals. The codebase contains zero uses
of $executeRawUnsafe to prevent SQL injection.

- VERIFY: FD-SEC-005 — PrismaService uses $executeRaw with Prisma.sql only

## Input Sanitization

The sanitizeInput utility strips HTML tags from user input using a
regex pattern and trims whitespace. This is applied in the auth
service (email), work orders service (title, description), and
technicians service (name) before persisting data.

- VERIFY: FD-SEC-006 — sanitizeInput strips HTML tags via /<[^>]*>/g regex

## Sensitive Data Masking

The maskSensitive utility masks all but the last N characters (default
4) of sensitive values. This is used in the auth service to mask
email addresses in responses, preventing full email exposure in logs
and API responses.

## Frontend Security

The frontend enforces security through:
- Zero uses of dangerouslySetInnerHTML
- Server actions validate response.ok before processing
- No raw user input rendered without React JSX escaping
- No inline event handlers with string code

## CI Security Audit

The CI pipeline includes `pnpm audit --audit-level=high` to detect
known vulnerabilities in dependencies before merge.

## Security Test Coverage

The security.spec.ts test file verifies:
- Helmet headers (CSP, X-Content-Type-Options, X-Frame-Options)
- X-Powered-By header removal
- Input validation constraints (email max length, password bounds)
- sanitizeInput function behavior
- maskSensitive function behavior
- slugify and truncateText utility behavior
