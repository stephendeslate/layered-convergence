# System Architecture: Analytics Engine

## Overview

The Analytics Engine follows a layered architecture with NestJS backend
and Next.js frontend, connected via REST API.

## Component Diagram

```
[Next.js Frontend] --> [NestJS API] --> [PostgreSQL]
       |                    |
       v                    v
  [shadcn/ui]         [Prisma ORM]
```

## Technology Stack

[VERIFY:AE-007] Backend uses NestJS 11 with Prisma 6 ORM for type-safe
database access and automatic migration management.

[VERIFY:AE-008] Frontend uses Next.js 15 with React 19 and Tailwind CSS 4
for responsive, accessible user interfaces.

[VERIFY:AE-009] Authentication is handled via @nestjs/jwt and @nestjs/passport
with Bearer token extraction from Authorization headers.

## Backend Architecture

The backend follows NestJS module pattern with clear separation:
- **AuthModule**: Handles registration, login, and JWT validation
- **TenantModule**: Manages multi-tenant context switching
- **AnalyticsModule**: Core business logic for pipelines, dashboards, data sources

[VERIFY:AE-010] Tenant context is set via PostgreSQL session variables using
`$executeRaw` with `Prisma.sql` tagged templates for SQL injection prevention.

## Frontend Architecture

[VERIFY:AE-011] The frontend uses server actions with 'use server' directive
for secure server-side mutations and authentication flows.

[VERIFY:AE-012] All routes include loading.tsx with role="status" and
aria-busy="true" for accessible loading states.

[VERIFY:AE-013] All routes include error.tsx with role="alert" and
useRef + useEffect focus management for accessible error handling.

## Deployment Model

- Backend: Node.js process with PM2 or container orchestration
- Frontend: Next.js with SSR/ISR on Vercel or self-hosted
- Database: PostgreSQL 15+ with RLS enabled

## Cross-References

- See [PRODUCT_VISION.md](./PRODUCT_VISION.md) for feature requirements
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for authentication flow
- See [API_CONTRACT.md](./API_CONTRACT.md) for endpoint specifications
