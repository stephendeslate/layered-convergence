# API Specification

## Overview

REST API built with NestJS ^11.0.0. All endpoints require JWT authentication
except health check, login, and registration. Rate limiting is applied globally
and more strictly on auth endpoints.

## Auth Endpoints

### POST /auth/register
- Rate limited to 5 requests per 60 seconds
- Body: RegisterDto with email, password, name, role, tenantId
- Role restricted to ALLOWED_REGISTRATION_ROLES (MANAGER, SELLER, BUYER)
- Returns: user profile (id, email, name, role)

### POST /auth/login
- Rate limited to 5 requests per 60 seconds
- Body: LoginDto with email, password, tenantId
- Returns: { access_token: string }

### GET /auth/profile
- Requires JWT Bearer token
- Returns: user profile without password

### GET /auth/health
- No authentication required
- Returns: { status: 'ok' }

## Listing Endpoints

### GET /listings
- Requires JWT, returns paginated active listings for tenant
- Query params: page, pageSize (capped at MAX_PAGE_SIZE=100)

### GET /listings/:id
- Requires JWT, returns single listing by id within tenant

### POST /listings
- Requires JWT, role must be SELLER or MANAGER
- Body: CreateListingDto with title, description, price
- Generates URL-safe slug via slugify() from shared package

### PATCH /listings/:id
- Requires JWT, only listing owner or MANAGER can update
- Body: UpdateListingDto with optional title, description, price, status

## Transaction Endpoints

### GET /transactions
- Requires JWT, returns paginated transactions where user is buyer or seller

### POST /transactions
- Requires JWT, creates transaction with escrow account
- Body: CreateTransactionDto with listingId

### PATCH /transactions/:id/status
- Requires JWT, validates state machine transitions
- Body: UpdateTransactionStatusDto with status

## Validation

All DTOs use class-validator decorators with @MaxLength on every string field.
See [security.md](./security.md) for input validation details and
[auth.md](./auth.md) for authentication flow.

## Cross-References

- Authentication: [auth.md](./auth.md)
- Security: [security.md](./security.md)
- Database: [database.md](./database.md)

## Verification Tags

<!-- VERIFY: EM-API-001 — JWT Bearer authentication on protected routes -->
<!-- VERIFY: EM-API-002 — Pagination with DEFAULT_PAGE_SIZE and MAX_PAGE_SIZE -->
<!-- VERIFY: EM-API-003 — Role-based access control on listing creation -->
<!-- VERIFY: EM-API-004 — Transaction state machine transitions -->
<!-- VERIFY: EM-API-005 — Health check endpoint -->
<!-- VERIFY: EM-API-006 — DTO validation on all input -->
<!-- VERIFY: EM-API-007 — Whitelist validation pipe (strip unknown fields) -->
<!-- VERIFY: EM-API-008 — Listing owner or manager authorization -->
<!-- VERIFY: EM-API-009 — URL-safe slug generation for listings -->
<!-- VERIFY: EM-API-010 — Delete listing with tenant/owner validation -->
<!-- VERIFY: EM-API-011 — Transaction lookup with tenant/participant validation -->
<!-- VERIFY: EM-API-012 — Transaction cancellation with tenant/participant validation -->
