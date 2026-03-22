# Security Specification

## Overview

The Escrow Marketplace implements defense-in-depth security across API,
data, and infrastructure layers. All security measures are enforced at
the framework level with no opt-out capability.

## Helmet.js Configuration

Content Security Policy directives:
- `default-src 'self'` — Restrict all content to same origin
- `script-src 'self'` — Only same-origin scripts
- `style-src 'self' 'unsafe-inline'` — Styles with inline for components
- `img-src 'self' data:` — Same-origin and data URI images
- `frame-ancestors 'none'` — Prevent clickjacking

## CORS Configuration

- Origin: From CORS_ORIGIN env var (NO fallback value)
- Credentials: true
- Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Allowed headers: Content-Type, Authorization, X-Tenant-Id, X-Correlation-ID
- Throws Error if CORS_ORIGIN not set at startup

## Rate Limiting (ThrottlerModule)

- Global: 100 requests per 60 seconds
- Auth endpoints: 5 requests per 60 seconds (see [auth.md](./auth.md))
- Registered as APP_GUARD in AppModule
- Health endpoints exempt via @SkipThrottle()

## VERIFY Tags

- VERIFY: EM-SEC-001 — Helmet CSP configuration
- VERIFY: EM-SEC-002 — CORS from environment variable
- VERIFY: EM-SEC-003 — ThrottlerModule with APP_GUARD
- VERIFY: EM-SEC-004 — ValidationPipe with whitelist and forbidNonWhitelisted
- VERIFY: EM-SEC-005 — Sensitive data masking for audit logging
- VERIFY: EM-SEC-006 — XSS prevention (sanitizeInput)

## Input Validation

- ValidationPipe: whitelist + forbidNonWhitelisted + transform
- ALL DTO string fields: @IsString() + @MaxLength()
- ALL DTO UUID fields: @MaxLength(36)
- Status enum fields: @IsString() + @MaxLength() + @IsIn()
- Email fields: @IsEmail() + @MaxLength(255)

## Data Security

- Row-Level Security on all PostgreSQL tables
- ENABLE + FORCE RLS in migration SQL
- tenantId filtering on all queries
- findFirst with justification comments

## Secrets Management

- No hardcoded secrets or fallback values
- JWT_SECRET required at startup (throws Error)
- CORS_ORIGIN required at startup (throws Error)
- DATABASE_URL required for Prisma connection
- Environment variable validation in main.ts bootstrap

## Zero-Tolerance Violations

- `as any` — Use proper types
- `dangerouslySetInnerHTML` — Use React text content
- `$executeRawUnsafe` — Use Prisma.sql templates
- Float for money — Use Decimal(12,2)
- Raw `<select>` — Use proper component
- console.log — Use structured logger

## Audit & Monitoring

- sanitizeInput() strips HTML tags for XSS prevention
- maskSensitive() masks PII in log output
- See [monitoring.md](./monitoring.md) for structured logging
