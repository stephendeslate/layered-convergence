# System Architecture — Analytics Engine

## Overview

The Analytics Engine follows a layered architecture with a NestJS 11 backend serving a Next.js 15
frontend. Data persistence uses Prisma 6 ORM against PostgreSQL 16 with row-level security.

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend Framework | NestJS | ^11.0.0 |
| ORM | Prisma | ^6.0.0 |
| Database | PostgreSQL | 16 |
| Frontend Framework | Next.js | ^15.0.0 |
| CSS Framework | Tailwind CSS | ^4.0.0 |
| Component Library | shadcn/ui (Radix) | Latest |

## Module Architecture

The backend is organized into domain modules, each encapsulating its own controller, service,
and DTOs. All modules are registered in the root AppModule.

[VERIFY:SA-001] NestJS modular architecture — all domain modules registered in AppModule.
> Implementation: `backend/src/app.module.ts:2`

### Core Infrastructure

The PrismaModule provides database access across the entire application as a global module,
eliminating the need to import it in every feature module.

[VERIFY:SA-002] PrismaService extends PrismaClient and is globally available via PrismaModule.
> Implementation: `backend/src/prisma/prisma.service.ts:5`

[VERIFY:SA-003] PrismaModule is decorated with @Global for application-wide availability.
> Implementation: `backend/src/prisma/prisma.module.ts:4`

### Authentication Layer

JWT-based authentication protects all endpoints except login and registration. The JwtStrategy
validates tokens extracted from Bearer authorization headers.

[VERIFY:SA-004] JwtStrategy validates JWT tokens via passport for endpoint protection.
> Implementation: `backend/src/auth/jwt.strategy.ts:11`

### Data Architecture Conventions

All Prisma models follow naming conventions for PostgreSQL compatibility. Model names use
PascalCase in the schema but map to snake_case table names.

[VERIFY:SA-005] All models use @@map for PostgreSQL snake_case table names.
> Implementation: `backend/prisma/schema.prisma:51`

### Frontend Component Architecture

The frontend uses 8 shadcn/ui components built on Radix primitives, providing accessible and
consistent UI elements across all pages.

[VERIFY:SA-006] 8 shadcn/ui components in components/ui/ (button, card, input, label, select, badge, table, dialog).
> Implementation: `frontend/components/ui/button.tsx:3`

### Accessibility Infrastructure

The root layout includes a skip-to-content link for keyboard users, following WCAG 2.1 AA
guidelines for bypass blocks (Success Criterion 2.4.1).

[VERIFY:SA-007] Skip-to-content link with sr-only class in root layout for keyboard navigation.
> Implementation: `frontend/app/layout.tsx:3`

## Deployment Model

The application runs as two separate services:
- Backend API server on port 3000 (NestJS)
- Frontend SSR server on port 3001 (Next.js)

PostgreSQL runs on the standard port 5432 with RLS policies applied via migration scripts
(see [SECURITY_MODEL.md](SECURITY_MODEL.md)).

## Cross-References

- **PRODUCT_VISION.md**: Defines the capabilities this architecture supports
- **DATA_MODEL.md**: Specifies entity schemas mapped to PostgreSQL tables
- **API_CONTRACT.md**: Documents the REST endpoints exposed by each NestJS module
- **TESTING_STRATEGY.md**: Describes how modules are tested in isolation and integration
