# Authentication Specification

## Overview

The Escrow Marketplace uses JWT-based authentication with bcrypt password hashing.
User registration is restricted to non-admin roles via ALLOWED_REGISTRATION_ROLES.

## JWT Implementation

JWT tokens are issued on successful login or registration. Tokens include
sub (user ID), email, role, and tenantId claims. Tokens expire after 24 hours.

- VERIFY: EM-AUTH-001 — JWT authentication with bcrypt hashing in AuthService
- VERIFY: EM-AUTH-002 — bcrypt uses BCRYPT_SALT_ROUNDS constant (12 rounds)

## Password Security

Passwords are hashed using bcrypt with 12 salt rounds (BCRYPT_SALT_ROUNDS constant).
The hashing operation is wrapped with withTimeout for performance safety.
Plain-text passwords are never stored or logged.

## Role Management

Four roles exist: ADMIN, MANAGER, SELLER, BUYER. Registration is restricted to
MANAGER, SELLER, and BUYER via @IsIn(ALLOWED_REGISTRATION_ROLES) decorator.

- VERIFY: EM-AUTH-003 — Registration restricted to ALLOWED_REGISTRATION_ROLES
- VERIFY: EM-AUTH-004 — Registration DTO validates role with @IsIn decorator

## DTOs and Validation

RegisterDto: email (@IsEmail, @MaxLength(255)), password (@IsString, @MinLength(8),
@MaxLength(128)), name (@IsString, @MaxLength(100)), role (@IsIn), tenantId (@MaxLength(36)).
LoginDto: email (@IsEmail, @MaxLength(255)), password (@IsString, @MaxLength(128)),
tenantId (@IsString, @MaxLength(36)).

- VERIFY: EM-AUTH-005 — Login DTO with string validation and MaxLength

## Auth Controller

The auth controller exposes POST /auth/register, POST /auth/login, and GET /auth/health.
Both register and login endpoints have throttle limits of 5 requests per 60 seconds.

- VERIFY: EM-AUTH-006 — Auth endpoints with Throttle(5, 60000) rate limiting

## JWT Strategy and Guard

JwtStrategy validates tokens using JWT_SECRET from environment (no fallback).
JwtAuthGuard is applied to protected routes via @UseGuards decorator.

- VERIFY: EM-AUTH-007 — JWT strategy with no hardcoded secret fallback

## Cross-References

- See security.md for rate limiting and input validation details
- See api.md for how auth guards protect domain endpoints
