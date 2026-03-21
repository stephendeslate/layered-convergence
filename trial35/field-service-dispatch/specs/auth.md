# Authentication & Authorization

**Project:** field-service-dispatch
**Layer:** 5 — Monorepo
**Version:** 1.0.0

---

## Overview

The authentication system uses JWT tokens with Passport.js strategy.
Passwords are hashed using bcrypt with configurable salt rounds.
Role-based access control restricts operations by user role.

## Auth Module

The auth module provides registration, login, and token validation
endpoints. It is imported by the root AppModule.

- VERIFY: FD-AUTH-001 — Auth module registers JwtModule, PassportModule, and providers
- VERIFY: FD-AUTH-002 — Auth controller exposes register, login, and me endpoints

## Auth Service

The service handles user creation, credential validation, and JWT signing.
It uses bcrypt for password hashing with salt rounds from shared constants.

- VERIFY: FD-AUTH-003 — Auth service uses bcrypt with BCRYPT_SALT_ROUNDS from shared

## Registration

Registration is restricted to non-ADMIN roles. The DTO validates the role
field against an allowlist to prevent privilege escalation.

- VERIFY: FD-AUTH-004 — Registration DTO excludes ADMIN via @IsIn validation

## JWT Strategy

The Passport JWT strategy extracts tokens from the Authorization header
and validates them against the JWT_SECRET environment variable.

- VERIFY: FD-AUTH-005 — JWT strategy validates token and attaches user to request

## Security Rules

- bcrypt salt rounds: 12
- JWT_SECRET must be set (fail-fast in main.ts)
- CORS_ORIGIN must be set (fail-fast in main.ts)
- ADMIN role cannot be self-registered
- Passwords must be at least 8 characters
- Tokens contain user ID, email, role, and tenant ID

## Password Hashing

All passwords are hashed before storage using bcrypt with 12 salt rounds.
The BCRYPT_SALT_ROUNDS constant is defined in the shared package and
imported by the auth service for consistency across the monorepo.
