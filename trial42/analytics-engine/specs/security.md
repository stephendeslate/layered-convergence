# Security Specification

## Overview
Analytics Engine implements defense-in-depth security across multiple layers.
See [authentication.md](./authentication.md) for JWT auth details.

## Helmet Configuration

### VERIFY:AE-SEC-003 — Bootstrap validates JWT_SECRET, CORS_ORIGIN, DATABASE_URL env vars at startup
### VERIFY:AE-SEC-004 — Helmet CSP: default-src self, script-src self, style-src self unsafe-inline, img-src self data:, frame-ancestors none

Content Security Policy headers are set via Helmet middleware in main.ts bootstrap.

## CORS Configuration

### VERIFY:AE-SEC-005 — CORS origin from CORS_ORIGIN env (no fallback), credentials true, explicit headers/methods

CORS is configured with no fallback origin — the CORS_ORIGIN environment variable
is required. Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS.
Allowed headers: Content-Type, Authorization, X-Correlation-ID.

## Rate Limiting

### VERIFY:AE-SEC-009 — ThrottlerModule configured with 100/60s default rate limit
### VERIFY:AE-SEC-010 — ThrottlerGuard and JwtAuthGuard registered as APP_GUARD in AppModule

Default rate limit: 100 requests per 60 seconds.
Auth endpoints (login, register): 5 requests per 60 seconds via @Throttle decorator.
Health endpoints exempt from throttling via @SkipThrottle decorator.

## Input Validation

### VERIFY:AE-SEC-006 — ValidationPipe uses whitelist + forbidNonWhitelisted + transform
### VERIFY:AE-SEC-007 — LoginDto uses @IsEmail, @IsString, @MaxLength on all fields
### VERIFY:AE-SEC-008 — RegisterDto uses @IsIn(ALLOWED_REGISTRATION_ROLES) from shared, excludes ADMIN

All DTO string fields have @IsString() + @MaxLength().
UUID fields have @MaxLength(36).
Extra fields are rejected by forbidNonWhitelisted.

## Shared Constants

### VERIFY:AE-SEC-001 — BCRYPT_SALT_ROUNDS exported from shared as 12
### VERIFY:AE-SEC-002 — ALLOWED_REGISTRATION_ROLES exported from shared, excludes ADMIN

## Security Testing

### VERIFY:AE-TEST-007 — Security integration tests verify auth rejection, input validation, health access

Security tests use supertest with real AppModule for HTTP-level assertions.

## Absolute Rules
- No `as any` anywhere in the codebase
- No $executeRawUnsafe
- No dangerouslySetInnerHTML
- No hardcoded secret fallbacks
- No Float for money fields
- findFirst always has justification comment
