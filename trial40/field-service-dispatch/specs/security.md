# Security Specification

## Overview

Security is implemented across multiple layers: input sanitization, authentication,
rate limiting, HTTP headers, and data isolation.

## Input Sanitization

- VERIFY: FD-SEC-001 — All user-facing string inputs pass through sanitizeInput() which strips HTML tags
- VERIFY: FD-SEC-002 — XSS prevention validated via unit tests on sanitizeInput()
- VERIFY: FD-SEC-003 — Rate limiting enforced via NestJS ThrottlerGuard (100 req/60s default)

## Authentication Security

- JWT tokens signed with JWT_SECRET (env variable, fail-fast if missing)
- Passwords hashed with bcrypt at salt round 12
- Hash operations wrapped in withTimeout(5000ms) to prevent DoS
- ADMIN role cannot be created via self-registration endpoint

## HTTP Security Headers

Helmet middleware provides:
- Content-Security-Policy with restrictive defaults
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Strict-Transport-Security (HSTS)

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| Global default | 100 | 60s |
| POST /auth/register | 5 | 60s |
| POST /auth/login | 5 | 60s |
| GET /health | Exempt | - |
| GET /health/ready | Exempt | - |
| GET /metrics | Exempt | - |

## Data Isolation

- All queries scoped by tenantId from JWT token payload
- Prisma findFirst used instead of findUnique for tenant-scoped lookups
- Row Level Security enabled on all PostgreSQL tables
- Foreign keys with ON DELETE RESTRICT prevent orphan records

## Sensitive Data Handling

- VERIFY: FD-SEC-006 — maskSensitive() used on email in registration response
- No stack traces in production error responses (GlobalExceptionFilter)
- No console.log in production code
- No $executeRawUnsafe — only template literal $executeRaw

## DTO Validation

All Data Transfer Objects enforce:
- @IsString() on every string field
- @MaxLength() on every string field to prevent oversized payloads
- @IsEmail() on email fields
- @IsEnum() on enum fields
- @IsOptional() on nullable fields
- ValidationPipe with whitelist: true and forbidNonWhitelisted: true

## CORS Configuration

- Origins restricted to CORS_ORIGIN environment variable
- Credentials enabled
- X-Correlation-ID exposed in Access-Control-Expose-Headers

## Environment Variables

Critical variables that cause fail-fast startup if missing:
- JWT_SECRET
- CORS_ORIGIN (logs warning, defaults to http://localhost:3001)
- DATABASE_URL (required by Prisma)

## Error Response Sanitization

- Production 500 errors return generic "Internal server error" message
- Non-production environments return detailed error info
- Stack traces never exposed to clients in production

## Cross-References

- JWT authentication and password hashing details: see [Authentication Specification](auth.md)
- GlobalExceptionFilter and structured error logging: see [Monitoring Specification](monitoring.md)
