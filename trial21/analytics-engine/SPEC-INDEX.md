# Specification Index

## Spec Documents

| # | Document | Description | Last Updated |
|---|----------|-------------|-------------|
| 1 | [PRODUCT_VISION.md](./specs/PRODUCT_VISION.md) | Product vision, target users, value proposition, success metrics | 2026-03-21 |
| 2 | [SYSTEM_ARCHITECTURE.md](./specs/SYSTEM_ARCHITECTURE.md) | System architecture, component diagram, technology choices, deployment | 2026-03-21 |
| 3 | [DATA_MODEL.md](./specs/DATA_MODEL.md) | Entity definitions, relationships, constraints, migrations | 2026-03-21 |
| 4 | [API_CONTRACT.md](./specs/API_CONTRACT.md) | Endpoint definitions, request/response schemas, error codes | 2026-03-21 |
| 5 | [SECURITY_MODEL.md](./specs/SECURITY_MODEL.md) | Threat model, authentication flow, authorization, RLS policies | 2026-03-21 |
| 6 | [TESTING_STRATEGY.md](./specs/TESTING_STRATEGY.md) | Test pyramid, coverage targets, test categories, CI integration | 2026-03-21 |
| 7 | [UI_SPECIFICATION.md](./specs/UI_SPECIFICATION.md) | Page inventory, component hierarchy, user flows, accessibility | 2026-03-21 |

## Dependency Graph

```
PRODUCT_VISION
    ├── SYSTEM_ARCHITECTURE
    │       ├── DATA_MODEL
    │       │       └── API_CONTRACT
    │       ├── SECURITY_MODEL
    │       │       └── API_CONTRACT
    │       └── TESTING_STRATEGY
    └── UI_SPECIFICATION
            ├── API_CONTRACT
            └── TESTING_STRATEGY
```

## Traceability Summary

| Prefix | Spec Document | VERIFY Tags | TRACED Tags |
|--------|--------------|-------------|-------------|
| PV | PRODUCT_VISION | 1 | 1 |
| SA | SYSTEM_ARCHITECTURE | 5 | 5 |
| DM | DATA_MODEL | 7 | 7 |
| AC | API_CONTRACT | 8 | 8 |
| SM | SECURITY_MODEL | 5 | 5 |
| TS | TESTING_STRATEGY | 4 | 4 |
| UI | UI_SPECIFICATION | 6 | 6 |
| **Total** | | **36** | **36** |

**Coverage:** 100% bidirectional traceability — every VERIFY tag has a corresponding TRACED tag, and every TRACED tag has a corresponding VERIFY tag. No orphans exist.

## VERIFY Tag Inventory

| Tag | Spec | Description |
|-----|------|-------------|
| PV-001 | PRODUCT_VISION | Server Actions with response.ok before redirect |
| SA-001 | SYSTEM_ARCHITECTURE | Prisma 6 as sole data access layer |
| SA-002 | SYSTEM_ARCHITECTURE | Fail-fast env validation at startup |
| SA-003 | SYSTEM_ARCHITECTURE | Root module imports all feature modules |
| SA-004 | SYSTEM_ARCHITECTURE | Pipeline state machine transitions |
| SA-005 | SYSTEM_ARCHITECTURE | Embed token-based access with expiration |
| DM-001 | DATA_MODEL | PostgreSQL database provider |
| DM-002 | DATA_MODEL | Role enum: VIEWER, EDITOR, ANALYST only |
| DM-003 | DATA_MODEL | PipelineState enum: DRAFT, ACTIVE, PAUSED, ARCHIVED |
| DM-004 | DATA_MODEL | Tenant as root entity |
| DM-005 | DATA_MODEL | User with tenantId and @@map |
| DM-006 | DATA_MODEL | DataPoint.value Decimal(20,6) |
| DM-007 | DATA_MODEL | DataPoint service Decimal handling |
| AC-001 | API_CONTRACT | Global ValidationPipe whitelist + transform |
| AC-002 | API_CONTRACT | Register DTO @IsIn role restriction |
| AC-003 | API_CONTRACT | Login DTO validation |
| AC-004 | API_CONTRACT | Auth service password hashing + login |
| AC-005 | API_CONTRACT | Auth controller endpoints |
| AC-006 | API_CONTRACT | DataSource tenant-scoped queries |
| AC-007 | API_CONTRACT | Pipeline transition validation |
| AC-008 | API_CONTRACT | Dashboard findOne with widget includes |
| SM-001 | SECURITY_MODEL | Fail-fast JWT_SECRET/CORS_ORIGIN |
| SM-002 | SECURITY_MODEL | $executeRaw tagged templates |
| SM-003 | SECURITY_MODEL | RLS tenant context via set_config |
| SM-004 | SECURITY_MODEL | bcrypt salt 12 |
| SM-005 | SECURITY_MODEL | JWT Bearer extraction |
| TS-001 | TESTING_STRATEGY | Auth service unit tests |
| TS-002 | TESTING_STRATEGY | Pipeline state machine unit tests |
| TS-003 | TESTING_STRATEGY | Pipeline integration tests |
| TS-004 | TESTING_STRATEGY | Tenant isolation integration tests |
| UI-001 | UI_SPECIFICATION | Frontend types match API contract |
| UI-002 | UI_SPECIFICATION | Dark mode via prefers-color-scheme |
| UI-003 | UI_SPECIFICATION | 8 shadcn/ui components |
| UI-004 | UI_SPECIFICATION | Nav in root layout |
| UI-005 | UI_SPECIFICATION | Root layout with skip-to-content |
| UI-006 | UI_SPECIFICATION | Error boundary role="alert" |
