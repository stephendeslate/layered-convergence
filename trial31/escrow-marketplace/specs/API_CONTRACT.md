# API Contract — Escrow Marketplace

## Overview
RESTful API endpoints for authentication, transaction management,
and dispute resolution.

See also: [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md), [SECURITY_MODEL.md](SECURITY_MODEL.md)

## Authentication Endpoints

### POST /auth/register
<!-- VERIFY:EM-REGISTER-ENDPOINT -->
Creates a new user account with role restriction.
Accepts: email, password (min 8 chars), role (BUYER | SELLER | ARBITER).
ADMIN role is explicitly excluded via @IsIn validator.
Returns: { access_token: string }

### POST /auth/login
<!-- VERIFY:EM-LOGIN-ENDPOINT -->
Authenticates user with email and password.
Returns JWT access token on success.
Returns 401 UnauthorizedException on invalid credentials.

### GET /auth/health
Returns { status: "ok" } for health monitoring.

## Transaction Endpoints

### GET /transactions
<!-- VERIFY:EM-TRANSACTIONS-LIST -->
Lists transactions filtered by buyerId query parameter.
Includes seller and dispute relations.
Ordered by createdAt descending.

### POST /transactions
Creates a new escrow transaction.
Accepts: amount, currency, description, buyerId, sellerId.

### PATCH /transactions/:id/status
Transitions transaction status with state machine validation.

## Dispute Endpoints

### GET /disputes
Lists disputes filtered by transactionId query parameter.

### POST /disputes
Creates a new dispute for a transaction.

### PATCH /disputes/:id/status
Transitions dispute status with state machine validation.

## CORS Configuration
<!-- VERIFY:EM-CORS-CONFIG -->
CORS origin configured from CORS_ORIGIN environment variable.
No hardcoded origins in application code.

## Error Responses
All validation errors return 400 with descriptive messages.
Authentication failures return 401 UnauthorizedException.
