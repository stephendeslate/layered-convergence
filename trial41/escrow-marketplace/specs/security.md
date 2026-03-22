# Escrow Marketplace — Security Specification

## Overview

Defense-in-depth security with Helmet CSP, CORS, rate limiting,
input validation, and environment variable protection.

## Helmet Configuration

<!-- VERIFY:EM-APP-02 main.ts with Helmet CSP and CORS -->

Content Security Policy directives:
- default-src: 'self'
- script-src: 'self'
- style-src: 'self' 'unsafe-inline'
- img-src: 'self' data:
- frame-ancestors: 'none'

## CORS Configuration

CORS origin loaded from CORS_ORIGIN environment variable.
No hardcoded fallback origin. Configuration includes:
- credentials: true
- Allowed headers: Content-Type, Authorization, X-Correlation-ID
- Allowed methods: GET, POST, PUT, DELETE, PATCH, OPTIONS

## Rate Limiting

ThrottlerModule registered as APP_GUARD in AppModule:
- Global: 100 requests per 60 seconds
- Auth endpoints: 5 requests per 60 seconds

## Input Validation

All DTOs enforce:
- @IsString() on all string fields
- @MaxLength() on all string fields
- @MaxLength(36) on all UUID fields
- @IsIn(ALLOWED_REGISTRATION_ROLES) on role field
- ValidationPipe: whitelist, forbidNonWhitelisted, transform

## Environment Variable Validation

<!-- VERIFY:EM-SEC-08 environment variable validation at startup -->

Required variables validated at startup:
- DATABASE_URL
- JWT_SECRET
- CORS_ORIGIN

Missing variables cause immediate process failure.

## Database Security

Row Level Security enabled and forced on all tables.
No $executeRawUnsafe anywhere in the codebase.
$executeRaw used only with Prisma.sql template tags.

## Code Security

- Zero `as any` casts
- Zero `console.log` in production code (structured logger instead)
- Zero hardcoded secret fallbacks
- Zero dangerouslySetInnerHTML usage

## Security Tests

<!-- VERIFY:EM-SEC-09 security integration tests with supertest -->

Integration tests verify:
- Protected endpoints reject unauthenticated requests
- Unknown fields stripped from request bodies
- Oversized UUID fields rejected
- Security headers present
- ADMIN role rejected in registration

## Cross-References

- See [auth.md](./auth.md) for JWT and role guard implementation
- See [monitoring.md](./monitoring.md) for error sanitization in responses
