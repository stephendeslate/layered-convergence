# Security Model: Escrow Marketplace

## Overview

The Escrow Marketplace implements comprehensive security for financial
transactions with multi-layer protection.

## Authentication Flow

[VERIFY:EM-026] JWT tokens signed with JWT_SECRET from environment.
Application fails fast on startup if JWT_SECRET is missing.

[VERIFY:EM-027] Passwords hashed with bcrypt using salt round 12
for strong brute-force resistance.

## Authorization Rules

[VERIFY:EM-028] Self-registration uses @IsIn validator restricting roles
to BUYER and SELLER only. ADMIN access is database-administered.

Role capabilities:
- ADMIN: Full platform access, dispute resolution authority
- BUYER: Create transactions, file disputes, view own transactions
- SELLER: Accept transactions, view own payouts

## Row Level Security

[VERIFY:EM-029] PostgreSQL RLS with FORCE enabled on ALL tables
(users, transactions, disputes, payouts, webhooks).

[VERIFY:EM-030] User context set via `set_config('app.current_user_id', ...)`
with $executeRaw and Prisma.sql tagged templates.

## Threat Model

- Payment Fraud: Mitigated by escrow state machine preventing unauthorized releases
- SQL Injection: Prevented by Prisma parameterized queries
- Privilege Escalation: Prevented by @IsIn role restriction
- Data Leakage: Prevented by RLS policies scoping queries to user

## CORS Configuration

[VERIFY:EM-031] CORS_ORIGIN required at startup for cross-origin protection.

## Security Anti-Patterns (Banned)

- No `$executeRawUnsafe` in codebase
- No `as any` type assertions
- No `console.log` in production
- No hardcoded credentials or secrets

## Cross-References

- See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for deployment
- See [API_CONTRACT.md](./API_CONTRACT.md) for auth endpoints
- See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for security tests
