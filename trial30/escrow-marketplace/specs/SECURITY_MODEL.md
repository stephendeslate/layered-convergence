# Security Model — Escrow Marketplace

## Overview
Security is critical for a financial escrow platform. This document covers
authentication, authorization, data protection, and code safety constraints.
See SYSTEM_ARCHITECTURE.md for architecture and API_CONTRACT.md for endpoints.

## Password Security
<!-- VERIFY:EM-BCRYPT-SALT — bcrypt.hash with salt 12 -->
All passwords are hashed using bcrypt with 12 salt rounds before storage.
Plain-text passwords are never stored or logged.

## Role-Based Access
<!-- VERIFY:EM-ADMIN-EXCLUDED — @IsIn excludes ADMIN -->
The ADMIN role cannot be self-assigned during registration. The RegisterDto
uses @IsIn(['BUYER', 'SELLER', 'ARBITER']) to restrict valid roles.
Only existing admins can promote users to ADMIN role.

## Row Level Security
<!-- VERIFY:EM-RLS-ENFORCEMENT — ENABLE + FORCE RLS in migration SQL -->
All 5 tables (users, transactions, disputes, payouts, webhooks) have
Row Level Security both ENABLED and FORCED in the migration SQL.
FORCE ensures RLS applies even to table owners, preventing bypass.

## SQL Injection Prevention
<!-- VERIFY:EM-NO-RAW-UNSAFE — Zero $executeRawUnsafe -->
The codebase contains zero uses of $executeRawUnsafe. All raw SQL
operations use $executeRaw or $queryRaw with Prisma.sql tagged
templates for automatic parameterization.

## Secret Management
<!-- VERIFY:EM-SECRET-MANAGEMENT — Environment-based secrets -->
JWT_SECRET is loaded from process.env with no fallback value.
The application throws an error at startup if JWT_SECRET is missing.
CORS_ORIGIN is also required, with no default value in app.module.ts.

## Type Safety
<!-- VERIFY:EM-NO-AS-ANY — Zero as any in codebase -->
The codebase contains zero uses of `as any` type assertions.
All types are properly defined with TypeScript strict mode enabled.

## Production Logging
<!-- VERIFY:EM-NO-CONSOLE-LOG — Zero console.log in production -->
Production code contains zero console.log statements. The seed
script uses process.stderr.write for error output instead of console.

## JWT Configuration
JWTs expire after 24 hours. The token payload includes user ID (sub),
email, and role. Token signing uses the HS256 algorithm by default.

## Input Validation
All API inputs are validated with class-validator decorators through
the global ValidationPipe. The pipe is configured with whitelist: true
and forbidNonWhitelisted: true to strip and reject unknown properties.

## State Machine Security
Transaction and dispute status transitions are enforced server-side.
The VALID_TRANSITIONS map ensures only permitted state changes occur.
Attempting an invalid transition returns a 400 BadRequestException.

## findFirst Justification
Every findFirst call has an inline comment explaining why findUnique
or findFirstOrThrow was not used. Common justifications include:
- State machine validation requiring null checks before transitions
- Post-raw-SQL fetches where raw update bypasses Prisma return types
- Multi-role login scoping for future composite lookup extensibility
