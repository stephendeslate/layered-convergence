# Authentication Specification

## Overview

Authentication uses JWT tokens with Passport.js. Passwords are hashed with bcrypt
at a configurable salt round (default: 12) imported from the shared package.

## Endpoints

### POST /auth/register

Creates a new user account. Only non-admin roles can self-register.

- VERIFY: FD-AUTH-001 — Registration DTO validates email (@IsEmail), password (@IsString, @MaxLength(128)), role, tenantId
- VERIFY: FD-AUTH-002 — Registration rejects ADMIN role via isAllowedRegistrationRole check
- VERIFY: FD-AUTH-003 — Password hashed with bcrypt salt 12 via withTimeout wrapper

### POST /auth/login

Authenticates existing user and returns JWT token.

- VERIFY: FD-AUTH-004 — Login DTO validates email, password, tenantId with @IsString and @MaxLength

## JWT Strategy

- Tokens signed with JWT_SECRET environment variable
- Payload contains: sub (userId), tenantId, role
- Strategy extracts token from Authorization Bearer header

## Security Controls

- Registration rate limited to 5 requests per 60 seconds
- Login rate limited to 5 requests per 60 seconds
- ADMIN role creation restricted to seed/direct DB only
- Email uniqueness enforced per tenant (composite unique constraint)

## Testing

- VERIFY: FD-AUTH-005 — Unit tests mock Prisma and JWT, verify role rejection and duplicate email handling
- VERIFY: FD-AUTH-006 — Integration tests validate HTTP status codes for malformed requests

## Password Hashing

The bcrypt salt rounds constant (12) is imported from `@field-service-dispatch/shared`
to ensure consistency between the API seed script and the auth service. The hashing
operation is wrapped in `withTimeout()` to prevent DoS via intentionally slow hash
requests.

## Role Hierarchy

| Role | Can Register | Capabilities |
|------|-------------|--------------|
| ADMIN | No (seed only) | Full access |
| DISPATCHER | Yes | Manage work orders, schedules |
| TECHNICIAN | Yes | View assigned work, update status |
| VIEWER | Yes | Read-only access |
