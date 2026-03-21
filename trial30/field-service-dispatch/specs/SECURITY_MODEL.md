# Security Model — Field Service Dispatch

## Overview
This document describes the security controls for Field Service Dispatch.
See SYSTEM_ARCHITECTURE.md for architectural context, API_CONTRACT.md
for endpoint details, and DATA_MODEL.md for data protection measures.

## Authentication

<!-- VERIFY:FSD-BCRYPT-SALT — bcrypt.hash with salt 12 -->
Passwords are hashed using bcrypt with 12 salt rounds. This provides
strong resistance against brute-force attacks while maintaining
acceptable registration and login performance.

<!-- VERIFY:FSD-ADMIN-EXCLUDED — @IsIn excludes ADMIN -->
Self-registration is restricted to TECHNICIAN, DISPATCHER, and MANAGER
roles using class-validator's @IsIn decorator. The ADMIN role is
excluded from the registration endpoint. ADMIN users can only be
created through direct database access or seed scripts.

## Row Level Security

<!-- VERIFY:FSD-RLS-ENFORCEMENT — ENABLE + FORCE RLS in migration SQL -->
All seven tables have Row Level Security enabled and forced in the
initial migration SQL:
- users — ENABLE + FORCE
- customers — ENABLE + FORCE
- service_areas — ENABLE + FORCE
- work_orders — ENABLE + FORCE
- equipment — ENABLE + FORCE
- skills — ENABLE + FORCE
- schedules — ENABLE + FORCE

Both ENABLE ROW LEVEL SECURITY and FORCE ROW LEVEL SECURITY are
applied to ensure RLS policies are enforced even for table owners.

## SQL Injection Prevention

<!-- VERIFY:FSD-NO-RAW-UNSAFE — Zero $executeRawUnsafe -->
All raw SQL queries use $executeRaw or $queryRaw with Prisma.sql
tagged templates for parameterized queries. The codebase contains
zero instances of $executeRawUnsafe or $queryRawUnsafe.

## Secret Management

<!-- VERIFY:FSD-SECRET-MANAGEMENT — Environment-based secrets -->
All secrets are sourced from environment variables:
- JWT_SECRET: Required, validated at startup with fail-fast
- CORS_ORIGIN: Required, validated at startup with fail-fast
- DATABASE_URL: Required by Prisma for database connection

No hardcoded fallback values are used for any secrets. The application
throws an error if required environment variables are missing.

## Code Quality Controls

<!-- VERIFY:FSD-NO-AS-ANY — Zero as any in codebase -->
The codebase contains zero instances of `as any` type assertions.
All types are properly defined and validated through TypeScript's
strict mode and class-validator decorators.

<!-- VERIFY:FSD-NO-CONSOLE-LOG — Zero console.log in production -->
The codebase contains zero instances of console.log in production code.
Error output uses process.stderr.write in the seed script.
Structured logging should be added for production deployment.

## Input Validation
All API inputs are validated through NestJS ValidationPipe with whitelist
and forbidNonWhitelisted options. This strips unknown properties and rejects
requests with unexpected fields. See API_CONTRACT.md for validation rules.
