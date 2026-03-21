# System Architecture: Escrow Marketplace

## Overview

The Escrow Marketplace uses a modular NestJS 11 backend with Next.js 15
frontend, designed for secure financial transaction processing.

## Technology Stack

### Backend
[VERIFY:EM-007] The backend uses NestJS 11 with Prisma 6 ORM. Feature modules
include AuthModule, TransactionModule, DisputeModule, PayoutModule, and
WebhookModule. Dependencies include bcrypt, class-validator, class-transformer,
@nestjs/jwt, and @nestjs/passport.

### Frontend
[VERIFY:EM-008] The frontend exposes transaction management endpoints with JWT
authentication. Next.js 15 with React 19 serves the UI with Tailwind CSS 4
and shadcn/ui components.

## Authentication Architecture

### JWT Strategy
[VERIFY:EM-009] Authentication uses passport-jwt strategy extracting Bearer
tokens from the Authorization header. JWT payload includes user ID, email,
and role for authorization decisions.

### User Context Propagation
[VERIFY:EM-010] User context is set via $executeRaw with Prisma.sql tagged
template literals for RLS enforcement. The app.current_user_id session
variable scopes database queries to the authenticated user.

## Frontend Architecture

### Server Actions
[VERIFY:EM-011] All API calls use Next.js Server Actions with 'use server'
directive. Each action validates response.ok before returning data,
providing consistent error handling across the application.

### Loading States
[VERIFY:EM-012] Every route includes a loading.tsx with role="status" and
aria-busy="true" for screen reader accessibility. Visual spinners provide
feedback during page transitions.

### Error Boundaries
[VERIFY:EM-013] Every route includes an error.tsx with role="alert" attribute.
Error components use useRef and useEffect to focus the error heading on
mount for screen reader announcement.

## Module Structure

```
AppModule
├── PrismaModule (Global)
├── AuthModule
│   ├── PassportModule
│   └── JwtModule
├── TransactionModule
├── DisputeModule
├── PayoutModule
└── WebhookModule
```

## Deployment

- Backend API: port 3002
- Frontend: port 3000
- Required env: JWT_SECRET, CORS_ORIGIN, DATABASE_URL

## Cross-References

- See [PRODUCT_VISION.md](./PRODUCT_VISION.md) for feature requirements
- See [API_CONTRACT.md](./API_CONTRACT.md) for endpoint specifications
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for security implementation
