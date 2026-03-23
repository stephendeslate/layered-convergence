# Security

## Overview

The Escrow Marketplace implements defense-in-depth security through
Helmet.js with CSP, rate limiting, CORS configuration, input validation,
and role-based access control with fail-closed APP_GUARD architecture.

## Helmet.js and CSP

- VERIFY: EM-SEC-001 — Helmet with Content Security Policy configured
- default-src: 'self'
- script-src: 'self'
- style-src: 'self' 'unsafe-inline'
- img-src: 'self' data:
- frame-ancestors: 'none'
- Additional security headers: X-Content-Type-Options, etc.

## Rate Limiting (Throttler)

- VERIFY: EM-THRT-001 — ThrottlerModule with default and auth limits
- VERIFY: EM-GUARD-001 — ThrottlerGuard registered as APP_GUARD
- Default rate limit: 100 requests per 60 seconds
- Auth endpoints: 5 requests per 60 seconds
- Health/metrics endpoints exempt via @SkipThrottle

## Authentication Guard (L9: APP_GUARD)

- VERIFY: EM-GUARD-002 — JwtAuthGuard registered as APP_GUARD
- Fail-closed: ALL routes require authentication by default
- @Public() decorator exempts specific routes (auth, health, metrics)
- Domain controllers have NO @UseGuards(JwtAuthGuard) decorators
- Domain modules have NO imports: [AuthModule]

## CORS Configuration

- VERIFY: EM-SEC-002 — CORS from CORS_ORIGIN env variable
- Origin from CORS_ORIGIN environment variable (no fallback)
- Credentials: true
- Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Allowed headers: Content-Type, Authorization, X-Correlation-ID

## Input Validation

- VERIFY: EM-VAL-001 — ValidationPipe with strict settings
- whitelist: true (strips unknown properties)
- forbidNonWhitelisted: true (rejects unknown properties)
- transform: true (auto-transforms payloads to DTO instances)
- All DTO string fields: @IsString() + @MaxLength()
- All UUID fields: @MaxLength(36)
- Registration role: @IsIn(ALLOWED_REGISTRATION_ROLES) — no ADMIN

## Environment Variable Security

- VERIFY: EM-ENV-001 — Required vars validated at startup
- VERIFY: EM-ENV-002 — validateEnvVars from shared used in main.ts
- JWT_SECRET: required, no hardcoded fallback
- CORS_ORIGIN: required, no wildcard default
- DATABASE_URL: required, includes connection_limit

## Code Security Constraints

- Zero `as any` type assertions in codebase
- Zero console.log in api/src (use structured logger)
- Zero $executeRawUnsafe (only $executeRaw with Prisma.sql)
- Zero dangerouslySetInnerHTML in frontend
- No hardcoded secret fallbacks

## Error Response Sanitization

- VERIFY: EM-FILT-001 — GlobalExceptionFilter as APP_FILTER
- Production error responses exclude stack traces
- Correlation ID included in all error responses
- Request body sanitized before logging (T42 LogSanitizer)

## Test Coverage

- VERIFY: EM-TSEC-001 — Security integration tests with supertest
- Tests validate Helmet headers
- Tests validate input rejection (invalid payload, ADMIN role, extra fields)
- Tests validate authentication requirements on all domain endpoints
- VERIFY: EM-TACC-001 — Accessibility tests with jest-axe
- VERIFY: EM-TKBD-001 — Keyboard navigation tests with userEvent

## UI Security

- VERIFY: EM-UTIL-001 — cn() uses clsx + tailwind-merge
- VERIFY: EM-UIB-001 — Button component uses cn() utility
- VERIFY: EM-UIA-001 — Alert component with role="alert"
- VERIFY: EM-UIBG-001 — Badge component with cn() utility
- VERIFY: EM-UIC-001 — Card component with cn() utility
- VERIFY: EM-UII-001 — Input component with cn() utility
- VERIFY: EM-UIL-001 — Label component with cn() utility
- VERIFY: EM-UISK-001 — Skeleton component for loading states
- VERIFY: EM-UIT-001 — Table component with cn() utility
- No raw <select> elements in pages
- All UI components use shadcn/ui pattern with cn()

## Cross-References

See [authentication.md](./authentication.md) for JWT and role details.
See [api-contracts.md](./api-contracts.md) for endpoint auth requirements.
See [cross-layer.md](./cross-layer.md) for guard chain documentation.
