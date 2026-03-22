# Security Specification

## Overview

Layer 6 security controls for the Analytics Engine platform. This specification
covers the threat model, implemented security controls, and verification tags
for all security-related features.

## Threat Model

### Attack Surface

1. **API Endpoints**: Public auth endpoints (login, register) and authenticated CRUD endpoints
2. **User Input**: Registration data, dashboard/pipeline creation data, search parameters
3. **Authentication Tokens**: JWT tokens in Authorization headers
4. **Database Queries**: Prisma ORM queries with user-provided filters
5. **Frontend Rendering**: Server-rendered HTML with user data display

### Threats Addressed

| Threat | Mitigation | Control |
|--------|-----------|---------|
| XSS (Cross-Site Scripting) | Helmet CSP headers, sanitizeInput(), no dangerouslySetInnerHTML | AE-SEC-001, AE-SEC-006 |
| Brute Force / DDoS | Rate limiting via @nestjs/throttler (100 req/min global, 5 req/min auth) | AE-SEC-002 |
| CSRF / Unauthorized Origins | CORS with explicit origin whitelist | AE-SEC-003 |
| Input Injection | class-validator with @MaxLength on all string fields, whitelist mode | AE-SEC-004 |
| SQL Injection | Prisma parameterized queries, no raw/unsafe query methods | AE-SEC-005 |
| Clickjacking | X-Frame-Options + CSP frame-ancestors:'none' | AE-SEC-001 |
| Information Disclosure | X-Powered-By removed, sensitive data masked in logs | AE-SEC-001 |

## Security Controls

### 1. Helmet.js + Content Security Policy (AE-SEC-001)

Applied in `main.ts` before any route handlers:
- `defaultSrc: ["'self'"]` — restricts default resource loading to same origin
- `scriptSrc: ["'self'"]` — prevents inline scripts and external script loading
- `styleSrc: ["'self'", "'unsafe-inline'"]` — allows inline styles for component styling
- `imgSrc: ["'self'", "data:"]` — allows same-origin and data URI images
- `frameAncestors: ["'none'"]` — prevents embedding in iframes (clickjacking protection)

### 2. Rate Limiting (AE-SEC-002)

Global rate limiting via ThrottlerModule in AppModule:
- **Global**: 100 requests per 60 seconds (configurable via RATE_LIMIT_TTL/RATE_LIMIT_MAX)
- **Auth endpoints**: 5 requests per 60 seconds via @Throttle decorator
- **Implementation**: APP_GUARD provider with ThrottlerGuard

### 3. CORS Configuration (AE-SEC-003)

Configured in `main.ts`:
- `origin`: Set from CORS_ORIGIN environment variable (fail-fast if missing)
- `credentials: true` — allows cookies and auth headers
- `allowedHeaders`: Content-Type, Authorization only
- `methods`: GET, POST, PUT, DELETE, PATCH

### 4. Input Validation (AE-SEC-004)

Global ValidationPipe with:
- `whitelist: true` — strips unknown properties
- `forbidNonWhitelisted: true` — rejects requests with unknown properties
- `transform: true` — auto-transforms payloads to DTO instances

DTO field constraints:
- Emails: @IsEmail() + @MaxLength(255)
- Passwords: @MinLength(8) + @MaxLength(128)
- Names: @IsString() + @MaxLength(100)
- All string fields: @MaxLength() required

### 5. SQL Injection Prevention (AE-SEC-005)

- All database access via Prisma ORM parameterized queries
- Zero `$executeRawUnsafe` or `$queryRawUnsafe` calls in codebase
- Row Level Security enabled and forced on all tables

### 6. XSS Prevention (AE-SEC-006)

- `sanitizeInput()` strips HTML tags from user input before storage
- No `dangerouslySetInnerHTML` in any .tsx file
- React's built-in JSX escaping for output encoding
- CSP headers prevent inline script execution

## Environment Variable Security

- `JWT_SECRET`: Required, application throws on startup if missing
- `CORS_ORIGIN`: Required, application throws on startup if missing
- `.env.example` provided with placeholder values
- Production secrets managed outside of version control

## Audit Logging

- `maskSensitive()` masks all but last 4 characters of sensitive values
- Registration events logged with masked email
- Pipeline status changes logged with masked pipeline IDs
- Logging via process.stderr.write (no console.log)

## Security Testing

`security.spec.ts` validates:
- Helmet headers are set correctly (CSP, X-Content-Type-Options, X-Frame-Options)
- X-Powered-By header is removed
- Rate limit headers are present
- Input validation rejects oversized fields
- Unknown request properties are rejected
- CORS headers returned for allowed origin

## VERIFY Tags

- `AE-SEC-001`: Helmet.js with CSP directives in main.ts <!-- VERIFY: AE-SEC-001 -->
- `AE-SEC-002`: Rate limiting via ThrottlerModule with APP_GUARD <!-- VERIFY: AE-SEC-002 -->
- `AE-SEC-003`: CORS with explicit origin from environment variable <!-- VERIFY: AE-SEC-003 -->
- `AE-SEC-004`: Input validation with class-validator and ValidationPipe <!-- VERIFY: AE-SEC-004 -->
- `AE-SEC-005`: SQL injection prevention via Prisma parameterized queries <!-- VERIFY: AE-SEC-005 -->
- `AE-SEC-006`: XSS prevention via sanitizeInput and no dangerouslySetInnerHTML <!-- VERIFY: AE-SEC-006 -->
