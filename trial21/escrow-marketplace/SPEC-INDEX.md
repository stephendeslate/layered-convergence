# Specification Index

## Bidirectional Traceability Matrix

This index maps every `[VERIFY:XXX-NNN]` tag in specification documents to its corresponding `[TRACED:XXX-NNN]` tag in source code, establishing a complete audit chain.

## Product Vision (PV) - 3 tags

| Tag | Spec Location | Source Location | Description |
|-----|--------------|-----------------|-------------|
| PV-001 | specs/PRODUCT_VISION.md | frontend/app/layout.tsx | Root layout with skip-to-content and semantic HTML |
| PV-002 | specs/PRODUCT_VISION.md | frontend/app/page.tsx | Landing page |
| PV-003 | specs/PRODUCT_VISION.md | frontend/app/error.tsx | Error boundary with role="alert" |

## System Architecture (SA) - 5 tags

| Tag | Spec Location | Source Location | Description |
|-----|--------------|-----------------|-------------|
| SA-001 | specs/SYSTEM_ARCHITECTURE.md | backend/src/main.ts | Server bootstrap, CORS fail-fast, validation pipe |
| SA-002 | specs/SYSTEM_ARCHITECTURE.md | backend/src/app.module.ts | NestJS module organization |
| SA-003 | specs/SYSTEM_ARCHITECTURE.md | backend/src/webhook/webhook.service.ts | Webhook event delivery system |
| SA-004 | specs/SYSTEM_ARCHITECTURE.md | frontend/app/actions.ts | Server Actions with response.ok checks |
| SA-005 | specs/SYSTEM_ARCHITECTURE.md | frontend/components/nav.tsx | Async server component session management |

## Data Model (DM) - 5 tags

| Tag | Spec Location | Source Location | Description |
|-----|--------------|-----------------|-------------|
| DM-001 | specs/DATA_MODEL.md | backend/src/prisma/prisma.service.ts | RLS context via $executeRaw tagged templates |
| DM-002 | specs/DATA_MODEL.md | backend/src/auth/dto/register.dto.ts | User role validation (BUYER/SELLER only) |
| DM-003 | specs/DATA_MODEL.md | backend/src/transaction/transaction.service.ts | Transaction state machine |
| DM-004 | specs/DATA_MODEL.md | backend/src/transaction/transaction.service.ts | Status transition role validation |
| DM-005 | specs/DATA_MODEL.md | backend/src/payout/payout.service.ts | Payout model with Decimal precision |

## API Contract (AC) - 12 tags

| Tag | Spec Location | Source Location | Description |
|-----|--------------|-----------------|-------------|
| AC-001 | specs/API_CONTRACT.md | backend/src/main.ts | Global ValidationPipe configuration |
| AC-002 | specs/API_CONTRACT.md | backend/src/auth/auth.service.ts | POST /auth/register |
| AC-003 | specs/API_CONTRACT.md | backend/src/auth/auth.service.ts | POST /auth/login |
| AC-004 | specs/API_CONTRACT.md | backend/src/auth/auth.service.ts | JWT token structure |
| AC-005 | specs/API_CONTRACT.md | backend/src/auth/auth.controller.ts | POST /auth/logout |
| AC-006 | specs/API_CONTRACT.md | backend/src/transaction/transaction.service.ts | POST /transactions |
| AC-007 | specs/API_CONTRACT.md | backend/src/transaction/transaction.service.ts | GET /transactions |
| AC-008 | specs/API_CONTRACT.md | backend/src/transaction/transaction.service.ts | PATCH /transactions/:id/status |
| AC-009 | specs/API_CONTRACT.md | backend/src/dispute/dispute.service.ts | POST /disputes |
| AC-010 | specs/API_CONTRACT.md | backend/src/dispute/dispute.service.ts | PATCH /disputes/:id/resolve |
| AC-011 | specs/API_CONTRACT.md | backend/src/payout/payout.service.ts | POST /payouts |
| AC-012 | specs/API_CONTRACT.md | backend/src/webhook/webhook.service.ts | POST /webhooks |

## Security Model (SM) - 6 tags

| Tag | Spec Location | Source Location | Description |
|-----|--------------|-----------------|-------------|
| SM-001 | specs/SECURITY_MODEL.md | backend/src/main.ts | CORS configuration (fail-fast) |
| SM-002 | specs/SECURITY_MODEL.md | backend/src/main.ts | Cookie security settings |
| SM-003 | specs/SECURITY_MODEL.md | backend/src/main.ts, backend/src/auth/auth.controller.ts | JWT authentication guard |
| SM-004 | specs/SECURITY_MODEL.md | backend/src/prisma/prisma.service.ts | RLS context with tagged templates |
| SM-005 | specs/SECURITY_MODEL.md | backend/src/auth/auth.service.ts | bcrypt password hashing (salt 12) |
| SM-006 | specs/SECURITY_MODEL.md | backend/src/common/roles.guard.ts | Role-based access control guard |

## Testing Strategy (TS) - 6 tags

| Tag | Spec Location | Source Location | Description |
|-----|--------------|-----------------|-------------|
| TS-001 | specs/TESTING_STRATEGY.md | backend/src/auth/auth.service.spec.ts | Auth service unit tests |
| TS-002 | specs/TESTING_STRATEGY.md | backend/src/transaction/transaction.service.spec.ts | Transaction service unit tests |
| TS-003 | specs/TESTING_STRATEGY.md | backend/src/dispute/dispute.service.spec.ts | Dispute service unit tests |
| TS-004 | specs/TESTING_STRATEGY.md | backend/src/payout/payout.service.spec.ts | Payout service unit tests |
| TS-005 | specs/TESTING_STRATEGY.md | backend/test/auth.integration.spec.ts | Auth integration tests |
| TS-006 | specs/TESTING_STRATEGY.md | backend/test/transaction.integration.spec.ts | Transaction state machine integration tests |

## UI Specification (UI) - 8 tags

| Tag | Spec Location | Source Location | Description |
|-----|--------------|-----------------|-------------|
| UI-001 | specs/UI_SPECIFICATION.md | frontend/lib/types.ts | Frontend TypeScript type definitions |
| UI-002 | specs/UI_SPECIFICATION.md | frontend/lib/validation.ts | Form validation helpers |
| UI-003 | specs/UI_SPECIFICATION.md | frontend/components/ui/button.tsx | Button component with CVA variants |
| UI-004 | specs/UI_SPECIFICATION.md | frontend/components/nav.tsx | Role-aware navigation component |
| UI-005 | specs/UI_SPECIFICATION.md | frontend/app/globals.css | Dark mode via prefers-color-scheme |
| UI-006 | specs/UI_SPECIFICATION.md | frontend/app/globals.css | Skip-to-content accessibility link |
| UI-007 | specs/UI_SPECIFICATION.md | frontend/app/transactions/page.tsx | Transactions page with Table and Badge |
| UI-008 | specs/UI_SPECIFICATION.md | frontend/app/disputes/page.tsx | Disputes page with status-based badges |

## Summary

| Category | Required | Actual | Status |
|----------|----------|--------|--------|
| PV (Product Vision) | 3+ | 3 | PASS |
| SA (System Architecture) | 5+ | 5 | PASS |
| DM (Data Model) | 5+ | 5 | PASS |
| AC (API Contract) | 8+ | 12 | PASS |
| SM (Security Model) | 5+ | 6 | PASS |
| TS (Testing Strategy) | 4+ | 6 | PASS |
| UI (UI Specification) | 5+ | 8 | PASS |
| **Total** | **35+** | **45** | **PASS** |

## Orphan Check

- **VERIFY tags without TRACED**: None
- **TRACED tags without VERIFY**: None
- **Bidirectional traceability**: Complete
