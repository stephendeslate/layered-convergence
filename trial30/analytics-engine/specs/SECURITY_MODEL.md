# Security Model — Analytics Engine

## Overview
The Analytics Engine implements defense-in-depth security with authentication,
authorization, database isolation, and input validation. See SYSTEM_ARCHITECTURE.md
for the overall architecture and API_CONTRACT.md for endpoint specifications.

## Authentication
<!-- VERIFY:AE-BCRYPT-SALT — bcrypt.hash with salt 12 -->
Passwords are hashed using bcrypt with 12 salt rounds. This provides strong
resistance against brute-force attacks while maintaining acceptable performance.
The hash is stored in the password_hash column (see DATA_MODEL.md for schema).

<!-- VERIFY:AE-ADMIN-EXCLUDED — @IsIn excludes ADMIN -->
Self-registration is restricted to non-admin roles using the @IsIn validator.
The RegisterDto only accepts VIEWER, EDITOR, and ANALYST roles. ADMIN accounts
must be created through direct database access or a separate admin API.

## Database Security
<!-- VERIFY:AE-RLS-ENFORCEMENT — ENABLE + FORCE RLS in migration SQL -->
Row Level Security is enabled and forced on all nine tables in the initial
migration. Both ENABLE ROW LEVEL SECURITY and FORCE ROW LEVEL SECURITY
statements are applied to ensure tenant isolation at the database level.
This prevents cross-tenant data access even if application code is bypassed.

<!-- VERIFY:AE-NO-RAW-UNSAFE — Zero $executeRawUnsafe -->
No $executeRawUnsafe calls exist in the codebase. All raw SQL uses
$executeRaw with Prisma.sql tagged template literals for parameterized queries,
preventing SQL injection attacks.

## Environment Security
<!-- VERIFY:AE-SECRET-MANAGEMENT — Environment-based secrets -->
All secrets are loaded from environment variables:
- JWT_SECRET: Used for signing JWT tokens
- DATABASE_URL: PostgreSQL connection string
- CORS_ORIGIN: Allowed CORS origin
- PORT: Server port

No fallback values are used for any secret. The application fails fast
at startup if JWT_SECRET or CORS_ORIGIN are missing.

## Code Quality Security
<!-- VERIFY:AE-NO-AS-ANY — Zero as any in codebase -->
No `as any` type assertions are permitted. All types must be explicitly
defined or properly inferred by TypeScript's type system.

<!-- VERIFY:AE-NO-CONSOLE-LOG — Zero console.log in production -->
No console.log statements are allowed in production code. Error output
uses process.stderr.write in the seed script.

## Input Validation
All request bodies are validated through NestJS ValidationPipe with:
- whitelist: true — strips unknown properties
- forbidNonWhitelisted: true — rejects requests with extra fields
- transform: true — enables automatic type transformation

DTOs use class-validator decorators for field-level validation:
- @IsEmail for email format
- @MinLength(8) for password strength
- @IsIn for role restriction (excluding ADMIN)
- @IsNotEmpty for required fields
- @IsString for string type enforcement

## JWT Token Security
Tokens expire after 24 hours. The JWT secret is loaded from environment
without any fallback. Token payload includes user ID, email, and role.
See TESTING_STRATEGY.md for security-related test coverage.

## CORS Policy
Cross-origin requests are restricted to the configured CORS_ORIGIN.
This is validated at startup with no default value. See API_CONTRACT.md
for the complete endpoint list that CORS applies to.
