# Security Model — Escrow Marketplace

## Overview

Escrow Marketplace implements defense-in-depth security with bcrypt password hashing, JWT authentication, user-scoped RLS policies, and input validation at every layer.

See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for the technology stack and [API_CONTRACT.md](./API_CONTRACT.md) for endpoint authentication requirements.

## Authentication Flow

1. User submits credentials to POST /auth/login
2. Server verifies bcrypt hash and issues JWT with user ID, email, and role
3. Protected endpoints extract JWT via passport-jwt strategy
4. User context set via `$executeRaw` before each user-scoped query

## Password Security

[VERIFY:SEC-001] User passwords are hashed with bcrypt using salt rounds of 12.
> Implementation: `backend/src/auth/auth.service.ts`

## Row Level Security

[VERIFY:SEC-002] All 5 tables have RLS policies enabled for user-scoped data isolation.
> Implementation: `backend/prisma/rls.sql`

[VERIFY:SEC-003] All tables use FORCE ROW LEVEL SECURITY.
> Implementation: `backend/prisma/rls.sql`

[VERIFY:SEC-004] TenantContextService sets user context using $executeRaw with Prisma.sql tagged templates (production code).
> Implementation: `backend/src/tenant/tenant-context.service.ts`

[VERIFY:SEC-005] Bcrypt salt rounds defined as constant BCRYPT_SALT_ROUNDS = 12.
> Implementation: `backend/src/common/constants.ts`

## Authorization

[VERIFY:SEC-006] Registration restricts roles to BUYER, SELLER via @IsIn — ADMIN cannot be self-assigned.
> Implementation: `backend/src/auth/dto/register.dto.ts`

## Token Security

[VERIFY:SEC-007] AuthService uses bcrypt + JWT for secure authentication.
> Implementation: `backend/src/auth/auth.service.ts`

[VERIFY:SEC-008] Password hashed with bcrypt salt 12 during registration.
> Implementation: `backend/src/auth/auth.service.ts`

[VERIFY:SEC-009] JWT strategy validates token and extracts user claims.
> Implementation: `backend/src/auth/jwt.strategy.ts`

## Threat Model

| Threat | Mitigation |
|--------|-----------|
| SQL Injection | Prisma parameterized queries + Prisma.sql tagged templates |
| Unauthorized access | PostgreSQL RLS with FORCE, user context per request |
| Password brute force | bcrypt with salt 12 (slow hashing) |
| Escrow fraud | State machine enforces valid transitions only |
| Mass assignment | ValidationPipe whitelist strips unknown fields |
| Privilege escalation | @IsIn on register DTO excludes ADMIN role |

## Cross-References

- See [DATA_MODEL.md](./DATA_MODEL.md) for schema definitions
- See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for security test coverage
