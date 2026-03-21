# Security Model — Field Service Dispatch

## Overview

Security is implemented in multiple layers: authentication (JWT), authorization (role-based guards), data isolation (PostgreSQL RLS), and input validation (class-validator DTOs).

## Authentication

<!-- VERIFY:SEC-001 Passwords hashed with bcrypt salt 12 -->
All passwords are hashed using bcrypt with a salt factor of 12. Plain-text passwords are never stored or logged.

### JWT Tokens
- Tokens contain `userId`, `companyId`, and `role` claims
- Signed with HMAC-SHA256 using `JWT_SECRET`
- Default expiration: 24 hours
- Tokens are stateless (no server-side session store)

### Fail-Fast Configuration
<!-- VERIFY:SEC-002 Application fails fast if JWT_SECRET or CORS_ORIGIN are missing -->
The application checks for `JWT_SECRET` and `CORS_ORIGIN` environment variables at startup. If either is missing, the application throws an error and refuses to start. This prevents running with insecure defaults.

## Authorization

### Role-Based Access Control
<!-- VERIFY:SEC-003 Two roles enforced: DISPATCHER and TECHNICIAN -->
The system enforces two roles:
- **DISPATCHER:** Full access to all CRUD operations within their company
- **TECHNICIAN:** Read access to own work orders, update status on assigned work orders, create GPS events

### Defense-in-Depth ADMIN Check
<!-- VERIFY:SEC-004 Auth service rejects ADMIN role even if validation is bypassed -->
Even though the register DTO uses `@IsIn(['DISPATCHER', 'TECHNICIAN'])`, the auth service includes a secondary check that rejects any attempt to register with an ADMIN (or any other undefined) role. This provides defense-in-depth against validation bypass attacks.

### Guards
- `JwtAuthGuard` — validates JWT on all protected routes
- `RolesGuard` — checks user role against `@Roles()` decorator
- Guards are applied globally via `APP_GUARD`

## Data Isolation

<!-- VERIFY:SEC-005 Row-level security on all company-scoped tables -->
### Row-Level Security (RLS)
Every company-scoped table has RLS policies that:
1. Enable RLS with `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
2. Force RLS with `ALTER TABLE ... FORCE ROW LEVEL SECURITY` (applies even to table owners)
3. Create a policy filtering by `company_id = current_setting('app.current_company_id')::uuid`

### Company Context Setting
Before each database operation, the application sets the company context:
```sql
SET LOCAL app.current_company_id = '<company-uuid>';
```
This is done via Prisma's `$executeRaw` with tagged templates (never `$executeRawUnsafe`).

## Input Validation

- All DTOs use `class-validator` decorators
- `ValidationPipe` is applied globally with `whitelist: true` and `forbidNonWhitelisted: true`
- UUIDs are validated with `@IsUUID()`
- Enums are validated with `@IsIn()` or `@IsEnum()`

## SQL Injection Prevention

- Prisma ORM handles parameterized queries by default
- Raw queries use `$executeRaw` with tagged template literals (automatic parameterization)
- `$executeRawUnsafe` is never used anywhere in the codebase

## CORS

- CORS origin is configured from `CORS_ORIGIN` environment variable
- Credentials are allowed for JWT cookie scenarios
- Methods restricted to GET, POST, PATCH, DELETE

## Logging

- No `console.log` in production code — NestJS Logger is used throughout
- Sensitive data (passwords, tokens) is never logged
- Request IDs are attached for traceability
