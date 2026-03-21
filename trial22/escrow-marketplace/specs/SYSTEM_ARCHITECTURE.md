# System Architecture — Escrow Marketplace

## Overview

The Escrow Marketplace follows a layered architecture with a NestJS 11 backend
serving a RESTful API consumed by a Next.js 15 frontend. Data persistence uses
PostgreSQL 16 via Prisma 6 ORM with Row-Level Security policies enforced at the
database level.

See: [PRODUCT_VISION.md](PRODUCT_VISION.md) for business context and value propositions.
See: [SECURITY_MODEL.md](SECURITY_MODEL.md) for detailed security implementation.

<!-- VERIFY:SA-001 — NestJS backend with modular architecture -->
<!-- VERIFY:SA-002 — Prisma 6 ORM with PostgreSQL 16 -->
<!-- VERIFY:SA-003 — JWT-based authentication with fail-fast validation -->
<!-- VERIFY:SA-004 — Transaction state machine enforced in service layer -->
<!-- VERIFY:SA-005 — Webhook delivery system for event notifications -->

## System Diagram

```
┌─────────────────┐     HTTPS/REST     ┌──────────────────┐
│  Next.js 15     │ ◄────────────────► │  NestJS 11       │
│  App Router     │                    │  REST API        │
│  (Frontend)     │                    │                  │
└─────────────────┘                    ├──────────────────┤
                                       │  Auth Module     │
                                       │  Transaction Mod │
                                       │  Dispute Module  │
                                       │  Payout Module   │
                                       │  Webhook Module  │
                                       └────────┬─────────┘
                                                │ Prisma 6
                                       ┌────────▼─────────┐
                                       │  PostgreSQL 16   │
                                       │  + RLS Policies  │
                                       └──────────────────┘
```

## Backend Architecture

### Module Structure

Each domain entity maps to a NestJS module containing:
- **Controller**: HTTP request handling, route definitions, input validation
- **Service**: Business logic, state machine transitions, authorization checks
- **DTOs**: Request/response validation with class-validator decorators

Modules:
1. **AuthModule** — Registration, login, JWT issuance. See [API_CONTRACT.md](API_CONTRACT.md) for endpoint specs.
2. **PrismaModule** — Global database connection, `$executeRaw` with `Prisma.sql` only
3. **TransactionModule** — Escrow lifecycle management, state transitions
4. **DisputeModule** — Dispute creation, evidence, resolution
5. **PayoutModule** — Fund release tracking after transaction completion
6. **WebhookModule** — Event subscription and delivery

### State Machine Implementation

Transaction state transitions are enforced in `TransactionService` with explicit
valid-transition maps. Invalid transitions throw `BadRequestException`.
See [DATA_MODEL.md](DATA_MODEL.md) for the Transaction model status enum.

```typescript
const VALID_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  PENDING: [FUNDED],
  FUNDED: [SHIPPED, DISPUTE],
  SHIPPED: [DELIVERED, DISPUTE],
  DELIVERED: [COMPLETED, DISPUTE],
  COMPLETED: [],
  DISPUTE: [REFUNDED, FUNDED],
  REFUNDED: [],
};
```

### Error Handling

- All controllers use NestJS built-in exception filters
- Business logic errors throw typed HTTP exceptions
- Prisma errors are caught and mapped to appropriate HTTP status codes
- No `console.log` in production — NestJS `Logger` service is used throughout

## Frontend Architecture

### Next.js 15 App Router

- Server Components by default, Client Components only where interactivity needed
- Server Actions for form submissions with `response.ok` checks before redirect
- Every route includes `loading.tsx` (role="status", aria-busy="true") and
  `error.tsx` (role="alert")
- See [UI_SPECIFICATION.md](UI_SPECIFICATION.md) for component specifications

### Component Library

- shadcn/ui provides 8 base components (Button, Card, Input, Label, Badge,
  Select, Table, Dialog)
- Tailwind CSS 4 for styling with `prefers-color-scheme` dark mode support
- Skip-to-content link in root layout for accessibility

## Database Architecture

- PostgreSQL 16 with Prisma 6 ORM
- All models use `@@map` for table names, `@map` for column names
- Monetary values stored as `Decimal(12,2)`
- Row-Level Security policies on user-scoped tables
- See [DATA_MODEL.md](DATA_MODEL.md) for complete schema specification

## Authentication Flow

1. User registers with email, password (bcrypt salt 12), and role (BUYER/SELLER)
2. Login returns JWT containing userId and role
3. `JwtAuthGuard` protects all authenticated routes
4. Defense-in-depth: auth service rejects any ADMIN role attempt
5. See [SECURITY_MODEL.md](SECURITY_MODEL.md) for threat model details

## Deployment

- Docker Compose for local development and testing
- PostgreSQL 16 container with health checks
- Backend and frontend as separate services
- See [TESTING_STRATEGY.md](TESTING_STRATEGY.md) for test environment setup
