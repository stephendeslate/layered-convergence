# Security Model — Analytics Engine

## Overview

The security model implements defense-in-depth with multiple layers: database-level row-level
security, application-level JWT authentication, input validation, and role-based access control.

## Row-Level Security (RLS)

PostgreSQL RLS policies enforce tenant isolation at the database level. Every tenant-scoped
table has both ENABLE and FORCE ROW LEVEL SECURITY applied, ensuring even table owners cannot
bypass the policies.

[VERIFY:SEC-001] FORCE ROW LEVEL SECURITY on all tenant-scoped tables in rls.sql.
> Implementation: `backend/prisma/rls.sql:1`

The tenant context is set via a PostgreSQL session variable (`app.current_tenant_id`) before
each tenant-scoped query. This is done through the TenantContextService.

## Application-Level Security

### Environment Variable Validation

The application fails fast if required security configuration is missing. Both JWT_SECRET and
CORS_ORIGIN must be set before the application starts.

[VERIFY:SEC-002] JWT_SECRET and CORS_ORIGIN fail-fast in main.ts — throws Error, no fallback.
> Implementation: `backend/src/main.ts:1`

### Input Validation

All incoming request bodies are validated through NestJS ValidationPipe configured with strict
settings that strip unknown properties and reject non-whitelisted fields.

[VERIFY:SEC-003] Global ValidationPipe with whitelist: true and forbidNonWhitelisted: true.
> Implementation: `backend/src/main.ts:2`

### Password Security

User passwords are hashed using bcrypt with a minimum of 12 salt rounds, providing strong
resistance against brute-force and rainbow table attacks.

[VERIFY:SEC-004] bcrypt salt rounds set to 12 (const SALT_ROUNDS = 12).
> Implementation: `backend/src/auth/auth.service.ts:1`

### Role Restriction

The ADMIN role is explicitly excluded from user registration at two levels:
1. DTO validation via @IsIn decorator
2. Service-level check in the register method

[VERIFY:SEC-005] ADMIN role rejection enforced at the service level in register method.
> Implementation: `backend/src/auth/auth.service.ts:2`

[VERIFY:SEC-006] @IsIn([VIEWER, EDITOR, ANALYST]) in RegisterDto excludes ADMIN from validation.
> Implementation: `backend/src/auth/dto/register.dto.ts:1`

### Tenant Context for RLS

The TenantContextService uses Prisma's $executeRaw with Prisma.sql tagged template literals
to safely set the PostgreSQL session variable used by RLS policies.

[VERIFY:SEC-007] TenantContextService sets RLS variable via $executeRaw with Prisma.sql.
> Implementation: `backend/src/tenant-context/tenant-context.service.ts:1`

## Threat Model

| Threat | Mitigation |
|--------|-----------|
| Cross-tenant data access | RLS policies + tenantId in JWT |
| SQL injection | Prisma ORM + Prisma.sql tagged templates |
| Privilege escalation | @IsIn DTO validator + service-level ADMIN check |
| Brute-force login | bcrypt salt 12 |
| Missing secrets | Fail-fast validation in main.ts |
| Mass assignment | ValidationPipe with forbidNonWhitelisted |

## Prohibited Patterns

- `$executeRawUnsafe` — NEVER used anywhere in the codebase
- `as any` — zero occurrences in production code
- `console.log` — zero occurrences in production code
- Fallback values for JWT_SECRET — application must crash if not configured

## Cross-References

- **PRODUCT_VISION.md**: Defines the access control requirements
- **DATA_MODEL.md**: Specifies which tables require RLS policies
- **API_CONTRACT.md**: Documents which endpoints require authentication
- **TESTING_STRATEGY.md**: Describes how security controls are tested
