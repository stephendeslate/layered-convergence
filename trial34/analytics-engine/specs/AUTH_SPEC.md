# Authentication Specification — Analytics Engine

## Overview

Authentication uses JWT tokens with bcrypt password hashing. The auth module provides
registration, login, and profile retrieval endpoints. See SECURITY.md for security
hardening details and REQUIREMENTS.md for functional context.

## Auth Controller

The AuthController exposes three endpoints:
- POST /auth/register — Create new user with role validation
- POST /auth/login — Authenticate and return JWT token
- GET /auth/profile — Retrieve authenticated user's profile (JWT-guarded)
- VERIFY: AE-SEC-AUTH-001 — Auth controller with register/login/profile endpoints

## Registration Security

### Role Exclusion
The RegisterDto uses @IsIn(['OWNER', 'ANALYST', 'VIEWER']) to exclude ADMIN from
self-registration. This is enforced at both the DTO validation layer and the service layer.
- VERIFY: AE-SEC-ADMIN-001 — @IsIn excludes ADMIN role from registration DTO

### Password Hashing
Passwords are hashed with bcrypt using a salt factor of 12 (not 10, which is the default).
This provides a good balance between security and performance.
- VERIFY: AE-SEC-BCRYPT-001 — bcrypt salt rounds = 12 in auth.service.ts

## Role Validation

### Shared Role Constants
Role constants are exported from the shared package for consistent validation across
both backend and frontend applications.
- VERIFY: AE-SEC-ROLES-001 — Role constants exported from shared package

### Registration Role Utility
The isAllowedRegistrationRole() function validates that a role is not ADMIN.
This is used as a server-side guard in the auth service register method.
- VERIFY: AE-SEC-ROLES-002 — isAllowedRegistrationRole utility in shared package
- VERIFY: AE-SEC-ROLES-003 — Server-side role validation in auth.service.ts

## JWT Strategy

The JwtStrategy uses passport-jwt to extract tokens from the Authorization header.
The secret key is read from JWT_SECRET environment variable (see SECURITY.md for fail-fast).
Tokens expire after 24 hours. The strategy validates the payload and returns a user
context object containing userId, tenantId, and role for downstream authorization.

## Password Policy

Minimum password length is 8 characters, enforced by @MinLength(8) in the RegisterDto.
The password is never stored in plaintext — only the bcrypt hash is persisted.
Comparison uses bcrypt.compare() which is timing-safe against side-channel attacks.

## Cross-References
- See SECURITY.md for fail-fast behavior and CORS configuration
- See DATA_MODEL.md for User entity schema and @@map conventions
- See API_SPEC.md for full endpoint documentation
- See TESTING_STRATEGY.md for auth integration test coverage
