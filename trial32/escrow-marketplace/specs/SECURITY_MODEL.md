# Security Model — Escrow Marketplace

## Overview

The security model ensures multi-tenant data isolation, secure authentication,
and input validation across all API endpoints.

See also: [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md), [API_CONTRACT.md](API_CONTRACT.md), [DATA_MODEL.md](DATA_MODEL.md)

## Row-Level Security

- [VERIFY:EM-SM-001] RLS FORCE on all tenant-scoped tables -> Implementation: apps/api/prisma/migrations/20240101000000_init/migration.sql:1
- All tenant-scoped tables have ENABLE ROW LEVEL SECURITY and FORCE ROW LEVEL SECURITY
- RLS policies filter by `tenant_id = current_setting('app.tenant_id', true)`
- Tables with RLS: users, transactions, disputes, payouts, webhooks

## Authentication

- JWT-based authentication using @nestjs/jwt and passport-jwt
- [VERIFY:EM-SM-002] JWT_SECRET fail-fast in main.ts -> Implementation: apps/api/src/main.ts:1
- CORS_ORIGIN also fail-fast (no fallback)
- Token payload: { sub, email, role, tenantId }

## Input Validation

- [VERIFY:EM-SM-003] Global ValidationPipe with whitelist + forbidNonWhitelisted -> Implementation: apps/api/src/main.ts:2
- class-validator decorators on all DTOs
- class-transformer for type coercion

## Password Security

- [VERIFY:EM-SM-004] bcrypt with salt rounds = 12 -> Implementation: apps/api/src/auth/auth.service.ts:1
- Passwords never logged or returned in API responses
- Passwords stored as bcrypt hashes only

## Role Security

- [VERIFY:EM-SM-005] ADMIN role rejected at registration -> Implementation: apps/api/src/auth/auth.service.ts:2
- @IsIn decorator in register DTO excludes ADMIN
- [VERIFY:EM-SM-006] @IsIn excludes ADMIN in register DTO -> Implementation: apps/api/src/auth/dto/register.dto.ts:1
- Service-level validation also rejects ADMIN using REGISTERABLE_ROLES from shared

## Tenant Context

- [VERIFY:EM-SM-007] TenantContextService sets RLS variable via $executeRaw -> Implementation: apps/api/src/tenant-context/tenant-context.service.ts:1
- Uses Prisma.sql tagged template literal (never $executeRawUnsafe)
- Sets PostgreSQL session variable before tenant-scoped queries

## Additional Security Measures

- No hardcoded secret fallbacks in any configuration
- HTTPS enforced in production
- All API responses exclude sensitive fields (password, internal IDs where appropriate)
- Rate limiting recommended for production deployment
