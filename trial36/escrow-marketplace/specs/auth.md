# Authentication Specification

## Overview

JWT-based authentication with bcrypt password hashing. Users belong to a single
tenant and have one of four roles: ADMIN, MANAGER, SELLER, BUYER.

## Registration

- Only MANAGER, SELLER, BUYER roles can self-register
- ADMIN accounts are seeded or created by other ADMINs
- Passwords hashed with bcrypt (12 salt rounds)
- Email must be unique within a tenant

## Login

- Validates email/password against bcrypt hash
- Returns signed JWT with payload: `{ sub, email, role, tenantId }`
- Token expiry configurable via JWT_EXPIRES_IN env var

## Guards

- JwtAuthGuard: Validates Bearer token on protected routes
- Extracts user from token payload and attaches to request

## Password Policy

- Minimum 8 characters
- Maximum 128 characters
- Validated via @MinLength(8) and @MaxLength(128) in DTOs

## Cross-References

- API endpoints: [api.md](./api.md)
- Security: [security.md](./security.md)

## Verification Tags

<!-- VERIFY: EM-AUTH-001 — bcrypt hashing with 12 salt rounds -->
<!-- VERIFY: EM-AUTH-002 — JWT token generation with correct payload -->
<!-- VERIFY: EM-AUTH-003 — Registration restricted to allowed roles -->
<!-- VERIFY: EM-AUTH-004 — JwtAuthGuard on protected routes -->
<!-- VERIFY: EM-AUTH-005 — Password length validation (8-128) -->
<!-- VERIFY: EM-AUTH-006 — Email uniqueness within tenant -->
<!-- VERIFY: EM-AUTH-007 — JWT payload contains sub, email, role, tenantId -->
