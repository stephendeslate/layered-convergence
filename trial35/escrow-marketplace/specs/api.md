# API Layer

**Project:** escrow-marketplace
**Layer:** 5 — Monorepo
**Version:** 1.0.0
**Cross-references:** auth.md, database.md, system-architecture.md

---

## Overview

The API is built with NestJS 11 and provides RESTful endpoints for managing
listings, transactions, and disputes. All endpoints require JWT authentication
and are scoped to the authenticated user's tenant.

## Application Bootstrap

The main.ts file performs fail-fast validation of required environment
variables before starting the NestJS application. Both JWT_SECRET and
CORS_ORIGIN must be configured or the application will throw immediately.

- VERIFY: EM-API-001 — main.ts validates JWT_SECRET and CORS_ORIGIN at startup
- VERIFY: EM-API-002 — AppModule imports Auth, Listings, and Transactions modules
- VERIFY: EM-API-003 — PrismaService uses $executeRaw with Prisma.sql only

## Module Structure

### Listings Module
Provides CRUD operations for marketplace listings. Each listing
belongs to a tenant and is created by a seller.

- VERIFY: EM-LIST-001 — ListingsModule registers controller, service, prisma
- VERIFY: EM-LIST-002 — ListingsController with create, findAll, findOne
- VERIFY: EM-LIST-003 — ListingsService uses generateId for entity creation

### Transactions Module
Manages escrow transactions with status transitions.
Transactions follow a state machine pattern defined in shared constants.

- VERIFY: EM-TXN-001 — TransactionsModule registers controller, service, prisma
- VERIFY: EM-TXN-002 — TransactionsController with create, findAll, updateStatus
- VERIFY: EM-TXN-003 — TransactionsService validates status transitions

## Server Actions

The Next.js frontend uses server actions to communicate with the API.
All server actions use the 'use server' directive and check response.ok.

- VERIFY: EM-ACTION-001 — Listing server actions with 'use server' + response.ok
- VERIFY: EM-ACTION-002 — Transaction server actions with 'use server' + response.ok

## Error Handling

All services throw appropriate NestJS exceptions:
- NotFoundException for missing resources
- ConflictException for duplicate entries
- BadRequestException for invalid state transitions
- UnauthorizedException for invalid credentials

## Request Validation

Global ValidationPipe with whitelist and transform options ensures
all incoming DTOs are validated and transformed before reaching
service methods. Unknown properties are stripped automatically.
