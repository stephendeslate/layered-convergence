# Testing Strategy — Field Service Dispatch

## Overview
Comprehensive testing across backend services, API integration,
frontend accessibility, and keyboard navigation.

## Backend Testing

### Unit Tests
WorkOrderService tests with mocked Prisma client:
- findAll returns all work orders with relations
- findById returns work order with full relations
- findById returns null for non-existent order
- assignTechnician uses $executeRaw for atomic update
- completeWorkOrder uses $executeRaw for atomic completion
- countByStatus returns aggregated counts
- sumEstimatedCosts returns summed costs
<!-- VERIFY:FD-UNIT-TESTS — Service specs with mocked Prisma -->

### Integration Tests
Supertest-based API tests importing real AppModule:
- Health endpoint returns status ok
- Registration rejects ADMIN role
- Registration validates email format
- Registration rejects short passwords
- Login rejects missing fields
- Work order listing returns array
- Invoice listing returns array
<!-- VERIFY:FD-INTEGRATION-TESTS — Supertest + AppModule tests -->

### Test Database
Docker Compose test configuration with tmpfs-backed PostgreSQL.
CI uses PostgreSQL 16 service containers.

## Frontend Testing

### Accessibility Tests
jest-axe tests rendering real components:
- Button component WCAG audit
- Input + Label pairing audit
- Card component audit
- Badge component audit
- Nav component audit
- Loading state aria attributes
- Error state role verification
<!-- VERIFY:FD-ACCESSIBILITY-TESTS — jest-axe with real components -->

### Keyboard Navigation Tests
userEvent tests verifying:
- Tab order between elements
- Enter activates buttons
- Space activates buttons
- Shift+Tab reverses focus
- Disabled elements skipped
<!-- VERIFY:FD-KEYBOARD-TESTS — userEvent Tab/Enter/Space -->

## CI Integration
GitHub Actions workflow runs:
- Lint job for code style
- Test job with PostgreSQL service
- Build job for compilation
- Migration-check for schema alignment

## Seed Data
prisma/seed.ts creates sample data with state transitions:
- Work Order: PENDING -> ASSIGNED -> IN_PROGRESS -> COMPLETED
- Work Order: PENDING -> ASSIGNED -> CANCELLED
- Route: PLANNED -> ACTIVE -> COMPLETED
- Invoice: DRAFT -> SENT -> PAID
<!-- VERIFY:FD-SEED-TRANSITIONS — Seed with 2+ state transitions -->

## Coverage
- Backend: service methods covered with mocked dependencies
- Frontend: WCAG accessibility pass for all components
- Integration: all API endpoints tested
