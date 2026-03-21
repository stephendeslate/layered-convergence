# Security Model — Analytics Engine

## Overview
Security is implemented at multiple layers: application, database, and
infrastructure. See SYSTEM_ARCHITECTURE.md for deployment security and
API_CONTRACT.md for endpoint-level access controls.

## Password Security
<!-- VERIFY:AE-BCRYPT-SALT — bcrypt.hash with salt 12 -->
User passwords are hashed using bcrypt with 12 salt rounds. Plain text
passwords are never stored or logged. The hash is stored in the
password_hash column as defined in DATA_MODEL.md.

## Role-Based Access Control
<!-- VERIFY:AE-ADMIN-EXCLUDED — @IsIn excludes ADMIN -->
Self-registration is restricted to non-admin roles using @IsIn validator.
Allowed registration roles: VIEWER, EDITOR, ANALYST. ADMIN accounts must
be created through administrative processes.

## Row Level Security
<!-- VERIFY:AE-RLS-ENFORCEMENT — ENABLE + FORCE RLS in migration SQL -->
All database tables have both ENABLE ROW LEVEL SECURITY and FORCE ROW
LEVEL SECURITY applied. This ensures tenant isolation at the PostgreSQL
level, preventing cross-tenant data access even if application logic fails.

## SQL Injection Prevention
<!-- VERIFY:AE-NO-RAW-UNSAFE — Zero $executeRawUnsafe -->
All raw SQL uses Prisma.sql tagged templates for parameterized queries.
$executeRawUnsafe is never used in the codebase. This prevents SQL
injection attacks in all database operations.

## Secret Management
<!-- VERIFY:AE-SECRET-MANAGEMENT — Environment-based secrets -->
All secrets (JWT_SECRET, DATABASE_URL) are provided via environment
variables. No hardcoded fallback values exist in the codebase. Missing
required variables cause immediate startup failure.

## Type Safety
<!-- VERIFY:AE-NO-AS-ANY — Zero as any in codebase -->
The codebase contains zero `as any` type assertions. All types are
properly defined using TypeScript interfaces and Prisma-generated types.

## Logging Policy
<!-- VERIFY:AE-NO-CONSOLE-LOG — Zero console.log in production -->
Production code contains zero console.log statements. Error reporting
uses structured error handling through NestJS exceptions.

## Input Validation
All API inputs are validated using class-validator decorators:
- Email validation with @IsEmail
- Password minimum length with @MinLength(8)
- Role restriction with @IsIn
- Whitelist mode strips unknown properties
- forbidNonWhitelisted rejects requests with extra fields

## Token Security
JWTs expire after 24 hours. Embed tokens have explicit expiration dates.
All tokens are validated on each request.

## Testing Strategy
Security-related tests are documented in TESTING_STRATEGY.md, including
integration tests that verify ADMIN role rejection and input validation.
