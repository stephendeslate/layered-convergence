# Specification Index — Field Service Dispatch (Trial 32)

## Documents

| Document | Path | Description |
|----------|------|-------------|
| Product Vision | [specs/PRODUCT_VISION.md](specs/PRODUCT_VISION.md) | Business goals, capabilities, user types |
| System Architecture | [specs/SYSTEM_ARCHITECTURE.md](specs/SYSTEM_ARCHITECTURE.md) | Technical stack, module structure, monorepo layout |
| Data Model | [specs/DATA_MODEL.md](specs/DATA_MODEL.md) | Entity definitions, relationships, enums |
| API Contract | [specs/API_CONTRACT.md](specs/API_CONTRACT.md) | REST endpoints, request/response formats |
| Security Model | [specs/SECURITY_MODEL.md](specs/SECURITY_MODEL.md) | Auth, RLS, input validation |
| Testing Strategy | [specs/TESTING_STRATEGY.md](specs/TESTING_STRATEGY.md) | Unit, integration, frontend test approach |
| UI Specification | [specs/UI_SPECIFICATION.md](specs/UI_SPECIFICATION.md) | Frontend routes, components, accessibility |

## VERIFY Tag Inventory

### Product Vision (PV) — 8 tags
| Tag | Description | Implementation |
|-----|-------------|----------------|
| FD-PV-001 | Company is the root multi-tenant entity | apps/api/prisma/schema.prisma:1 |
| FD-PV-002 | Work order state machine enforces valid transitions | apps/api/src/work-order/work-order.service.ts:4 |
| FD-PV-003 | Work order sets completedAt on COMPLETED | apps/api/src/work-order/work-order.service.ts:5 |
| FD-PV-004 | Technician availability tracking | apps/api/src/technician/technician.service.ts:1 |
| FD-PV-005 | GPS events use Decimal(10,6) precision | apps/api/prisma/schema.prisma:6 |
| FD-PV-006 | Invoice amount uses Decimal(20,2) precision | apps/api/prisma/schema.prisma:7 |
| FD-PV-007 | DISPATCHER role assigned at registration | apps/api/src/auth/auth.service.ts:1 |
| FD-PV-008 | ADMIN role rejected at registration | apps/api/src/auth/auth.service.ts:2 |

### System Architecture (SA) — 8 tags
| Tag | Description | Implementation |
|-----|-------------|----------------|
| FD-SA-001 | NestJS modules in app.module.ts | apps/api/src/app.module.ts:1 |
| FD-SA-002 | PrismaModule is global | apps/api/src/prisma/prisma.module.ts:1 |
| FD-SA-003 | JwtAuthGuard protects endpoints | apps/api/src/auth/jwt-auth.guard.ts:1 |
| FD-SA-004 | validateTransition used in work-order service | apps/api/src/work-order/work-order.service.ts:3 |
| FD-SA-005 | @@map on all models | apps/api/prisma/schema.prisma:2 |
| FD-SA-006 | findFirst justification comments | apps/api/src/work-order/work-order.service.ts:6 |
| FD-SA-007 | Skip-to-content link in layout | apps/web/app/layout.tsx:2 |
| FD-SA-008 | 8 shadcn/ui components | apps/web/components/ui/button.tsx:1 |

### Data Model (DM) — 4 tags
| Tag | Description | Implementation |
|-----|-------------|----------------|
| FD-DM-001 | @@map on all models for table names | apps/api/prisma/schema.prisma:3 |
| FD-DM-002 | @map on multi-word columns | apps/api/prisma/schema.prisma:4 |
| FD-DM-003 | GPS coordinates use Decimal(10,6) | apps/api/prisma/schema.prisma:5 |
| FD-DM-004 | Invoice amount uses Decimal(20,2) | apps/api/prisma/schema.prisma:8 |

### API Contract (AC) — 7 tags
| Tag | Description | Implementation |
|-----|-------------|----------------|
| FD-AC-001 | Work order CRUD with company isolation | apps/api/src/work-order/work-order.service.ts:1 |
| FD-AC-002 | Work order state machine validation | apps/api/src/work-order/work-order.service.ts:2 |
| FD-AC-003 | Customer CRUD with company isolation | apps/api/src/customer/customer.service.ts:1 |
| FD-AC-004 | Technician CRUD with company isolation | apps/api/src/technician/technician.service.ts:1 |
| FD-AC-005 | Route CRUD with company isolation | apps/api/src/route/route.service.ts:1 |
| FD-AC-006 | GPS event CRUD with company isolation | apps/api/src/gps-event/gps-event.service.ts:1 |
| FD-AC-007 | Invoice CRUD with company isolation | apps/api/src/invoice/invoice.service.ts:1 |

### Security Model (SM) — 7 tags
| Tag | Description | Implementation |
|-----|-------------|----------------|
| FD-SM-001 | RLS ENABLE + FORCE on all company-scoped tables | apps/api/prisma/migrations/20240101000000_init/migration.sql:1 |
| FD-SM-002 | JWT_SECRET fail-fast in main.ts | apps/api/src/main.ts:1 |
| FD-SM-003 | CORS_ORIGIN fail-fast in main.ts | apps/api/src/main.ts:2 |
| FD-SM-004 | bcrypt salt 12 for password hashing | apps/api/src/auth/auth.service.ts:3 |
| FD-SM-005 | ADMIN role rejected at service level | apps/api/src/auth/auth.service.ts:4 |
| FD-SM-006 | @IsIn excludes ADMIN in RegisterDto | apps/api/src/auth/dto/register.dto.ts:1 |
| FD-SM-007 | CompanyContextService uses Prisma.sql tagged template | apps/api/src/company-context/company-context.service.ts:1 |

### Testing Strategy (TS) — 4 tags
| Tag | Description | Implementation |
|-----|-------------|----------------|
| FD-TS-001 | Docker Compose for test database | docker-compose.test.yml:1 |
| FD-TS-002 | Integration test for auth endpoints | apps/api/__integration__/auth.spec.ts:1 |
| FD-TS-003 | Integration test for work-order endpoints | apps/api/__integration__/work-order.spec.ts:1 |
| FD-TS-004 | Frontend axe-core accessibility tests | apps/web/__tests__/pages.test.tsx:1 |

### UI Specification (UI) — 7 tags
| Tag | Description | Implementation |
|-----|-------------|----------------|
| FD-UI-001 | Tailwind CSS 4 import syntax | apps/web/app/globals.css:1 |
| FD-UI-002 | Dark mode prefers-color-scheme | apps/web/app/globals.css:2 |
| FD-UI-003 | Button component with variants | apps/web/components/ui/button.tsx:1 |
| FD-UI-004 | Nav component in layout | apps/web/components/nav.tsx:1 |
| FD-UI-005 | Root layout skip-to-content | apps/web/app/layout.tsx:1 |
| FD-UI-006 | Server actions with response.ok | apps/web/app/actions.ts:1 |
| FD-UI-007 | Keyboard navigation tests | apps/web/__tests__/keyboard-navigation.test.tsx:1 |

## Summary

- **Total VERIFY tags**: 45
- **Total TRACED tags**: 45 (matching 1:1)
- **All specs cross-reference at least 2 other specs**: Yes
- **All specs >= 50 lines**: Yes
