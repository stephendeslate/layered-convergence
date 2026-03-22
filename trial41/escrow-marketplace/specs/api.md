# Escrow Marketplace — API Specification

## Overview

RESTful API with full CRUD on all domain entities.
All DTOs validated with class-validator decorators.

## Endpoint Summary

### Auth
- POST /auth/register — Create account (public, throttled)
- POST /auth/login — Authenticate (public, throttled)

### Listings (authenticated)
<!-- VERIFY:EM-LISTING-01 listing service with Prisma select optimization -->
<!-- VERIFY:EM-LISTING-02 listing controller with full CRUD and Cache-Control -->
- POST /listings — Create listing
- GET /listings — List all (paginated, Cache-Control)
- GET /listings/:id — Get by ID
- PUT /listings/:id — Update listing
- DELETE /listings/:id — Delete listing

### Transactions (authenticated)
<!-- VERIFY:EM-TXN-01 transaction service with N+1 prevention -->
<!-- VERIFY:EM-TXN-02 transaction controller with full CRUD -->
- POST /transactions — Create transaction
- GET /transactions — List all (paginated, Cache-Control)
- GET /transactions/:id — Get by ID
- PUT /transactions/:id — Update transaction
- DELETE /transactions/:id — Delete transaction

### Escrows (authenticated)
<!-- VERIFY:EM-ESCROW-01 escrow service with Decimal money handling -->
<!-- VERIFY:EM-ESCROW-02 escrow controller with full CRUD -->
- POST /escrows — Create escrow
- GET /escrows — List all (paginated, Cache-Control)
- GET /escrows/:id — Get by ID
- PUT /escrows/:id — Update escrow
- DELETE /escrows/:id — Delete escrow

### Disputes (authenticated)
<!-- VERIFY:EM-DISPUTE-01 dispute service with tenant scoping -->
<!-- VERIFY:EM-DISPUTE-02 dispute controller with full CRUD -->
- POST /disputes — Create dispute
- GET /disputes — List all (paginated, Cache-Control)
- GET /disputes/:id — Get by ID
- PUT /disputes/:id — Update dispute
- DELETE /disputes/:id — Delete dispute

## DTO Validation

<!-- VERIFY:EM-SEC-05 registration DTO with role validation -->

All string fields have @IsString() + @MaxLength().
All UUID fields have @MaxLength(36).
Status enum fields have @IsIn() with allowed values.
ValidationPipe configured with whitelist + forbidNonWhitelisted + transform.

## Pagination

All list endpoints support page and pageSize query parameters.
Page size is clamped to MAX_PAGE_SIZE (not rejected).

## Response Format

Paginated responses include meta: { page, pageSize, total, totalPages }.
Individual entity responses return the entity directly.

## Test Coverage

<!-- VERIFY:EM-TEST-01 auth integration tests with supertest -->
<!-- VERIFY:EM-TEST-02 auth service unit tests -->
<!-- VERIFY:EM-TEST-03 listing service unit tests -->
<!-- VERIFY:EM-TEST-04 escrow service unit tests -->
<!-- VERIFY:EM-A11Y-01 accessibility tests with jest-axe -->
<!-- VERIFY:EM-A11Y-02 keyboard navigation tests with userEvent -->

Test files cover:
- 3+ unit tests (auth service, listing service, escrow service)
- 2 integration tests with supertest (auth, security)
- Monitoring integration tests with supertest
- Performance tests
- Accessibility tests with jest-axe
- Keyboard navigation tests with userEvent

## Cross-References

- See [data-model.md](./data-model.md) for entity field definitions
- See [security.md](./security.md) for validation and auth guards
