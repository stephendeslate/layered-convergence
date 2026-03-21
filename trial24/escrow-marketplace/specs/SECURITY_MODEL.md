# Security Model — Escrow Marketplace

## Overview

The security model addresses authentication, authorization, data isolation, and input
validation. It implements defense-in-depth with multiple layers: JWT authentication,
role-based access control, row-level security, and input sanitization.

**Cross-references:** [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md), [DATA_MODEL.md](DATA_MODEL.md), [API_CONTRACT.md](API_CONTRACT.md)

## Threat Model

| Threat | Mitigation |
|--------|-----------|
| Credential stuffing | bcrypt with salt 12, rate limiting |
| Token theft | Short-lived JWTs (24h expiry) |
| Privilege escalation | Role enum restricted to BUYER/SELLER |
| Cross-tenant data access | PostgreSQL RLS policies |
| SQL injection | Prisma parameterized queries, Prisma.sql templates |
| Mass assignment | ValidationPipe with whitelist + forbidNonWhitelisted |
| Missing auth | JwtAuthGuard on all protected routes |

## Authentication Flow

1. User registers with email, password, name, and role
2. Password is hashed with bcrypt (salt rounds = 12)
3. JWT is issued containing user ID, email, and role
4. Subsequent requests include JWT in Authorization header
5. JwtStrategy validates token and extracts user context

[VERIFY:SEC-001] JWT_SECRET and CORS_ORIGIN MUST fail-fast on startup with thrown Error (no fallback).
> Implementation: `backend/src/main.ts:5`

[VERIFY:SEC-002] Registration DTO MUST restrict role to BUYER or SELLER via `@IsIn([Role.BUYER, Role.SELLER])`.
> Implementation: `backend/src/auth/dto/register.dto.ts:6`

[VERIFY:SEC-003] Passwords MUST be hashed with bcrypt using salt rounds of 12.
> Implementation: `backend/src/auth/auth.service.ts:9`

## Input Validation

[VERIFY:SEC-004] The global ValidationPipe MUST be configured with whitelist and forbidNonWhitelisted.
> Implementation: `backend/src/main.ts:17`

All DTOs use class-validator decorators:
- `@IsEmail()` for email fields
- `@IsString()` and `@MinLength(8)` for passwords
- `@IsIn()` for enum restrictions
- `@IsNumber()` with `@Min()` for monetary values
- `@IsUrl()` for webhook URLs

## Row Level Security

RLS policies are defined in `prisma/rls.sql` and enforce tenant-level data isolation
at the PostgreSQL level. Even if application-level checks are bypassed, RLS prevents
cross-tenant data access.

[VERIFY:SEC-005] RLS policies MUST be defined in a standalone `prisma/rls.sql` file with FORCE ROW LEVEL SECURITY on all tables.
> Implementation: `backend/prisma/rls.sql:5`

[VERIFY:SEC-006] The TenantContextService MUST set the current user context before database operations using `$executeRaw`.
> Implementation: `backend/src/tenant-context/tenant-context.service.ts:7`

## JWT Strategy

[VERIFY:SEC-007] The JWT strategy MUST extract and validate token payload for user identification.
> Implementation: `backend/src/auth/strategies/jwt.strategy.ts:12`

The JWT payload contains:
- `sub` — User ID (UUID)
- `email` — User email
- `role` — User role (BUYER or SELLER)

## Banned Patterns

The following patterns are explicitly banned in production code:
- `$executeRawUnsafe` — prevents SQL injection
- `as any` — prevents type safety bypass
- `console.log` — prevents information leakage in production
- Raw `<select>` elements — use shadcn Select wrapper instead

## Authorization Rules

| Resource | BUYER | SELLER |
|----------|-------|--------|
| Create Transaction | Yes (as buyer) | No |
| Fund Transaction | Yes (own) | No |
| Ship Transaction | No | Yes (own) |
| Confirm Delivery | Yes (own) | No |
| File Dispute | Yes (own) | Yes (own) |
| Request Payout | No | Yes (own) |
| Manage Webhooks | Yes | Yes |
