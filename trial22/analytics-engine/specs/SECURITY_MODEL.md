# Security Model

## Overview

The Analytics Engine implements defense-in-depth security through multiple layers:
JWT authentication, role-based access control, Row Level Security at the database
level, and input validation at the API boundary.

## Authentication

Authentication uses JWT tokens with 24-hour expiry. Tokens are issued on
registration and login, containing the user's ID, email, role, and tenantId.

### Password Hashing

Passwords are hashed using bcrypt with a cost factor of 12. This provides
adequate protection against brute-force attacks while maintaining acceptable
login latency.

[VERIFY:SEC-001] Tenant isolation via tenantId foreign key on all scoped tables -> Implementation: prisma/schema.prisma:7

## Row Level Security

RLS is the primary mechanism for tenant data isolation. Every tenant-scoped
table has RLS enabled AND forced (ensuring even table owners are subject to
policies).

[VERIFY:SEC-002] RLS policies on all 9 tenant-scoped tables -> Implementation: prisma/rls.sql:1

[VERIFY:SEC-003] FORCE ROW LEVEL SECURITY ensures table owners are also subject to RLS -> Implementation: prisma/rls.sql:2

The following tables have RLS enabled and forced:
- tenants
- users
- data_sources
- data_points
- pipelines
- dashboards
- widgets
- embeds
- sync_runs

## Fail-Fast Configuration

Critical security configuration is validated at application startup. Missing
values cause immediate failure rather than running in an insecure state.

[VERIFY:SEC-004] JWT_SECRET fail-fast validation at startup -> Implementation: src/main.ts:1

[VERIFY:SEC-005] CORS_ORIGIN fail-fast validation at startup -> Implementation: src/main.ts:2

## Prisma Query Safety

All raw SQL queries use `$executeRaw` with `Prisma.sql` tagged templates.
The codebase NEVER uses `$executeRawUnsafe`, preventing SQL injection.

[VERIFY:SEC-006] Uses $executeRaw with Prisma.sql tagged template -> Implementation: src/prisma/prisma.service.ts:2

## Tenant Context

The TenantContextMiddleware sets the PostgreSQL session variable `app.tenant_id`
before each request, enabling RLS policy evaluation.

[VERIFY:SEC-007] Tenant context middleware sets RLS context per request -> Implementation: src/tenant-context/tenant-context.middleware.ts:1

## Password Security

[VERIFY:SEC-008] bcrypt salt rounds = 12 for password hashing -> Implementation: src/auth/auth.service.ts:1

## Defense-in-Depth

Even though the Role enum only contains VIEWER, EDITOR, and ANALYST, the auth
service includes an explicit ADMIN role check as defense-in-depth.

[VERIFY:SEC-009] Defense-in-depth ADMIN role rejection in auth service -> Implementation: src/auth/auth.service.ts:2

## Input Validation

[VERIFY:SEC-010] Role validation via @IsIn prevents unauthorized role assignment -> Implementation: src/auth/dto/register.dto.ts:2

[VERIFY:SEC-011] JWT strategy extracts tenant context from token payload -> Implementation: src/auth/jwt.strategy.ts:1

[VERIFY:SEC-012] JWT auth guard protects all authenticated routes -> Implementation: src/auth/jwt-auth.guard.ts:1

[VERIFY:SEC-013] Server Actions check response.ok before redirect -> Implementation: frontend/app/actions.ts:2

## Cross-References

- RLS table definitions: see DATA_MODEL.md
- JWT flow in architecture: see SYSTEM_ARCHITECTURE.md
- API authentication: see API_CONTRACT.md
