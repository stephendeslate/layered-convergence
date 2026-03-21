# Testing Strategy

## Overview

Analytics Engine follows a test pyramid approach with three layers: unit tests (Jest +
@nestjs/testing), integration tests (NestJS Test.createTestingModule with real database
interactions), and frontend component tests (Vitest + React Testing Library + axe-core).

## Test Pyramid

```
        ┌──────────┐
        │ E2E (TBD)│  (future: Playwright)
        ├──────────┤
      ┌─┤Integration├─┐  NestJS Test.createTestingModule
      │ ├──────────┤   │  Real service interactions
    ┌─┤ │  Unit    │   ├─┐  Jest mocks + Vitest
    │ │ └──────────┘   │ │  Component isolation
    │ └────────────────┘ │
    └────────────────────┘
```

## Unit Tests

[VERIFY:TS-001] Auth service unit tests MUST use @nestjs/testing Test.createTestingModule with mocked dependencies.
> Implementation: `src/auth/auth.service.spec.ts:1` — Test.createTestingModule with PrismaService and JwtService mocks

Unit tests verify individual service methods in isolation. Dependencies (PrismaService,
JwtService, TenantContextService) are replaced with Jest mock objects. Each service module
has a corresponding `.spec.ts` file:

| Service | Test File | Key Scenarios |
|---------|-----------|---------------|
| AuthService | `auth.service.spec.ts` | register, login, password hashing, invalid credentials |
| PipelineService | `pipeline.service.spec.ts` | state transitions, invalid transitions, CRUD |
| DashboardService | `dashboard.service.spec.ts` | create, findAll, findOne with widgets, delete |
| DataSourceService | `data-source.service.spec.ts` | CRUD operations, tenant scoping |
| DataPointService | `data-point.service.spec.ts` | create with Decimal, findAll |
| WidgetService | `widget.service.spec.ts` | CRUD by dashboard |
| EmbedService | `embed.service.spec.ts` | token lookup, expiration check, CRUD |
| SyncRunService | `sync-run.service.spec.ts` | status tracking |
| TenantContextService | `tenant-context.service.spec.ts` | RLS context setting |

## Pipeline State Machine Tests

[VERIFY:TS-002] Pipeline unit tests MUST verify all valid transitions AND reject invalid transitions.
> Implementation: `src/pipeline/pipeline.service.spec.ts:1` — tests for each valid/invalid transition pair

The pipeline state machine tests cover:
- All 6 valid transitions (DRAFT->ACTIVE, ACTIVE->PAUSED, ACTIVE->DRAFT, PAUSED->ACTIVE,
  PAUSED->ARCHIVED, ARCHIVED->DRAFT)
- Invalid transitions (e.g., DRAFT->ARCHIVED, DRAFT->PAUSED) return BadRequestException
- State persistence after transition

## Integration Tests

[VERIFY:TS-003] Pipeline state machine integration tests MUST use Test.createTestingModule with service-layer testing.
> Implementation: `__integration__/pipeline-state-machine.spec.ts:1` — full module bootstrap with PrismaService

[VERIFY:TS-004] Tenant isolation integration tests MUST verify cross-tenant query isolation.
> Implementation: `__integration__/tenant-isolation.spec.ts:1` — tests that tenant A cannot access tenant B data

Integration tests bootstrap real NestJS modules with Test.createTestingModule and interact with
a PostgreSQL test database (configured via `docker-compose.test.yml`). They verify:

1. **Pipeline state machine** — end-to-end state transitions through the service layer
2. **Tenant isolation** — data created by tenant A is invisible to tenant B queries

## Frontend Tests

Frontend tests use Vitest with React Testing Library and axe-core for accessibility validation.
Each component and page has tests covering:

- Render correctness (visible text, structure)
- Accessibility (axe-core automated checks, ARIA attributes)
- Keyboard navigation (tab order, focus management)
- Component variants (button styles, badge colors)

| Test File | Coverage |
|-----------|----------|
| `nav.test.tsx` | Navigation links, ARIA landmark |
| `button.test.tsx` | Variants, disabled state |
| `card.test.tsx` | Composition, styling |
| `input.test.tsx` | Types, placeholder, disabled |
| `table.test.tsx` | Headers, rows, cells |
| `badge.test.tsx` | Variants |
| `error-page.test.tsx` | role="alert", reset callback |
| `loading.test.tsx` | Loading indicator |
| `keyboard-navigation.test.tsx` | Tab order, focus rings |

## Coverage Targets

| Category | Target | Measurement |
|----------|--------|-------------|
| Backend unit | 80%+ line coverage | Jest --coverage |
| Backend integration | All critical paths | Pipeline transitions, tenant isolation |
| Frontend components | All 8 shadcn components | Vitest with axe-core |
| Accessibility | 0 axe violations | vitest-axe toHaveNoViolations() |

## CI Integration

Tests run in the following order:
1. `npm run lint` — ESLint checks
2. `npm run test` — Jest unit tests
3. `docker-compose -f docker-compose.test.yml up -d` — start test database
4. `npm run test:integration` — integration tests against real database
5. `cd frontend && npm run test` — Vitest frontend tests

## Cross-References

- Security tests: [SECURITY_MODEL.md](./SECURITY_MODEL.md)
- API contract for test scenarios: [API_CONTRACT.md](./API_CONTRACT.md)
- Data model for test fixtures: [DATA_MODEL.md](./DATA_MODEL.md)
