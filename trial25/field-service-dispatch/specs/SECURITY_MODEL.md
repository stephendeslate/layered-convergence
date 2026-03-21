# Security Model -- Field Service Dispatch

## Overview

Multi-tenant security with company-scoped Row Level Security, JWT authentication, and bcrypt password hashing.

## Password Security

[VERIFY:SEC-001] User passwords hashed with bcrypt salt 12.
> Implementation: `backend/src/auth/auth.service.ts`

[VERIFY:SEC-002] Bcrypt salt rounds defined as constant BCRYPT_SALT_ROUNDS = 12 in common/constants.ts.
> Implementation: `backend/src/common/constants.ts`

[VERIFY:SEC-003] RegisterDto uses @IsIn(['DISPATCHER', 'TECHNICIAN']) to exclude ADMIN from self-registration.
> Implementation: `backend/src/auth/dto/register.dto.ts`

## Row Level Security

[VERIFY:SEC-004] TenantContextService uses $executeRaw with Prisma.sql to set app.user_id for RLS context.
> Implementation: `backend/src/tenant/tenant-context.service.ts`

[VERIFY:SEC-005] Row Level Security enabled on all 8 tables (companies, users, customers, technicians, work_orders, routes, gps_events, invoices).
> Implementation: `backend/prisma/rls.sql`

[VERIFY:SEC-006] FORCE ROW LEVEL SECURITY applied on all tables to enforce policies even for table owners.
> Implementation: `backend/prisma/rls.sql`

## Authentication

[VERIFY:SEC-007] AuthService handles registration and login with bcrypt password hashing and JWT token generation.
> Implementation: `backend/src/auth/auth.service.ts`

[VERIFY:SEC-008] Password hashed with bcrypt salt 12 during registration.
> Implementation: `backend/src/auth/auth.service.ts`

[VERIFY:SEC-009] JWT strategy validates bearer tokens from Authorization header using passport-jwt.
> Implementation: `backend/src/auth/jwt.strategy.ts`

## Cross-References

- See [API_CONTRACT.md](./API_CONTRACT.md) for endpoint authentication requirements
- See [DATA_MODEL.md](./DATA_MODEL.md) for entity access patterns
