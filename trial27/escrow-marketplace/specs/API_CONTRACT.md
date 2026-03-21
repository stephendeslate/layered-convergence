# API Contract: Escrow Marketplace

## Overview

The Escrow Marketplace API provides endpoints for authentication,
transaction management, dispute resolution, payouts, and webhooks.

## Authentication Endpoints

### POST /auth/register
[VERIFY:EM-021] Registration endpoint accepts email, password, name, and role.
Role validation excludes ADMIN via @IsIn validator on the DTO. Returns
user object and JWT token on success.

Request body:
```json
{
  "email": "user@example.com",
  "password": "securePassword",
  "name": "Jane Doe",
  "role": "BUYER"
}
```

### POST /auth/login
Login endpoint validates credentials and returns JWT token.

## Transaction Endpoints

### GET /transactions
[VERIFY:EM-022] Returns transactions where the authenticated user is either
buyer or seller. User context is set via RLS for query scoping.

### POST /transactions
Creates a new transaction in PENDING status with the authenticated user
as buyer.

### POST /transactions/:id/transition
Validates state machine rules before updating transaction status.

## Dispute Endpoints

### POST /disputes
Creates a dispute against a transaction with a reason description.

### POST /disputes/:id/resolve
Resolves a dispute in favor of buyer or seller with resolution text.

## Webhook Endpoints

### GET /webhooks
[VERIFY:EM-023] Returns active webhook configurations. Webhooks are
standalone entities that subscribe to transaction lifecycle events.

### POST /webhooks
Creates a new webhook with URL, secret, and event subscriptions.

## Validation

[VERIFY:EM-024] ValidationPipe with whitelist and forbidNonWhitelisted
rejects unknown properties. Transform enables automatic type conversion.

## Error Responses

- 400: Validation errors, invalid state transitions
- 401: Missing or invalid JWT
- 403: Insufficient permissions (role mismatch)
- 404: Resource not found

## Cross-References

- See [DATA_MODEL.md](./DATA_MODEL.md) for entity schemas
- See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for authentication flow
- See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for endpoint test coverage
