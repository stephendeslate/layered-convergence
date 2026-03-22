# API Specification

## Overview

The API exposes RESTful endpoints for managing listings and transactions.
All domain endpoints require JWT authentication via JwtAuthGuard.
Pagination is enforced on all list endpoints using normalizePageParams.

## Pagination

All list endpoints accept page and pageSize query parameters. The normalizePageParams
utility from the shared package sanitizes these values: page minimum is 1,
pageSize minimum is 1 and maximum is MAX_PAGE_SIZE (100).

- VERIFY: EM-API-001 — All list endpoints enforce MAX_PAGE_SIZE via normalizePageParams
- VERIFY: EM-API-002 — Pagination uses DEFAULT_PAGE_SIZE and MAX_PAGE_SIZE constants

## Listings Endpoints

- POST /listings — Create a new listing with slug generation
- GET /listings — List all listings (paginated, tenant-scoped, optimized select)
- GET /listings/:id — Get listing with seller and transactions included
- PUT /listings/:id — Update listing fields (regenerates slug on title change)
- DELETE /listings/:id — Delete a listing

- VERIFY: EM-API-003 — Listing DTOs with @IsString, @MaxLength, @Min validation
- VERIFY: EM-API-004 — Listings service with full CRUD and slug generation
- VERIFY: EM-API-005 — Listings controller with all five CRUD endpoints

## Transactions Endpoints

- POST /transactions — Create transaction with atomic escrow account creation
- GET /transactions — List transactions (paginated, tenant-scoped, optimized select)
- GET /transactions/:id — Get transaction with all relations included
- PUT /transactions/:id/status — Update status via state machine
- DELETE /transactions/:id — Delete transaction and related records

- VERIFY: EM-API-006 — Transaction DTOs with UUID @MaxLength(36) validation
- VERIFY: EM-API-007 — Transaction status update DTO with @IsIn validation

## State Machine

Transaction status transitions follow TRANSACTION_STATUS_TRANSITIONS:
PENDING can transition to COMPLETED, DISPUTED, or FAILED.
DISPUTED can transition to COMPLETED or REFUNDED.
COMPLETED, REFUNDED, and FAILED are terminal states.

- VERIFY: EM-API-008 — Transaction service enforces state machine transitions

## Slug Generation

Listing titles are automatically converted to URL-safe slugs via the slugify utility.
Slugs are regenerated when titles are updated.

- VERIFY: EM-API-009 — URL-safe slug generation for listings

## Cross-References

- See auth.md for JWT authentication and role management
- See security.md for DTO validation and input sanitization
- See performance.md for query optimization and caching headers

- VERIFY: EM-API-010 — Transactions controller with full CRUD endpoints
