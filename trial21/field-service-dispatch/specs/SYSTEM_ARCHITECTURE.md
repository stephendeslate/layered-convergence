# System Architecture

## Overview

The system follows a layered architecture with a NestJS 11 backend API server
and a Next.js 15 frontend. PostgreSQL 16 serves as the primary data store with
Prisma 6 as the ORM layer. Multi-tenant isolation is enforced at both the
application and database layers.

## Backend Architecture

[VERIFY:SA-001] The backend SHALL use NestJS 11 with global validation pipes
(whitelist, forbidNonWhitelisted, transform) and CORS enabled. The application
performs fail-fast checks for JWT_SECRET and CORS_ORIGIN environment variables
at startup and listens on port 3001 by default.
→ Implementation: backend/src/main.ts:6

[VERIFY:SA-002] The backend SHALL follow NestJS modular architecture with
dedicated modules for: Auth, Customer, Technician, WorkOrder, Route, GpsEvent,
Invoice, Prisma, and CompanyContext. Each domain module encapsulates its
controller, service, and DTOs.
→ Implementation: backend/src/app.module.ts:13

## Database Layer

[VERIFY:SA-003] The system SHALL use Prisma 6 as the ORM with PostgreSQL 16
as the database engine. Geographic coordinates (GpsEvent.lat, GpsEvent.lng)
use Float type for latitude/longitude values.
→ Implementation: backend/prisma/schema.prisma:151

[VERIFY:SA-004] Monetary values (Invoice.amount, Invoice.tax, Invoice.total)
SHALL use Decimal(12,2) precision to prevent floating-point rounding errors
in financial calculations. See [DATA_MODEL.md](DATA_MODEL.md) for field details.
→ Implementation: backend/prisma/schema.prisma:167

## Service Layer

[VERIFY:SA-005] The PrismaService SHALL extend PrismaClient and implement
OnModuleInit and OnModuleDestroy lifecycle hooks for database connection
management. It is provided as a global module available to all feature modules.
→ Implementation: backend/src/prisma/prisma.service.ts:5

## Frontend Architecture

The frontend uses Next.js 15 App Router with Server Components for data fetching
and Client Components for interactive forms. All mutations use Server Actions
defined in a centralized actions.ts file. The component library is shadcn/ui
with Radix UI primitives. See [UI_SPECIFICATION.md](UI_SPECIFICATION.md) for
component details.

## Request Flow

1. Frontend Server Action sends HTTP request with Bearer JWT token
2. NestJS JwtAuthGuard validates the token and extracts user context
3. Controller extracts companyId from the authenticated request
4. Service calls CompanyContextService.setCompanyContext(companyId) to set RLS
5. Prisma queries execute with RLS policies enforcing tenant isolation
6. Response returns JSON to the frontend

## Deployment

- Backend: Node.js process on port 3001
- Frontend: Next.js server on port 3000
- Database: PostgreSQL 16 with RLS policies enabled with FORCE
- Test database: Docker Compose with PostgreSQL 16 container (port 5433)
- Environment variables: JWT_SECRET, CORS_ORIGIN, DATABASE_URL (all required)
