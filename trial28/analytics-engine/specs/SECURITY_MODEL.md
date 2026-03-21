# Security Model — Analytics Engine

## Authentication

### Password Storage
All passwords are hashed using bcrypt with a salt factor of 12.
Raw passwords are never stored or logged.
<!-- VERIFY:AE-BCRYPT-SALT — bcrypt.hash with salt rounds 12 -->

### JWT Tokens
Authentication tokens are signed with a configurable JWT_SECRET.
Tokens expire after 24 hours by default.
Token payload includes: sub (user ID), email, role.

### Registration Restrictions
The ADMIN role is excluded from the self-registration endpoint.
Admin accounts must be created through direct database seeding or admin API.
<!-- VERIFY:AE-ADMIN-EXCLUDED — @IsIn excludes ADMIN role -->

## Authorization

### Role-Based Access Control
Four roles with hierarchical permissions:
- VIEWER: Read dashboards and widgets
- EDITOR: Create/modify dashboards and widgets
- ANALYST: Manage pipelines and data sources
- ADMIN: Full tenant administration

## Data Protection

### Row Level Security
PostgreSQL RLS is enforced on all tables via FORCE ROW LEVEL SECURITY.
This provides database-level tenant isolation independent of application logic.
<!-- VERIFY:AE-RLS-ENFORCEMENT — FORCE RLS in migration SQL -->

### Input Validation
All API inputs are validated using class-validator decorators.
ValidationPipe strips unknown properties (whitelist) and rejects
unrecognized fields (forbidNonWhitelisted).

### SQL Injection Prevention
All raw SQL queries use Prisma.sql tagged template literals for parameterization.
The codebase never uses $executeRawUnsafe.
<!-- VERIFY:AE-NO-RAW-UNSAFE — Zero $executeRawUnsafe usage -->

## Environment Security

### Secret Management
JWT_SECRET is loaded from environment variables with fail-fast validation.
The application refuses to start without a configured JWT_SECRET.
CORS_ORIGIN is also validated at startup to prevent misconfiguration.
<!-- VERIFY:AE-SECRET-MANAGEMENT — Environment-based secret configuration -->

### Docker Security
Production Docker image runs as non-root USER node.
Multi-stage build excludes development dependencies from production image.
.dockerignore prevents sensitive files from entering the build context.

## Code Quality

### Type Safety
No `as any` type assertions in the codebase.
TypeScript strict mode is enabled for maximum type safety.
<!-- VERIFY:AE-NO-AS-ANY — Zero as any in codebase -->

### Logging
No console.log statements in production code.
Error reporting uses NestJS built-in exception handling.
<!-- VERIFY:AE-NO-CONSOLE-LOG — Zero console.log in production -->

## Dependency Security
Dependencies are pinned to specific major versions in package.json.
Regular dependency audits should be performed using npm audit.
