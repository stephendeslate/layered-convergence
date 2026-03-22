# Authentication Specification

**Project:** Analytics Engine
**Prefix:** AE-AUTH
**Cross-references:** [Security](security.md), [Database](database.md)

---

## Overview

Authentication uses JWT tokens with bcrypt password hashing.
Registration is restricted to non-ADMIN roles via the shared ALLOWED_REGISTRATION_ROLES constant.

---

## Requirements

### AE-AUTH-01: Role Validation
- VERIFY:AE-AUTH-01 — isAllowedRegistrationRole validates against ALLOWED_REGISTRATION_ROLES
- ADMIN role is excluded from self-registration
- See [Security](security.md) for input validation details

### AE-AUTH-02: Auth Module Configuration
- VERIFY:AE-AUTH-02 — AuthModule registers JWT with secret from env, Passport with jwt strategy
- JWT_SECRET validated at module load time (no fallback)
- Token expiry set to 24 hours

### AE-AUTH-03: Auth Controller Endpoints
- VERIFY:AE-AUTH-03 — AuthController has register (POST), login (POST), health (GET) with Throttle 5/60s
- Rate limiting applied at controller level to prevent brute force
- Health endpoint returns { status, timestamp } for monitoring

### AE-AUTH-04: Password Hashing
- VERIFY:AE-AUTH-04 — AuthService uses bcrypt with BCRYPT_SALT_ROUNDS (12), wrapped in withTimeout
- withTimeout guards against slow hashing operations (10s timeout)
- Both hash and compare are wrapped for consistency
- See [Database](database.md) for user model password storage

### AE-AUTH-05: Registration DTO
- VERIFY:AE-AUTH-05 — RegisterDto uses @IsIn(ALLOWED_REGISTRATION_ROLES) excluding ADMIN
- All string fields have @IsString + @MaxLength decorators

### AE-AUTH-06: Login DTO
- VERIFY:AE-AUTH-06 — LoginDto validates email and password with @IsEmail, @IsString, @MaxLength
- No extra fields accepted (forbidNonWhitelisted)

### AE-AUTH-07: JWT Guard
- VERIFY:AE-AUTH-07 — JwtAuthGuard extends Passport AuthGuard('jwt')
- Applied to all domain controllers

### AE-AUTH-08: JWT Strategy
- VERIFY:AE-AUTH-08 — JwtStrategy extracts token from Bearer header, validates against JWT_SECRET
- Payload includes sub, email, role, tenantId

---

**SJD Labs, LLC** — Analytics Engine T39
