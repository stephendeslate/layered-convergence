# Security Model — Escrow Marketplace

## Overview
The Escrow Marketplace implements defense-in-depth security with authentication,
authorization, and data isolation controls. See SYSTEM_ARCHITECTURE.md for
infrastructure security and API_CONTRACT.md for endpoint access rules.

## Password Security
<!-- VERIFY:EM-BCRYPT-SALT — bcrypt.hash with salt 12 -->
Passwords are hashed using bcrypt with 12 salt rounds. This provides strong
one-way hashing resistant to brute-force attacks.

## Role-Based Access
<!-- VERIFY:EM-ADMIN-EXCLUDED — @IsIn excludes ADMIN -->
The registration DTO uses @IsIn(['BUYER', 'SELLER', 'ARBITER']) to prevent
self-registration as ADMIN. Admin accounts must be created through
administrative channels.

## Row Level Security
<!-- VERIFY:EM-RLS-ENFORCEMENT — ENABLE + FORCE RLS in migration SQL -->
PostgreSQL Row Level Security is enforced with both ENABLE and FORCE statements
on all tables: users, transactions, disputes, payouts, webhooks.

## SQL Injection Prevention
<!-- VERIFY:EM-NO-RAW-UNSAFE — Zero $executeRawUnsafe -->
The codebase uses exclusively Prisma.sql tagged templates for raw SQL. The
$executeRawUnsafe method is never used anywhere in the codebase.

## Secret Management
<!-- VERIFY:EM-SECRET-MANAGEMENT — Environment-based secrets -->
JWT_SECRET is loaded from process.env with no fallback value. The application
fails fast at startup if the secret is missing.

## Type Safety
<!-- VERIFY:EM-NO-AS-ANY — Zero as any in codebase -->
The codebase contains zero uses of `as any` type assertions. All types are
properly defined and enforced by TypeScript.

## Logging Policy
<!-- VERIFY:EM-NO-CONSOLE-LOG — Zero console.log in production -->
Production code contains zero console.log statements. All output uses
structured logging or process.stderr.write for seed scripts.

## Data Protection
See DATA_MODEL.md for field-level encryption requirements and
TESTING_STRATEGY.md for security test coverage.
