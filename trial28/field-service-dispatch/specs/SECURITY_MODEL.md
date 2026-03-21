# Security Model — Field Service Dispatch

## Authentication

### Password Storage
Passwords hashed with bcrypt, salt rounds = 12.
Raw passwords never stored, logged, or transmitted in responses.
<!-- VERIFY:FD-BCRYPT-SALT — bcrypt.hash with salt rounds 12 -->

### JWT Tokens
Signed with configurable JWT_SECRET from environment.
24-hour expiration by default.
Payload: sub (user ID), email, role.

### Registration Restrictions
ADMIN role excluded from self-registration via @IsIn validator.
Only DISPATCHER, TECHNICIAN, MANAGER roles allowed during registration.
<!-- VERIFY:FD-ADMIN-EXCLUDED — @IsIn excludes ADMIN role -->

## Data Protection

### Row Level Security
FORCE ROW LEVEL SECURITY applied to all 8 tables in migration.
Prevents cross-tenant data leakage at the database level.
<!-- VERIFY:FD-RLS-ENFORCEMENT — FORCE RLS in migration SQL -->

### Input Validation
class-validator decorators on all DTOs.
ValidationPipe strips and rejects unknown properties.

### SQL Injection Prevention
All raw queries use Prisma.sql tagged templates.
Zero $executeRawUnsafe usage in the codebase.
<!-- VERIFY:FD-NO-RAW-UNSAFE — Zero $executeRawUnsafe -->

## Environment Security

### Secret Management
JWT_SECRET loaded from environment with fail-fast validation.
CORS_ORIGIN validated at startup.
No hardcoded secrets in source code.
<!-- VERIFY:FD-SECRET-MANAGEMENT — Environment-based secrets -->

### Docker Security
Non-root USER node in production image.
.dockerignore prevents sensitive files in build context.
Multi-stage build excludes dev dependencies.

## Code Quality

### Type Safety
Zero `as any` assertions in the codebase.
TypeScript strict mode enabled.
<!-- VERIFY:FD-NO-AS-ANY — Zero as any -->

### Logging
Zero console.log in production code.
Errors handled via NestJS exception filters.
<!-- VERIFY:FD-NO-CONSOLE-LOG — Zero console.log -->

## Multi-Tenant Isolation
Company-scoped queries ensure tenant isolation.
All work orders, routes, and invoices reference a company ID.
GPS events are scoped through technician -> company relationship.
