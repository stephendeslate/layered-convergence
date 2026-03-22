# Authentication Specification — Field Service Dispatch

## Overview

JWT-based authentication using Passport.js with bcrypt password hashing.

## Password Hashing

- Algorithm: bcrypt
- Salt rounds: BCRYPT_SALT_ROUNDS (12) from @field-service-dispatch/shared
- All code (auth service, seed, tests) imports salt rounds from shared
- No hardcoded salt round values anywhere

## JWT Token

- Payload: { sub (userId), email, role, tenantId }
- Expiration: 24 hours
- Secret: JWT_SECRET environment variable (no fallback)
- Extraction: Bearer token from Authorization header

## Registration Flow

1. Client sends POST /auth/register with email, password, role, tenantId
2. Server validates DTO:
   - email: @IsEmail() + @MaxLength(255)
   - password: @IsString() + @MinLength(8) + @MaxLength(128)
   - role: @IsString() + @IsIn(ALLOWED_REGISTRATION_ROLES) — excludes ADMIN
   - tenantId: @IsString() + @MaxLength(36)
3. Check for existing user by email (findFirst with justification)
4. Hash password with bcrypt using BCRYPT_SALT_ROUNDS
5. Create user in database
6. Sign JWT token
7. Return user data and token

## Login Flow

1. Client sends POST /auth/login with email, password
2. Server validates DTO
3. Look up user by email (findFirst with justification)
4. Compare password with bcrypt
5. Sign JWT token on success
6. Return user data and token

## Guards

### JwtAuthGuard
- Extends AuthGuard('jwt')
- Checks for @Public() metadata decorator
- Public routes bypass JWT verification
- Applied selectively (not as APP_GUARD to allow public endpoints)

### ThrottlerGuard
- Registered as APP_GUARD in AppModule
- Default: 100 requests per 60 seconds
- Auth endpoints: 5 requests per 60 seconds

## Rate Limiting

Auth endpoints override default throttle limits:
- POST /auth/register — 5/60s
- POST /auth/login — 5/60s

## Cross-References

- See [security.md](./security.md) for input validation details
- See [api-contracts.md](./api-contracts.md) for request/response formats
