# API Specification

## Overview

The Escrow Marketplace API is a NestJS 11 REST service providing CRUD operations
for Listings, Transactions, Escrow Accounts, and Disputes. All domain endpoints
require JWT authentication (see [auth.md](./auth.md) for details).

## Base URL

`http://localhost:3001` (configurable via PORT env var)

## Endpoints

### Auth Endpoints (public)
- `POST /auth/register` — Register a new user
- `POST /auth/login` — Login and receive JWT

### Listings (JWT required)
- `POST /listings` — Create listing
- `GET /listings` — List all (paginated, Cache-Control: public)
- `GET /listings/:id` — Get by ID (includes seller, transactions)
- `PUT /listings/:id` — Update listing
- `DELETE /listings/:id` — Delete listing

### Transactions (JWT required)
- `POST /transactions` — Create transaction (atomic escrow creation)
- `GET /transactions` — List all (paginated, Cache-Control: private)
- `GET /transactions/:id` — Get by ID (includes relations)
- `PUT /transactions/:id/status` — Update status (state machine)
- `DELETE /transactions/:id` — Delete (cascades escrow, disputes)

### Escrows (JWT required)
- `POST /escrows` — Create escrow account
- `GET /escrows` — List all (paginated)
- `GET /escrows/:id` — Get by ID
- `PUT /escrows/:id` — Update escrow
- `DELETE /escrows/:id` — Delete escrow

### Disputes (JWT required)
- `POST /disputes` — Create dispute
- `GET /disputes` — List all (paginated)
- `GET /disputes/:id` — Get by ID
- `PUT /disputes/:id` — Update dispute
- `DELETE /disputes/:id` — Delete dispute

### Health & Monitoring (public, see [monitoring.md](./monitoring.md))
- `GET /health` — Health check
- `GET /health/ready` — Readiness check (DB)
- `GET /health/metrics` — Operational metrics

## Pagination

All list endpoints support `page` and `pageSize` query parameters.
- VERIFY: EM-API-001 — All list endpoints enforce MAX_PAGE_SIZE via normalizePageParams
- VERIFY: EM-API-002 — Pagination with DEFAULT_PAGE_SIZE and MAX_PAGE_SIZE

## DTOs

- VERIFY: EM-API-003 — Listing DTO with string and UUID validation
- VERIFY: EM-API-004 — Listings service with CRUD operations
- VERIFY: EM-API-005 — Listings controller with full CRUD
- VERIFY: EM-API-006 — Transaction DTO with UUID MaxLength validation
- VERIFY: EM-API-007 — Transaction status update DTO
- VERIFY: EM-API-008 — Transaction service with state machine
- VERIFY: EM-API-009 — URL-safe slug generation for listings
- VERIFY: EM-API-010 — Transactions controller with full CRUD
- VERIFY: EM-API-011 — Escrows controller with full CRUD
- VERIFY: EM-API-012 — Escrows service with CRUD operations
- VERIFY: EM-API-013 — Disputes controller with full CRUD
- VERIFY: EM-API-014 — Disputes service with CRUD operations

## Performance

- VERIFY: EM-PERF-001 — withTimeout utility for async timeout guard
- VERIFY: EM-PERF-002 — normalizePageParams utility for pagination safety
- VERIFY: EM-PERF-003 — ResponseTimeInterceptor as APP_INTERCEPTOR
- VERIFY: EM-PERF-004 — Response time measurement with performance.now()
- VERIFY: EM-PERF-005 — withTimeout wrapping bcrypt hash
- VERIFY: EM-PERF-006 — Cache-Control headers for list endpoints
- VERIFY: EM-PERF-007 — Cache-Control private for transaction endpoints

## State Machine

Transaction status transitions are defined in shared package.
Only valid transitions are allowed (BadRequestException otherwise).

## Response Format

All list responses use PaginatedResult<T> from shared package:
`{ data: T[], total, page, pageSize, totalPages }`
