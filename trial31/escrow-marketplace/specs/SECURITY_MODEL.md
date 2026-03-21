# Security Model — Escrow Marketplace

## Overview
Security controls for the escrow payment platform covering authentication,
authorization, data protection, and code quality enforcement.

See also: [API_CONTRACT.md](API_CONTRACT.md), [TESTING_STRATEGY.md](TESTING_STRATEGY.md)

## Authentication

### Password Hashing
<!-- VERIFY:EM-BCRYPT-SALT -->
All passwords hashed using bcrypt with salt rounds of 12.
Configured in AuthService.register method.

### Role Restriction
<!-- VERIFY:EM-ADMIN-EXCLUDED -->
Self-registration excludes ADMIN role using @IsIn validator.
RegisterDto allows only: BUYER, SELLER, ARBITER.

## Database Security

### Row Level Security
<!-- VERIFY:EM-RLS-ENFORCEMENT -->
All tables have both ENABLE ROW LEVEL SECURITY and FORCE ROW LEVEL SECURITY
in the migration SQL. Applied to: users, transactions, disputes, payouts, webhooks.

### SQL Injection Prevention
<!-- VERIFY:EM-NO-RAW-UNSAFE -->
Zero occurrences of $executeRawUnsafe in the codebase.
All raw SQL uses Prisma.sql tagged template literals for parameterization.

## Secret Management
<!-- VERIFY:EM-SECRET-MANAGEMENT -->
JWT_SECRET referenced from process.env without fallback values.
JwtModule.register uses process.env.JWT_SECRET directly.
No hardcoded secrets or default values in any configuration.

## Code Quality Gates

### Type Safety
<!-- VERIFY:EM-NO-AS-ANY -->
Zero occurrences of `as any` type assertions in the codebase.
TypeScript strict mode enforced in tsconfig.json.

### No Debug Logging
<!-- VERIFY:EM-NO-CONSOLE-LOG -->
Zero occurrences of console.log in production code.
All error output uses structured NestJS exceptions.

## Webhook Security
Webhook endpoints protected with shared secrets (whsec_ prefix).
Event payloads include transaction and dispute identifiers.
