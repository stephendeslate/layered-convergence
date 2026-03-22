# Authentication Specification

## Overview
Analytics Engine uses JWT-based authentication with bcrypt password hashing.
The auth module provides login, registration, and profile endpoints.

## JWT Strategy

### VERIFY:AE-AUTH-001 — JwtStrategy reads JWT_SECRET from env, no hardcoded fallback
### VERIFY:AE-AUTH-002 — JwtAuthGuard supports @Public decorator to skip auth on marked routes

The JWT strategy extracts tokens from the Authorization header using Bearer scheme.
Token payload includes: sub (userId), email, role, tenantId.
Tokens expire after 24 hours.

## Auth Service

### VERIFY:AE-AUTH-003 — AuthService uses bcrypt.compare for login, bcrypt.hash with BCRYPT_SALT_ROUNDS for register
### VERIFY:AE-AUTH-004 — AuthController applies @Throttle(5/60s) on login and register, @Public on both

### Login Flow
1. Find user by email (findFirst with justification comment)
2. Compare password with stored hash using bcrypt
3. Generate JWT with user payload
4. Return access token and user info

### Registration Flow
1. Check for existing email (findFirst with justification comment)
2. Reject if email already exists (ConflictException)
3. Hash password with BCRYPT_SALT_ROUNDS (12, from shared)
4. Create user record
5. Generate JWT with new user payload
6. Return access token and user info

## Role Management
Roles: ADMIN, USER, VIEWER, EDITOR
Registration only allows roles in ALLOWED_REGISTRATION_ROLES (excludes ADMIN).
Role validation uses @IsIn decorator with values from shared constants.

## Security Considerations
- No hardcoded JWT secrets anywhere
- BCRYPT_SALT_ROUNDS imported from @analytics-engine/shared (value: 12)
- Passwords never returned in responses
- Rate limiting on auth endpoints (5 requests per 60 seconds)
- Input validation on all DTO fields

## Guard Registration
JwtAuthGuard is registered as APP_GUARD in AppModule for global authentication.
Routes decorated with @Public() bypass the guard.
Health endpoints and auth login/register are public.

## Test Coverage

### VERIFY:AE-TEST-001 — Auth unit tests cover login success, login failure, register, duplicate email
### VERIFY:AE-TEST-004 — Auth integration tests use supertest with real AppModule

Auth tests import BCRYPT_SALT_ROUNDS from shared — no hardcoded salt values.
