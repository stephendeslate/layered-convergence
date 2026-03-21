# Security Model — Escrow Marketplace

## Overview

Security is implemented in defense-in-depth layers: authentication (JWT),
authorization (role guards), data isolation (Row-Level Security), and input
validation (class-validator DTOs). No ADMIN role exists in the system.

See: [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) for authentication flow overview.
See: [DATA_MODEL.md](DATA_MODEL.md) for table structures and RLS migration.

<!-- VERIFY:SM-001 — bcrypt with salt rounds = 12 -->
<!-- VERIFY:SM-002 — JWT_SECRET fail-fast validation in main.ts -->
<!-- VERIFY:SM-003 — CORS_ORIGIN fail-fast validation in main.ts -->
<!-- VERIFY:SM-004 — Defense-in-depth ADMIN rejection in auth service -->
<!-- VERIFY:SM-005 — Row-Level Security FORCE on user-scoped tables -->
<!-- VERIFY:SM-006 — No $executeRawUnsafe anywhere in codebase -->

## Authentication

### Password Hashing
- Algorithm: bcrypt
- Salt rounds: 12 (defined as `const SALT_ROUNDS = 12`)
- Password is hashed on registration and verified on login
- See [API_CONTRACT.md](API_CONTRACT.md) for registration endpoint spec

### JWT Tokens
- Issued on successful login
- Payload contains: `sub` (userId), `email`, `role`
- Secret loaded from `JWT_SECRET` environment variable
- `main.ts` validates `JWT_SECRET` is set at startup — throws if missing

### Fail-Fast Environment Validation
```typescript
// main.ts
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
if (!process.env.CORS_ORIGIN) {
  throw new Error('CORS_ORIGIN environment variable is required');
}
```

## Authorization

### Role-Based Access
- BUYER: Can create transactions, fund them, confirm delivery
- SELLER: Can mark items as shipped, receive payouts
- Both: Can file disputes, view their own transactions

### Defense-in-Depth ADMIN Check
Even though no ADMIN role exists in the enum, the auth service explicitly
rejects any attempt to register with an ADMIN role. This guards against
enum expansion attacks.
See [TESTING_STRATEGY.md](TESTING_STRATEGY.md) for ADMIN rejection test cases.

```typescript
if (role === 'ADMIN') {
  throw new ForbiddenException('Registration with ADMIN role is not permitted');
}
```

### Ownership Verification
All service methods verify that the authenticated user is a participant
(buyer or seller) of the transaction before allowing access.

## Data Security

### Row-Level Security (RLS)
PostgreSQL RLS policies are applied to user-scoped tables via migration.
See [DATA_MODEL.md](DATA_MODEL.md) for the complete list of protected tables.

```sql
-- Transactions: users can only see their own
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions FORCE ROW LEVEL SECURITY;

-- Disputes: users can only see disputes on their transactions
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes FORCE ROW LEVEL SECURITY;

-- Payouts: users can only see their own payouts
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts FORCE ROW LEVEL SECURITY;
```

### SQL Injection Prevention
- All raw SQL uses `$executeRaw` with `Prisma.sql` tagged templates
- `$executeRawUnsafe` is NEVER used anywhere in the codebase
- Prisma's query builder handles parameterization for standard queries

## Input Validation

### DTO Validation
- All request bodies validated with class-validator decorators
- `@IsIn([Role.BUYER, Role.SELLER])` on registration role field
- `@IsEmail()` on email fields
- `@IsString()` and `@IsNotEmpty()` on required string fields
- `@IsNumberString()` on monetary amount fields
- See [API_CONTRACT.md](API_CONTRACT.md) for complete DTO specifications

### State Machine Validation
Transaction status transitions are validated against the allowed transition
map before any database mutation occurs.
See [PRODUCT_VISION.md](PRODUCT_VISION.md) for the state machine diagram.

## Webhook Security

Webhook payloads are stored as JSON and delivered with the transaction context.
Event types are validated against a whitelist of known events.

## Threat Model

| Threat | Mitigation |
|--------|-----------|
| Password brute force | bcrypt with salt 12 (slow hashing) |
| JWT theft | Short expiry, HTTPS only |
| SQL injection | Prisma ORM + $executeRaw with Prisma.sql |
| Cross-user data access | RLS policies + ownership checks in services |
| ADMIN role injection | Defense-in-depth rejection in auth service |
| CORS abuse | Strict CORS_ORIGIN configuration |
| XSS | React auto-escaping + CSP headers |

## Security Testing

See [TESTING_STRATEGY.md](TESTING_STRATEGY.md) for security-specific test cases including:
- ADMIN role rejection tests
- Ownership verification tests
- Invalid JWT tests
- State machine violation tests
