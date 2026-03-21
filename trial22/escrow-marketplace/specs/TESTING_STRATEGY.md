# Testing Strategy — Escrow Marketplace

## Overview

Testing uses a dual-framework approach: Jest for backend integration tests with
real NestJS modules and a real PostgreSQL database, and Vitest for frontend
component and accessibility tests. All frontend tests include axe-core
accessibility checks.

See: [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) for module structure being tested.
See: [API_CONTRACT.md](API_CONTRACT.md) for endpoint specifications under test.

<!-- VERIFY:TS-001 — Backend tests use Test.createTestingModule with real modules -->
<!-- VERIFY:TS-002 — Integration tests run against real PostgreSQL database -->
<!-- VERIFY:TS-003 — All frontend tests include axe-core accessibility checks -->
<!-- VERIFY:TS-004 — Keyboard navigation tests exist for interactive components -->
<!-- VERIFY:TS-005 — State machine transition tests cover all valid and invalid paths -->

## Backend Testing (Jest)

### Integration Test Setup
```typescript
const moduleRef = await Test.createTestingModule({
  imports: [AppModule],
}).compile();
```

Tests use REAL modules (not mocks) with a real PostgreSQL database provided
by Docker Compose. See `docker-compose.test.yml` for test database configuration.

### Test Categories

#### Authentication Tests
- Registration with valid BUYER role succeeds
- Registration with valid SELLER role succeeds
- Registration with ADMIN role is rejected (403)
  See [SECURITY_MODEL.md](SECURITY_MODEL.md) for defense-in-depth rationale
- Login with valid credentials returns JWT
- Login with invalid credentials returns 401
- Protected routes reject missing JWT

#### Transaction State Machine Tests
All valid transitions (see [DATA_MODEL.md](DATA_MODEL.md) for status enum):
- PENDING -> FUNDED (buyer funds escrow)
- FUNDED -> SHIPPED (seller marks shipped)
- SHIPPED -> DELIVERED (buyer confirms receipt)
- DELIVERED -> COMPLETED (funds released)
- FUNDED -> DISPUTE (dispute filed)
- SHIPPED -> DISPUTE (dispute filed)
- DELIVERED -> DISPUTE (dispute filed)
- DISPUTE -> REFUNDED (resolved in buyer's favor)
- DISPUTE -> FUNDED (dispute dismissed)

Invalid transitions (should throw 400):
- PENDING -> SHIPPED (skipping FUNDED)
- COMPLETED -> any (terminal state)
- REFUNDED -> any (terminal state)

#### Dispute Tests
- Only transaction participants can file disputes
- Dispute creation transitions transaction to DISPUTE status
- Resolution can set transaction to REFUNDED or back to previous state

#### Payout Tests
- Payout created automatically when transaction reaches COMPLETED
- Payout amount matches transaction amount (Decimal precision)
- Only seller receives payouts

#### Ownership Tests
- Users cannot access transactions they are not party to
- Users cannot access disputes on other users' transactions
- Users cannot access other users' payouts

### Test Database Management
- Each test suite gets a clean database state
- Migrations run before test suite starts
- Transactions are rolled back or data is cleaned between tests
- See [SECURITY_MODEL.md](SECURITY_MODEL.md) for RLS policy behavior in tests

## Frontend Testing (Vitest)

### Component Tests
Every component test file includes:

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

it('has no accessibility violations', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Accessibility Tests
- axe-core automated checks in every test file
- Skip-to-content link presence and functionality
- Dark mode rendering (prefers-color-scheme)
- See [UI_SPECIFICATION.md](UI_SPECIFICATION.md) for accessibility requirements

### Keyboard Navigation Tests
- Tab order through form fields
- Enter/Space to activate buttons
- Escape to close dialogs
- Arrow keys in select components
- Focus management after navigation

### Pages Under Test
- Login page: form validation, submit, error display
- Register page: role selection, validation
- Transactions list: table rendering, status badges
- Transaction detail: state display, action buttons
- Disputes list and detail pages
- Payouts list page

## Test Environment

### docker-compose.test.yml
```yaml
services:
  db-test:
    image: postgres:16
    environment:
      POSTGRES_DB: escrow_test
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
    ports:
      - "5433:5432"
```

### Environment Variables for Tests
```
DATABASE_URL=postgresql://test:test@localhost:5433/escrow_test
JWT_SECRET=test-secret-key
CORS_ORIGIN=http://localhost:3000
```

## Coverage Targets

- Backend: 80%+ line coverage on services and controllers
- Frontend: 80%+ line coverage on components and pages
- All state machine paths must have explicit test cases
- See [PRODUCT_VISION.md](PRODUCT_VISION.md) for success metrics that tests validate
