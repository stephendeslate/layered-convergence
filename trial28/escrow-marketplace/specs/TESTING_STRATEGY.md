# Testing Strategy — Escrow Marketplace

## Overview
Comprehensive testing across backend services, API integration,
frontend accessibility, and keyboard navigation.

## Backend Testing

### Unit Tests
TransactionService tests with mocked Prisma client:
- findAll returns all transactions
- findById returns transaction with relations
- transitionStatus updates status correctly
- releaseTransaction uses $executeRaw
- sumByStatus returns aggregated amounts
<!-- VERIFY:EM-UNIT-TESTS — Service specs with mocked Prisma -->

### Integration Tests
Supertest-based API tests importing real AppModule:
- Health endpoint returns status ok
- Registration rejects ADMIN role
- Registration validates email format
- Registration rejects short passwords
- Login rejects incomplete requests
- Transaction listing returns array
- Dispute listing returns array
<!-- VERIFY:EM-INTEGRATION-TESTS — Supertest + AppModule tests -->

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
<!-- VERIFY:EM-ACCESSIBILITY-TESTS — jest-axe with real components -->

### Keyboard Navigation Tests
userEvent tests verifying:
- Tab order between elements
- Enter activates buttons
- Space activates buttons
- Shift+Tab reverses focus
- Disabled elements skipped
<!-- VERIFY:EM-KEYBOARD-TESTS — userEvent Tab/Enter/Space -->

## CI Integration
GitHub Actions workflow runs:
- Lint job for code style
- Test job with PostgreSQL service
- Build job for compilation
- Migration-check for schema alignment

## Seed Data
prisma/seed.ts creates sample data with state transitions:
- Transaction: PENDING -> FUNDED -> RELEASED
- Transaction: PENDING -> FUNDED -> DISPUTED
- Dispute: OPEN -> UNDER_REVIEW -> RESOLVED
<!-- VERIFY:EM-SEED-TRANSITIONS — Seed with 2+ state transitions -->

## Coverage
- Backend: service methods covered with mocked dependencies
- Frontend: WCAG accessibility pass for all components
- Integration: all API endpoints tested
