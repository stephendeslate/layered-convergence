# Specification Traceability Index

This index maps every [VERIFY:XXX-NNN] tag in spec documents to its corresponding
[TRACED:XXX-NNN] tag in source code, providing bidirectional traceability.

## Spec Documents

| # | Document | Description | Last Updated |
|---|----------|-------------|-------------|
| 1 | [PRODUCT_VISION.md](specs/PRODUCT_VISION.md) | Core features, target users, and success criteria | 2026-03-21 |
| 2 | [SYSTEM_ARCHITECTURE.md](specs/SYSTEM_ARCHITECTURE.md) | Backend/frontend stack, request flow, deployment | 2026-03-21 |
| 3 | [DATA_MODEL.md](specs/DATA_MODEL.md) | 8 entities, enums, column mapping, indexes | 2026-03-21 |
| 4 | [API_CONTRACT.md](specs/API_CONTRACT.md) | REST endpoints, DTOs, validation, error responses | 2026-03-21 |
| 5 | [SECURITY_MODEL.md](specs/SECURITY_MODEL.md) | RLS, JWT, bcrypt, CORS, defense-in-depth | 2026-03-21 |
| 6 | [TESTING_STRATEGY.md](specs/TESTING_STRATEGY.md) | Unit tests, integration tests, a11y tests | 2026-03-21 |
| 7 | [UI_SPECIFICATION.md](specs/UI_SPECIFICATION.md) | Pages, components, accessibility, Server Actions | 2026-03-21 |

## Spec Dependency Graph

```
PRODUCT_VISION
    |
    v
SYSTEM_ARCHITECTURE --> SECURITY_MODEL
    |                       |
    v                       v
DATA_MODEL              API_CONTRACT
    |                       |
    v                       v
TESTING_STRATEGY <---- UI_SPECIFICATION
```

- PRODUCT_VISION: standalone, defines requirements for all other specs
- SYSTEM_ARCHITECTURE: references SECURITY_MODEL, DATA_MODEL, UI_SPECIFICATION
- DATA_MODEL: references SECURITY_MODEL (RLS), API_CONTRACT (transitions)
- API_CONTRACT: references SECURITY_MODEL (auth details)
- SECURITY_MODEL: references SYSTEM_ARCHITECTURE (request flow), UI_SPECIFICATION (frontend security)
- TESTING_STRATEGY: references SYSTEM_ARCHITECTURE (stack)
- UI_SPECIFICATION: references API_CONTRACT (endpoints consumed)

## Product Vision (PV)

| Tag | Spec | Source |
|-----|------|--------|
| PV-001 | specs/PRODUCT_VISION.md | backend/src/work-order/work-order.service.ts:14 |
| PV-002 | specs/PRODUCT_VISION.md | backend/src/technician/technician.service.ts:8 |
| PV-003 | specs/PRODUCT_VISION.md | backend/src/route/route.service.ts:7 |
| PV-004 | specs/PRODUCT_VISION.md | backend/src/gps-event/gps-event.service.ts:7 |
| PV-005 | specs/PRODUCT_VISION.md | backend/src/invoice/invoice.service.ts:8 |

## System Architecture (SA)

| Tag | Spec | Source |
|-----|------|--------|
| SA-001 | specs/SYSTEM_ARCHITECTURE.md | backend/src/main.ts:6 |
| SA-002 | specs/SYSTEM_ARCHITECTURE.md | backend/src/app.module.ts:13 |
| SA-003 | specs/SYSTEM_ARCHITECTURE.md | backend/prisma/schema.prisma:151 |
| SA-004 | specs/SYSTEM_ARCHITECTURE.md | backend/prisma/schema.prisma:167 |
| SA-005 | specs/SYSTEM_ARCHITECTURE.md | backend/src/prisma/prisma.service.ts:5 |

## Data Model (DM)

| Tag | Spec | Source |
|-----|------|--------|
| DM-001 | specs/DATA_MODEL.md | backend/prisma/schema.prisma:11 |
| DM-002 | specs/DATA_MODEL.md | backend/prisma/schema.prisma:18 |
| DM-003 | specs/DATA_MODEL.md | backend/prisma/schema.prisma:25 |
| DM-004 | specs/DATA_MODEL.md | backend/prisma/schema.prisma:42 |
| DM-005 | specs/DATA_MODEL.md | backend/prisma/schema.prisma:61 |
| DM-006 | specs/DATA_MODEL.md | backend/src/invoice/invoice.service.ts:43 |

## API Contract (AC)

| Tag | Spec | Source |
|-----|------|--------|
| AC-001 | specs/API_CONTRACT.md | backend/src/main.ts:27 |
| AC-002 | specs/API_CONTRACT.md | backend/src/auth/dto/register.dto.ts:5 |
| AC-003 | specs/API_CONTRACT.md | backend/src/auth/dto/login.dto.ts:4 |
| AC-004 | specs/API_CONTRACT.md | backend/src/auth/auth.service.ts:62 |
| AC-005 | specs/API_CONTRACT.md | backend/src/auth/auth.controller.ts:8 |
| AC-006 | specs/API_CONTRACT.md | backend/src/customer/dto/create-customer.dto.ts:4 |
| AC-007 | specs/API_CONTRACT.md | backend/src/work-order/dto/create-work-order.dto.ts:4 |
| AC-008 | specs/API_CONTRACT.md | backend/src/work-order/dto/transition-work-order.dto.ts:5 |
| AC-009 | specs/API_CONTRACT.md | backend/src/route/dto/create-route.dto.ts:4 |
| AC-010 | specs/API_CONTRACT.md | backend/src/gps-event/dto/create-gps-event.dto.ts:4 |
| AC-011 | specs/API_CONTRACT.md | backend/src/invoice/dto/create-invoice.dto.ts:4 |

## Security Model (SEC)

| Tag | Spec | Source |
|-----|------|--------|
| SEC-001 | specs/SECURITY_MODEL.md | backend/prisma/rls.sql:1 |
| SEC-002 | specs/SECURITY_MODEL.md | backend/prisma/rls.sql:28 |
| SEC-003 | specs/SECURITY_MODEL.md | backend/src/main.ts:8 |
| SEC-004 | specs/SECURITY_MODEL.md | backend/src/main.ts:14 |
| SEC-005 | specs/SECURITY_MODEL.md | backend/src/company-context/company-context.service.ts:6 |
| SEC-006 | specs/SECURITY_MODEL.md | backend/src/auth/auth.service.ts:14 |
| SEC-007 | specs/SECURITY_MODEL.md | backend/src/auth/auth.service.ts:25 |

## Testing Strategy (TS)

| Tag | Spec | Source |
|-----|------|--------|
| TS-001 | specs/TESTING_STRATEGY.md | backend/test/auth.integration.spec.ts:8 |
| TS-002 | specs/TESTING_STRATEGY.md | backend/test/work-order.integration.spec.ts:9 |
| TS-003 | specs/TESTING_STRATEGY.md | backend/src/auth/auth.service.spec.ts:1 |
| TS-004 | specs/TESTING_STRATEGY.md | frontend/__tests__/nav.test.tsx:1 |

## UI Specification (UI)

| Tag | Spec | Source |
|-----|------|--------|
| UI-001 | specs/UI_SPECIFICATION.md | frontend/lib/types.ts:1 |
| UI-002 | specs/UI_SPECIFICATION.md | frontend/lib/validation.ts:1 |
| UI-003 | specs/UI_SPECIFICATION.md | frontend/lib/auth.ts:14 |
| UI-004 | specs/UI_SPECIFICATION.md | frontend/app/globals.css:26 |
| UI-005 | specs/UI_SPECIFICATION.md | frontend/app/globals.css:61 |
| UI-006 | specs/UI_SPECIFICATION.md | frontend/components/nav.tsx:9 |
| UI-007 | specs/UI_SPECIFICATION.md | frontend/app/error.tsx:7 |
| UI-008 | specs/UI_SPECIFICATION.md | frontend/app/actions.ts:12 |

## Traceability Summary

| Category | Count | Minimum Required | Status |
|----------|-------|-----------------|--------|
| PV (Product Vision) | 5 | 3 | Pass |
| SA (System Architecture) | 5 | 5 | Pass |
| DM (Data Model) | 6 | 5 | Pass |
| AC (API Contract) | 11 | 8 | Pass |
| SEC (Security Model) | 7 | 5 | Pass |
| TS (Testing Strategy) | 4 | 4 | Pass |
| UI (UI Specification) | 8 | 5 | Pass |
| **Total** | **46** | **35** | **Pass** |

Coverage: 46/46 VERIFY tags have matching TRACED tags in source code (100%).
No orphan VERIFY tags (specs without code). No orphan TRACED tags (code without specs).
