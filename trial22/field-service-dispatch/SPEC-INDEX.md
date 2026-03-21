# Specification Index — Field Service Dispatch

## Documents

| # | Document | Path | VERIFY Count |
|---|----------|------|-------------|
| 1 | Product Vision | [specs/PRODUCT_VISION.md](specs/PRODUCT_VISION.md) | 3 |
| 2 | System Architecture | [specs/SYSTEM_ARCHITECTURE.md](specs/SYSTEM_ARCHITECTURE.md) | 5 |
| 3 | Data Model | [specs/DATA_MODEL.md](specs/DATA_MODEL.md) | 5 |
| 4 | API Contract | [specs/API_CONTRACT.md](specs/API_CONTRACT.md) | 8 |
| 5 | Security Model | [specs/SECURITY_MODEL.md](specs/SECURITY_MODEL.md) | 5 |
| 6 | Testing Strategy | [specs/TESTING_STRATEGY.md](specs/TESTING_STRATEGY.md) | 4 |
| 7 | UI Specification | [specs/UI_SPECIFICATION.md](specs/UI_SPECIFICATION.md) | 5 |
| **Total** | | | **35** |

## VERIFY Tag Registry

### Product Vision (PV)
| Tag | Description | Traced To |
|-----|-------------|-----------|
| PV-001 | Work order state machine | backend/src/work-order/work-order.service.ts |
| PV-002 | Two roles: DISPATCHER and TECHNICIAN | backend/src/auth/dto/register.dto.ts |
| PV-003 | Company-scoped data with RLS | backend/prisma/rls.sql |

### System Architecture (SA)
| Tag | Description | Traced To |
|-----|-------------|-----------|
| SA-001 | Feature modules with clear boundaries | backend/src/app.module.ts |
| SA-002 | JWT auth with fail-fast on missing JWT_SECRET | backend/src/auth/auth.module.ts |
| SA-003 | Row-level security on company-scoped tables | backend/prisma/rls.sql |
| SA-004 | Company context set on every authenticated request | backend/src/company-context/company-context.middleware.ts |
| SA-005 | Structured error responses with HTTP status codes | backend/src/main.ts |

### Data Model (DM)
| Tag | Description | Traced To |
|-----|-------------|-----------|
| DM-001 | Company is root tenant entity | backend/prisma/schema.prisma |
| DM-002 | User role constrained to DISPATCHER or TECHNICIAN | backend/prisma/schema.prisma |
| DM-003 | WorkOrder status state machine | backend/src/work-order/work-order.service.ts |
| DM-004 | Invoice amounts use Decimal(12,2) | backend/prisma/schema.prisma |
| DM-005 | GPS coordinates use Float type | backend/prisma/schema.prisma |

### API Contract (AC)
| Tag | Description | Traced To |
|-----|-------------|-----------|
| AC-001 | All endpoints except auth require JWT | backend/src/app.module.ts |
| AC-002 | Register validates role (no ADMIN) | backend/src/auth/dto/register.dto.ts |
| AC-003 | List endpoints return company-scoped data | backend/src/customer/customer.service.ts |
| AC-004 | Work orders support filtering by status | backend/src/work-order/work-order.controller.ts |
| AC-005 | Work order creation sets initial status to OPEN | backend/src/work-order/work-order.service.ts |
| AC-006 | Status transitions validated against state machine | backend/src/work-order/work-order.service.ts |
| AC-007 | Assignment requires technicianId and transitions to ASSIGNED | backend/src/work-order/work-order.service.ts |
| AC-008 | Invoice creation requires COMPLETED work order | backend/src/invoice/invoice.service.ts |

### Security Model (SEC)
| Tag | Description | Traced To |
|-----|-------------|-----------|
| SEC-001 | Passwords hashed with bcrypt salt 12 | backend/src/auth/auth.service.ts |
| SEC-002 | Fail-fast on missing JWT_SECRET or CORS_ORIGIN | backend/src/main.ts |
| SEC-003 | Two roles enforced: DISPATCHER and TECHNICIAN | backend/src/auth/guards/roles.guard.ts |
| SEC-004 | Auth service rejects ADMIN role | backend/src/auth/auth.service.ts |
| SEC-005 | RLS on all company-scoped tables | backend/prisma/rls.sql |

### Testing Strategy (TS)
| Tag | Description | Traced To |
|-----|-------------|-----------|
| TS-001 | Integration tests use real DB, not Prisma mocks | backend/test/work-order.integration.spec.ts |
| TS-002 | Integration tests in backend/test/ directory | backend/test/ |
| TS-003 | Docker Compose provides test PostgreSQL | docker-compose.test.yml |
| TS-004 | axe-core accessibility tests | frontend/__tests__/accessibility.test.tsx |

### UI Specification (UI)
| Tag | Description | Traced To |
|-----|-------------|-----------|
| UI-001 | 8 shadcn/ui components | frontend/components/ui/ |
| UI-002 | Dark mode via prefers-color-scheme | frontend/app/globals.css |
| UI-003 | Nav in root layout with skip-to-content | frontend/app/layout.tsx |
| UI-004 | loading.tsx with role="status" and aria-busy="true" | frontend/app/dashboard/loading.tsx |
| UI-005 | error.tsx with role="alert" | frontend/app/dashboard/error.tsx |

## Cross-References

### Work Order State Machine
- Defined in: PV-001, DM-003
- API enforcement: AC-005, AC-006, AC-007
- Implementation: backend/src/work-order/work-order.service.ts

### Multi-Tenant Isolation
- Vision: PV-003
- Architecture: SA-003, SA-004
- Security: SEC-005
- Implementation: backend/prisma/rls.sql, backend/src/company-context/

### Role-Based Access
- Vision: PV-002
- API: AC-001, AC-002
- Security: SEC-003, SEC-004
- Implementation: backend/src/auth/

### Testing Integrity
- Strategy: TS-001, TS-002, TS-003
- Infrastructure: docker-compose.test.yml
- Tests: backend/test/*.integration.spec.ts

### Accessibility
- UI: UI-003, UI-004, UI-005
- Testing: TS-004
- Implementation: frontend/app/layout.tsx, frontend/app/*/loading.tsx, frontend/app/*/error.tsx
