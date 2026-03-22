# Authentication Specification

## Overview

Authentication is implemented using JWT tokens with Passport.js strategy.
All tokens expire after 24 hours. Passwords are hashed using bcrypt with
a salt factor of 12 (BCRYPT_SALT_ROUNDS constant from shared package).

## Registration

<!-- VERIFY: FD-AUTH-001 — Register DTO with validation constraints -->

The registration endpoint accepts email, password, role, and tenantId.
All fields have explicit validation constraints including @MaxLength
and @MinLength decorators.

<!-- VERIFY: FD-SHARED-002 — Registration role whitelist excluding ADMIN -->

Self-registration is restricted to non-admin roles. The allowed roles
are DISPATCHER, TECHNICIAN, and VIEWER. ADMIN accounts must be created
through direct database operations or a separate admin interface.

<!-- VERIFY: FD-AUTH-003 — Auth service with bcrypt salt 12 and withTimeout -->

The auth service uses bcrypt with 12 salt rounds for password hashing.
The hashing operation is wrapped with withTimeout to prevent hanging
if bcrypt takes too long (T39 variation).

## Login

<!-- VERIFY: FD-AUTH-002 — Login DTO with validation constraints -->

Login requires email, password, and tenantId. The service performs
tenant-scoped user lookup and bcrypt comparison. Invalid credentials
return 401 Unauthorized without revealing whether the email exists.

## JWT Strategy

<!-- VERIFY: FD-AUTH-004 — JWT strategy and auth guard -->

The JWT strategy extracts tokens from the Authorization bearer header.
The payload contains sub (user ID), tenantId, and role claims.
JwtAuthGuard protects all domain endpoints.

## Controller

<!-- VERIFY: FD-AUTH-005 — Auth controller with Throttle 5/60s -->

The auth controller exposes register, login, and me endpoints.
Register and login are throttled to 5 requests per 60 seconds
to mitigate brute-force attacks.

## Module

<!-- VERIFY: FD-AUTH-006 — Auth module with JWT configuration -->

The auth module configures JWT with the secret from environment
variables and a 24-hour expiration. It exports AuthService for
use by other modules.

## Cross-References

- See [Security](./security.md) for rate limiting details
- See [API](./api.md) for endpoint specifications
