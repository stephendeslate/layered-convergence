# Security Model — Analytics Engine

## Overview

Security is enforced at multiple layers: authentication (JWT), authorization (roles),
data isolation (Row-Level Security), and input validation (class-validator with
NestJS ValidationPipe).

## Authentication

### JWT Token Management
Users authenticate via email/password and receive a JWT token containing:
- `sub` — user ID
- `email` — user email
- `role` — user role (VIEWER, EDITOR, ANALYST)
- `tenantId` — tenant UUID for RLS scoping

Tokens expire after 24 hours. The JWT secret is loaded from environment variables
with fail-fast validation — the application throws an error if JWT_SECRET is missing.

[VERIFY:SM-001] RLS FORCE ROW LEVEL SECURITY on all tenant tables -> Implementation: backend/prisma/rls.sql:1
[VERIFY:SM-002] JWT_SECRET fail-fast in main.ts -> Implementation: backend/src/main.ts:1
[VERIFY:SM-003] Global ValidationPipe with whitelist + forbidNonWhitelisted -> Implementation: backend/src/main.ts:2

### Password Security
Passwords are hashed using bcrypt with 12 salt rounds. The salt round constant
is defined as `const SALT_ROUNDS = 12` to prevent accidental changes.

[VERIFY:SM-004] bcrypt salt 12 for password hashing -> Implementation: backend/src/auth/auth.service.ts:1
[VERIFY:SM-005] ADMIN role rejected at registration -> Implementation: backend/src/auth/auth.service.ts:2

### CORS Configuration
CORS origin is loaded from the CORS_ORIGIN environment variable with fail-fast
validation. The application throws an error if CORS_ORIGIN is missing.

## Authorization

### Role System
Three roles are supported:
- **VIEWER** — read-only access
- **EDITOR** — read and write access
- **ANALYST** — full access including pipeline management

The ADMIN role does not exist in the system. Registration explicitly validates
the role field using `@IsIn([Role.VIEWER, Role.EDITOR, Role.ANALYST])`.

[VERIFY:SM-006] @IsIn excludes ADMIN from registration DTO -> Implementation: backend/src/auth/dto/register.dto.ts:1

## Data Isolation

### Row-Level Security (RLS)
PostgreSQL RLS is enabled and forced on all tenant-scoped tables:
- users, data_sources, data_points, pipelines
- dashboards, widgets, embeds, sync_runs

Each table has a policy that filters rows based on the `app.current_tenant_id`
session variable, which is set via TenantContextService.

[VERIFY:SM-007] TenantContextService sets RLS variable -> Implementation: backend/src/tenant-context/tenant-context.service.ts:1

### Application-Level Isolation
In addition to RLS, all service methods accept a `tenantId` parameter and filter
queries accordingly. This provides defense in depth — even if RLS is misconfigured,
the application layer prevents cross-tenant data access.

## Input Validation

### NestJS ValidationPipe
The global ValidationPipe is configured with:
- `whitelist: true` — strips unknown properties
- `forbidNonWhitelisted: true` — rejects requests with unknown properties
- `transform: true` — transforms payloads to DTO instances

### SQL Injection Prevention
All raw SQL queries use `Prisma.sql` tagged templates. The codebase never uses
`$executeRawUnsafe` or string concatenation for queries.

## Cross-References

- See [PRODUCT_VISION.md](./PRODUCT_VISION.md) for security requirements context
- See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for guard implementation
- See [API_CONTRACT.md](./API_CONTRACT.md) for endpoint authentication requirements
