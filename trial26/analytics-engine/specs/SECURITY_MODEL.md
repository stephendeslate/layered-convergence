# Security Model: Analytics Engine

## Overview

The Analytics Engine implements defense-in-depth security with multiple
layers of protection for multi-tenant data isolation.

## Authentication Flow

[VERIFY:AE-025] JWT tokens are signed with a secret loaded from JWT_SECRET
environment variable. Application fails fast if JWT_SECRET is not set.

[VERIFY:AE-026] Passwords are hashed using bcrypt with a salt round of 12,
providing strong resistance against brute-force attacks.

## Authorization Rules

[VERIFY:AE-027] Self-registration restricts role assignment using @IsIn validator,
explicitly excluding ADMIN role to prevent privilege escalation.

Role capabilities:
- ADMIN: Full access to all tenant resources
- EDITOR: Create and modify dashboards and pipelines
- ANALYST: Read access to all data, create personal dashboards
- VIEWER: Read-only access to shared dashboards

## Row Level Security

[VERIFY:AE-028] PostgreSQL RLS is enabled with FORCE on ALL tables (tenants,
users, data_sources, data_points, pipelines, dashboards, widgets, embeds, sync_runs).

[VERIFY:AE-029] Tenant context is set via `set_config('app.current_tenant_id', ...)`
using $executeRaw with Prisma.sql tagged templates.

## Threat Model

- SQL Injection: Prevented by Prisma parameterized queries and Prisma.sql templates
- Cross-Tenant Access: Prevented by RLS policies on all tables
- Privilege Escalation: Prevented by @IsIn role restriction
- CSRF: Mitigated by CORS origin validation
- XSS: Mitigated by React's default output escaping

## CORS Configuration

[VERIFY:AE-030] CORS_ORIGIN is required at startup. Application fails fast
if the environment variable is not set.

## Security Anti-Patterns (Banned)

- No `$executeRawUnsafe` anywhere in codebase
- No `as any` type assertions
- No `console.log` in production code
- No hardcoded secrets

## Cross-References

- See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for deployment security
- See [API_CONTRACT.md](./API_CONTRACT.md) for authentication endpoints
- See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for security test coverage
