# Testing Strategy — Field Service Dispatch

## Overview

Testing follows a pyramid approach with unit tests at the base, integration tests in the middle, and end-to-end accessibility tests at the top. The critical requirement is that integration tests use a REAL database — never mocked Prisma methods.

## Backend Testing (Jest)

### Unit Tests
- Test pure business logic functions (state machine transitions, invoice calculations)
- Mock external dependencies (not Prisma — that is for integration tests)
- Located alongside source files as `*.spec.ts`

### Integration Tests (CRITICAL)
<!-- VERIFY:TS-001 Integration tests use real database operations, not Prisma mocks -->
Integration tests are the primary quality gate for backend services. They MUST:
1. Import real NestJS modules via `Test.createTestingModule`
2. Use the real `PrismaService` — NO `jest.spyOn` on Prisma methods
3. Perform actual database CRUD operations against a test PostgreSQL instance
4. Use `beforeAll` / `afterAll` for test data setup and teardown
5. Test service behavior through NestJS dependency injection

**Correct pattern:**
```typescript
const module = await Test.createTestingModule({
  imports: [WorkOrderModule, PrismaModule, CompanyContextModule],
}).compile();
const service = module.get(WorkOrderService);
const prisma = module.get(PrismaService);

// Create REAL records
const company = await prisma.company.create({ data: { name: 'Test Co' } });
// Test REAL service methods
const result = await service.create(dto, companyId);
```

**Prohibited patterns:**
```typescript
// NEVER DO THIS — makes it a unit test, not integration
jest.spyOn(prisma.workOrder, 'findFirst').mockResolvedValue(mockData);
jest.spyOn(prisma.workOrder, 'create').mockResolvedValue(mockData);
```

<!-- VERIFY:TS-002 Integration tests located in backend/test/ directory -->
Integration test files are in `backend/test/` and named `*.integration.spec.ts`.

### Test Database
<!-- VERIFY:TS-003 Docker Compose provides test PostgreSQL instance -->
A dedicated PostgreSQL instance is provisioned via `docker-compose.test.yml`. Tests connect to this instance using a separate `DATABASE_URL`. Prisma migrations are applied before tests run.

## Frontend Testing (Vitest)

### Component Tests
- Test React components with Vitest and Testing Library
- Located in `frontend/__tests__/`

### Accessibility Tests
<!-- VERIFY:TS-004 axe-core accessibility tests on all pages -->
Every page is tested with axe-core to ensure WCAG compliance:
- No accessibility violations on rendered pages
- Keyboard navigation tests for interactive elements
- Skip-to-content link verification
- `role="status"` on loading states
- `role="alert"` on error states

## Test Infrastructure

### docker-compose.test.yml
Provides:
- PostgreSQL 16 on port 5433 (to avoid conflicts with dev DB)
- Health check to ensure DB is ready before tests run

### CI Pipeline
1. Start test database via Docker Compose
2. Run Prisma migrations
3. Execute backend integration tests
4. Execute backend unit tests
5. Execute frontend component tests
6. Report coverage

## Coverage Targets

- Backend services: 80%+ line coverage
- Frontend components: 70%+ line coverage
- Integration tests: Cover all CRUD operations and state machine transitions
