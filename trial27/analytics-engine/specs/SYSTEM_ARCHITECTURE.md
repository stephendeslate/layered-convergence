# System Architecture: Analytics Engine

## Overview

The Analytics Engine follows a modular architecture with NestJS 11 backend,
Next.js 15 frontend, and PostgreSQL with Prisma 6 ORM.

## Technology Stack

### Backend
[VERIFY:AE-007] The backend uses NestJS 11 with Prisma 6 ORM, organized into
feature modules (AuthModule, TenantModule, AnalyticsModule). Dependencies include
bcrypt for password hashing, class-validator and class-transformer for DTO
validation, and @nestjs/jwt with @nestjs/passport for authentication.

### Frontend
[VERIFY:AE-008] The frontend uses Next.js 15 with React 19, Tailwind CSS 4,
and shadcn/ui-style components. API communication uses Server Actions with
'use server' directive and response.ok validation.

## Authentication Architecture

### JWT Strategy
[VERIFY:AE-009] Authentication uses passport-jwt strategy extracting tokens
from the Authorization Bearer header. The JWT payload contains user ID, email,
tenant ID, and role for downstream authorization decisions.

### Tenant Context Propagation
[VERIFY:AE-010] Tenant isolation is enforced by setting a PostgreSQL session
variable via $executeRaw with Prisma.sql tagged template literals. This sets
app.current_tenant_id which RLS policies reference for row filtering.

## Frontend Architecture

### Server Actions
[VERIFY:AE-011] All API calls from the frontend use Next.js Server Actions
with the 'use server' directive. Each action checks response.ok before
returning data, providing error handling at the action boundary.

### Loading States
[VERIFY:AE-012] Every route includes a loading.tsx component with
role="status" and aria-busy="true" attributes for screen reader compatibility.
A spinner animation provides visual feedback during page transitions.

### Error Boundaries
[VERIFY:AE-013] Every route includes an error.tsx component with role="alert"
attribute. Error components use useRef and useEffect to automatically focus
the error heading on mount, ensuring screen readers announce the error.

## Module Dependency Graph

```
AppModule
├── PrismaModule (Global)
├── AuthModule
│   ├── PassportModule
│   └── JwtModule
├── TenantModule
└── AnalyticsModule
    └── TenantModule
```

## Deployment Architecture

The platform deploys as two services:
- Backend API server on port 3001
- Frontend Next.js server on port 3000

Both require environment variables:
- JWT_SECRET (backend, fail-fast validation)
- CORS_ORIGIN (backend, fail-fast validation)
- DATABASE_URL (backend, Prisma connection)
- API_URL (frontend, backend endpoint)

## Cross-References

- See [PRODUCT_VISION.md](./PRODUCT_VISION.md) for feature requirements
- See [API_CONTRACT.md](./API_CONTRACT.md) for endpoint specifications
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for security implementation details
