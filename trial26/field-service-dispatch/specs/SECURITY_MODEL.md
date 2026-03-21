# Security Model: Field Service Dispatch

## Overview

Field Service Dispatch implements defense-in-depth security with
company-level data isolation and role-based access control.

## Authentication Flow

[VERIFY:FD-029] JWT tokens signed with JWT_SECRET from environment.
Application fails fast on startup if JWT_SECRET is not set.

[VERIFY:FD-030] Passwords hashed with bcrypt using salt round 12
for strong resistance against brute-force attacks.

## Authorization Rules

[VERIFY:FD-031] Self-registration uses @IsIn validator restricting
roles to DISPATCHER and TECHNICIAN. ADMIN is excluded.

Role capabilities:
- ADMIN: Full company access, user management
- DISPATCHER: Create/assign work orders, manage routes
- TECHNICIAN: View assigned work orders, update status, record GPS

## Row Level Security

[VERIFY:FD-032] PostgreSQL RLS with FORCE enabled on ALL tables
(companies, users, customers, technicians, work_orders, routes,
gps_events, invoices).

[VERIFY:FD-033] Company context set via `set_config('app.current_company_id', ...)`
using $executeRaw with Prisma.sql tagged templates.

## Threat Model

- SQL Injection: Prevented by Prisma parameterized queries
- Cross-Company Access: Prevented by RLS policies on all tables
- Privilege Escalation: Prevented by @IsIn role restriction
- GPS Spoofing: Mitigated by server-side timestamp validation
- CSRF: Mitigated by CORS origin validation

## CORS Configuration

[VERIFY:FD-034] CORS_ORIGIN required at startup. Application fails
fast if the environment variable is not set.

## Security Anti-Patterns (Banned)

- No `$executeRawUnsafe` in codebase
- No `as any` type assertions
- No `console.log` in production code
- No hardcoded secrets or credentials

## Cross-References

- See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for deployment
- See [API_CONTRACT.md](./API_CONTRACT.md) for auth endpoints
- See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for security tests
