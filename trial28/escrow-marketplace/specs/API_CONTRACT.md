# API Contract — Escrow Marketplace

## Base URL
All endpoints served from backend on configured PORT (default 4001).

## Authentication Endpoints

### POST /auth/register
Creates a new user account.
Request body: { email, password, role }
Role restricted to: BUYER, SELLER, ARBITER (ADMIN excluded via @IsIn).
Response: { access_token: string }
<!-- VERIFY:EM-REGISTER-ENDPOINT — POST /auth/register with role restriction -->

### POST /auth/login
Authenticates a user.
Request body: { email, password }
Response: { access_token: string }
Errors: 401 for invalid credentials.
<!-- VERIFY:EM-LOGIN-ENDPOINT — POST /auth/login with JWT response -->

### GET /auth/health
Health check endpoint.
Response: { status: "ok" }

## Transaction Endpoints

### GET /transactions
Returns all transactions with buyer and seller details.
Response: Transaction[]
<!-- VERIFY:EM-TRANSACTIONS-LIST — GET /transactions endpoint -->

### GET /transactions/:id
Returns a single transaction with relations.
Response: Transaction (includes buyer, seller, disputes)

### PATCH /transactions/:id/release
Releases transaction funds using $executeRaw.
Only transitions from FUNDED status.
Response: Transaction

### PATCH /transactions/:id/status?status={status}
Transitions transaction to a new status.
Response: Transaction

### GET /transactions/sum/:status
Returns total amount for transactions in given status.
Response: { total: number }

## Dispute Endpoints

### GET /disputes
Returns all disputes with transaction and arbiter details.
Response: Dispute[]

### GET /disputes/:id
Returns a single dispute.
Response: Dispute

### PATCH /disputes/:id/status?status={status}
Transitions dispute status.
Response: Dispute

## Validation
ValidationPipe configured with:
- whitelist: true
- forbidNonWhitelisted: true
- transform: true

## CORS
Configured via CORS_ORIGIN environment variable.
<!-- VERIFY:EM-CORS-CONFIG — CORS from environment variable -->

## Error Responses
Standard NestJS error format with statusCode, message, and error fields.
400 for validation errors, 401 for authentication failures.
