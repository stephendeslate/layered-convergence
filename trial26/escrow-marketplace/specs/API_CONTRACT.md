# API Contract: Escrow Marketplace

## Overview

The Escrow Marketplace API provides REST endpoints for transaction
management, dispute resolution, and webhook configuration.

## Authentication Endpoints

### POST /auth/register
[VERIFY:EM-021] Registration validates role with @IsIn allowing only
BUYER and SELLER. ADMIN role is explicitly excluded.

Request: `{ name, email, password, role }`
Response: `{ accessToken, user: { id, email, role } }`
Errors: 400 (validation), 409 (duplicate)

### POST /auth/login
Request: `{ email, password }`
Response: `{ accessToken, user: { id, email, role } }`
Error: 401 (invalid credentials)

## Transaction Endpoints

### POST /transactions
[VERIFY:EM-022] Creates a new escrow transaction in PENDING status.
Requires buyerId, sellerId, amount, and optional description.

### POST /transactions/:id/transition
[VERIFY:EM-023] Transitions transaction status following state machine.
Returns 400 for invalid transitions.

### GET /transactions/user/:userId
Returns all transactions for a user (as buyer or seller).

## Dispute Endpoints

### POST /disputes
[VERIFY:EM-024] Files a new dispute against a transaction.
Requires transactionId, filedBy, and reason.

### POST /disputes/:id/transition
Transitions dispute status with optional resolution text.

## Payout Endpoints

### POST /payouts
Creates a payout record for a transaction.

### POST /payouts/:id/transition
Processes payout state transition with optional failure reason.

## Webhook Endpoints

### POST /webhooks
Registers a new webhook endpoint with event subscriptions.

### GET /webhooks
Returns all active webhooks.

### DELETE /webhooks/:id
Deactivates a webhook.

## Input Validation

[VERIFY:EM-025] ValidationPipe with whitelist and forbidNonWhitelisted
strips unknown properties and rejects non-whitelisted fields.

## Cross-References

- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for JWT configuration
- See [DATA_MODEL.md](./DATA_MODEL.md) for entity schemas
- See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for endpoint tests
