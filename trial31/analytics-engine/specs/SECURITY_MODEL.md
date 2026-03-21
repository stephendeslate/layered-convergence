# Security Model — Analytics Engine

## Overview
Security is enforced at multiple layers: application-level validation,
database-level RLS, and infrastructure-level container hardening.

See also: [API_CONTRACT.md](API_CONTRACT.md), [TESTING_STRATEGY.md](TESTING_STRATEGY.md)

## Password Security
<!-- VERIFY:AE-BCRYPT-SALT -->
All passwords are hashed using bcrypt with a salt factor of 12.
The bcrypt.hash function is called with the raw password and salt rounds.
Password comparison uses bcrypt.compare for timing-safe verification.

## Role-Based Access Control
<!-- VERIFY:AE-ADMIN-EXCLUDED -->
The ADMIN role is excluded from self-registration. The RegisterDto uses
@IsIn(['VIEWER', 'EDITOR', 'ANALYST']) to validate the role field.
ADMIN accounts must be created through direct database operations or
administrative API endpoints.

## Row Level Security
<!-- VERIFY:AE-RLS-ENFORCEMENT -->
PostgreSQL Row Level Security is both ENABLED and FORCED on every table
in the migration SQL. Both statements are required:
- ALTER TABLE "table_name" ENABLE ROW LEVEL SECURITY;
- ALTER TABLE "table_name" FORCE ROW LEVEL SECURITY;

Tables with RLS: tenants, users, data_sources, data_points, pipelines,
dashboards, widgets, embeds, sync_runs (9 tables total).

## SQL Injection Prevention
<!-- VERIFY:AE-NO-RAW-UNSAFE -->
The codebase contains zero uses of $executeRawUnsafe or $queryRawUnsafe.
All raw SQL uses Prisma.sql tagged templates for parameterized queries.

## Secret Management
<!-- VERIFY:AE-SECRET-MANAGEMENT -->
Environment-based secret management with no hardcoded fallbacks.
JWT_SECRET is referenced directly from process.env without a default value.
The application fails fast if secrets are not configured.

## Code Quality
<!-- VERIFY:AE-NO-AS-ANY -->
Zero uses of `as any` type assertions in the codebase.
All types are properly defined and checked by TypeScript.

<!-- VERIFY:AE-NO-CONSOLE-LOG -->
Zero uses of console.log in production code.
Error output uses process.stderr.write or NestJS Logger.

## Container Security
Dockerfile uses USER node to run as non-root.
Multi-stage build minimizes attack surface in production image.
HEALTHCHECK enables orchestrator-level monitoring.
