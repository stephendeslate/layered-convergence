# Security Model — Field Service Dispatch

## Overview

FSD implements a defense-in-depth security model with multiple layers:
JWT-based authentication, role-based access control, database-level Row Level Security,
input validation, and secure password storage. The system deliberately excludes an ADMIN
role to minimize the attack surface.

## Authentication Flow

```
1. User submits email + password via POST /auth/login
2. Backend verifies password against bcrypt hash (salt 12)
3. On success, JWT is issued with claims: sub, email, role, companyId
4. Client stores token and sends it as Bearer token on subsequent requests
5. JwtAuthGuard extracts and validates the token on protected routes
6. CurrentUser decorator injects the authenticated user into controllers
```

## Authorization Model

### Roles

The system supports exactly two roles:

| Role | Permissions |
|------|-------------|
| DISPATCHER | Full CRUD on all entities within their company |
| TECHNICIAN | Read work orders, update work order status, create GPS events |

There is NO ADMIN role. This is an intentional security decision to prevent
privilege escalation within the application.

### Company Scoping

Every data query is scoped to the authenticated user's `companyId`. This is enforced
at two levels:

1. **Application level** — every service method accepts `companyId` as a parameter
   and includes it in Prisma `where` clauses.
2. **Database level** — PostgreSQL Row Level Security policies enforce tenant isolation
   even if application code has a bug.

## Row Level Security (RLS)

### Implementation

RLS is configured via SQL migration script (`prisma/rls.sql`). All 7 company-scoped
tables have `FORCE ROW LEVEL SECURITY` enabled with policies for SELECT, INSERT,
UPDATE, and DELETE operations.

### Session Variable

Before each tenant-scoped query, the `CompanyContextService` sets a PostgreSQL session
variable using `$executeRaw` with `Prisma.sql` tagged templates:

```sql
SET LOCAL app.current_company_id = '<companyId>';
```

This is used in RLS policies to filter rows by the current tenant.

## Input Validation

### Global Pipeline

The NestJS `ValidationPipe` is configured globally with:
- `whitelist: true` — strips unknown properties
- `forbidNonWhitelisted: true` — rejects requests with unknown properties

### DTO Validation

All request DTOs use `class-validator` decorators:
- `@IsEmail()` for email fields
- `@IsString()`, `@MinLength()` for strings
- `@IsNumber()` for numeric fields
- `@IsIn(['DISPATCHER', 'TECHNICIAN'])` for role restriction
- `@IsOptional()` for optional fields
- `@IsUUID()` for UUID references

## Password Security

Passwords are hashed using bcrypt with exactly 12 salt rounds. The salt round count
is defined as a constant and never reduced. Raw passwords are never stored or logged.

## Environment Security

The application fails fast on startup if critical environment variables are missing:
- `JWT_SECRET` — used for signing JWT tokens
- `CORS_ORIGIN` — used for CORS configuration

This prevents the application from running with insecure defaults.

## Verified Security Requirements

[VERIFY:SEC-001] User role enum MUST restrict to DISPATCHER and TECHNICIAN only (no ADMIN).
> Implementation: `backend/prisma/schema.prisma`

[VERIFY:SEC-002] All company-scoped tables MUST use FORCE ROW LEVEL SECURITY.
> Implementation: `backend/prisma/rls.sql`

[VERIFY:SEC-003] Application MUST fail fast if JWT_SECRET is not set.
> Implementation: `backend/src/main.ts`

[VERIFY:SEC-004] Application MUST fail fast if CORS_ORIGIN is not set.
> Implementation: `backend/src/main.ts`

[VERIFY:SEC-005] ValidationPipe MUST be configured with whitelist and forbidNonWhitelisted.
> Implementation: `backend/src/main.ts`

[VERIFY:SEC-006] Registration DTO MUST use `@IsIn(['DISPATCHER', 'TECHNICIAN'])` excluding ADMIN.
> Implementation: `backend/src/auth/dto/register.dto.ts`

[VERIFY:SEC-007] bcrypt MUST use exactly 12 salt rounds for password hashing.
> Implementation: `backend/src/auth/auth.service.ts`

[VERIFY:SEC-008] JWT payload MUST contain sub, email, role, and companyId claims.
> Implementation: `backend/src/auth/auth.service.ts`

## Cross-References

- See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for the overall system design.
- See [API_CONTRACT.md](./API_CONTRACT.md) for endpoint authentication requirements.
- See [DATA_MODEL.md](./DATA_MODEL.md) for the User entity and role enum definitions.
