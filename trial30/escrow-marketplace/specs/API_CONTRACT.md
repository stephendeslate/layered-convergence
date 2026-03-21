# API Contract — Escrow Marketplace

## Overview
The Escrow Marketplace API provides endpoints for authentication,
transaction management, and dispute resolution. See SYSTEM_ARCHITECTURE.md
for backend architecture and SECURITY_MODEL.md for auth requirements.

## Authentication Endpoints

### GET /auth/health
Returns service health status.
Response: `{ "status": "ok" }`

### POST /auth/register
<!-- VERIFY:EM-REGISTER-ENDPOINT — POST /auth/register with role restriction -->
Creates a new user account. The role field is restricted to BUYER, SELLER,
or ARBITER via @IsIn validator. ADMIN role cannot be self-assigned.

Request body:
- email (string, valid email format)
- password (string, minimum 8 characters)
- role (string, one of: BUYER, SELLER, ARBITER)

Response: `{ "access_token": "jwt-token" }`
Error 400: Invalid role, email format, or short password.

### POST /auth/login
<!-- VERIFY:EM-LOGIN-ENDPOINT — POST /auth/login with JWT -->
Authenticates an existing user and returns a JWT token.

Request body:
- email (string, valid email format)
- password (string, minimum 8 characters)

Response: `{ "access_token": "jwt-token" }`
Error 401: Invalid credentials.

## Transaction Endpoints

### GET /transactions?buyerId=
Returns all transactions for a buyer, ordered by creation date descending.
Includes associated disputes.

### GET /transactions/seller?sellerId=
Returns all transactions for a seller, ordered by creation date descending.
Includes associated payouts.

### PATCH /transactions/:id/status
<!-- VERIFY:EM-TRANSACTION-TRANSITION — Transaction status transition endpoint -->
Updates transaction status following the state machine:
PENDING -> FUNDED -> RELEASED/DISPUTED -> RELEASED/REFUNDED.

Request body: `{ "status": "FUNDED" }`
Error 400: Invalid transition or transaction not found.

## Dispute Endpoints

### GET /disputes?transactionId=
Returns all disputes for a transaction, ordered by creation date descending.

### GET /disputes/:id
Returns a single dispute with its associated transaction.
Error 404: Dispute not found.

### POST /disputes
Creates a new dispute against a transaction.

Request body:
- reason (string)
- transactionId (string)
- filedById (string)

### PATCH /disputes/:id/status
Updates dispute status following the state machine:
OPEN -> UNDER_REVIEW/ESCALATED, UNDER_REVIEW -> RESOLVED/ESCALATED.

Request body: `{ "status": "RESOLVED", "resolution": "Partial refund" }`
Error 400: Invalid transition or dispute not found.

## CORS Configuration
<!-- VERIFY:EM-CORS-CONFIG — CORS from environment variable -->
CORS origin is configured from the CORS_ORIGIN environment variable.
No hardcoded origins are permitted.
