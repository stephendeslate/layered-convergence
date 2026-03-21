# Escrow Marketplace — API Specification

## Overview

REST API endpoints for the Escrow Marketplace platform. All endpoints except
auth use JWT Bearer tokens. See AUTH_SPEC.md for authentication details
and DATA_MODEL.md for entity schemas.

## Base URL

`/` — all routes are relative to the API root.

## Authentication Endpoints

### POST /auth/register
- VERIFY: EM-API-REG-001 — Registration endpoint with email, password, role, tenantId
- Request body: { email: string, password: string (min 8), role: string, tenantId: string }
- Role validation: @IsIn excludes ADMIN (only BUYER, SELLER, ARBITER allowed)
- Response 201: { id, email, role }
- Response 400: validation error or invalid role
- Cross-references: AUTH_SPEC.md (role restrictions)

### POST /auth/login
- VERIFY: EM-API-LOGIN-001 — Login endpoint returning JWT access token
- Request body: { email: string, password: string }
- Response 200: { accessToken: string }
- Response 401: invalid credentials
- Cross-references: AUTH_SPEC.md (JWT configuration)

## Escrow Transaction Endpoints

### GET /escrow
- VERIFY: EM-API-ESC-LIST-001 — List escrow transactions with pagination
- Query params: page (default 1), pageSize (default 20, max 100)
- Response 200: PaginatedResult<EscrowTransaction>
- Includes disputes in response
- Cross-references: DATA_MODEL.md (EscrowTransaction), REQUIREMENTS.md (FR-2)

### GET /escrow/:id
- VERIFY: EM-API-ESC-GET-001 — Get single transaction with buyer, seller, disputes
- Response 200: EscrowTransaction with relations
- Response 404: not found
- Uses findFirst scoped by tenantId for RLS alignment

### PATCH /escrow/:id/transition
- VERIFY: EM-API-ESC-TRANS-001 — Transition escrow status
- Request body: { status: EscrowStatus }
- Response 200: updated transaction
- Response 400: invalid state transition
- Cross-references: STATE_MACHINES.md (EscrowStatus transitions)

## Dispute Endpoints

### GET /disputes/transaction/:txId
- VERIFY: EM-API-DISP-LIST-001 — List disputes for a transaction
- Response 200: Dispute[]
- Cross-references: DATA_MODEL.md (Dispute)

### PATCH /disputes/:id/transition
- VERIFY: EM-API-DISP-TRANS-001 — Transition dispute status
- Request body: { status: DisputeStatus }
- Response 200: updated dispute
- Response 400: invalid state transition
- Cross-references: STATE_MACHINES.md (DisputeStatus transitions)

## Cross-References

- AUTH_SPEC.md: JWT configuration and role-based access
- DATA_MODEL.md: Entity schemas and relationships
- STATE_MACHINES.md: Valid status transitions
- TESTING_STRATEGY.md: Integration test coverage for endpoints
