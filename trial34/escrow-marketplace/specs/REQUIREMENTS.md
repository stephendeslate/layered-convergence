# Requirements Specification — Escrow Marketplace

## Overview

Escrow Marketplace is a multi-tenant platform for secure buyer-seller transactions
with escrow protection. Built as a Turborepo monorepo with NestJS 11 backend,
Next.js 15 frontend, and shared package for types, constants, and utilities.

## Functional Requirements

### FR-1: Monorepo Architecture
Turborepo 2 with pnpm workspaces. Root turbo.json defines build/test/lint/typecheck/dev
tasks with dependsOn: ["^build"]. The shared package exports types, constants, and utilities.
The monorepo uses workspace:* protocol for inter-package dependencies, ensuring that
both apps/api and apps/web can import from @escrow-marketplace/shared with type safety.
- VERIFY: EM-FC-SHARED-001 — Shared package barrel export in packages/shared/src/index.ts
- VERIFY: EM-FC-NEST-001 — NestJS AppModule imports auth, transaction, listing modules
- VERIFY: EM-FC-NEXT-001 — Next.js home page imports from @escrow-marketplace/shared

### FR-2: Listing Management
Sellers create listings with title, description, and price. Listing titles are slugified
for URL-safe identifiers using the shared slugify() utility.
- VERIFY: EM-FC-LISTING-001 — Listing service with CRUD operations
- VERIFY: EM-CQ-SLUG-002 — slugify used for listing slug generation

### FR-3: Transaction Processing
Buyers initiate transactions on listings. Transaction flow follows a state machine
(INITIATED->FUNDED->SHIPPED->DELIVERED->COMPLETED) with dispute resolution.
Terminal states (COMPLETED, REFUNDED, CANCELLED) have no outgoing transitions.
See STATE_MACHINES.md for the complete transition map and error handling details.
- VERIFY: EM-FC-TXN-001 — Transaction service with state machine
- VERIFY: EM-UI-TXN-001 — Transactions page displays data with shared imports

### FR-4: Server Actions
Frontend uses Next.js Server Actions with 'use server' directive and response.ok checks.
- VERIFY: EM-FC-ACTION-001 — Listing server action with 'use server' and response.ok
- VERIFY: EM-FC-ACTION-002 — Transaction server action with response.ok check

### FR-5: T34 Variation — Shared Utilities
- VERIFY: EM-CQ-SLUG-001 — slugify utility in shared package
- VERIFY: EM-CQ-TRUNC-001 — truncate utility in shared package
- VERIFY: EM-CQ-UTIL-001 — Paginate utility in shared package
- VERIFY: EM-CQ-UTIL-002 — Currency formatting utility in shared package

## Non-Functional Requirements

### NFR-1: Performance
Pagination is enforced on all list endpoints with configurable page size.
The shared paginate() utility handles offset calculation and result wrapping.

### NFR-2: Security
All domain endpoints require JWT authentication. Environment variables are
validated at startup with fail-fast behavior. See SECURITY.md for details.

### NFR-3: Accessibility
WCAG 2.1 Level AA compliance. All interactive components pass jest-axe tests.
Loading states use role="status" with aria-busy="true". Error states use
role="alert" with useRef and focus management for screen reader users.

## Cross-References
- See DATA_MODEL.md for entity relationships and @@map conventions
- See AUTH_SPEC.md for authentication and authorization details
- See SECURITY.md for security requirements and fail-fast behavior
- See TESTING_STRATEGY.md for test coverage requirements
