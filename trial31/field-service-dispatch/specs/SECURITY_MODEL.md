# Security Model — Field Service Dispatch

## Password Security

### Bcrypt Hashing
All passwords are hashed using bcrypt with a salt factor of 12. This provides adequate protection
against brute-force attacks while maintaining reasonable registration performance. The salt factor
of 12 results in approximately 2^12 iterations of the key derivation function. Password hashes
are stored in the `password_hash` column and never exposed through API responses.
<!-- VERIFY:FD-BCRYPT-SALT -->

### Admin Role Exclusion
The ADMIN role is excluded from self-registration via `@IsIn(['DISPATCHER', 'TECHNICIAN', 'MANAGER'])` decorator. ADMIN accounts can only be created through direct database operations or seed scripts.
<!-- VERIFY:FD-ADMIN-EXCLUDED -->

## Database Security

### Row Level Security
All 8 tables (companies, users, customers, technicians, work_orders, routes, gps_events, invoices)
have both `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY` applied in the initial
migration SQL. The FORCE directive ensures RLS applies even to table owners, preventing
privilege escalation through superuser connections.
<!-- VERIFY:FD-RLS-ENFORCEMENT -->

### Raw SQL Safety
The codebase uses exclusively `$executeRaw` and `$queryRaw` with `Prisma.sql` tagged template literals for parameterized queries. Zero occurrences of `$executeRawUnsafe` exist in the codebase.
<!-- VERIFY:FD-NO-RAW-UNSAFE -->

## Environment Security

### Secret Management
All secrets (JWT_SECRET, CORS_ORIGIN, DATABASE_URL) are sourced from environment variables. The application fails fast at startup if critical variables are missing. No hardcoded fallback values exist for security-sensitive configuration.
<!-- VERIFY:FD-SECRET-MANAGEMENT -->

## Code Quality Constraints

### No Type Assertions
Zero occurrences of `as any` type assertions in the codebase. All types are properly defined and inferred.
<!-- VERIFY:FD-NO-AS-ANY -->

### No Console Logging
Zero occurrences of `console.log` in production code. Structured error handling is used instead (NestJS exceptions, process.stderr in seed).
<!-- VERIFY:FD-NO-CONSOLE-LOG -->

## Input Validation
All incoming request bodies are validated through NestJS class-validator decorators before reaching
service logic. Email fields use `@IsEmail()`, passwords use `@MinLength(8)`, and role fields use
`@IsIn()` to whitelist allowed values. The global ValidationPipe with `forbidNonWhitelisted: true`
rejects any request containing unexpected properties, mitigating mass assignment attacks.

## Cross-References
- See API_CONTRACT.md for endpoint security requirements
- See TESTING_STRATEGY.md for security-related test coverage
