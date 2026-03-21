# Security Model

## Overview

Security is enforced at multiple layers: database (RLS), application (guards),
and transport (JWT + httpOnly cookies). Multi-tenant isolation is the primary
security concern. See [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) for
the request flow that enforces these controls.

## Row-Level Security

[VERIFY:SEC-001] PostgreSQL RLS policies SHALL be enabled with FORCE on all 8
company-scoped tables: companies, users, customers, technicians, work_orders,
routes, gps_events, invoices. The FORCE keyword ensures RLS applies even to
table owners, preventing bypass via superuser connections.
→ Implementation: backend/prisma/rls.sql:1

[VERIFY:SEC-002] RLS policies SHALL use the session variable app.company_id
(set via set_config) to restrict all SELECT, INSERT, UPDATE, DELETE operations
to rows matching the current tenant's company_id.
→ Implementation: backend/prisma/rls.sql:28

## Application Security

[VERIFY:SEC-003] JWT tokens SHALL require a JWT_SECRET environment variable.
The application performs a fail-fast check at startup and throws an error if
JWT_SECRET is not set. Tokens expire after 24 hours by default.
→ Implementation: backend/src/main.ts:8

[VERIFY:SEC-004] The backend SHALL require a CORS_ORIGIN environment variable
and perform a fail-fast check at startup. CORS is enabled with credentials
to support cookie-based authentication from the frontend.
→ Implementation: backend/src/main.ts:14

[VERIFY:SEC-005] The CompanyContext service SHALL set the PostgreSQL session
variable for RLS before any database query. It uses Prisma's $executeRaw
with Prisma.sql tagged template literals (not $executeRawUnsafe or string
interpolation) to prevent SQL injection.
→ Implementation: backend/src/company-context/company-context.service.ts:6

## Registration Security

[VERIFY:SEC-006] Password hashing SHALL use bcrypt with a minimum salt factor of 12
rounds. The SALT_ROUNDS constant is defined at the module level and used for
both registration and password verification.
→ Implementation: backend/src/auth/auth.service.ts:14

[VERIFY:SEC-007] ADMIN role registration SHALL be rejected at the service layer
as a defense-in-depth measure, even though the DTO validation already restricts
roles to DISPATCHER and TECHNICIAN via @IsIn. This prevents privilege escalation
through direct API calls that bypass DTO validation.
→ Implementation: backend/src/auth/auth.service.ts:25

## Frontend Security

- Server Actions validate all inputs before making API calls
- response.ok is checked before any redirect (see [UI_SPECIFICATION.md](UI_SPECIFICATION.md) UI-008)
- Cookie parsing uses runtime type narrowing with no `as any` casts
- JWT tokens stored in httpOnly cookies (not localStorage), with secure flag in production
- SameSite=lax prevents CSRF for cross-origin POST requests
- No sensitive data exposed in client-side JavaScript bundles

## Defense-in-Depth Summary

| Layer | Control | Bypass Prevention |
|-------|---------|-------------------|
| Database | RLS with FORCE | Even table owners cannot bypass |
| Application | companyId scoping in all queries | findFirst with id+companyId compound where |
| Transport | JWT + httpOnly cookies | XSS cannot steal tokens |
| Validation | @IsIn enum constraints | Unknown values rejected |
| Service | ADMIN role check | Bypassed DTO still caught |
