# System Architecture — Field Service Dispatch

## Overview

The system follows a three-tier architecture: a Next.js 15 frontend, a NestJS 11 backend API, and a PostgreSQL 16 database with Prisma 6 ORM.

## Architecture Diagram

```
┌─────────────────────────┐
│   Next.js 15 Frontend   │
│   (App Router, SSR)     │
├─────────────────────────┤
│   Server Actions /      │
│   API fetch calls       │
└──────────┬──────────────┘
           │ HTTPS / JWT
┌──────────▼──────────────┐
│   NestJS 11 Backend     │
│   ├── AuthModule        │
│   ├── PrismaModule      │
│   ├── CompanyContext     │
│   ├── CustomerModule    │
│   ├── TechnicianModule  │
│   ├── WorkOrderModule   │
│   ├── InvoiceModule     │
│   ├── RouteModule       │
│   └── GpsEventModule    │
├─────────────────────────┤
│   Prisma 6 ORM          │
│   (with RLS bypass)     │
└──────────┬──────────────┘
           │ TCP/5432
┌──────────▼──────────────┐
│   PostgreSQL 16         │
│   Row-Level Security    │
│   per-company isolation │
└─────────────────────────┘
```

## Module Structure

<!-- VERIFY:SA-001 Backend organized into feature modules with clear boundaries -->
Each domain entity has its own NestJS module containing a controller, service, and DTOs. Modules declare explicit imports and exports to maintain clean boundaries.

### Module Dependency Graph

```
AppModule
├── AuthModule (standalone — no feature module deps)
├── PrismaModule (global)
├── CompanyContextModule (depends on PrismaModule)
├── CustomerModule (depends on PrismaModule, CompanyContextModule)
├── TechnicianModule (depends on PrismaModule, CompanyContextModule)
├── WorkOrderModule (depends on PrismaModule, CompanyContextModule)
├── InvoiceModule (depends on PrismaModule, CompanyContextModule, WorkOrderModule)
├── RouteModule (depends on PrismaModule, CompanyContextModule)
└── GpsEventModule (depends on PrismaModule, CompanyContextModule)
```

## Authentication Flow

<!-- VERIFY:SA-002 JWT authentication with fail-fast on missing JWT_SECRET -->
1. User registers or logs in via AuthModule.
2. AuthService validates credentials, hashes passwords with bcrypt (salt 12).
3. On success, a JWT is issued containing `userId`, `companyId`, and `role`.
4. All protected endpoints use `JwtAuthGuard`.
5. Application fails fast at startup if `JWT_SECRET` is not set.

## Multi-Tenant Isolation

<!-- VERIFY:SA-003 Row-level security enforced at database level for all company-scoped tables -->
All company-scoped tables have PostgreSQL RLS policies. The application sets `app.current_company_id` via `SET LOCAL` before each request. Even if application-level filtering fails, the database prevents cross-tenant access.

## Request Lifecycle

<!-- VERIFY:SA-004 Company context set on every authenticated request -->
1. Request arrives at NestJS controller.
2. `JwtAuthGuard` validates the JWT and attaches user to request.
3. `CompanyContextMiddleware` extracts `companyId` from JWT and sets it on the Prisma connection via `$executeRaw`.
4. Service layer performs business logic using Prisma.
5. Response is returned.

## Error Handling

<!-- VERIFY:SA-005 Structured error responses with appropriate HTTP status codes -->
- Validation errors: 400 Bad Request with field-level details
- Authentication failures: 401 Unauthorized
- Authorization failures: 403 Forbidden
- Not found: 404
- State machine violations: 409 Conflict
- Internal errors: 500 with sanitized message (no stack traces in production)

## Environment Configuration

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — HMAC secret for JWT signing (fail-fast if missing)
- `CORS_ORIGIN` — Allowed origin for CORS (fail-fast if missing)
- `PORT` — Server port (default 3000)

## Deployment

- Docker Compose for local development and testing
- PostgreSQL 16 container with health checks
- Backend container with Prisma migrations on startup
- Frontend container with Next.js standalone build
