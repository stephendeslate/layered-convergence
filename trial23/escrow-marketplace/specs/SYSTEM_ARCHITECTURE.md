# System Architecture — Escrow Marketplace

## Overview
The system follows a modular monolith architecture with NestJS on the backend
and Next.js 15 on the frontend. PostgreSQL serves as the primary data store
with Prisma as the ORM layer.

<!-- VERIFY:SA-001: Backend uses NestJS with modular architecture -->
<!-- VERIFY:SA-002: Frontend uses Next.js 15 App Router -->
<!-- VERIFY:SA-003: Database is PostgreSQL with Prisma ORM -->
<!-- VERIFY:SA-004: JWT tokens used for authentication -->
<!-- VERIFY:SA-005: Global ValidationPipe with whitelist enabled -->

## Component Topology

```
┌─────────────────────────────────────────────┐
│              Next.js 15 Frontend            │
│  ┌─────────┐ ┌──────────┐ ┌─────────────┐  │
│  │ App      │ │ shadcn   │ │ Server      │  │
│  │ Router   │ │ /ui      │ │ Actions     │  │
│  └─────────┘ └──────────┘ └─────────────┘  │
└──────────────────┬──────────────────────────┘
                   │ HTTP/REST
┌──────────────────▼──────────────────────────┐
│              NestJS 11 Backend              │
│  ┌──────┐ ┌───────────┐ ┌────────┐         │
│  │ Auth │ │Transaction│ │Dispute │         │
│  └──────┘ └───────────┘ └────────┘         │
│  ┌───────┐ ┌─────────┐ ┌────────┐         │
│  │Payout │ │ Webhook │ │ Prisma │         │
│  └───────┘ └─────────┘ └────────┘         │
└──────────────────┬──────────────────────────┘
                   │ Prisma Client
┌──────────────────▼──────────────────────────┐
│           PostgreSQL 16                     │
│  Row-Level Security · Decimal(12,2)         │
└─────────────────────────────────────────────┘
```

## Backend Modules

| Module | Responsibility |
|--------|---------------|
| AuthModule | Registration, login, JWT issuance, password validation |
| TransactionModule | CRUD + state machine transitions |
| DisputeModule | Dispute creation and resolution |
| PayoutModule | Payout lifecycle management |
| WebhookModule | Event notification registration and delivery |
| PrismaModule | Database connection and query execution |

## Configuration
- `JWT_SECRET` — Required. Application throws on startup if missing.
- `CORS_ORIGIN` — Required. Application throws on startup if missing.
- `DATABASE_URL` — Required. Prisma connection string.

Fail-fast validation ensures no silent misconfiguration in any environment.

## Deployment
- Docker Compose for local development
- docker-compose.test.yml for integration test database
- Separate containers for app and database

## Related Specifications
- See [PRODUCT_VISION.md](PRODUCT_VISION.md) for business context
- See [DATA_MODEL.md](DATA_MODEL.md) for database schema details
- See [SECURITY_MODEL.md](SECURITY_MODEL.md) for auth architecture
- See [TESTING_STRATEGY.md](TESTING_STRATEGY.md) for test infrastructure
