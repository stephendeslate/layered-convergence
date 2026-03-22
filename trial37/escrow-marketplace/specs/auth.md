# Authentication Specification

## Overview

JWT-based authentication with bcrypt password hashing. Users belong to a single
tenant and have one of four roles: ADMIN, MANAGER, SELLER, BUYER. Authentication
is handled by the AuthModule which includes PassportModule and JwtModule.

## Registration

- Only MANAGER, SELLER, BUYER roles can self-register
- ADMIN accounts are seeded or created by other ADMINs
- Passwords hashed with bcrypt using 12 salt rounds (BCRYPT_SALT_ROUNDS constant)
- Email must be unique within a tenant (composite unique constraint)
- Registration DTO uses @IsIn(ALLOWED_REGISTRATION_ROLES) — never @IsEnum(UserRole)
- This prevents ADMIN self-registration through the public API endpoint
- Input names are sanitized via sanitizeInput() to strip HTML tags

## Login

- Validates email/password against bcrypt hash stored in database
- Returns signed JWT with payload: `{ sub, email, role, tenantId }`
- Token expiry configurable via JWT_EXPIRES_IN env var (default: 1h)
- Failed login returns generic "Invalid credentials" to prevent enumeration

## JWT Configuration

- Secret loaded from process.env.JWT_SECRET with NO fallback value
- Strategy extracts token from Authorization Bearer header
- Token payload includes: sub (user ID), email, role, tenantId
- Expiration configured via JWT_EXPIRES_IN environment variable

## Guards

- JwtAuthGuard: Validates Bearer token on protected routes
- Extracts user from token payload and attaches to request object
- Applied via @UseGuards(JwtAuthGuard) on controller methods or classes

## Password Policy

- Minimum 8 characters (validated via @MinLength(8))
- Maximum 128 characters (validated via @MaxLength(128))
- Hashed with bcrypt using 12 rounds before storage
- Never returned in any API response (select excludes password field)

## Rate Limiting

- Auth endpoints rate limited to 5 requests per 60 seconds
- Applied via @Throttle decorator on register and login endpoints
- Prevents brute force attacks on authentication endpoints

## Cross-References

- API endpoints: [api.md](./api.md)
- Security controls: [security.md](./security.md)
- Database schema: [database.md](./database.md)

## Verification Tags

<!-- VERIFY: EM-AUTH-001 — bcrypt hashing with 12 salt rounds -->
<!-- VERIFY: EM-AUTH-002 — JWT token generation with correct payload -->
<!-- VERIFY: EM-AUTH-003 — Registration restricted to allowed roles -->
<!-- VERIFY: EM-AUTH-004 — JwtAuthGuard on protected routes -->
<!-- VERIFY: EM-AUTH-005 — Password length validation (8-128) -->
<!-- VERIFY: EM-AUTH-006 — Email uniqueness within tenant -->
<!-- VERIFY: EM-AUTH-007 — JWT payload contains sub, email, role, tenantId -->
