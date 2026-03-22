# API Specification

## Overview

RESTful API built with NestJS ^11.0.0. All endpoints return JSON. Authentication
via JWT Bearer tokens. Input validated with class-validator DTOs.

## Base URL

`http://localhost:3001`

## Authentication Endpoints

### POST /auth/register
Register a new user. Rate limited to 5 requests per 60 seconds.
- Body: `{ email, password, name, role, tenantId }`
- Roles allowed: MANAGER, SELLER, BUYER
- Password: 8-128 characters
- Email: max 255 characters
- Name: max 100 characters

### POST /auth/login
Authenticate and receive JWT token. Rate limited to 5 requests per 60 seconds.
- Body: `{ email, password, tenantId }`
- Returns: `{ access_token }`

### GET /auth/profile
Get current user profile. Requires Bearer token.

## Listing Endpoints

### GET /listings
List all active listings for the tenant. Supports pagination.
- Query: `page`, `pageSize` (max 100)

### GET /listings/:id
Get a single listing by ID.

### POST /listings
Create a new listing. Requires SELLER or MANAGER role.
- Body: `{ title, description, price }`
- Title: max 100 characters
- Description: max 1000 characters
- Price: Decimal(12,2)

### PATCH /listings/:id
Update a listing. Owner or MANAGER only.

## Transaction Endpoints

### GET /transactions
List transactions for the current user.

### POST /transactions
Create a new transaction (initiates escrow).
- Body: `{ listingId }`

### PATCH /transactions/:id/status
Update transaction status. Follows state machine transitions.

## Health Check

### GET /health
Returns 200 with `{ status: 'ok' }`.

## Cross-References

- Auth details: [auth.md](./auth.md)
- Security controls: [security.md](./security.md)

## Verification Tags

<!-- VERIFY: EM-API-001 — JWT Bearer authentication on protected routes -->
<!-- VERIFY: EM-API-002 — Pagination with DEFAULT_PAGE_SIZE and MAX_PAGE_SIZE -->
<!-- VERIFY: EM-API-003 — Role-based access control on listing creation -->
<!-- VERIFY: EM-API-004 — Transaction state machine transitions -->
<!-- VERIFY: EM-API-005 — Health check endpoint -->
<!-- VERIFY: EM-API-006 — DTO validation on all input -->
<!-- VERIFY: EM-API-007 — Whitelist validation pipe (strip unknown fields) -->
<!-- VERIFY: EM-API-008 — Listing owner or manager authorization -->
