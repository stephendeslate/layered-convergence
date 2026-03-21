# API Contract — Escrow Marketplace

## Overview
The Escrow Marketplace API provides RESTful endpoints for authentication,
transaction management, and dispute resolution. See DATA_MODEL.md for entity
schemas and SECURITY_MODEL.md for access control.

## Authentication Endpoints

### POST /auth/register
<!-- VERIFY:EM-REGISTER-ENDPOINT — POST /auth/register with role restriction -->
Creates a new user account. The role field is validated with @IsIn to exclude
ADMIN from self-registration. Only BUYER, SELLER, and ARBITER are accepted.

Request body: `{ email, password, role }`
Response: `{ access_token }`

### POST /auth/login
<!-- VERIFY:EM-LOGIN-ENDPOINT — POST /auth/login with JWT -->
Authenticates a user and returns a JWT. Password is compared against the
bcrypt hash stored in the database.

Request body: `{ email, password }`
Response: `{ access_token }`

### GET /auth/health
Returns service health status.

## Transaction Endpoints

### GET /transactions
<!-- VERIFY:EM-TRANSACTIONS-LIST — GET /transactions with user filtering -->
Returns all transactions where the authenticated user is buyer or seller.

Query: `?userId=<id>`
Response: Array of Transaction objects with disputes included.

### PATCH /transactions/:id/status
Updates transaction status following the state machine rules.

### PATCH /transactions/:id/fund
Funds a transaction using raw SQL update.

### GET /transactions/total
Returns total transaction amount for a user using raw SQL aggregation.

## Dispute Endpoints

### GET /disputes
Returns disputes for a given transaction.

### GET /disputes/:id
Returns a single dispute with its transaction.

### POST /disputes
Creates a new dispute for a transaction.

### PATCH /disputes/:id/status
Updates dispute status following the state machine rules.

## CORS Configuration
<!-- VERIFY:EM-CORS-CONFIG — CORS from environment variable -->
CORS origin is configured from the CORS_ORIGIN environment variable. No
hardcoded origins are used.

## Error Handling
See SYSTEM_ARCHITECTURE.md for validation pipe configuration and
UI_SPECIFICATION.md for error display components.
