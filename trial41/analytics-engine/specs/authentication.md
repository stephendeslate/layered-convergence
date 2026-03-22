# Authentication Specification

## Overview

The Analytics Engine uses JWT-based authentication with bcrypt password hashing.
The auth system is implemented via NestJS Passport with a custom JWT strategy.

## Password Hashing

Passwords are hashed using bcrypt with a salt round value of 12.
The salt round constant (BCRYPT_SALT_ROUNDS) is imported from the shared package
to ensure consistency between the auth service and seed scripts.

<!-- VERIFY:AE-AUTH-MODULE — AuthModule configures JWT and Passport modules -->
<!-- VERIFY:AE-JWT-STRATEGY — JwtStrategy extracts token from Bearer header and validates payload -->
<!-- VERIFY:AE-JWT-AUTH-GUARD — JwtAuthGuard extends Passport AuthGuard for route protection -->

## JWT Token Structure

The JWT payload contains:
- sub: user ID (UUID)
- email: user email address
- role: user role (ADMIN, USER, VIEWER, EDITOR)
- tenantId: tenant UUID for multi-tenant scoping

Tokens expire after 24 hours.

## Role-Based Access

Registration is restricted to non-ADMIN roles via @IsIn(ALLOWED_REGISTRATION_ROLES).
The ALLOWED_REGISTRATION_ROLES constant from shared includes: USER, VIEWER, EDITOR.
ADMIN accounts can only be created via seed scripts or direct database access.

See [security.md](./security.md) for rate limiting on auth endpoints.

## Request Flow

1. User submits credentials to POST /auth/login
2. AuthService looks up user by email (findFirst with justification comment)
3. bcrypt.compare validates the password against the stored hash
4. On success, JwtService signs a payload with user claims
5. Client stores token and includes it in Authorization: Bearer header
6. JwtAuthGuard + JwtStrategy validate the token on protected routes

## Current User Extraction

<!-- VERIFY:AE-CURRENT-USER-DECORATOR — CurrentUser decorator extracts JWT payload from request -->

The @CurrentUser() parameter decorator extracts the authenticated user's JWT
payload from the request object. It supports accessing individual fields
(e.g., @CurrentUser('sub') for user ID) or the full payload.

## Security Considerations

- No hardcoded secret fallbacks — JWT_SECRET must be set via environment variable
- Environment variables validated at startup (DATABASE_URL, JWT_SECRET, CORS_ORIGIN)
- Passwords never returned in API responses (Prisma select optimization)
- Failed login attempts return generic "Invalid credentials" message
- Auth endpoints rate-limited to 5 requests per 60 seconds

## Test Coverage

<!-- VERIFY:AE-AUTH-UNIT-TEST — Auth service unit tests cover registration and login flows -->
<!-- VERIFY:AE-AUTH-INTEGRATION-TEST — Auth integration tests use supertest with real AppModule -->
