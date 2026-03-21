# System Architecture

## Overview

The Escrow Marketplace follows a client-server architecture with a NestJS 11 backend API and Next.js 15 frontend. Communication occurs via REST API with JWT-based authentication.

## Architecture Layers

```
┌─────────────────────────────────────────┐
│           Next.js 15 Frontend           │
│  (Server Components + Server Actions)   │
├─────────────────────────────────────────┤
│              REST API (JSON)            │
├─────────────────────────────────────────┤
│           NestJS 11 Backend             │
│   (Controllers → Services → Prisma)    │
├─────────────────────────────────────────┤
│        PostgreSQL 16 + RLS              │
└─────────────────────────────────────────┘
```

## Backend Architecture

### [VERIFY:SA-001] Server Bootstrap and Configuration
The NestJS application must bootstrap with explicit configuration for CORS, global validation pipes, and cookie parsing. CORS_ORIGIN must be a required environment variable with fail-fast behavior (throw Error if missing, no fallback). JWT_SECRET must also fail-fast.

**Traced to**: `backend/src/main.ts`

### [VERIFY:SA-002] Module Organization
The application must use NestJS module system with the following domain modules:
- `PrismaModule` (global) - Database connectivity
- `AuthModule` - Authentication and authorization
- `TransactionModule` - Transaction lifecycle management
- `DisputeModule` - Dispute creation and resolution
- `PayoutModule` - Payout processing
- `WebhookModule` - Event notification delivery

**Traced to**: `backend/src/app.module.ts`

### [VERIFY:SA-003] Webhook Event Delivery
The webhook system must support asynchronous event delivery with status tracking (PENDING, SENT, FAILED). Webhook payloads must be stored for audit purposes.

**Traced to**: `backend/src/webhook/webhook.service.ts`

### [VERIFY:SA-004] Server Actions for Mutations
All frontend mutations must use Next.js Server Actions. Every Server Action must check `response.ok` before calling `redirect()` to prevent redirecting on error responses.

**Traced to**: `frontend/app/actions.ts`

### [VERIFY:SA-005] Server Component Session Management
Navigation and authenticated pages must use async server components that read session data from cookies. Cookie-based session management enables server-side rendering without client-side state hydration.

**Traced to**: `frontend/components/nav.tsx`

## Frontend Architecture

- **App Router**: File-system based routing with `page.tsx`, `loading.tsx`, `error.tsx` conventions
- **Server Components**: Default for data fetching pages (transactions, disputes, payouts, webhooks)
- **Client Components**: Used only for interactive forms (`'use client'` directive)
- **Server Actions**: All mutations routed through `app/actions.ts`

## Infrastructure

- **Database**: PostgreSQL 16 with Row Level Security
- **ORM**: Prisma 6 with tagged template `$executeRaw` for RLS context
- **Container**: Docker Compose for development and testing
