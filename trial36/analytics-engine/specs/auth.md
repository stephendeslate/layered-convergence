# Authentication Specification

## Overview

JWT-based authentication using @nestjs/jwt and @nestjs/passport.
Tokens are issued on login/register and validated via Passport JWT strategy.

## Authentication Flow

1. User sends credentials to `/auth/login` or registration data to `/auth/register`
2. Server validates credentials against bcrypt-hashed password in database
3. Server issues JWT containing `sub`, `email`, `role`, `tenantId`
4. Client includes token in `Authorization: Bearer <token>` header
5. JwtAuthGuard validates token on protected routes via Passport strategy

## JWT Configuration

- **Secret**: Set via `JWT_SECRET` environment variable (fail-fast if missing)
- **Expiration**: Configurable via `JWT_EXPIRES_IN` (default: 1h)
- **Payload**: `{ sub: userId, email, role, tenantId }`

## Password Security

- Passwords hashed with bcrypt using 12 salt rounds (BCRYPT_SALT_ROUNDS constant)
- Minimum length: 8 characters
- Maximum length: 128 characters
- Comparison uses bcrypt.compare (timing-safe)

## Role-Based Access

- **ADMIN**: Full system access, cannot self-register
- **MANAGER**: Team management capabilities
- **ANALYST**: Data analysis and report generation
- **VIEWER**: Read-only access to dashboards and reports

Only MANAGER, ANALYST, and VIEWER roles are available for self-registration.
ADMIN accounts must be created via database seeding or direct database access.

## Guards

- `JwtAuthGuard`: Extends Passport AuthGuard('jwt') for route protection
- Applied at controller level on dashboards and pipelines controllers
- Auth endpoints are public but rate-limited (5 req/min via @Throttle)

## Input Sanitization

- User names are sanitized via `sanitizeInput()` to strip HTML tags
- Email addresses are validated via class-validator @IsEmail()
- All string fields have @MaxLength() constraints

## Audit Logging

- Registration events are logged with masked email via `maskSensitive()`
- Pipeline status changes are logged with masked IDs

## VERIFY Tags

- `AE-AUTH-001`: Auth module with JWT and Passport configured <!-- VERIFY: AE-AUTH-001 -->
- `AE-AUTH-002`: RegisterDto with validation decorators <!-- VERIFY: AE-AUTH-002 -->
- `AE-AUTH-003`: LoginDto with validation decorators <!-- VERIFY: AE-AUTH-003 -->
- `AE-AUTH-004`: AuthService with register/login/validate methods <!-- VERIFY: AE-AUTH-004 -->
- `AE-AUTH-005`: Password hashing with bcrypt and configurable rounds <!-- VERIFY: AE-AUTH-005 -->
- `AE-AUTH-006`: Login method with credential validation <!-- VERIFY: AE-AUTH-006 -->
- `AE-AUTH-007`: GET /auth/me endpoint with JWT guard <!-- VERIFY: AE-AUTH-007 -->
- `AE-AUTH-008`: Audit logging with masked sensitive data <!-- VERIFY: AE-AUTH-008 -->
- `AE-AUTH-009`: JWT strategy with token extraction and validation <!-- VERIFY: AE-AUTH-009 -->
- `AE-AUTH-010`: JwtAuthGuard extending Passport AuthGuard <!-- VERIFY: AE-AUTH-010 -->
