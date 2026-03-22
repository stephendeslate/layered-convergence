# Security Specification

## Overview

Security is implemented across multiple layers: transport (Helmet/CSP), authentication (JWT/bcrypt), authorization (RBAC), input validation (class-validator), rate limiting (ThrottlerModule), and data isolation (multi-tenancy with RLS).

## Transport Security

### Helmet Configuration
- Content-Security-Policy directives:
  - defaultSrc: 'self'
  - scriptSrc: 'self'
  - styleSrc: 'self' + 'unsafe-inline'
  - imgSrc: 'self' + data:
  - frameAncestors: 'none'
- X-Content-Type-Options: nosniff (Helmet default)
- X-Frame-Options: DENY (via frameAncestors 'none')
- X-Powered-By: removed (Helmet default)

### CORS
- Origin restricted to CORS_ORIGIN environment variable
- Credentials enabled for cookie-based auth flow
- Allowed headers: Content-Type, Authorization
- Allowed methods: GET, POST, PUT, DELETE, PATCH

## Rate Limiting

ThrottlerModule is configured globally in AppModule:
- Global rate limit: 100 requests per 60 seconds
- Auth endpoints (register, login): 5 requests per 60 seconds via @Throttle decorator
- ThrottlerGuard registered as APP_GUARD for global enforcement

## Input Validation

### ValidationPipe Configuration
- `whitelist: true` -- Strips properties not defined in the DTO
- `forbidNonWhitelisted: true` -- Rejects requests containing unknown properties
- `transform: true` -- Auto-transforms payloads to DTO class instances

### DTO Decorators
- `@IsString()` + `@MaxLength(N)` on all string fields
- `@IsEmail()` + `@MaxLength(255)` on email fields
- `@IsUUID()` + `@MaxLength(36)` on UUID fields
- `@IsIn(ALLOWED_REGISTRATION_ROLES)` on role field
- `@IsNumber({ maxDecimalPlaces: 2 })` + `@Min(0.01)` on price fields
- `@MinLength(8)` + `@MaxLength(128)` on password fields

## Data Security

### XSS Prevention
- `sanitizeInput()` strips all HTML tags from user-provided strings via regex
- No use of `dangerouslySetInnerHTML` anywhere in the frontend
- CSP headers restrict script execution to same-origin only

### SQL Injection Prevention
- Prisma ORM uses parameterized queries exclusively
- No use of `$executeRawUnsafe` in the codebase
- `$executeRaw` uses `Prisma.sql` tagged template literal for safe parameterization

### Sensitive Data Protection
- `maskSensitive()` masks PII (emails, tokens) in audit log output
- Passwords excluded from all API responses via Prisma select
- JWT secret loaded from environment variable with no hardcoded fallback

### JWT Security
- JwtStrategy configured with `ignoreExpiration: false`
- Token extracted via `ExtractJwt.fromAuthHeaderAsBearerToken()`
- No secret fallback -- app fails to start without JWT_SECRET

## Verification Tags

<!-- VERIFY: EM-SEC-001 — Helmet with CSP directives -->
<!-- VERIFY: EM-SEC-002 — Rate limiting (global 100/min, auth 5/min) -->
<!-- VERIFY: EM-SEC-003 — CORS restricted to configured origin -->
<!-- VERIFY: EM-SEC-004 — Input validation with class-validator -->
<!-- VERIFY: EM-SEC-005 — JWT strategy with no secret fallback -->
<!-- VERIFY: EM-SEC-006 — XSS prevention (sanitizeInput + maskSensitive) -->

## Zero-Tolerance Rules

The following patterns are forbidden and must never appear in the codebase:

- `as any` -- Use proper types or generics instead
- `dangerouslySetInnerHTML` -- Use React text content rendering
- `$executeRawUnsafe` -- Use Prisma.sql parameterized queries
- Raw `<select>` -- Use a proper component abstraction
- Float for money -- Use Decimal(12,2) via Prisma

## Cross-References

- See [auth.md](auth.md) for JWT configuration, bcrypt hashing, and role definitions
- See [api.md](api.md) for DTO validation details and endpoint authorization
