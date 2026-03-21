# System Architecture: Field Service Dispatch

## Overview

The system follows a modular NestJS backend with Prisma ORM and a Next.js
frontend with React Server Components and Server Actions.

## Backend Architecture

[VERIFY:FD-007] The backend uses Prisma 6 ORM with 8 entities: Company, User,
Customer, Technician, WorkOrder, Route, GpsEvent, and Invoice. All models
use @@map for snake_case table names and @map for multi-word column names.

[VERIFY:FD-008] Work order operations are exposed via a REST controller with
JWT-protected endpoints for CRUD, state transitions, and technician assignment.

[VERIFY:FD-009] Authentication uses Passport JWT strategy extracting Bearer
tokens from the Authorization header. The JWT payload contains user ID, email,
and role for authorization decisions.

## Company Context

[VERIFY:FD-010] Multi-tenant isolation is achieved by setting a PostgreSQL
session variable via $executeRaw with Prisma.sql tagged templates. The
company context is set before every database operation to activate RLS policies.

## Frontend Architecture

[VERIFY:FD-011] The frontend communicates with the backend via Server Actions
using the 'use server' directive. Every fetch call checks response.ok before
processing results, returning structured error objects on failure.

[VERIFY:FD-012] Every route includes a loading.tsx with role="status" and
aria-busy="true" for accessible loading states that communicate progress
to screen readers.

[VERIFY:FD-013] Every route includes an error.tsx with role="alert" and
automatic focus management via useRef and useEffect to ensure errors are
immediately announced to assistive technology.

## Module Structure

```
AuthModule     — Registration, login, JWT strategy
CompanyModule  — Company CRUD, tenant context
WorkOrderModule — Work order CRUD, state machine
RouteModule    — Route planning and lifecycle
InvoiceModule  — Invoice generation and payment tracking
```

## Cross-References

- See [PRODUCT_VISION.md](./PRODUCT_VISION.md) for business context
- See [DATA_MODEL.md](./DATA_MODEL.md) for entity relationships
- See [API_CONTRACT.md](./API_CONTRACT.md) for endpoint specifications
