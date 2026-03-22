# Authentication

## Overview

The Escrow Marketplace uses JWT-based authentication with bcrypt
password hashing. Registration is restricted to non-admin roles using
the ALLOWED_REGISTRATION_ROLES constant from the shared package.

## Registration Flow

- VERIFY: EM-CONST-003 — ALLOWED_REGISTRATION_ROLES excludes ADMIN
- Users register with email, password, name, role, tenantId
- Password hashed with bcrypt using BCRYPT_SALT_ROUNDS (12)
- Role validated with @IsIn(ALLOWED_REGISTRATION_ROLES)
- JWT token returned upon successful registration

## Login Flow

- VERIFY: EM-ACTL-001 — Auth controller rate-limited on login/register
- User provides email and password
- Service looks up user by email (findFirst with justification comment)
- Password compared with bcrypt.compare
- JWT token returned with sub, email, role, tenantId claims

## JWT Strategy

- VERIFY: EM-JWT-001 — JWT strategy extracts token from Bearer header
- Secret from JWT_SECRET environment variable (no fallback)
- Token expiration: 24 hours
- Payload: { sub: userId, email, role, tenantId }

## JWT Auth Guard

- VERIFY: EM-JWTG-001 — JwtAuthGuard extends Passport AuthGuard
- Applied to all domain controllers (listings, transactions, escrows, disputes)
- Health and metrics endpoints are exempt (SkipThrottle)

## Password Security

- VERIFY: EM-CONST-001 — BCRYPT_SALT_ROUNDS = 12 from shared
- VERIFY: EM-SEED-001 — Seed uses BCRYPT_SALT_ROUNDS from shared
- Salt rounds imported from @escrow-marketplace/shared
- No hardcoded salt values in application or test code

## Rate Limiting

Auth endpoints use stricter rate limits (5/60s) vs default (100/60s).
See [security.md](./security.md) for full throttling configuration.

## Environment Variables

- JWT_SECRET: Required, no fallback value
- Validated at startup in main.ts

## Test Coverage

- VERIFY: EM-TAUT-001 — Auth service unit tests
- VERIFY: EM-TINT-001 — Auth integration tests with supertest
- Tests import BCRYPT_SALT_ROUNDS from shared (no hardcoded values)
