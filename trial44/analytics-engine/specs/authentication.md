# Authentication Specification

## Overview

Authentication is implemented using JWT bearer tokens with bcrypt password hashing.
The system supports registration with role-based access control and login with
credential verification.

## VERIFY:AE-AUTH-001 -- JWT Strategy

The `JwtStrategy` extends Passport's JWT strategy and extracts tokens from the
`Authorization: Bearer <token>` header. The strategy validates the token signature
using `JWT_SECRET` from environment variables. If `JWT_SECRET` is not set, the
application throws an error at startup.

## VERIFY:AE-AUTH-002 -- JwtAuthGuard and @Public Decorator

`JwtAuthGuard` is registered as a global `APP_GUARD`. It checks for the `@Public()`
decorator metadata via NestJS Reflector. Routes decorated with `@Public()` bypass
JWT validation. All other routes require a valid JWT.

## VERIFY:AE-AUTH-003 -- Auth Service

The `AuthService` handles:

- **Login**: Finds user by email using `findFirst` (email is not a unique index
  in multi-tenant schema). Compares password with bcrypt. Returns JWT on success.
- **Register**: Validates role is in `ALLOWED_REGISTRATION_ROLES` (from shared).
  Hashes password with `BCRYPT_SALT_ROUNDS` (12). Creates user record. Returns JWT.

## VERIFY:AE-AUTH-004 -- Auth Controller

The auth controller exposes:

- `POST /auth/login` -- @Public, @Throttle(5, 60)
- `POST /auth/register` -- @Public, @Throttle(5, 60)
- `GET /auth/profile` -- Protected, returns current user from JWT payload

## Token Payload

```typescript
{
  sub: string;      // user ID
  email: string;    // user email
  role: string;     // user role
  tenantId: string; // tenant ID
}
```

## Password Security

- Bcrypt with salt rounds = 12 (from `BCRYPT_SALT_ROUNDS` shared constant)
- Passwords never stored in plaintext
- Passwords never returned in API responses
- Minimum password length enforced via DTO validation

## VERIFY:AE-SEC-001 -- Salt Rounds Constant

`BCRYPT_SALT_ROUNDS` is defined in `packages/shared/src/constants.ts` and used
by both the API auth service and available to the web app via server actions.

## VERIFY:AE-SEC-002 -- Registration Role Restriction

Only roles in `ALLOWED_REGISTRATION_ROLES` (`USER`, `VIEWER`, `EDITOR`) can be
self-registered. ADMIN role requires manual assignment.

## Cross-References

- See [security.md](./security.md) for Helmet CSP, CORS, rate limiting, and input validation details
- See [data-model.md](./data-model.md) for user model schema and multi-tenant isolation
- See [cross-layer.md](./cross-layer.md) for how APP_GUARD integrates with middleware ordering
