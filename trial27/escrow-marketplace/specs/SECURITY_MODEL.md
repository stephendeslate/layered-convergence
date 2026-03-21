# Security Model: Escrow Marketplace

## Overview

Financial transaction security requires defense-in-depth: application auth,
database RLS, input validation, and state machine integrity.

## Application Security

### Environment Validation
[VERIFY:EM-025] The application fails fast if JWT_SECRET is not set,
preventing operation with insecure token verification.

### Password Hashing
[VERIFY:EM-026] Passwords are hashed with bcrypt salt round 12. This
provides strong protection against brute-force attacks while maintaining
acceptable registration latency.

### Role-Based Access
[VERIFY:EM-027] @IsIn excludes ADMIN from self-registration. Only BUYER,
SELLER, and ARBITER roles are available during registration.

## Database Security

### Row Level Security
[VERIFY:EM-028] PostgreSQL FORCE ROW LEVEL SECURITY is enabled on ALL 5
tables (users, transactions, disputes, payouts, webhooks). Policies
scope access to the authenticated user's transactions.

### User Context
[VERIFY:EM-029] The user context for RLS is set via $executeRaw with
Prisma.sql tagged templates, using parameterized queries to prevent
SQL injection.

### Input Validation
[VERIFY:EM-030] CORS_ORIGIN is validated at startup with fail-fast.
ValidationPipe strips unknown properties via whitelist and rejects
non-whitelisted fields.

## Financial Security

### Decimal Precision
Transaction amounts use Decimal(20,2) to prevent floating-point
rounding errors in financial calculations.

### State Machine Integrity
Transaction transitions are validated at the service layer. Funds
cannot be released without proper state progression.

### Dispute Protection
Disputes freeze fund movement until resolution by an arbiter.

## Threat Model

- **Unauthorized fund release**: Mitigated by state machine validation
- **Cross-user data access**: Mitigated by RLS on all tables
- **Privilege escalation**: Mitigated by @IsIn on registration DTO
- **SQL injection**: Mitigated by Prisma ORM and Prisma.sql templates

## Cross-References

- See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for JWT architecture
- See [API_CONTRACT.md](./API_CONTRACT.md) for endpoint security
- See [DATA_MODEL.md](./DATA_MODEL.md) for entity relationships
