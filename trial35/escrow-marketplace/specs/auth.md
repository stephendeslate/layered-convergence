# Authentication & Authorization

**Project:** escrow-marketplace
**Layer:** 5 — Monorepo
**Version:** 1.0.0

---

## Overview

Authentication uses JWT tokens with Passport.js integration in NestJS.
Passwords are hashed using bcrypt with a salt factor of 12. Role-based
access control restricts API endpoints based on user roles.

## Registration

Users can self-register with the roles SELLER or BUYER. The ADMIN role
is excluded from self-registration and must be assigned by an existing
administrator through a separate process.

- VERIFY: EM-AUTH-001 — Auth module registers JWT and Passport
- VERIFY: EM-AUTH-002 — Auth controller exposes register, login, and me endpoints
- VERIFY: EM-AUTH-003 — Auth service uses bcrypt with salt rounds of 12
- VERIFY: EM-AUTH-004 — Registration DTO uses @IsIn excluding ADMIN
- VERIFY: EM-AUTH-005 — JWT strategy validates token and extracts user payload

## JWT Token Structure

The JWT token payload contains:
- sub: user ID
- tenantId: tenant identifier for multi-tenant scoping
- role: user role for authorization checks

Tokens expire after 24 hours. The JWT_SECRET is loaded from environment
variables and the application fails fast if it is not configured.

## Password Security

Passwords must be at least 8 characters long. The bcrypt salt factor
of 12 provides adequate protection against brute-force attacks while
maintaining acceptable performance for authentication operations.

## Login Flow

1. User submits email, password, and tenant ID
2. Service looks up user by email within the tenant scope
3. bcrypt.compare validates the password against the stored hash
4. On success, a JWT token is generated and returned
5. On failure, UnauthorizedException is thrown

## Role Hierarchy

| Role | Permissions |
|------|-------------|
| ADMIN | Full access, user management, dispute resolution |
| SELLER | Create listings, manage orders, view transactions |
| BUYER | Browse listings, create transactions, file disputes |

## Security Considerations

- No hardcoded secret fallbacks in production code
- JWT_SECRET validated at startup via fail-fast check
- CORS_ORIGIN validated at startup via fail-fast check
- findFirst queries include justification comments
- No $executeRawUnsafe usage in production code
