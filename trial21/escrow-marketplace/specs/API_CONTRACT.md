# API Contract

## Overview

The Escrow Marketplace exposes a REST API over HTTP/JSON. All authenticated endpoints require a JWT Bearer token in the Authorization header or as an httpOnly cookie.

## Base URL

```
http://localhost:3001
```

## Authentication Endpoints

### [VERIFY:AC-001] Global Validation Pipeline
All incoming requests must pass through NestJS ValidationPipe with `whitelist: true` and `transform: true` to strip unknown properties and auto-transform types.

**Traced to**: `backend/src/main.ts`

### [VERIFY:AC-002] POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "string (required, @IsEmail)",
  "password": "string (required, @MinLength(8))",
  "role": "string (required, @IsIn(['BUYER', 'SELLER']))"
}
```

**Response (201):**
```json
{
  "token": "string (JWT)",
  "user": { "id": "uuid", "email": "string", "role": "string" }
}
```

**Traced to**: `backend/src/auth/auth.service.ts`

### [VERIFY:AC-003] POST /auth/login
Authenticate an existing user.

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (200):**
```json
{
  "token": "string (JWT)",
  "user": { "id": "uuid", "email": "string", "role": "string" }
}
```

**Error (401):** Invalid credentials

**Traced to**: `backend/src/auth/auth.service.ts`

### [VERIFY:AC-004] JWT Token Structure
JWT tokens must contain `sub` (user ID) and `role` claims. Tokens are signed with JWT_SECRET and have a configurable expiration.

**Traced to**: `backend/src/auth/auth.service.ts`

### [VERIFY:AC-005] POST /auth/logout
Clear authentication cookies and invalidate session.

**Traced to**: `backend/src/auth/auth.controller.ts`

## Transaction Endpoints

### [VERIFY:AC-006] POST /transactions
Create a new escrow transaction. Requires BUYER role.

**Request Body:**
```json
{
  "sellerId": "uuid (required)",
  "amount": "number (required, positive)",
  "description": "string (required)"
}
```

**Response (201):** Transaction object with status PENDING

**Traced to**: `backend/src/transaction/transaction.service.ts`

### [VERIFY:AC-007] GET /transactions
List all transactions visible to the authenticated user. Buyers see their purchases, sellers see their sales.

**Response (200):** Array of Transaction objects with buyer and seller details

**Traced to**: `backend/src/transaction/transaction.service.ts`

### [VERIFY:AC-008] PATCH /transactions/:id/status
Update transaction status. Validates role-based transition rules.

**Request Body:**
```json
{
  "status": "string (required, valid transition)"
}
```

**Response (200):** Updated Transaction object

**Error (400):** Invalid state transition
**Error (403):** Unauthorized role for transition

**Traced to**: `backend/src/transaction/transaction.service.ts`

## Dispute Endpoints

### [VERIFY:AC-009] POST /disputes
Create a new dispute for a transaction.

**Request Body:**
```json
{
  "transactionId": "uuid (required)",
  "reason": "string (required)"
}
```

**Response (201):** Dispute object with status OPEN

**Traced to**: `backend/src/dispute/dispute.service.ts`

### [VERIFY:AC-010] PATCH /disputes/:id/resolve
Resolve an open dispute.

**Request Body:**
```json
{
  "resolution": "string (required)"
}
```

**Response (200):** Updated Dispute object with status RESOLVED

**Traced to**: `backend/src/dispute/dispute.service.ts`

## Payout Endpoints

### [VERIFY:AC-011] POST /payouts
Request a payout for a delivered transaction.

**Request Body:**
```json
{
  "transactionId": "uuid (required)"
}
```

**Response (201):** Payout object

**Error (400):** Duplicate payout for transaction

**Traced to**: `backend/src/payout/payout.service.ts`

## Webhook Endpoints

### [VERIFY:AC-012] POST /webhooks
Register a webhook for event notifications.

**Request Body:**
```json
{
  "url": "string (required, valid URL)",
  "event": "string (required)"
}
```

**Response (201):** Webhook object with status PENDING

**Traced to**: `backend/src/webhook/webhook.service.ts`
