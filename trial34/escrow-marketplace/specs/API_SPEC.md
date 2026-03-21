# API Specification — Escrow Marketplace

## Overview

The REST API is built with NestJS 11 and provides endpoints for authentication,
listing management, and transaction processing. All domain endpoints require
JWT authentication. See AUTH_SPEC.md for auth and REQUIREMENTS.md for context.

## Environment Fail-Fast

The application validates required environment variables at startup.

### JWT_SECRET
Required for JWT token signing and verification.
- VERIFY: EM-SEC-FAILFAST-001 — Fail-fast on missing JWT_SECRET in main.ts

### CORS_ORIGIN
Required for CORS configuration.
- VERIFY: EM-SEC-FAILFAST-002 — Fail-fast on missing CORS_ORIGIN in main.ts
- VERIFY: EM-SEC-CORS-001 — CORS enabled from CORS_ORIGIN environment variable

## Listing Endpoints

### GET /listings
Returns paginated list of listings for the tenant.

### GET /listings/:id
Returns a single listing. Uses findFirst with tenant scope for RLS.

### POST /listings
Creates a new listing with slugified title.

## Transaction Endpoints

### GET /transactions
Returns all transactions for the tenant with listing data.

### POST /transactions
Creates a new transaction for a listing.

### PATCH /transactions/:id/status
Updates transaction status with state machine validation.
See STATE_MACHINES.md for transition rules.

## Frontend Display

### Text Truncation
- VERIFY: EM-CQ-TRUNC-002 — truncate used in frontend nav component
- VERIFY: EM-CQ-TRUNC-003 — truncate used in listings page

## Cross-References
- See AUTH_SPEC.md for authentication endpoint details
- See STATE_MACHINES.md for transaction status transition rules
- See SECURITY.md for environment variable validation
- See DATA_MODEL.md for entity schemas
