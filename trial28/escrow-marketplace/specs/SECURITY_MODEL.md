# Security Model — Escrow Marketplace

## Authentication

### Password Storage
Passwords hashed with bcrypt, salt rounds = 12.
Raw passwords never stored, logged, or transmitted in responses.
<!-- VERIFY:EM-BCRYPT-SALT — bcrypt.hash with salt rounds 12 -->

### JWT Tokens
Signed with configurable JWT_SECRET from environment.
24-hour expiration by default.
Payload: sub (user ID), email, role.

### Registration Restrictions
ADMIN role excluded from self-registration via @IsIn validator.
Only BUYER, SELLER, ARBITER roles allowed during registration.
<!-- VERIFY:EM-ADMIN-EXCLUDED — @IsIn excludes ADMIN role -->

## Financial Security

### Decimal Precision
All monetary amounts stored as Decimal(20,2) to prevent floating-point errors.
Never uses Float for financial calculations.

### Transaction State Machine
Fund release requires FUNDED status.
$executeRaw ensures atomic status transition.
Race conditions prevented by database-level constraints.

## Data Protection

### Row Level Security
FORCE ROW LEVEL SECURITY applied to all tables in migration.
<!-- VERIFY:EM-RLS-ENFORCEMENT — FORCE RLS in migration SQL -->

### Input Validation
class-validator decorators on all DTOs.
ValidationPipe strips and rejects unknown properties.

### SQL Injection Prevention
All raw queries use Prisma.sql tagged templates.
Zero $executeRawUnsafe usage in the codebase.
<!-- VERIFY:EM-NO-RAW-UNSAFE — Zero $executeRawUnsafe -->

## Environment Security

### Secret Management
JWT_SECRET loaded from environment with fail-fast validation.
CORS_ORIGIN validated at startup.
No hardcoded secrets in source code.
<!-- VERIFY:EM-SECRET-MANAGEMENT — Environment-based secrets -->

### Docker Security
Non-root USER node in production image.
.dockerignore prevents sensitive files in build context.
Multi-stage build excludes dev dependencies.

## Code Quality

### Type Safety
Zero `as any` assertions in the codebase.
TypeScript strict mode enabled.
<!-- VERIFY:EM-NO-AS-ANY — Zero as any -->

### Logging
Zero console.log in production code.
Errors handled via NestJS exception filters.
<!-- VERIFY:EM-NO-CONSOLE-LOG — Zero console.log -->

## Webhook Security
Webhook secrets are stored for request signing.
Only active webhooks receive notifications.
