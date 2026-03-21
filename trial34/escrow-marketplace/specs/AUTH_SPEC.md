# Authentication Specification — Escrow Marketplace

## Overview

Authentication uses JWT tokens with bcrypt password hashing. The auth module provides
registration, login, and profile retrieval endpoints. See SECURITY.md for security
hardening details and REQUIREMENTS.md for functional context.

## Auth Controller

The AuthController exposes three endpoints:
- POST /auth/register — Create new user with role validation
- POST /auth/login — Authenticate and return JWT token
- GET /auth/profile — Retrieve authenticated user's profile (JWT-guarded)
- VERIFY: EM-SEC-AUTH-001 — Auth controller with register/login/profile endpoints

## Registration Security

### Role Exclusion
The RegisterDto uses @IsIn(['OWNER', 'BUYER', 'SELLER']) to exclude ADMIN from
self-registration. This is enforced at both the DTO validation layer and the service layer.
- VERIFY: EM-SEC-ADMIN-001 — @IsIn excludes ADMIN role from registration DTO

### Password Hashing
Passwords are hashed with bcrypt using a salt factor of 12 (not the default 10).
This provides stronger security for marketplace user accounts.
- VERIFY: EM-SEC-BCRYPT-001 — bcrypt salt rounds = 12 in auth.service.ts

## Role Validation

### Shared Role Constants
Role constants are exported from the shared package for consistent validation.
- VERIFY: EM-SEC-ROLES-001 — Role constants exported from shared package

### Registration Role Utility
The isAllowedRegistrationRole() function validates roles for self-registration.
- VERIFY: EM-SEC-ROLES-002 — isAllowedRegistrationRole utility in shared package
- VERIFY: EM-SEC-ROLES-003 — Server-side role validation in auth.service.ts

## JWT Strategy

The JwtStrategy extracts tokens from the Authorization header using passport-jwt.
Secret is read from JWT_SECRET environment variable. Tokens expire after 24 hours.
Payload contains userId, tenantId, and role for downstream authorization.

## Password Policy

Minimum password length is 8 characters via @MinLength(8) in RegisterDto.
Passwords are never stored in plaintext. bcrypt.compare() is used for verification.

## Cross-References
- See SECURITY.md for fail-fast behavior and CORS configuration
- See DATA_MODEL.md for User entity schema and @@map conventions
- See API_SPEC.md for full endpoint documentation
- See TESTING_STRATEGY.md for auth integration test coverage
