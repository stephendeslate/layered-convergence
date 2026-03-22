# Authentication & Authorization Specification

## Overview

Authentication uses JWT tokens issued on login. Passwords are hashed with bcrypt (12 salt rounds via BCRYPT_SALT_ROUNDS constant). Registration is restricted to BUYER, SELLER, and MANAGER roles.

## Registration

- Email must be unique within a tenant (@@unique([email, tenantId]))
- Password is hashed with bcrypt using BCRYPT_SALT_ROUNDS (12)
- Name is sanitized via sanitizeInput() to strip HTML tags (XSS prevention)
- Role must be one of ALLOWED_REGISTRATION_ROLES: BUYER, SELLER, MANAGER
- ADMIN role registration is explicitly rejected with BadRequestException
- Rate limited: 5 requests per 60 seconds via @Throttle decorator
- measureDuration is used to time the bcrypt hash operation for monitoring

## Login

- Lookup by email + tenantId (findFirst for RLS compliance)
- Password verified with bcrypt.compare
- On success: returns JWT with payload { sub, email, role, tenantId }
- On failure: throws UnauthorizedException (generic message to prevent enumeration)
- Rate limited: 5 requests per 60 seconds via @Throttle decorator

## JWT Configuration

- Secret from JWT_SECRET env var (no fallback -- fail-fast validation in main.ts)
- Expiration: configurable via JWT_EXPIRES_IN env var
- Payload: sub (user ID), email, role, tenantId
- Validated by JwtStrategy (passport-jwt) with ExtractJwt.fromAuthHeaderAsBearerToken
- JwtAuthGuard applied to protected routes (profile, listings, transactions)

## Authorization

| Role    | Capabilities                                    |
|---------|------------------------------------------------|
| ADMIN   | Not registrable; system-level access           |
| MANAGER | CRUD on all listings in tenant; manage disputes |
| SELLER  | Create/update/delete own listings              |
| BUYER   | Browse listings, create transactions           |

## Password Policy

- Minimum length: 8 characters
- Maximum length: 128 characters
- Enforced via class-validator @MinLength(8) @MaxLength(128) on RegisterDto

## Verification Tags

<!-- VERIFY: EM-AUTH-001 — bcrypt hashing with 12 salt rounds -->
<!-- VERIFY: EM-AUTH-002 — JWT token generation with correct payload -->
<!-- VERIFY: EM-AUTH-003 — Registration restricted to allowed roles -->
<!-- VERIFY: EM-AUTH-004 — JwtAuthGuard on protected routes -->
<!-- VERIFY: EM-AUTH-005 — Password length validation (8-128) -->
<!-- VERIFY: EM-AUTH-006 — Email uniqueness within tenant -->
<!-- VERIFY: EM-AUTH-007 — JWT payload contains sub, email, role, tenantId -->

## Security Considerations

- Passwords are never returned in API responses
- getProfile excludes password field via Prisma select
- JWT tokens should be stored securely client-side (httpOnly cookies recommended)
- maskSensitive is used to mask emails in audit logs
- See [security.md](security.md) for Helmet, CORS, and rate limiting details
