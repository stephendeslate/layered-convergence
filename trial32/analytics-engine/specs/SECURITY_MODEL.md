# Security Model — Analytics Engine

## Overview

Security is enforced through multiple layers: JWT authentication, role-based access
control, Row-Level Security at the database level, and input validation.

See also: [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md), [API_CONTRACT.md](API_CONTRACT.md)

## Authentication

### JWT Configuration
- [VERIFY:AE-SM-002] JWT_SECRET fails fast at startup if not set -> Implementation: apps/api/src/main.ts:1
- CORS_ORIGIN also fails fast at startup if not set
- JWT tokens include: sub (user ID), email, role, tenantId
- Token expiration: 24 hours

### Password Security
- [VERIFY:AE-SM-004] bcrypt with salt rounds = 12 for password hashing -> Implementation: apps/api/src/auth/auth.service.ts:1
- Passwords are never stored in plaintext or logged

### Registration Security
- [VERIFY:AE-SM-005] ADMIN role rejected at registration endpoint -> Implementation: apps/api/src/auth/auth.service.ts:2
- [VERIFY:AE-SM-006] @IsIn validator excludes ADMIN in RegisterDto -> Implementation: apps/api/src/auth/dto/register.dto.ts:1
- Double validation: DTO level (@IsIn) and service level (REGISTERABLE_ROLES check)

## Authorization

### Role-Based Access Control
- VIEWER: Read-only access to dashboards, data points, embeds
- EDITOR: Full CRUD on most entities within tenant scope
- ANALYST: Extended analytical capabilities

### Tenant Isolation
- [VERIFY:AE-SM-001] RLS with ENABLE and FORCE on all tenant-scoped tables -> Implementation: apps/api/prisma/migrations/20240101000000_init/migration.sql:1
- [VERIFY:AE-SM-007] TenantContextService sets RLS variable via $executeRaw with Prisma.sql -> Implementation: apps/api/src/tenant-context/tenant-context.service.ts:1
- All queries are scoped to the current tenant via tenantId from JWT
- Database-level RLS provides defense-in-depth

## Input Validation

### Global Configuration
- [VERIFY:AE-SM-003] Global ValidationPipe with whitelist + forbidNonWhitelisted -> Implementation: apps/api/src/main.ts:2
- All request bodies are validated against DTO classes
- Unknown properties are stripped (whitelist) and rejected (forbidNonWhitelisted)
- class-transformer enabled for automatic type conversion

### State Machine Validation
- All status transitions are validated against allowed transition maps
- Invalid transitions return 400 Bad Request with descriptive error message
- The validateTransition utility from @analytics-engine/shared enforces rules

## Database Security

- Row-Level Security policies on all tenant-scoped tables
- RLS policies check `current_setting('app.tenant_id', true)` against row's tenant_id
- No $executeRawUnsafe usage — only $executeRaw with Prisma.sql tagged templates
- Parameterized queries via Prisma prevent SQL injection

## Secrets Management

- JWT_SECRET: Required environment variable, no fallback
- CORS_ORIGIN: Required environment variable, no fallback
- DATABASE_URL: Required environment variable for Prisma
- No hardcoded secret fallbacks anywhere in the codebase
