# Specification Index — Escrow Marketplace (Trial 24)

**Last Updated:** 2026-03-21

## Documents

| # | Document | Path | Purpose | Last Updated |
|---|----------|------|---------|-------------|
| 1 | Product Vision | [specs/PRODUCT_VISION.md](specs/PRODUCT_VISION.md) | Business goals, user personas, success metrics | 2026-03-21 |
| 2 | System Architecture | [specs/SYSTEM_ARCHITECTURE.md](specs/SYSTEM_ARCHITECTURE.md) | Component topology, deployment, infrastructure | 2026-03-21 |
| 3 | Data Model | [specs/DATA_MODEL.md](specs/DATA_MODEL.md) | Entity definitions, relationships, constraints | 2026-03-21 |
| 4 | API Contract | [specs/API_CONTRACT.md](specs/API_CONTRACT.md) | REST endpoints, request/response schemas | 2026-03-21 |
| 5 | Security Model | [specs/SECURITY_MODEL.md](specs/SECURITY_MODEL.md) | Auth, authorization, RLS, input validation | 2026-03-21 |
| 6 | Testing Strategy | [specs/TESTING_STRATEGY.md](specs/TESTING_STRATEGY.md) | Test pyramid, coverage targets, tooling | 2026-03-21 |
| 7 | UI Specification | [specs/UI_SPECIFICATION.md](specs/UI_SPECIFICATION.md) | Routes, components, accessibility, dark mode | 2026-03-21 |

## Spec Dependency Graph

```
PRODUCT_VISION
  ├── SYSTEM_ARCHITECTURE
  │   ├── DATA_MODEL
  │   │   └── API_CONTRACT
  │   ├── SECURITY_MODEL
  │   └── TESTING_STRATEGY
  └── UI_SPECIFICATION
```

## Traceability Summary

- **Total VERIFY tags:** 51
- **Total TRACED tags:** 51
- **Bidirectional match:** 100%
- **Orphan specs:** 0
- **Orphan traces:** 0
- **Coverage:** All 5 entities (User, Transaction, Dispute, Payout, Webhook) traced

## Complete Tag Inventory

### PV — Product Vision (4 tags)

| Tag | Description | Implementation File |
|-----|-------------|-------------------|
| PV-001 | Landing page core value proposition | `frontend/app/page.tsx` |
| PV-002 | Two user personas: buyers and sellers | `frontend/app/page.tsx` |
| PV-003 | Core escrow flow state machine | `backend/src/transaction/transaction.service.ts` |
| PV-004 | Seller payout lifecycle | `backend/src/payout/payout.service.ts` |

### SA — System Architecture (6 tags)

| Tag | Description | Implementation File |
|-----|-------------|-------------------|
| SA-001 | NestJS modular architecture | `backend/src/app.module.ts` |
| SA-002 | PrismaService wraps PrismaClient | `backend/src/prisma/prisma.service.ts` |
| SA-003 | State machine pattern at service layer | `backend/src/transaction/transaction.service.ts` |
| SA-004 | Module dependency graph | `backend/src/app.module.ts` |
| SA-005 | $executeRaw with Prisma.sql in production | `backend/src/tenant-context/tenant-context.service.ts` |
| SA-006 | TenantContextModule RLS integration | `backend/src/app.module.ts` |

### DM — Data Model (7 tags)

| Tag | Description | Implementation File |
|-----|-------------|-------------------|
| DM-001 | @@map for snake_case table names | `backend/prisma/schema.prisma` |
| DM-002 | @map for multi-word columns | `backend/prisma/schema.prisma` |
| DM-003 | Decimal(12,2) monetary fields | `backend/prisma/schema.prisma` |
| DM-004 | Role enum BUYER/SELLER only | `backend/prisma/schema.prisma` |
| DM-005 | TransactionStatus enum state machine | `backend/prisma/schema.prisma` |
| DM-006 | DisputeStatus enum | `backend/prisma/schema.prisma` |
| DM-007 | PayoutStatus enum | `backend/prisma/schema.prisma` |

### DA — Data Architecture (2 tags)

| Tag | Description | Implementation File |
|-----|-------------|-------------------|
| DA-001 | FORCE ROW LEVEL SECURITY on all tables | `backend/prisma/rls.sql` |
| DA-002 | Decimal(12,2) precision for financial accuracy | `backend/prisma/schema.prisma` |

### AC — API Contract (8 tags)

| Tag | Description | Implementation File |
|-----|-------------|-------------------|
| AC-001 | Auth endpoints register/login | `backend/src/auth/auth.controller.ts` |
| AC-002 | Transaction state machine validation | `backend/src/transaction/transaction.service.ts` |
| AC-003 | UpdateTransactionStatusDto validation | `backend/src/transaction/dto/update-status.dto.ts` |
| AC-004 | Dispute disputable state validation | `backend/src/dispute/dispute.service.ts` |
| AC-005 | Payout state machine transitions | `backend/src/payout/payout.service.ts` |
| AC-006 | Payout CRUD endpoints | `backend/src/payout/payout.controller.ts` |
| AC-007 | Webhook CRUD operations | `backend/src/webhook/webhook.service.ts` |
| AC-008 | Webhook JWT authentication | `backend/src/webhook/webhook.controller.ts` |

### SEC — Security Model (7 tags)

| Tag | Description | Implementation File |
|-----|-------------|-------------------|
| SEC-001 | JWT_SECRET/CORS_ORIGIN fail-fast | `backend/src/main.ts` |
| SEC-002 | @IsIn([BUYER, SELLER]) role restriction | `backend/src/auth/dto/register.dto.ts` |
| SEC-003 | bcrypt salt 12 | `backend/src/auth/auth.service.ts` |
| SEC-004 | ValidationPipe whitelist + forbidNonWhitelisted | `backend/src/main.ts` |
| SEC-005 | RLS policies in standalone rls.sql | `backend/prisma/rls.sql` |
| SEC-006 | TenantContextService $executeRaw for RLS | `backend/src/tenant-context/tenant-context.service.ts` |
| SEC-007 | JWT strategy token validation | `backend/src/auth/strategies/jwt.strategy.ts` |

### TS — Testing Strategy (7 tags)

| Tag | Description | Implementation File |
|-----|-------------|-------------------|
| TS-001 | Unit tests with Test.createTestingModule | `backend/src/auth/auth.service.spec.ts` |
| TS-002 | Tenant context RLS unit test | `backend/src/tenant-context/tenant-context.service.spec.ts` |
| TS-003 | Integration test with real AppModule | `backend/test/app.e2e-spec.ts` |
| TS-004 | docker-compose.test.yml for test DB | `docker-compose.test.yml` |
| TS-005 | axe-core accessibility tests | `frontend/__tests__/accessibility.test.tsx` |
| TS-006 | Dedicated keyboard navigation tests | `frontend/__tests__/keyboard-navigation.test.tsx` |
| TS-007 | Page-level rendering tests | `frontend/__tests__/pages.test.tsx` |

### UI — UI Specification (10 tags)

| Tag | Description | Implementation File |
|-----|-------------|-------------------|
| UI-001 | Tailwind 4 @import syntax | `frontend/app/globals.css` |
| UI-002 | shadcn/ui Button component | `frontend/components/ui/button.tsx` |
| UI-003 | Nav component with aria-label | `frontend/components/nav.tsx` |
| UI-004 | Root layout with Nav and skip-to-content | `frontend/app/layout.tsx` |
| UI-005 | sr-only CSS class | `frontend/app/globals.css` |
| UI-006 | Dark mode via prefers-color-scheme | `frontend/app/globals.css` |
| UI-007 | shadcn Select wrapper (no raw select) | `frontend/components/ui/select.tsx` |
| UI-008 | Server Actions with 'use server' | `frontend/app/actions.ts` |
| UI-009 | Root loading.tsx with role="status" | `frontend/app/loading.tsx` |
| UI-010 | Root error.tsx with role="alert" + focus | `frontend/app/error.tsx` |

## Cross-Reference Matrix

| Spec | References |
|------|-----------|
| PRODUCT_VISION | SYSTEM_ARCHITECTURE, SECURITY_MODEL, UI_SPECIFICATION |
| SYSTEM_ARCHITECTURE | DATA_MODEL, SECURITY_MODEL, TESTING_STRATEGY |
| DATA_MODEL | SYSTEM_ARCHITECTURE, API_CONTRACT, SECURITY_MODEL |
| API_CONTRACT | SYSTEM_ARCHITECTURE, SECURITY_MODEL, DATA_MODEL |
| SECURITY_MODEL | SYSTEM_ARCHITECTURE, DATA_MODEL, API_CONTRACT |
| TESTING_STRATEGY | SYSTEM_ARCHITECTURE, API_CONTRACT, UI_SPECIFICATION |
| UI_SPECIFICATION | PRODUCT_VISION, API_CONTRACT, TESTING_STRATEGY |
