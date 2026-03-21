# System Architecture: Escrow Marketplace

## Overview

The Escrow Marketplace uses NestJS backend with Prisma ORM and a
Next.js frontend with shadcn/ui components.

## Component Diagram

```
[Next.js Frontend] --> [NestJS API] --> [PostgreSQL]
       |                    |               |
       v                    v               v
  [shadcn/ui]         [Prisma ORM]    [RLS Policies]
```

## Technology Stack

[VERIFY:EM-007] Backend uses NestJS 11 with Prisma 6 ORM providing
type-safe database operations and migration management.

[VERIFY:EM-008] Frontend uses Next.js 15 with React 19 and Tailwind CSS 4
for a responsive, modern user interface.

[VERIFY:EM-009] Authentication uses @nestjs/jwt and @nestjs/passport with
Bearer token extraction from Authorization headers.

## Backend Architecture

Modules follow NestJS patterns:
- **AuthModule**: Registration, login, JWT validation
- **TransactionModule**: Escrow transaction lifecycle management
- **DisputeModule**: Dispute filing and resolution workflows
- **PayoutModule**: Payment processing and tracking
- **WebhookModule**: Event notification delivery

[VERIFY:EM-010] User context is set via PostgreSQL session variables using
`$executeRaw` with `Prisma.sql` tagged templates for safe SQL execution.

## Frontend Architecture

[VERIFY:EM-011] Server actions use 'use server' directive for mutations
with response.ok validation before processing results.

[VERIFY:EM-012] All routes include loading.tsx with role="status" and
aria-busy="true" for accessible loading indicators.

[VERIFY:EM-013] All routes include error.tsx with role="alert" and
useRef + useEffect focus management for screen reader accessibility.

## Deployment Model

- Backend: Containerized NestJS application
- Frontend: Next.js with SSR on cloud platform
- Database: PostgreSQL with RLS enabled

## Cross-References

- See [PRODUCT_VISION.md](./PRODUCT_VISION.md) for requirements
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for auth details
- See [API_CONTRACT.md](./API_CONTRACT.md) for endpoints
