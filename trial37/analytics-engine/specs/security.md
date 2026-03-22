# Security Specification

## Overview

Security is implemented at multiple layers: HTTP headers (Helmet with CSP),
rate limiting (ThrottlerModule), CORS with credentials, input validation
(class-validator with DTOs), and database-level row isolation (RLS).

## HTTP Headers

Helmet is applied globally to set secure HTTP headers including
Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, and others.

[VERIFY: AE-SEC-01] main.ts applies Helmet with a Content-Security-Policy
configuration that includes script-src and style-src directives.

## Rate Limiting

The ThrottlerModule is registered globally in AppModule to prevent abuse.
The auth controller applies a stricter per-route limit for login and
registration endpoints.

[VERIFY: AE-SEC-02] app.module.ts registers ThrottlerModule.forRoot with
a default throttle configuration.

[VERIFY: AE-SEC-03] app.module.ts provides APP_GUARD with ThrottlerGuard
to apply rate limiting globally.

## CORS

Cross-Origin Resource Sharing is configured in main.ts with explicit origin
and credentials support.

[VERIFY: AE-SEC-04] main.ts enables CORS with origin from CORS_ORIGIN
environment variable and credentials set to true.

## Input Validation

All request bodies are validated using class-validator decorators on DTO
classes. The global ValidationPipe rejects unknown properties.

[VERIFY: AE-SEC-05] main.ts configures ValidationPipe with whitelist,
forbidNonWhitelisted, and transform all set to true.

[VERIFY: AE-SEC-06] All DTO string fields use @MaxLength() to prevent
oversized input.

## JWT Security

JWT tokens are signed using a secret stored exclusively in environment
variables. No hardcoded fallback values are permitted anywhere in the
codebase to prevent secret leakage.

[VERIFY: AE-SEC-07] No JWT secret fallback strings exist anywhere in the
codebase. process.env.JWT_SECRET is used directly.

## Database Security

All database queries that use findFirst instead of findUnique must include
a justification comment. This ensures developers consciously choose
findFirst when filtering by non-unique fields (e.g., email + tenantId).

[VERIFY: AE-SEC-08] All Prisma findFirst calls include a justification
comment explaining why findFirst is appropriate over findUnique.
