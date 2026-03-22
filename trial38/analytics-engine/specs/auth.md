# Authentication Specification

## Trial 38 | Analytics Engine

### Overview

JWT-based authentication with bcrypt password hashing. Registration
creates users with tenant association. Login returns a JWT token.
Auth endpoints have stricter rate limiting than domain endpoints.

### VERIFY: AE-AUTH-01 - Registration Flow

POST `/auth/register` accepts `email`, `password`, `name`, `tenantId`,
and `role`. Password is hashed with bcrypt using `BCRYPT_SALT_ROUNDS`
constant (value: 12) from the shared package. A slug is generated from
the user's name using `slugify()` from shared.

TRACED in: `apps/api/src/auth/auth.service.ts`

### VERIFY: AE-AUTH-02 - Login Flow

POST `/auth/login` accepts `email` and `password`. The service looks up
the user by email (using `findFirst` - justified: email is not a unique
constraint in multi-tenant context). Password is compared using
`bcrypt.compare`. On success, a JWT is returned with `sub`, `email`,
`role`, and `tenantId` claims.

TRACED in: `apps/api/src/auth/auth.service.ts`

### VERIFY: AE-AUTH-03 - JWT Strategy

Passport JWT strategy extracts the token from the Authorization Bearer
header. The strategy validates the token using `JWT_SECRET` from
environment variables. The payload is attached to `request.user`.

TRACED in: `apps/api/src/auth/jwt.strategy.ts`

### VERIFY: AE-AUTH-04 - JWT Auth Guard

`JwtAuthGuard` extends `AuthGuard('jwt')` from `@nestjs/passport`.
It is applied per-controller on domain endpoints (dashboards, pipelines).
It is NOT applied to auth endpoints (register, login).

TRACED in: `apps/api/src/auth/jwt-auth.guard.ts`

### VERIFY: AE-AUTH-05 - Role Validation

Registration DTO uses `@IsIn(ALLOWED_REGISTRATION_ROLES)` from the
shared package, NOT `@IsEnum()`. The allowed roles are `['admin',
'editor', 'viewer']` defined as a constant array in shared.

TRACED in: `apps/api/src/auth/dto/register.dto.ts`

### VERIFY: AE-AUTH-06 - Auth Rate Limiting

Auth controller uses `@Throttle({ default: { limit: 5, ttl: 60000 } })`
which is stricter than the global default of 100 requests per 60 seconds.
This prevents brute-force login attempts.

TRACED in: `apps/api/src/auth/auth.controller.ts`

### VERIFY: AE-AUTH-07 - Password Security

Passwords are never returned in API responses. The `User` type in the
shared package includes the `passwordHash` field for internal use, but
controllers never expose it. Bcrypt salt rounds are centralized in
the shared package constant.

TRACED in: `apps/api/src/auth/auth.service.ts`

### VERIFY: AE-AUTH-08 - Auth Module Configuration

`AuthModule` imports `JwtModule.register()` with secret from
`process.env.JWT_SECRET` and `expiresIn: '24h'`. It provides
`AuthService` and exports it. `JwtStrategy` is registered as a provider.

TRACED in: `apps/api/src/auth/auth.module.ts`

---

Cross-references: [security.md](security.md), [api.md](api.md)
