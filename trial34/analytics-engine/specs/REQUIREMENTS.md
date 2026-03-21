# Requirements Specification — Analytics Engine

## Overview

Analytics Engine is a multi-tenant analytics platform providing dashboard management,
data pipeline orchestration, widget configuration, report scheduling, and audit logging.
Built as a Turborepo monorepo with NestJS 11 backend, Next.js 15 frontend, and shared package.

## Functional Requirements

### FR-1: Monorepo Architecture
The project uses Turborepo 2 with pnpm workspaces. Root turbo.json defines build/test/lint/typecheck/dev
tasks with dependsOn: ["^build"]. The shared package (@analytics-engine/shared) exports types,
constants, and utilities consumed by both apps.
- VERIFY: AE-FC-SHARED-001 — Shared package barrel export in packages/shared/src/index.ts
- VERIFY: AE-FC-NEST-001 — NestJS AppModule imports auth, dashboard, pipeline modules
- VERIFY: AE-FC-NEXT-001 — Next.js home page imports from @analytics-engine/shared

### FR-2: Dashboard Management
Users can create, view, and manage analytics dashboards within their tenant scope.
Dashboard names are slugified for URL-safe identifiers using the shared slugify() utility.
- VERIFY: AE-FC-DASH-001 — Dashboard service with CRUD operations

### FR-3: Pipeline Orchestration
Data pipelines have a defined state machine (PENDING->RUNNING->COMPLETED/FAILED/CANCELLED).
Pipeline names are also slugified. Status transitions are validated server-side.
- VERIFY: AE-UI-PIPE-001 — Pipelines page displays pipeline data with shared imports

### FR-4: Server Actions
Frontend uses Next.js Server Actions with 'use server' directive. All fetch calls check response.ok
before returning data. See AUTH_SPEC.md and API_SPEC.md for endpoint details.
- VERIFY: AE-FC-ACTION-001 — Dashboard server action with 'use server' and response.ok
- VERIFY: AE-FC-ACTION-002 — Pipeline server action with response.ok check

### FR-5: T34 Variation — Shared Utilities
The shared package exports slugify() for URL-safe slug generation (used by backend services)
and truncate() for text display truncation (used by frontend components).
- VERIFY: AE-CQ-SLUG-001 — slugify utility in shared package
- VERIFY: AE-CQ-TRUNC-001 — truncate utility in shared package

## Non-Functional Requirements

### NFR-1: Performance
- Pagination via shared paginate() utility with MAX_PAGE_SIZE of 100
- VERIFY: AE-CQ-UTIL-001 — Paginate utility in shared package

### NFR-2: Date Formatting
- Consistent date formatting via shared formatDate() utility
- VERIFY: AE-CQ-UTIL-002 — Date formatting utility in shared package

## Cross-References
- See DATA_MODEL.md for entity relationships and @@map conventions
- See AUTH_SPEC.md for authentication and authorization details
- See SECURITY.md for security requirements and fail-fast behavior
- See TESTING_STRATEGY.md for test coverage requirements
