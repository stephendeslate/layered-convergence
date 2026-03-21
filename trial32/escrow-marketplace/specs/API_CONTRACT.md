# API Contract — Escrow Marketplace

## Overview

RESTful API endpoints for the Escrow Marketplace platform.
All endpoints (except auth) require JWT Bearer token authentication.

See also: [DATA_MODEL.md](DATA_MODEL.md), [SECURITY_MODEL.md](SECURITY_MODEL.md), [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md)

## Authentication Endpoints

### POST /auth/register
- Body: { email, password, role, tenantId }
- Response: { id, email, role }
- Role validation: only BUYER, SELLER, ARBITER accepted

### POST /auth/login
- Body: { email, password }
- Response: { accessToken }

## Transaction Endpoints

- [VERIFY:EM-AC-001] Transaction CRUD with tenant isolation -> Implementation: apps/api/src/transaction/transaction.service.ts:1
- [VERIFY:EM-AC-002] Transaction state machine with validated transitions -> Implementation: apps/api/src/transaction/transaction.service.ts:2

### GET /transactions
- Auth: Required
- Response: TransactionDto[]

### GET /transactions/:id
- Auth: Required
- Response: TransactionDto

### POST /transactions
- Auth: Required
- Body: { amount, currency, buyerId, sellerId, description, tenantId }
- Response: TransactionDto (status: PENDING)

### PATCH /transactions/:id/transition
- Auth: Required
- Body: { status }
- Response: TransactionDto

### DELETE /transactions/:id
- Auth: Required

## Dispute Endpoints

- [VERIFY:EM-AC-003] Dispute CRUD with tenant isolation -> Implementation: apps/api/src/dispute/dispute.service.ts:1
- [VERIFY:EM-AC-004] Dispute state machine validation -> Implementation: apps/api/src/dispute/dispute.service.ts:2

### GET /disputes
- Auth: Required
- Response: DisputeDto[]

### POST /disputes
- Auth: Required
- Body: { reason, transactionId, filedById, tenantId }
- Response: DisputeDto (status: OPEN)

### PATCH /disputes/:id/transition
- Auth: Required
- Body: { status, resolution? }
- Response: DisputeDto

## Payout Endpoints

- [VERIFY:EM-AC-005] Payout CRUD with tenant isolation -> Implementation: apps/api/src/payout/payout.service.ts:1

### GET /payouts
- Auth: Required
- Response: PayoutDto[]

### POST /payouts
- Auth: Required
- Body: { amount, currency, recipientId, transactionId, tenantId }
- Response: PayoutDto

## Webhook Endpoints

- [VERIFY:EM-AC-006] Webhook CRUD with tenant isolation -> Implementation: apps/api/src/webhook/webhook.service.ts:1

### GET /webhooks
- Auth: Required
- Response: WebhookDto[]

### POST /webhooks
- Auth: Required
- Body: { url, events, tenantId }
- Response: WebhookDto

### DELETE /webhooks/:id
- Auth: Required

## Error Responses

All error responses follow the format:
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```
