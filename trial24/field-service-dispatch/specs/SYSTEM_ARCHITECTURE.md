# System Architecture — Field Service Dispatch

## Overview

FSD follows a layered architecture with a NestJS backend API, PostgreSQL database with
Row Level Security, and a Next.js frontend. The system is designed for multi-tenant
operation where each company's data is strictly isolated at the database level.

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend API | NestJS | 11 |
| ORM | Prisma | 6 |
| Database | PostgreSQL | 16 |
| Frontend | Next.js | 15 |
| UI Components | shadcn/ui (Radix) | Latest |
| CSS | Tailwind CSS | 4 |
| Auth | JWT + bcrypt | — |

## Component Diagram

```
┌─────────────────────────────────────────────┐
│            Next.js 15 Frontend              │
│   (App Router, Server Actions, shadcn/ui)   │
└──────────────────┬──────────────────────────┘
                   │ REST API (JWT Bearer)
┌──────────────────▼──────────────────────────┐
│            NestJS 11 Backend                │
│  ┌──────────┐ ┌───────────┐ ┌────────────┐ │
│  │ Auth     │ │ WorkOrder │ │ Invoice    │ │
│  │ Module   │ │ Module    │ │ Module     │ │
│  ├──────────┤ ├───────────┤ ├────────────┤ │
│  │ Customer │ │ Technician│ │ Route      │ │
│  │ Module   │ │ Module    │ │ Module     │ │
│  ├──────────┤ ├───────────┤ ├────────────┤ │
│  │ GpsEvent │ │ Company   │ │ Company    │ │
│  │ Module   │ │ Module    │ │ Context    │ │
│  └──────────┘ └───────────┘ └────────────┘ │
│  ┌─────────────────────────────────────────┐│
│  │      PrismaService (Global Module)      ││
│  └─────────────────────────────────────────┘│
└──────────────────┬──────────────────────────┘
                   │ Prisma Client
┌──────────────────▼──────────────────────────┐
│         PostgreSQL 16 Database              │
│     (RLS Policies, FORCE ROW LEVEL SEC)     │
└─────────────────────────────────────────────┘
```

## Module Organization

Each domain entity is a self-contained NestJS module with:

- **Module** — declares controller and provides service
- **Controller** — handles HTTP routing, guards, and DTO validation
- **Service** — contains business logic, Prisma queries, state machines
- **DTO** — class-validator decorated request shapes

## Key Architectural Decisions

### Multi-Tenant Isolation

Company context is set per request using `$executeRaw` with `Prisma.sql` tagged templates
in production code. This ensures the RLS session variable is set before any tenant-scoped
query executes.

### State Machine Enforcement

Three entities implement server-side state machines (WorkOrder, Invoice, Route). Invalid
transitions return HTTP 409 Conflict. The transition maps are defined as constants in
the respective service files.

### Validation Pipeline

[VERIFY:SEC-005] NestJS ValidationPipe MUST be configured globally with `whitelist: true`
and `forbidNonWhitelisted: true` to strip/reject unknown fields.
> Implementation: `backend/src/main.ts`

[VERIFY:CQ-002] Production code MUST use NestJS Logger, never `console.log`.
> Implementation: `backend/src/main.ts`

[VERIFY:SEC-009] `$executeRaw` with `Prisma.sql` tagged templates MUST appear in
production source code (not just tests) for RLS context setup.
> Implementation: `backend/src/company-context/company-context.service.ts`

[VERIFY:CQ-003] `$executeRawUnsafe` MUST NOT appear anywhere in production code.
> Implementation: `backend/src/company-context/company-context.service.ts`

[VERIFY:CQ-001] Zero `as any` type assertions permitted across the entire codebase.
> Implementation: `backend/prisma/schema.prisma` (verified project-wide)

## Deployment Model

The application runs as two services:

1. **Backend API** — containerized NestJS application on port 3000
2. **Frontend** — Next.js application on port 3001

PostgreSQL runs as a managed database service (or Docker container in development).

## Cross-References

- See [PRODUCT_VISION.md](./PRODUCT_VISION.md) for domain entity descriptions.
- See [DATA_MODEL.md](./DATA_MODEL.md) for Prisma schema and table mappings.
- See [API_CONTRACT.md](./API_CONTRACT.md) for endpoint definitions.
