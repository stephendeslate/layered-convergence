# API Contracts

## Overview

The Escrow Marketplace API exposes RESTful endpoints for managing
listings, transactions, escrows, and disputes. All routes require
JWT authentication via APP_GUARD unless marked with @Public().

## Authentication Endpoints

### POST /auth/register
- VERIFY: EM-ADTO-001 — Registration DTO validates all fields
- Marked @Public() to bypass APP_GUARD JwtAuthGuard
- Request body: email, password, name, role, tenantId
- Role restricted to ALLOWED_REGISTRATION_ROLES (no ADMIN)
- Returns: { user, token }

### POST /auth/login
- VERIFY: EM-ASVC-001 — Login validates credentials with bcrypt
- Marked @Public() to bypass APP_GUARD JwtAuthGuard
- Request body: email, password
- Returns: { user, token }
- Rate limited: 5 requests per 60 seconds

## Listing Endpoints (CRUD)

### POST /listings — Create listing
- VERIFY: EM-LCTL-001 — Listings controller handles CRUD
- Auth enforced by APP_GUARD (no per-controller @UseGuards)
- Body: title, description, price, tenantId

### GET /listings — List all (paginated)
- VERIFY: EM-CACHE-001 — Cache-Control header set on list endpoints
- Query: page, pageSize (clamped to MAX_PAGE_SIZE)

### GET /listings/:id — Get one
### PUT /listings/:id — Update listing
### DELETE /listings/:id — Remove listing

## Transaction Endpoints (CRUD)

### POST /transactions — Create transaction
- VERIFY: EM-TCTL-001 — Transactions controller handles CRUD
- Auth enforced by APP_GUARD

### GET /transactions — List all (paginated)
### GET /transactions/:id — Get one (with N+1 prevention includes)
### PUT /transactions/:id — Update transaction status
### DELETE /transactions/:id — Remove transaction

## Escrow Endpoints (CRUD)

### POST /escrows — Create escrow
- VERIFY: EM-ECTL-001 — Escrows controller handles CRUD
- Auth enforced by APP_GUARD

### GET /escrows — List all (paginated)
### GET /escrows/:id — Get one
### PUT /escrows/:id — Update escrow status/balance
### DELETE /escrows/:id — Remove escrow

## Dispute Endpoints (CRUD)

### POST /disputes — Create dispute
- VERIFY: EM-DCTL-001 — Disputes controller handles CRUD
- Auth enforced by APP_GUARD

### GET /disputes — List all (paginated)
### GET /disputes/:id — Get one (includes raisedBy, resolvedBy, transaction)
### PUT /disputes/:id — Update dispute status/resolution
### DELETE /disputes/:id — Remove dispute

## Health and Monitoring

### GET /health
- VERIFY: EM-HLTH-001 — Health returns status, timestamp, uptime, version
- VERIFY: EM-CONST-004 — APP_VERSION from shared (no hardcoded version)
- Marked @Public() to bypass APP_GUARD JwtAuthGuard
- Rate limit skipped via @SkipThrottle

### GET /health/ready
- VERIFY: EM-HLTH-002 — Ready checks database connectivity
- Uses Prisma.$queryRaw(Prisma.sql)

### GET /metrics
- VERIFY: EM-METR-002 — Metrics returns operational stats
- Returns: requestCount, errorCount, averageResponseTime, uptime

## Integration Test Coverage

- VERIFY: EM-TDOM-001 — Domain integration tests validate CRUD flows
- VERIFY: EM-TXLR-001 — Cross-layer integration tests validate full pipeline

## Cross-References

See [security.md](./security.md) for endpoint protection details.
See [performance.md](./performance.md) for pagination and caching specs.
See [cross-layer.md](./cross-layer.md) for guard/filter/interceptor chain.
