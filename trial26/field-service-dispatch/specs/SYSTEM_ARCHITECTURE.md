# System Architecture: Field Service Dispatch

## Overview

Field Service Dispatch uses NestJS backend with Prisma ORM and a
Next.js frontend with shadcn/ui for responsive field service UI.

## Component Diagram

```
[Next.js Frontend] --> [NestJS API] --> [PostgreSQL]
       |                    |               |
       v                    v               v
  [shadcn/ui]         [Prisma ORM]    [RLS Policies]
                           |
                      [GPS Events]
```

## Technology Stack

[VERIFY:FD-007] Backend uses NestJS 11 with Prisma 6 ORM for type-safe
database access with migration management.

[VERIFY:FD-008] Frontend uses Next.js 15 with React 19 and Tailwind CSS 4
for responsive interfaces suited to field technician tablet use.

[VERIFY:FD-009] Authentication via @nestjs/jwt and @nestjs/passport with
Bearer token extraction for API access control.

## Backend Architecture

NestJS modules:
- **AuthModule**: Registration, login, JWT token management
- **CompanyModule**: Multi-company context and isolation
- **WorkOrderModule**: Work order lifecycle management
- **RouteModule**: Route planning, GPS event recording
- **InvoiceModule**: Invoice creation and payment tracking

[VERIFY:FD-010] Company context set via PostgreSQL session variables using
`$executeRaw` with `Prisma.sql` tagged templates for injection prevention.

## Frontend Architecture

[VERIFY:FD-011] Server actions use 'use server' directive for secure
mutations with response.ok validation before processing.

[VERIFY:FD-012] All routes include loading.tsx with role="status" and
aria-busy="true" for accessible loading states.

[VERIFY:FD-013] All routes include error.tsx with role="alert" and
useRef + useEffect focus management for error accessibility.

## Deployment Model

- Backend: Containerized NestJS with horizontal scaling
- Frontend: Next.js with SSR
- Database: PostgreSQL 15+ with RLS

## Cross-References

- See [PRODUCT_VISION.md](./PRODUCT_VISION.md) for feature requirements
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for authentication
- See [API_CONTRACT.md](./API_CONTRACT.md) for endpoint specifications
