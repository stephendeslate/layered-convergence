# Specification Index — Field Service Dispatch

**Project:** Field Service Dispatch (FSD)
**Trial:** 24 (Convergence Confirmation)
**Last Updated:** 2026-03-21

---

## Spec Documents

| # | Document | Description | Last Updated |
|---|----------|-------------|--------------|
| 1 | [PRODUCT_VISION.md](./specs/PRODUCT_VISION.md) | Product vision, target users, value proposition, domain entities | 2026-03-21 |
| 2 | [SYSTEM_ARCHITECTURE.md](./specs/SYSTEM_ARCHITECTURE.md) | Technology stack, component diagram, module organization, deployment | 2026-03-21 |
| 3 | [DATA_MODEL.md](./specs/DATA_MODEL.md) | Entity definitions, relationships, enum values, field types | 2026-03-21 |
| 4 | [API_CONTRACT.md](./specs/API_CONTRACT.md) | REST endpoints, request/response schemas, error codes | 2026-03-21 |
| 5 | [SECURITY_MODEL.md](./specs/SECURITY_MODEL.md) | Authentication, authorization, RLS, input validation | 2026-03-21 |
| 6 | [TESTING_STRATEGY.md](./specs/TESTING_STRATEGY.md) | Test pyramid, unit/integration/frontend test structure | 2026-03-21 |
| 7 | [UI_SPECIFICATION.md](./specs/UI_SPECIFICATION.md) | Page inventory, component hierarchy, user flows, accessibility | 2026-03-21 |

## Spec Dependency Graph

```
PRODUCT_VISION
    ├── SYSTEM_ARCHITECTURE
    │       ├── DATA_MODEL
    │       │       └── API_CONTRACT
    │       └── SECURITY_MODEL
    ├── TESTING_STRATEGY
    └── UI_SPECIFICATION
```

## Traceability Summary

| Metric | Value |
|--------|-------|
| Total VERIFY tags | 63 |
| Total TRACED tags | 63 |
| Bidirectional coverage | 100% |
| Orphan VERIFY tags | 0 |
| Orphan TRACED tags | 0 |

## Complete Tag Inventory

### DM — Data Model (10 tags)

| Tag | Description | Spec | Implementation File |
|-----|-------------|------|-------------------|
| DM-001 | @@map / @map naming conventions | DATA_MODEL.md | `backend/prisma/schema.prisma` |
| DM-002 | WorkOrderStatus 7 states | DATA_MODEL.md | `backend/prisma/schema.prisma` |
| DM-003 | InvoiceStatus enum | DATA_MODEL.md | `backend/prisma/schema.prisma` |
| DM-004 | RouteStatus enum | DATA_MODEL.md | `backend/prisma/schema.prisma` |
| DM-005 | estimatedDistance Decimal(10,2) | DATA_MODEL.md | `backend/prisma/schema.prisma` |
| DM-006 | Float only for GPS coordinates | DATA_MODEL.md | `backend/prisma/schema.prisma` |
| DM-007 | Monetary fields Decimal(12,2) | DATA_MODEL.md | `backend/prisma/schema.prisma` |
| DM-008 | WorkOrder state machine | PRODUCT_VISION.md | `backend/src/work-order/work-order.service.ts` |
| DM-009 | Invoice state machine | PRODUCT_VISION.md | `backend/src/invoice/invoice.service.ts` |
| DM-010 | Route state machine | PRODUCT_VISION.md | `backend/src/route/route.service.ts` |

### SEC — Security (9 tags)

| Tag | Description | Spec | Implementation File |
|-----|-------------|------|-------------------|
| SEC-001 | Role enum (no ADMIN) | SECURITY_MODEL.md | `backend/prisma/schema.prisma` |
| SEC-002 | FORCE ROW LEVEL SECURITY | SECURITY_MODEL.md | `backend/prisma/rls.sql` |
| SEC-003 | JWT_SECRET fail-fast | SECURITY_MODEL.md | `backend/src/main.ts` |
| SEC-004 | CORS_ORIGIN fail-fast | SECURITY_MODEL.md | `backend/src/main.ts` |
| SEC-005 | ValidationPipe whitelist | SECURITY_MODEL.md | `backend/src/main.ts` |
| SEC-006 | @IsIn role restriction | SECURITY_MODEL.md | `backend/src/auth/dto/register.dto.ts` |
| SEC-007 | bcrypt salt 12 | SECURITY_MODEL.md | `backend/src/auth/auth.service.ts` |
| SEC-008 | JWT payload claims | SECURITY_MODEL.md | `backend/src/auth/auth.service.ts` |
| SEC-009 | $executeRaw with Prisma.sql | SYSTEM_ARCHITECTURE.md | `backend/src/company-context/company-context.service.ts` |

### CQ — Code Quality (3 tags)

| Tag | Description | Spec | Implementation File |
|-----|-------------|------|-------------------|
| CQ-001 | Zero `as any` | SYSTEM_ARCHITECTURE.md | `backend/prisma/schema.prisma` |
| CQ-002 | NestJS Logger (no console.log) | SYSTEM_ARCHITECTURE.md | `backend/src/main.ts` |
| CQ-003 | No $executeRawUnsafe | SYSTEM_ARCHITECTURE.md | `backend/src/company-context/company-context.service.ts` |

### API — API Contract (11 tags)

| Tag | Description | Spec | Implementation File |
|-----|-------------|------|-------------------|
| API-001 | RegisterDto validation | API_CONTRACT.md | `backend/src/auth/dto/register.dto.ts` |
| API-002 | LoginDto validation | API_CONTRACT.md | `backend/src/auth/dto/login.dto.ts` |
| API-003 | Auth endpoints | API_CONTRACT.md | `backend/src/auth/auth.controller.ts` |
| API-004 | CreateWorkOrderDto fields | API_CONTRACT.md | `backend/src/work-order/dto/create-work-order.dto.ts` |
| API-005 | 409 Conflict on invalid transition | API_CONTRACT.md | `backend/src/work-order/work-order.service.ts` |
| API-006 | PATCH transition endpoint | API_CONTRACT.md | `backend/src/work-order/work-order.controller.ts` |
| API-007 | Customer company scope | API_CONTRACT.md | `backend/src/customer/customer.service.ts` |
| API-008 | Technician company scope | API_CONTRACT.md | `backend/src/technician/technician.service.ts` |
| API-009 | Invoice company scope | API_CONTRACT.md | `backend/src/invoice/invoice.service.ts` |
| API-010 | Route company scope | API_CONTRACT.md | `backend/src/route/route.controller.ts` |
| API-011 | GpsEvent company scope | API_CONTRACT.md | `backend/src/gps-event/gps-event.service.ts` |

### SA — System Architecture (1 tag)

| Tag | Description | Spec | Implementation File |
|-----|-------------|------|-------------------|
| SA-001 | All 9 modules in AppModule | PRODUCT_VISION.md | `backend/src/app.module.ts` |

### TS — Testing Strategy (9 tags)

| Tag | Description | Spec | Implementation File |
|-----|-------------|------|-------------------|
| TS-001 | 8 spec files in src/ | TESTING_STRATEGY.md | `backend/src/auth/auth.service.spec.ts` |
| TS-002 | Mocked dependencies in unit tests | TESTING_STRATEGY.md | `backend/src/auth/auth.service.spec.ts` |
| TS-003 | Real AppModule in integration tests | TESTING_STRATEGY.md | `backend/test/auth.e2e-spec.ts` |
| TS-004 | No jest.spyOn on Prisma | TESTING_STRATEGY.md | `backend/test/auth.e2e-spec.ts` |
| TS-005 | Frontend page tests | TESTING_STRATEGY.md | `frontend/__tests__/pages.test.tsx` |
| TS-006 | Component rendering tests | TESTING_STRATEGY.md | `frontend/__tests__/components.test.tsx` |
| TS-007 | Loading component tests | TESTING_STRATEGY.md | `frontend/__tests__/loading.test.tsx` |
| TS-008 | Error component tests | TESTING_STRATEGY.md | `frontend/__tests__/error.test.tsx` |
| TS-009 | Keyboard navigation tests | TESTING_STRATEGY.md | `frontend/__tests__/keyboard-navigation.test.tsx` |

### UI — User Interface (20 tags)

| Tag | Description | Spec | Implementation File |
|-----|-------------|------|-------------------|
| UI-001 | Tailwind 4 @import syntax | UI_SPECIFICATION.md | `frontend/app/globals.css` |
| UI-002 | Dark mode support | UI_SPECIFICATION.md | `frontend/app/globals.css` |
| UI-003 | sr-only class | UI_SPECIFICATION.md | `frontend/app/globals.css` |
| UI-004 | 8+ shadcn/ui components | UI_SPECIFICATION.md | `frontend/components/ui/button.tsx` |
| UI-005 | Radix Select (not raw select) | UI_SPECIFICATION.md | `frontend/components/ui/select.tsx` |
| UI-006 | Nav in root layout | UI_SPECIFICATION.md | `frontend/components/nav.tsx` |
| UI-007 | Skip-to-content link | UI_SPECIFICATION.md | `frontend/app/layout.tsx` |
| UI-008 | Server Actions directive | UI_SPECIFICATION.md | `frontend/app/actions.ts` |
| UI-009 | response.ok before redirect | UI_SPECIFICATION.md | `frontend/app/actions.ts` |
| UI-010 | Dashboard entity cards | UI_SPECIFICATION.md | `frontend/app/page.tsx` |
| UI-011 | Login Server Action form | UI_SPECIFICATION.md | `frontend/app/login/page.tsx` |
| UI-012 | Register shadcn Select | UI_SPECIFICATION.md | `frontend/app/register/page.tsx` |
| UI-013 | Work Orders table + badges | UI_SPECIFICATION.md | `frontend/app/work-orders/page.tsx` |
| UI-014 | Technicians table | UI_SPECIFICATION.md | `frontend/app/technicians/page.tsx` |
| UI-015 | Customers table | UI_SPECIFICATION.md | `frontend/app/customers/page.tsx` |
| UI-016 | Invoices status + amounts | UI_SPECIFICATION.md | `frontend/app/invoices/page.tsx` |
| UI-017 | Routes status + distance | UI_SPECIFICATION.md | `frontend/app/routes/page.tsx` |
| UI-018 | GPS Events coordinates | UI_SPECIFICATION.md | `frontend/app/gps-events/page.tsx` |
| UI-019 | Root loading.tsx (FM #64) | UI_SPECIFICATION.md | `frontend/app/loading.tsx` |
| UI-020 | Root error.tsx (FM #64) | UI_SPECIFICATION.md | `frontend/app/error.tsx` |
