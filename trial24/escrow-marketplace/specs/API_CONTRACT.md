# API Contract — Escrow Marketplace

## Overview

The backend exposes a RESTful API with JSON request/response bodies. All endpoints except
auth routes require JWT Bearer token authentication. Input validation is enforced via
class-validator decorators with whitelist mode.

**Cross-references:** [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md), [SECURITY_MODEL.md](SECURITY_MODEL.md), [DATA_MODEL.md](DATA_MODEL.md)

## Authentication Endpoints

### POST /auth/register
Creates a new user account and returns a JWT.

**Request:**
```json
{ "email": "string", "password": "string (min 8)", "name": "string", "role": "BUYER | SELLER" }
```

**Response (201):**
```json
{ "access_token": "string" }
```

[VERIFY:AC-001] Auth endpoints MUST support registration and login with JWT token response.
> Implementation: `backend/src/auth/auth.controller.ts:6`

### POST /auth/login
Authenticates a user and returns a JWT.

**Request:**
```json
{ "email": "string", "password": "string" }
```

**Response (200):**
```json
{ "access_token": "string" }
```

## Transaction Endpoints

### POST /transactions
Creates a new escrow transaction. Requires BUYER role.

### GET /transactions
Lists all transactions for the authenticated user (buyer or seller).

### GET /transactions/:id
Returns a single transaction with disputes and payouts.

### PATCH /transactions/:id/status
Updates transaction status with state machine validation.

[VERIFY:AC-002] Transaction status updates MUST validate state machine transitions before persisting.
> Implementation: `backend/src/transaction/transaction.service.ts:15`

[VERIFY:AC-003] The UpdateTransactionStatusDto MUST restrict status values to valid TransactionStatus enum values.
> Implementation: `backend/src/transaction/dto/update-status.dto.ts:5`

## Dispute Endpoints

### POST /disputes
Creates a dispute for a transaction in a disputable state (FUNDED, SHIPPED, or DELIVERED).

### GET /disputes
Lists all disputes filed by the authenticated user.

### GET /disputes/:id
Returns a single dispute with transaction details.

### PATCH /disputes/:id/resolve
Resolves an open dispute.

[VERIFY:AC-004] Dispute creation MUST validate that the transaction is in a disputable state.
> Implementation: `backend/src/dispute/dispute.service.ts:9`

## Payout Endpoints

### POST /payouts
Creates a payout request for a completed transaction. Requires SELLER role.

### GET /payouts
Lists all payouts for the authenticated seller.

### GET /payouts/:id
Returns a single payout with transaction details.

### PATCH /payouts/:id/process
Transitions payout from PENDING to PROCESSING.

### PATCH /payouts/:id/complete
Transitions payout from PROCESSING to COMPLETED.

[VERIFY:AC-005] Payout state machine MUST enforce valid transitions: PENDING -> PROCESSING -> COMPLETED | FAILED.
> Implementation: `backend/src/payout/payout.service.ts:10`

[VERIFY:AC-006] Payout endpoints MUST support CRUD operations and status transitions.
> Implementation: `backend/src/payout/payout.controller.ts:10`

## Webhook Endpoints

### POST /webhooks
Creates a webhook subscription for transaction events.

### GET /webhooks
Lists all webhooks for the authenticated user.

### GET /webhooks/:id
Returns a single webhook.

### DELETE /webhooks/:id
Deletes a webhook subscription.

[VERIFY:AC-007] Webhook service MUST support CRUD operations for event subscriptions.
> Implementation: `backend/src/webhook/webhook.service.ts:7`

[VERIFY:AC-008] Webhook endpoints MUST be protected by JWT authentication.
> Implementation: `backend/src/webhook/webhook.controller.ts:8`

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request — validation failure or invalid state transition |
| 401 | Unauthorized — missing or invalid JWT |
| 403 | Forbidden — role-based access denied |
| 404 | Not Found — resource does not exist or not accessible |
| 409 | Conflict — duplicate email on registration |

## Input Validation

All DTOs use class-validator decorators. The global ValidationPipe is configured with:
- `whitelist: true` — strips unknown properties
- `forbidNonWhitelisted: true` — rejects requests with unknown properties
- `transform: true` — auto-transforms payloads to DTO instances
