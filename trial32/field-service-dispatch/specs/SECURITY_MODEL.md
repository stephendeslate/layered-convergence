# Security Model — Field Service Dispatch

## Overview

Security is enforced at multiple layers: database (RLS), application (JWT + guards),
and input validation (class-validator DTOs). No hardcoded secrets or unsafe queries.

See also: [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md), [API_CONTRACT.md](API_CONTRACT.md)

## Row-Level Security

PostgreSQL Row-Level Security is enabled and forced on all company-scoped tables:
- users, customers, technicians, work_orders, routes, gps_events, invoices
- RLS policies use `current_setting('app.company_id')` to filter rows
- CompanyContextService sets the RLS variable using `Prisma.sql` tagged template

- [VERIFY:FD-SM-001] RLS ENABLE + FORCE on all company-scoped tables -> Implementation: apps/api/prisma/migrations/20240101000000_init/migration.sql:1

## JWT Authentication

- JWT tokens contain userId, email, role, and companyId
- JwtStrategy extracts and validates the payload
- JwtAuthGuard protects all endpoints except /auth/*
- JWT_SECRET is required at startup (fail-fast in main.ts)

- [VERIFY:FD-SM-002] JWT_SECRET fail-fast in main.ts -> Implementation: apps/api/src/main.ts:1
- [VERIFY:FD-SM-003] CORS_ORIGIN fail-fast in main.ts -> Implementation: apps/api/src/main.ts:2

## Password Security

- All passwords hashed with bcrypt
- Salt rounds set to 12 (constant, not configurable)
- Passwords never returned in API responses

- [VERIFY:FD-SM-004] bcrypt salt 12 for password hashing -> Implementation: apps/api/src/auth/auth.service.ts:3

## Role-Based Access

- Four roles: ADMIN, DISPATCHER, TECHNICIAN, MANAGER
- ADMIN role cannot be assigned during registration
- Registration rejects ADMIN via both DTO validation (@IsIn) and service-level check
- REGISTERABLE_ROLES constant from shared package enforces allowed roles

- [VERIFY:FD-SM-005] ADMIN role rejected at service level -> Implementation: apps/api/src/auth/auth.service.ts:4
- [VERIFY:FD-SM-006] @IsIn excludes ADMIN in RegisterDto -> Implementation: apps/api/src/auth/dto/register.dto.ts:1

## Input Validation

- Global ValidationPipe with whitelist and forbidNonWhitelisted
- DTOs use class-validator decorators
- All findFirst calls have justification comments

## Database Safety

- No $executeRawUnsafe usage anywhere
- $executeRaw uses Prisma.sql tagged template only
- No hardcoded secret fallbacks

- [VERIFY:FD-SM-007] CompanyContextService uses Prisma.sql tagged template -> Implementation: apps/api/src/company-context/company-context.service.ts:1
