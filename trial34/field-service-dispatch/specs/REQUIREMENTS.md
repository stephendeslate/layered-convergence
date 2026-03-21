# Requirements Specification — Field Service Dispatch

## Overview

Field Service Dispatch is a multi-tenant work order management platform providing
technician dispatch, service area tracking, equipment management, and audit logging.
Built as a Turborepo monorepo with NestJS 11 backend, Next.js 15 frontend, and shared package.

## Functional Requirements

### FR-1: Monorepo Architecture
The project uses Turborepo 2 with pnpm workspaces. Root turbo.json defines build/test/lint/typecheck/dev
tasks with dependsOn: ["^build"]. The shared package (@field-service-dispatch/shared) exports types,
constants, and utilities consumed by both apps via workspace:* protocol.
- VERIFY: FD-FC-SHARED-001 — Shared package barrel export in packages/shared/src/index.ts
- VERIFY: FD-FC-NEST-001 — NestJS AppModule imports auth, workorder, technician modules
- VERIFY: FD-FC-NEXT-001 — Next.js home page imports from @field-service-dispatch/shared

### FR-2: Work Order Management
Users can create, view, and manage field service work orders within their tenant scope.
Work orders follow a state machine lifecycle (CREATED->ASSIGNED->IN_PROGRESS->COMPLETED)
with additional states for escalation and cancellation. See STATE_MACHINES.md for details.
- VERIFY: FD-FC-WO-001 — WorkOrder service with CRUD and status transition operations

### FR-3: Server Actions
Frontend uses Next.js Server Actions with 'use server' directive. All fetch calls check response.ok
before returning data. Two action files cover work orders and technicians.
- VERIFY: FD-FC-ACTION-001 — WorkOrder server action with 'use server' and response.ok
- VERIFY: FD-FC-ACTION-002 — Technician server action with response.ok check

### FR-4: T34 Variation — Shared Utilities
The shared package exports slugify() for URL-safe slug generation (used by backend services)
and truncate() for text display truncation (used by frontend components).
- VERIFY: FD-CQ-SLUG-001 — slugify utility in shared package
- VERIFY: FD-CQ-TRUNC-001 — truncate utility in shared package

## Non-Functional Requirements

### NFR-1: Performance
Pagination via shared paginate() utility with MAX_PAGE_SIZE of 100 and DEFAULT_PAGE_SIZE of 20.
All list endpoints return paginated results to prevent unbounded queries.
- VERIFY: FD-CQ-UTIL-001 — Paginate utility in shared package

### NFR-2: Duration Formatting
Consistent duration formatting via shared formatDuration() utility for service time tracking.
Used to display estimated and actual service durations in work order listings.
- VERIFY: FD-CQ-UTIL-002 — Duration formatting utility in shared package

### NFR-3: Security
CORS origin and JWT secret are required environment variables with fail-fast validation.
bcrypt salt factor of 12 for password hashing. RLS on all tables for tenant isolation.
See SECURITY.md and AUTH_SPEC.md for detailed security specifications.

### NFR-4: Accessibility
All routes include loading.tsx (role="status" + aria-busy="true") and error.tsx
(role="alert" + useRef + focus management). UI components pass jest-axe validation.
See TESTING_STRATEGY.md for accessibility test coverage.

## Cross-References
- See DATA_MODEL.md for entity relationships and @@map conventions
- See AUTH_SPEC.md for authentication and authorization details
- See SECURITY.md for security requirements and fail-fast behavior
- See TESTING_STRATEGY.md for test coverage requirements
