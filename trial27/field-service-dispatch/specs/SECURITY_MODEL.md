# Security Model: Field Service Dispatch

## Overview

Security is implemented at multiple layers: application-level JWT
authentication, database-level Row Level Security, and input validation.

## Authentication

[VERIFY:FD-025] The application fails fast on startup if JWT_SECRET is not
set in the environment. This prevents running with default or missing
secrets in any environment.

[VERIFY:FD-026] Passwords are hashed using bcrypt with a salt round of 12.
This provides strong resistance against brute-force attacks while maintaining
acceptable login latency.

[VERIFY:FD-027] Login validates credentials by looking up the user by email
and comparing the provided password against the bcrypt hash. Generic
"Invalid credentials" messages prevent user enumeration.

## Row Level Security

[VERIFY:FD-028] All 8 tables have FORCE ROW LEVEL SECURITY enabled:
companies, users, customers, technicians, work_orders, routes, gps_events,
and invoices. FORCE ensures RLS applies even to table owners.

[VERIFY:FD-029] The company context is set via parameterized queries using
Prisma.sql tagged templates with $executeRaw. This prevents SQL injection
by ensuring all user-provided values are properly parameterized. The
$executeRawUnsafe function is never used.

## Environment Security

[VERIFY:FD-030] CORS_ORIGIN must be set in the environment or the application
will throw an error on startup. This prevents accidental exposure of the API
to unauthorized origins.

## Threat Mitigations

| Threat | Mitigation |
|--------|------------|
| SQL Injection | Prisma.sql tagged templates |
| Privilege Escalation | @IsIn excludes ADMIN role |
| Cross-Tenant Access | RLS FORCE on all tables |
| Brute Force | bcrypt salt 12 |
| CSRF | CORS origin validation |
| Mass Assignment | forbidNonWhitelisted |

## Cross-References

- See [PRODUCT_VISION.md](./PRODUCT_VISION.md) for role definitions
- See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for module structure
- See [API_CONTRACT.md](./API_CONTRACT.md) for validation rules
