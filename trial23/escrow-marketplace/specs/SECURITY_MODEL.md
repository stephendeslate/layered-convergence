# Security Model — Escrow Marketplace

## Overview
Security is enforced at multiple layers: application-level authentication via
JWT, authorization via role checks and ownership validation, database-level
protection via row-level security, and input validation via class-validator.

<!-- VERIFY:SM-001: Passwords hashed with bcrypt salt 12 -->
<!-- VERIFY:SM-002: JWT_SECRET fails fast if missing -->
<!-- VERIFY:SM-003: CORS_ORIGIN fails fast if missing -->
<!-- VERIFY:SM-004: Row-level security enabled on all tables -->
<!-- VERIFY:SM-005: ValidationPipe uses whitelist and forbidNonWhitelisted -->

## Authentication

### Password Storage
- bcrypt with explicit salt rounds constant: `const SALT_ROUNDS = 12`
- Password never returned in API responses
- Password field excluded from all select queries

### JWT Configuration
- Tokens issued on successful login
- Token contains user ID and role
- `JWT_SECRET` environment variable is mandatory — application throws
  `Error('JWT_SECRET environment variable is required')` on startup if missing

### Session Management
- Stateless JWT — no server-side session storage
- Tokens validated on every protected request via AuthGuard

## Authorization

### Role-Based Access
- Only BUYER and SELLER roles exist
- Registration DTO uses `@IsIn([Role.BUYER, Role.SELLER])` to reject ADMIN
- Transaction creation restricted to BUYER role
- Payout listing restricted to SELLER role

### Ownership Validation
- Transaction details visible only to buyer or seller on the transaction
- Dispute creation requires involvement in the transaction
- Webhook management scoped to the authenticated user

## Database Security

### Row-Level Security
All tables have RLS policies enforced. The migration includes:
```sql
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE transactions FORCE ROW LEVEL SECURITY;
ALTER TABLE disputes FORCE ROW LEVEL SECURITY;
ALTER TABLE payouts FORCE ROW LEVEL SECURITY;
ALTER TABLE webhooks FORCE ROW LEVEL SECURITY;
```

### Raw Query Safety
- All raw queries use `$executeRaw` with `Prisma.sql` tagged template literals
- `$executeRawUnsafe` is explicitly prohibited
- No string interpolation in SQL queries

## Input Validation
- Global `ValidationPipe` configured with `whitelist: true` and
  `forbidNonWhitelisted: true`
- All DTOs use class-validator decorators
- Unknown properties stripped automatically
- Malformed requests return 400 with descriptive errors

## CORS
- `CORS_ORIGIN` environment variable is mandatory
- Application throws `Error('CORS_ORIGIN environment variable is required')`
  on startup if missing
- No wildcard origins in production

## Related Specifications
- See [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) for infrastructure context
- See [API_CONTRACT.md](API_CONTRACT.md) for endpoint auth requirements
- See [DATA_MODEL.md](DATA_MODEL.md) for entity-level constraints
- See [TESTING_STRATEGY.md](TESTING_STRATEGY.md) for security test coverage
