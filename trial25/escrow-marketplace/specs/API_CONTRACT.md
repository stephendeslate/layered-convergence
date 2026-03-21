# API Contract — Escrow Marketplace

## Overview

The Escrow Marketplace exposes a RESTful API built with NestJS 11. All endpoints except auth require JWT bearer token authentication. User context is derived from the JWT payload.

See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for authentication flow and [DATA_MODEL.md](./DATA_MODEL.md) for entity schemas.

## Authentication Endpoints

### POST /auth/register
- Request: `{ email, password, name, role }`
- Response: `{ accessToken: string }`
- Validation: role must be BUYER or SELLER (not ADMIN)

### POST /auth/login
- Request: `{ email, password }`
- Response: `{ accessToken: string }`

## Transaction Endpoints

### GET /transactions
- Auth: JWT required
- Returns transactions where user is buyer or seller

### POST /transactions
- Request: `{ sellerId, amount, description?, currency? }`
- Buyer ID from JWT

### GET /transactions/:id
### PATCH /transactions/:id/transition
- Request: `{ status }` (must be valid transition)

## Dispute Endpoints

### GET /disputes
### POST /disputes
- Request: `{ transactionId, reason }`
### PATCH /disputes/:id/transition
- Request: `{ status, resolution? }`

## Payout Endpoints

### GET /payouts
### POST /payouts
- Request: `{ transactionId, amount }`
### PATCH /payouts/:id/transition
- Request: `{ status, failureReason? }`

## Verification Tags

[VERIFY:API-001] Auth endpoints handle registration and login.
> Implementation: `backend/src/auth/auth.controller.ts`

[VERIFY:API-002] Transaction endpoints with state machine transitions.
> Implementation: `backend/src/transaction/transaction.service.ts`

[VERIFY:API-003] Dispute endpoints with state machine transitions.
> Implementation: `backend/src/dispute/dispute.service.ts`

[VERIFY:API-004] Payout endpoints with state machine transitions.
> Implementation: `backend/src/payout/payout.service.ts`

[VERIFY:API-005] Webhook CRUD service.
> Implementation: `backend/src/webhook/webhook.service.ts`

[VERIFY:API-006] Server Actions check response.ok before processing API responses.
> Implementation: `frontend/lib/actions.ts`

[VERIFY:API-007] All protected endpoints use JwtAuthGuard decorator.
> Implementation: `backend/src/transaction/transaction.controller.ts`

[VERIFY:API-008] Register DTO validates role with @IsIn excluding ADMIN.
> Implementation: `backend/src/auth/dto/register.dto.ts`

## Error Codes

| Code | Meaning |
|------|---------|
| 400  | Bad Request — validation failure or invalid state transition |
| 401  | Unauthorized — missing or invalid JWT |
| 404  | Not Found — entity does not exist or access denied |
| 409  | Conflict — duplicate email registration |

## Cross-References

- See [PRODUCT_VISION.md](./PRODUCT_VISION.md) for feature context
- See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for API test coverage
