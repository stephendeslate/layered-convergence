# Security Model

## Overview

The Escrow Marketplace implements defense-in-depth security with multiple layers: transport security, authentication, authorization, input validation, and database-level isolation.

## Authentication

### [VERIFY:SM-001] CORS Configuration
Cross-Origin Resource Sharing must be configured with an explicit origin from the CORS_ORIGIN environment variable. The application must fail fast (throw Error) if CORS_ORIGIN is not set -- no fallback to a default value.

**Traced to**: `backend/src/main.ts`

### [VERIFY:SM-002] Cookie Security
Authentication tokens must be stored in httpOnly cookies with secure flag in production and sameSite=lax policy. Cookie parsing must be enabled at the application level.

**Traced to**: `backend/src/main.ts`

### [VERIFY:SM-003] JWT Authentication Guard
All protected endpoints must use JWT authentication guard. The JWT strategy must extract tokens from both Authorization header (Bearer scheme) and httpOnly cookies.

**Traced to**: `backend/src/main.ts`, `backend/src/auth/auth.controller.ts`

## Authorization

### [VERIFY:SM-004] Row Level Security Context
Every database query must execute within an RLS context that restricts data access to the authenticated user. The RLS context is set via `$executeRaw` with Prisma.sql tagged templates to prevent SQL injection.

**Traced to**: `backend/src/prisma/prisma.service.ts`

### [VERIFY:SM-005] Password Security
User passwords must be hashed using bcrypt with a salt factor of 12. Password comparison must use bcrypt.compare for timing-safe comparison. Raw passwords must never be stored or logged.

**Traced to**: `backend/src/auth/auth.service.ts`

### [VERIFY:SM-006] Role-Based Access Control
A roles guard must enforce endpoint-level access control. The guard must validate that the authenticated user's role matches the required role(s) for the endpoint.

**Traced to**: `backend/src/common/roles.guard.ts`

## Input Validation

- All DTOs validated via class-validator decorators
- ValidationPipe strips unknown properties (`whitelist: true`)
- Role field restricted to `['BUYER', 'SELLER']` via `@IsIn`
- No `as any` type assertions in production code
- No `console.log` in production code

## Database Security

- PostgreSQL 16 Row Level Security with FORCE
- RLS policies on: users, transactions, disputes, payouts
- `$executeRaw` with tagged templates only (never `$executeRawUnsafe`)
- All foreign keys enforced at database level

## Transport Security

- HTTPS enforced in production via reverse proxy
- CORS restricted to configured origin
- httpOnly cookies prevent XSS token theft
- sameSite=lax prevents CSRF attacks
