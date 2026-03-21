# Security Model

## Overview

Analytics Engine implements defense-in-depth security through multiple layers: JWT-based
authentication, role-based access control, row-level security (RLS) at the database level,
input validation via class-validator, and fail-fast configuration validation at startup.

## Threat Model

| Threat | Mitigation | Verification |
|--------|------------|-------------|
| Cross-tenant data access | PostgreSQL RLS with FORCE policy | Integration test TS-004 |
| Password compromise | bcrypt with salt rounds = 12 | Unit test TS-001 |
| Invalid state transitions | State machine validation in service layer | Unit test TS-002 |
| JWT secret exposure | Fail-fast env validation at startup | SM-001 traced tag |
| SQL injection | Prisma ORM + $executeRaw tagged templates | SM-002 traced tag |
| Role escalation | @IsIn validator excludes ADMIN | AC-002 traced tag |
| Expired embed access | Token expiration check in service | SA-005 traced tag |

## Authentication Flow

1. User submits credentials to `POST /auth/login`
2. AuthService validates email existence and bcrypt password comparison
3. On success, JWT is signed with `JWT_SECRET` containing `{ sub, tenantId, role }`
4. Frontend stores JWT in httpOnly cookie (secure in production, sameSite: lax)
5. Subsequent requests include `Authorization: Bearer <token>` header
6. JwtAuthGuard extracts and validates token on every protected endpoint

## Fail-Fast Configuration

[VERIFY:SM-001] The application MUST fail-fast at startup if JWT_SECRET or CORS_ORIGIN is missing.
> Implementation: `src/main.ts:2` — bootstrap throws Error when env vars are undefined

This prevents the application from starting in an insecure state where JWTs would be signed
with undefined secrets or CORS would be misconfigured.

## Database Security

[VERIFY:SM-002] All raw SQL queries MUST use $executeRaw with tagged template literals, never $executeRawUnsafe.
> Implementation: `src/prisma/prisma.service.ts:1` — PrismaService uses Prisma.$executeRaw``

The PrismaService wraps raw SQL execution in tagged template literals, which Prisma
automatically parameterizes. The `$executeRawUnsafe` method is never used anywhere in the
codebase, eliminating SQL injection vectors in raw queries.

## Row-Level Security

[VERIFY:SM-003] Tenant context MUST be set via set_config before any tenant-scoped database operation.
> Implementation: `src/tenant-context/tenant-context.service.ts:1` — setContext uses $executeRaw to call set_config

Each request sets the PostgreSQL session variable `app.tenant_id` via `set_config()` before
executing queries. RLS policies on all tenant-scoped tables filter rows based on this variable.
This provides a security boundary at the database level that cannot be bypassed by application
code bugs.

## Password Security

[VERIFY:SM-004] Passwords MUST be hashed with bcrypt using a salt factor of 12.
> Implementation: `src/auth/auth.service.ts:1` — SALT_ROUNDS = 12, bcrypt.hash()

The salt factor of 12 provides approximately 2^12 = 4096 iterations, balancing security against
computation time. Passwords are never stored in plaintext and are never returned in API responses.

## JWT Strategy

[VERIFY:SM-005] JWT tokens MUST be extracted from the Authorization Bearer header using passport-jwt.
> Implementation: `src/auth/jwt.strategy.ts:1` — ExtractJwt.fromAuthHeaderAsBearerToken()

The JWT strategy validates token signatures, extracts the payload, and attaches `{ sub, tenantId, role }`
to the request object. Expired tokens are automatically rejected by passport-jwt.

## Input Validation

All incoming request bodies pass through a global ValidationPipe configured with:
- `whitelist: true` — strips properties not defined in the DTO
- `transform: true` — converts plain objects to DTO class instances

DTOs use class-validator decorators: `@IsString()`, `@IsEmail()`, `@IsIn()`, `@IsDateString()`,
`@IsOptional()`, and `@IsUUID()`.

## Role Authorization

The application defines three roles with implicit capability levels:
- **VIEWER** — read-only access to dashboards and widgets
- **EDITOR** — VIEWER capabilities plus create/edit dashboards, widgets, embeds
- **ANALYST** — EDITOR capabilities plus manage data sources, pipelines, sync runs

Role authorization is enforced at the controller level via custom guards (when needed) and
validated at registration time via the `@IsIn` decorator.

## Cross-References

- Authentication endpoints: [API_CONTRACT.md](./API_CONTRACT.md)
- User model with role: [DATA_MODEL.md](./DATA_MODEL.md)
- Testing strategy for security: [TESTING_STRATEGY.md](./TESTING_STRATEGY.md)
- System architecture: [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)
