# Authentication Specification

## Overview

The Escrow Marketplace uses JWT-based authentication with Passport.js.
Passwords are hashed with bcrypt using a salt rounds constant from the shared package.

## Authentication Flow

1. User registers via POST /auth/register
2. Password hashed with bcrypt (BCRYPT_SALT_ROUNDS = 12)
3. JWT token returned with payload: { sub, email, role, tenantId }
4. Token expires after 24 hours
5. Protected routes require Bearer token in Authorization header

## Registration

- Email validated with @IsEmail()
- Password: min 8 chars, max 128 chars
- Name: max 100 chars
- Role restricted via @IsIn(ALLOWED_REGISTRATION_ROLES) — excludes ADMIN
- TenantId: max 36 chars (UUID)

## VERIFY Tags

- VERIFY: EM-AUTH-001 — JWT authentication with bcrypt hashing
- VERIFY: EM-AUTH-002 — bcrypt with BCRYPT_SALT_ROUNDS constant
- VERIFY: EM-AUTH-003 — Registration restricted to allowed roles
- VERIFY: EM-AUTH-004 — Registration DTO with role validation
- VERIFY: EM-AUTH-005 — Login DTO with string validation
- VERIFY: EM-AUTH-006 — Auth endpoints with throttle limiting
- VERIFY: EM-AUTH-007 — JWT strategy with no secret fallback

## JWT Strategy

- Secret loaded from JWT_SECRET env var (no fallback — throws Error if missing)
- Token extracted from Authorization: Bearer header
- Expiration not ignored (ignoreExpiration: false)

## Rate Limiting

Auth endpoints use @Throttle({ default: { limit: 5, ttl: 60000 } })
to prevent brute-force attacks. See [security.md](./security.md) for global config.

## Password Security

- bcrypt with salt rounds = 12 (from BCRYPT_SALT_ROUNDS constant)
- withTimeout wrapping (5000ms) to prevent DoS via slow hashing
- Passwords never returned in API responses
- Login returns generic "Invalid credentials" for both missing user and wrong password

## Multi-Tenant Isolation

- Users are unique per tenant: @@unique([email, tenantId])
- JWT payload includes tenantId for downstream tenant-scoped queries
- All queries filter by tenantId from JWT context

## Guard Architecture

- JwtAuthGuard extends Passport AuthGuard('jwt')
- Applied via @UseGuards(JwtAuthGuard) on all domain controllers
- Health endpoints exempt from auth (see [monitoring.md](./monitoring.md))

## DTO Validation

All string fields have @IsString() + @MaxLength().
UUID fields use @MaxLength(36).
ValidationPipe enforces whitelist + forbidNonWhitelisted + transform.
