# Security Model: Analytics Engine

## Overview

Security is enforced at multiple layers: application-level authentication,
database-level Row Level Security, and input validation. This defense-in-depth
approach ensures that even if one layer is compromised, data remains protected.

## Application Security

### Environment Validation
[VERIFY:AE-025] The application performs fail-fast validation on startup,
throwing an error if JWT_SECRET is not set. This prevents the application
from running in an insecure configuration where tokens cannot be verified.

### Password Hashing
[VERIFY:AE-026] User passwords are hashed using bcrypt with a salt round
of 12. This provides a strong work factor that balances security with
performance. Raw passwords are never stored or logged.

### Role-Based Access Control
[VERIFY:AE-027] The @IsIn validator on the RegisterDto excludes ADMIN from
self-registration. Only VIEWER, EDITOR, and ANALYST roles are available
during registration. ADMIN users must be created through administrative
channels.

## Database Security

### Row Level Security
[VERIFY:AE-028] PostgreSQL FORCE ROW LEVEL SECURITY is enabled on ALL 9
tables (tenants, users, data_sources, data_points, pipelines, dashboards,
widgets, embeds, sync_runs). RLS policies filter rows based on the
app.current_tenant_id session variable.

### Tenant Context
[VERIFY:AE-029] The tenant context is set using $executeRaw with Prisma.sql
tagged template literals. This uses parameterized queries to prevent SQL
injection when setting the session variable for RLS enforcement.

## Input Validation

### Request Validation
[VERIFY:AE-030] The CORS_ORIGIN environment variable is validated at startup
with fail-fast behavior. ValidationPipe with whitelist and forbidNonWhitelisted
options strips unknown properties and rejects requests with extra fields.

## Threat Model

### Cross-Tenant Data Access
Mitigated by RLS policies at the database level. Even if application-level
checks are bypassed, the database enforces tenant boundaries.

### Privilege Escalation
Mitigated by @IsIn validation preventing ADMIN role self-assignment.
Token payload includes role for authorization decisions.

### SQL Injection
Mitigated by using Prisma ORM for all queries and Prisma.sql tagged
templates for raw queries. No $executeRawUnsafe calls exist in the codebase.

### CSRF
Mitigated by JWT Bearer token authentication (not cookie-based) and
CORS origin validation.

## Security Checklist

- No $executeRawUnsafe in codebase
- No `as any` type assertions
- No console.log statements (use structured logging in production)
- All findFirst calls have justification comments
- Passwords hashed with bcrypt salt 12

## Cross-References

- See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for JWT architecture
- See [API_CONTRACT.md](./API_CONTRACT.md) for endpoint authorization requirements
- See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for security test coverage
