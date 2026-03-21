# Security Model — Analytics Engine

## Overview

Analytics Engine implements defense-in-depth security with bcrypt password hashing, JWT authentication, tenant-scoped RLS policies, and input validation at every layer.

See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for the technology stack and [API_CONTRACT.md](./API_CONTRACT.md) for endpoint authentication requirements.

## Authentication Flow

1. User submits credentials to POST /auth/login
2. Server verifies bcrypt hash and issues JWT with user ID, email, role, and tenant ID
3. Protected endpoints extract JWT via passport-jwt strategy
4. Tenant context is set via `$executeRaw` before each tenant-scoped query

## Password Security

[VERIFY:SEC-001] User passwords are hashed with bcrypt using salt rounds of 12.
> Implementation: `backend/src/auth/auth.service.ts:50` (bcrypt.hash call)

## Row Level Security

[VERIFY:SEC-002] All 9 tables have RLS policies enabled that filter by tenant_id using current_setting('app.tenant_id').
> Implementation: `backend/prisma/rls.sql`

[VERIFY:SEC-003] All tables use FORCE ROW LEVEL SECURITY to ensure policies apply even to table owners.
> Implementation: `backend/prisma/rls.sql`

[VERIFY:SEC-004] TenantContextService sets RLS context using $executeRaw with Prisma.sql tagged template literals (production code).
> Implementation: `backend/src/tenant/tenant-context.service.ts`

[VERIFY:SEC-005] Bcrypt salt rounds defined as constant BCRYPT_SALT_ROUNDS = 12.
> Implementation: `backend/src/common/constants.ts`

## Authorization

[VERIFY:SEC-006] Registration restricts assignable roles to VIEWER, EDITOR, ANALYST via @IsIn decorator — ADMIN cannot be self-assigned.
> Implementation: `backend/src/auth/dto/register.dto.ts`

## Token Security

[VERIFY:SEC-007] AuthService uses JwtService for token generation with configurable expiration.
> Implementation: `backend/src/auth/auth.service.ts`

[VERIFY:SEC-008] Password comparison uses bcrypt.compare (timing-safe).
> Implementation: `backend/src/auth/auth.service.ts`

[VERIFY:SEC-009] JWT strategy validates token signature and extracts user claims.
> Implementation: `backend/src/auth/jwt.strategy.ts`

## Input Validation

- ValidationPipe with whitelist and forbidNonWhitelisted strips unknown properties
- DTOs use class-validator decorators (@IsEmail, @IsString, @MinLength, @IsIn)
- State machine transitions validated against allowed transition maps

## Threat Model

| Threat | Mitigation |
|--------|-----------|
| SQL Injection | Prisma parameterized queries + Prisma.sql tagged templates |
| Cross-tenant access | PostgreSQL RLS with FORCE, tenant context per request |
| Password brute force | bcrypt with salt 12 (slow hashing) |
| Token theft | JWT expiration (24h), CORS origin restriction |
| Mass assignment | ValidationPipe whitelist strips unknown fields |
| Privilege escalation | @IsIn on register DTO excludes ADMIN role |

## Cross-References

- See [DATA_MODEL.md](./DATA_MODEL.md) for schema definitions
- See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for security test coverage
