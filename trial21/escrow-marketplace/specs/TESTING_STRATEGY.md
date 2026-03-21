# Testing Strategy

## Overview

The Escrow Marketplace uses a multi-layered testing approach: unit tests for business logic, integration tests for API workflows, and accessibility tests for frontend components.

## Backend Unit Tests

### [VERIFY:TS-001] Auth Service Tests
Unit tests must verify: user registration with bcrypt hashing, login with credential validation, JWT token generation, and duplicate email rejection.

**Traced to**: `backend/src/auth/auth.service.spec.ts`

### [VERIFY:TS-002] Transaction Service Tests
Unit tests must verify: transaction creation, listing with user-scoped queries, single transaction retrieval, and status update with state machine validation including role-based transition rejection.

**Traced to**: `backend/src/transaction/transaction.service.spec.ts`

### [VERIFY:TS-003] Dispute Service Tests
Unit tests must verify: dispute creation with OPEN status, dispute resolution with RESOLVED status, and single dispute retrieval.

**Traced to**: `backend/src/dispute/dispute.service.spec.ts`

### [VERIFY:TS-004] Payout Service Tests
Unit tests must verify: payout creation, single payout retrieval, and duplicate payout rejection for the same transaction.

**Traced to**: `backend/src/payout/payout.service.spec.ts`

## Backend Integration Tests

### [VERIFY:TS-005] Auth Integration Tests
Integration tests must use NestJS TestingModule with the full AppModule to verify end-to-end registration and login flows against a real PostgreSQL database.

**Traced to**: `backend/test/auth.integration.spec.ts`

### [VERIFY:TS-006] Transaction State Machine Integration Tests
Integration tests must verify the complete transaction lifecycle state machine (PENDING -> FUNDED -> SHIPPED -> DELIVERED) against a real database, ensuring state transitions are enforced correctly.

**Traced to**: `backend/test/transaction.integration.spec.ts`

## Frontend Tests

- **Component tests**: Button, Card, Input, Label, Badge with axe-core accessibility checks
- **Page tests**: Login and Register pages with form rendering, error states, keyboard navigation
- **Loading tests**: All 7 loading components verified for `role="status"` and `aria-busy="true"`
- **Error boundary test**: Error page with `role="alert"`, reset functionality, keyboard accessibility
- **Validation tests**: `validateRequiredString` and `validateRequiredNumber` helper functions

## Accessibility Testing

- All frontend tests include `jest-axe` accessibility scans
- Keyboard navigation verified for all interactive forms
- ARIA attributes verified on loading states and error boundaries
- Screen reader semantics tested via role queries

## Test Infrastructure

- **Backend unit tests**: Jest with NestJS TestingModule, mocked Prisma service
- **Backend integration tests**: Docker Compose with PostgreSQL 16 test container (port 5433)
- **Frontend tests**: Jest with @testing-library/react, jest-axe, @testing-library/user-event
- **CI pipeline**: Tests run on every pull request
