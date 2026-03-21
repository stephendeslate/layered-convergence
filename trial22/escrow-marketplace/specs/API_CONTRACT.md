# API Contract — Escrow Marketplace

## Overview

RESTful API served by NestJS 11 with JWT-based authentication. All endpoints
return JSON. Monetary values are serialized as strings to preserve Decimal(12,2)
precision.

See: [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) for backend module structure.
See: [DATA_MODEL.md](DATA_MODEL.md) for entity definitions and field types.

<!-- VERIFY:AC-001 — POST /auth/register with email, password, role -->
<!-- VERIFY:AC-002 — POST /auth/login returns JWT access token -->
<!-- VERIFY:AC-003 — POST /transactions creates a new escrow transaction -->
<!-- VERIFY:AC-004 — PATCH /transactions/:id/status transitions state machine -->
<!-- VERIFY:AC-005 — GET /transactions returns user's transactions -->
<!-- VERIFY:AC-006 — POST /disputes creates a dispute on a transaction -->
<!-- VERIFY:AC-007 — PATCH /disputes/:id/resolve resolves a dispute -->
<!-- VERIFY:AC-008 — GET /payouts returns user's payouts -->
<!-- VERIFY:AC-009 — POST /webhooks registers a webhook subscription -->
<!-- VERIFY:AC-010 — All protected routes require Authorization: Bearer <token> -->

## Base URL

```
http://localhost:3001/api
```

## Authentication Endpoints

### POST /auth/register
Creates a new user account. See [SECURITY_MODEL.md](SECURITY_MODEL.md) for password hashing details.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "role": "BUYER"
}
```
- `role` must be one of: `BUYER`, `SELLER` (validated with `@IsIn`)
- Password hashed with bcrypt salt 12

**Response (201):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "BUYER"
}
```

### POST /auth/login

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

## Transaction Endpoints

All transaction endpoints require `Authorization: Bearer <token>`.

### POST /transactions
Creates a new escrow transaction (BUYER only).
See [PRODUCT_VISION.md](PRODUCT_VISION.md) for escrow lifecycle context.

**Request Body:**
```json
{
  "sellerId": "uuid",
  "amount": "150.00",
  "description": "Vintage watch purchase"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "buyerId": "uuid",
  "sellerId": "uuid",
  "amount": "150.00",
  "description": "Vintage watch purchase",
  "status": "PENDING",
  "createdAt": "2026-03-21T00:00:00.000Z"
}
```

### GET /transactions
Returns transactions for the authenticated user (as buyer or seller).

**Response (200):**
```json
[
  {
    "id": "uuid",
    "buyerId": "uuid",
    "sellerId": "uuid",
    "amount": "150.00",
    "description": "...",
    "status": "FUNDED",
    "createdAt": "..."
  }
]
```

### GET /transactions/:id
Returns a single transaction. User must be buyer or seller.

### PATCH /transactions/:id/status
Transitions the transaction status. Valid transitions enforced by state machine.
See [TESTING_STRATEGY.md](TESTING_STRATEGY.md) for state transition test cases.

**Request Body:**
```json
{
  "status": "FUNDED"
}
```

**Valid Transitions:**
| Current    | Allowed Next States       |
|------------|---------------------------|
| PENDING    | FUNDED                    |
| FUNDED     | SHIPPED, DISPUTE          |
| SHIPPED    | DELIVERED, DISPUTE        |
| DELIVERED  | COMPLETED, DISPUTE        |
| COMPLETED  | (none — terminal)         |
| DISPUTE    | REFUNDED, FUNDED          |
| REFUNDED   | (none — terminal)         |

**Response (200):** Updated transaction object.

## Dispute Endpoints

### POST /disputes
Creates a dispute on a transaction. See [UI_SPECIFICATION.md](UI_SPECIFICATION.md) for dispute form UI.

**Request Body:**
```json
{
  "transactionId": "uuid",
  "reason": "Item not as described"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "transactionId": "uuid",
  "filedBy": "uuid",
  "reason": "Item not as described",
  "status": "OPEN",
  "createdAt": "..."
}
```

### GET /disputes
Returns disputes for the authenticated user's transactions.

### PATCH /disputes/:id/resolve

**Request Body:**
```json
{
  "resolution": "Refund issued to buyer",
  "outcome": "REFUNDED"
}
```

**Response (200):** Updated dispute with resolution.

## Payout Endpoints

### GET /payouts
Returns payouts for the authenticated user (seller).

**Response (200):**
```json
[
  {
    "id": "uuid",
    "transactionId": "uuid",
    "recipientId": "uuid",
    "amount": "150.00",
    "paidAt": "..."
  }
]
```

## Webhook Endpoints

### POST /webhooks
Registers a webhook for transaction events.

**Request Body:**
```json
{
  "transactionId": "uuid",
  "event": "status_changed",
  "payload": {}
}
```

### GET /webhooks
Returns webhooks for the authenticated user's transactions.

## Error Responses

All errors follow this format:
```json
{
  "statusCode": 400,
  "message": "Invalid state transition",
  "error": "Bad Request"
}
```

Common status codes:
- `400` — Validation error or invalid state transition
- `401` — Missing or invalid JWT
- `403` — Unauthorized action (e.g., buyer trying seller-only action)
- `404` — Resource not found
