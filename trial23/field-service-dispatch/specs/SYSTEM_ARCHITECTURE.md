# System Architecture — Field Service Dispatch

## Overview

The system follows a client-server architecture with a NestJS backend API
and a Next.js frontend. PostgreSQL provides persistent storage with row-level
security for multi-tenant data isolation.

See: PRODUCT_VISION.md, SECURITY_MODEL.md

## Component Topology

```
┌─────────────────────────────────────────────┐
│                 Frontend                     │
│           Next.js 15 App Router              │
│    shadcn/ui · Tailwind CSS 4 · Vitest       │
└──────────────────┬──────────────────────────┘
                   │ HTTPS / REST
┌──────────────────▼──────────────────────────┐
│                 Backend                      │
│              NestJS 11 API                   │
│   JWT Auth · ValidationPipe · Guards         │
└──────────────────┬──────────────────────────┘
                   │ Prisma 6
┌──────────────────▼──────────────────────────┐
│               Database                       │
│          PostgreSQL 16 + RLS                 │
└─────────────────────────────────────────────┘
```

## VERIFY:GLOBAL_VALIDATION_PIPE — ValidationPipe with whitelist and forbidNonWhitelisted is set globally

## Backend Modules

| Module | Responsibility |
|--------|---------------|
| `auth` | Registration, login, JWT token issuance, password hashing |
| `work-order` | CRUD + state machine transitions for work orders |
| `customer` | Customer management per company |
| `technician` | Technician management per company |
| `invoice` | Invoice CRUD + state machine (DRAFT→SENT→PAID→VOID) |
| `route` | Route planning with estimated distances |
| `gps-event` | GPS coordinate logging for technicians |
| `company-context` | Sets company context for RLS enforcement |
| `prisma` | Prisma client provider, connection management |

## VERIFY:NESTJS_MODULES — All 9 modules (auth, work-order, customer, technician, invoice, route, gps-event, company-context, prisma) exist

## Data Flow

1. User authenticates via `/auth/login` → receives JWT
2. Frontend includes JWT in Authorization header
3. Backend extracts user + company from JWT
4. CompanyContext middleware sets `app.company_id` on the PostgreSQL session
5. RLS policies filter all queries to the authenticated company
6. Prisma executes queries through RLS-protected views

## VERIFY:EXECUTERAW_SAFE — All $executeRaw calls use Prisma.sql tagged template, never $executeRawUnsafe

## Deployment

### Docker Compose (Development)
- `postgres:16` — main database
- Backend runs on port 3000
- Frontend runs on port 3001

### Docker Compose (Testing)
- `docker-compose.test.yml` — isolated test database
- Integration tests run against real PostgreSQL instance
- Zero mocking of Prisma methods in integration tests

See: TESTING_STRATEGY.md, DATA_MODEL.md

## Error Handling

- Global exception filters catch unhandled errors
- Validation errors return 400 with field-level messages
- Authentication errors return 401
- Authorization errors return 403
- Not found errors return 404
- State machine violation errors return 409 (Conflict)

## VERIFY:STATE_CONFLICT_409 — Invalid state transitions return HTTP 409

## Frontend Architecture

The frontend uses Next.js 15 App Router with server actions for data mutations.
All server actions are defined in `app/actions.ts` with the `'use server'` directive.

Routes:
- `/` — Dashboard (root)
- `/login` — Authentication
- `/register` — New user registration
- `/work-orders` — Work order list
- `/work-orders/[id]` — Work order detail
- `/technicians` — Technician management
- `/customers` — Customer management
- `/invoices` — Invoice management
- `/routes` — Route management
- `/gps-events` — GPS event log

Every route has `loading.tsx` and `error.tsx` files for graceful loading and error states.

See: UI_SPECIFICATION.md, API_CONTRACT.md
