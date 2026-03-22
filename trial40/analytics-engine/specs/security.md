# Security Specification

## Overview
Comprehensive security posture with defense-in-depth approach.
Covers HTTP security, input validation, rate limiting, and database security.

## HTTP Security Headers (Helmet.js)
Content Security Policy directives:
- default-src: 'self'
- script-src: 'self'
- style-src: 'self' 'unsafe-inline'
- img-src: 'self' data:
- frame-ancestors: 'none'
- VERIFY:AE-SEC-05 — Security tests with supertest HTTP assertions
- VERIFY:AE-SEC-06 — CSP and security headers verification

Additional headers set by Helmet:
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 0 (modern CSP replaces this)

## CORS Configuration
- Origin from CORS_ORIGIN environment variable (no fallback value)
- Credentials: true
- Allowed headers: Content-Type, Authorization, X-Correlation-ID
- Allowed methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- VERIFY:AE-SEC-08 — ThrottlerModule as APP_GUARD with CORS from env

## Rate Limiting
- Global: 100 requests per 60 seconds (ThrottlerModule)
- Auth endpoints: 5 requests per 60 seconds (@Throttle override)
- ThrottlerGuard registered as APP_GUARD in AppModule

## Input Validation
- ValidationPipe: whitelist, forbidNonWhitelisted, transform
- All DTO string fields: @IsString() + @MaxLength()
- All DTO UUID fields: @MaxLength(36)
- Role validation: @IsIn(ALLOWED_REGISTRATION_ROLES) from shared
- VERIFY:AE-SEC-01 — sanitizeInput strips HTML for XSS prevention
- VERIFY:AE-SEC-02 — maskSensitive hides PII in logs
- VERIFY:AE-SEC-03 — generateId uses crypto.randomBytes

## Environment Security
- No hardcoded secret fallbacks anywhere
- JWT_SECRET validated at startup
- CORS_ORIGIN validated at startup
- DATABASE_URL validated at startup
- VERIFY:AE-INFRA-04 — Environment variable validation at startup

## Database Security
- Row Level Security (RLS) enabled and forced on all tables
- Prisma parameterized queries only ($executeRaw with Prisma.sql)
- Zero $executeRawUnsafe usage
- Zero dangerouslySetInnerHTML in frontend

## Password Security
- bcrypt with 12 salt rounds (BCRYPT_SALT_ROUNDS from shared)
- Minimum 8 characters, maximum 128 characters
- Salt rounds never hardcoded in application code
Cross-reference: auth.md for full authentication flow.

## Audit Requirements
- pnpm audit --audit-level=high in CI pipeline
- No known high or critical vulnerabilities allowed
- VERIFY:AE-TEST-01 — Auth service unit tests
- VERIFY:AE-TEST-02 — Events service unit tests
- VERIFY:AE-TEST-03 — Dashboards service unit tests
Cross-reference: infrastructure.md for CI pipeline details.
