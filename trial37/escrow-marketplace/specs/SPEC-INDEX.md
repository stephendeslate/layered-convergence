# Specification Index

## Overview

This document serves as the central index for all specifications in the
Escrow Marketplace project (Trial 37, Layer 6: Security).

## Specifications

| File | Description | VERIFY Prefix |
|------|-------------|---------------|
| [system-architecture.md](./system-architecture.md) | Overall architecture, data flow, multi-tenancy | EM-ARCH-* |
| [api.md](./api.md) | REST API endpoints, request/response formats | EM-API-* |
| [auth.md](./auth.md) | Authentication, authorization, JWT, bcrypt | EM-AUTH-* |
| [database.md](./database.md) | Prisma schema, RLS, Decimal fields | EM-DB-* |
| [frontend.md](./frontend.md) | Next.js routes, Server Actions, components | EM-FE-* |
| [infrastructure.md](./infrastructure.md) | Docker, CI/CD, environment config | EM-INFRA-* |
| [testing.md](./testing.md) | Test categories, coverage, tooling | EM-TEST-* |
| [security.md](./security.md) | Threat model, security controls, audit | EM-SEC-* |

## VERIFY Tag Summary

### EM-ARCH (System Architecture)
- EM-ARCH-001: Turborepo monorepo structure
- EM-ARCH-002: Multi-tenant RLS enforcement
- EM-ARCH-003: Fail-fast env validation
- EM-ARCH-004: Decimal(12,2) for all money fields
- EM-ARCH-005: Shared package types and utilities
- EM-ARCH-006: Environment variable fail-fast validation

### EM-API (API)
- EM-API-001: JWT Bearer authentication on protected routes
- EM-API-002: Pagination with DEFAULT_PAGE_SIZE and MAX_PAGE_SIZE
- EM-API-003: Role-based access control on listing creation
- EM-API-004: Transaction state machine transitions
- EM-API-005: Health check endpoint
- EM-API-006: DTO validation on all input
- EM-API-007: Whitelist validation pipe (strip unknown fields)
- EM-API-008: Listing owner or manager authorization
- EM-API-009: URL-safe slug generation for listings
- EM-API-010: Delete listing with tenant/owner validation
- EM-API-011: Transaction lookup with tenant/participant validation
- EM-API-012: Transaction cancellation with tenant/participant validation

### EM-AUTH (Authentication)
- EM-AUTH-001: bcrypt hashing with 12 salt rounds
- EM-AUTH-002: JWT token generation with correct payload
- EM-AUTH-003: Registration restricted to allowed roles
- EM-AUTH-004: JwtAuthGuard on protected routes
- EM-AUTH-005: Password length validation (8-128)
- EM-AUTH-006: Email uniqueness within tenant
- EM-AUTH-007: JWT payload contains sub, email, role, tenantId

### EM-DB (Database)
- EM-DB-001: All money fields Decimal(12,2)
- EM-DB-002: RLS enabled and forced on all tables
- EM-DB-003: All models use @@map
- EM-DB-004: All enums use @@map with individual @map on values
- EM-DB-005: UUID primary keys on all models
- EM-DB-006: Tenant FK on all domain models
- EM-DB-007: Email unique per tenant constraint
- EM-DB-008: EscrowAccount unique transactionId

### EM-FE (Frontend)
- EM-FE-001: Server Actions with 'use server' directive
- EM-FE-002: response.ok check on all fetches
- EM-FE-003: Loading states with role="status" aria-busy="true"
- EM-FE-004: Error states with role="alert" and focus management
- EM-FE-005: cn() utility on all UI components
- EM-FE-006: Zero dangerouslySetInnerHTML
- EM-FE-007: No raw select elements in pages
- EM-FE-008: Navigation landmark with aria-label
- EM-FE-009: Text truncation with configurable suffix

### EM-INFRA (Infrastructure)
- EM-INFRA-001: 3-stage Dockerfile with node:20-alpine
- EM-INFRA-002: USER node in production stage
- EM-INFRA-003: HEALTHCHECK in Dockerfile
- EM-INFRA-004: pnpm audit in CI pipeline
- EM-INFRA-005: turbo.json copied in deps stage

### EM-TEST (Testing)
- EM-TEST-001: Unit tests for all three services
- EM-TEST-002: Integration tests with real AppModule and supertest
- EM-TEST-003: Security test for Helmet headers
- EM-TEST-004: jest-axe on 8 UI components
- EM-TEST-005: Keyboard navigation tests
- EM-TEST-006: Security input validation tests
- EM-TEST-007: Transaction state machine tests

### EM-SEC (Security)
- EM-SEC-001: Helmet with CSP directives
- EM-SEC-002: Rate limiting (global 100/min, auth 5/min)
- EM-SEC-003: CORS restricted to configured origin
- EM-SEC-004: Input validation with MaxLength on all DTO strings
- EM-SEC-005: JWT strategy with no secret fallback
- EM-SEC-006: XSS prevention (sanitizeInput, no dangerouslySetInnerHTML)

## Total VERIFY Tags: 60

## Cross-References

- system-architecture.md references: api.md, database.md, auth.md, security.md
- api.md references: auth.md, security.md, database.md
- auth.md references: api.md, security.md, database.md
- database.md references: api.md, security.md, auth.md
- frontend.md references: api.md, system-architecture.md, testing.md
- infrastructure.md references: security.md, database.md, testing.md
- testing.md references: frontend.md, api.md, security.md
- security.md references: auth.md, api.md, infrastructure.md, testing.md

## T37 Variation

New shared utilities added for this trial:
- `slugify(input: string): string` — URL-safe slug generation, used by listings service
- `truncateText(text: string, maxLength: number, suffix?: string): string` — text
  truncation with configurable suffix, used by frontend pages

## T36 Fixes Applied

8 failure modes addressed (FM#76–FM#83).
