# API Contract — Escrow Marketplace

## Overview
RESTful API served by NestJS 11. All endpoints except auth require a valid
JWT Bearer token. Request/response bodies use JSON.

<!-- VERIFY:AC-001: Auth endpoints do not require JWT -->
<!-- VERIFY:AC-002: All other endpoints require JWT Bearer token -->
<!-- VERIFY:AC-003: Register endpoint rejects ADMIN role -->
<!-- VERIFY:AC-004: Transaction state transitions are validated -->
<!-- VERIFY:AC-005: Response bodies use consistent envelope structure -->

## Base URL
```
http://localhost:3001/api
```

## Authentication

### POST /auth/register
Register a new user. Role must be BUYER or SELLER (ADMIN rejected).

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "Alice Smith",
  "role": "BUYER"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Alice Smith",
  "role": "BUYER"
}
```

### POST /auth/login
Authenticate and receive JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOi..."
}
```

## Transactions

### POST /transactions
Create a new transaction (BUYER only).

### GET /transactions
List transactions for the authenticated user (buyer or seller).

### GET /transactions/:id
Get transaction details (must be buyer or seller on the transaction).

### PATCH /transactions/:id/status
Update transaction status. Valid transitions:
- PENDING → FUNDED (buyer)
- FUNDED → SHIPPED (seller)
- SHIPPED → DELIVERED (buyer)
- DELIVERED → COMPLETED (auto or seller)
- FUNDED/SHIPPED/DELIVERED → DISPUTE (buyer or seller)
- DISPUTE → REFUNDED (system)

## Disputes

### POST /disputes
Create a dispute on an active transaction.

### GET /disputes
List disputes for authenticated user.

### GET /disputes/:id
Get dispute details.

### PATCH /disputes/:id/resolve
Resolve an open dispute.

## Payouts

### GET /payouts
List payouts for authenticated seller.

### GET /payouts/:id
Get payout details.

## Webhooks

### POST /webhooks
Register a webhook URL for event notifications.

### GET /webhooks
List registered webhooks for authenticated user.

## Error Responses
All errors follow the structure:
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

## Related Specifications
- See [DATA_MODEL.md](DATA_MODEL.md) for entity schemas
- See [SECURITY_MODEL.md](SECURITY_MODEL.md) for authorization rules
- See [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) for backend modules
