# Specification Index

## Analytics Engine - Trial 22 (Layer 3: Specifications)

### Spec Document Inventory

| # | Document | Path | VERIFY Tags | Lines |
|---|----------|------|-------------|-------|
| 1 | Product Vision | specs/PRODUCT_VISION.md | 3 (PV-001 to PV-003) | 70+ |
| 2 | System Architecture | specs/SYSTEM_ARCHITECTURE.md | 14 (SA-001 to SA-014) | 80+ |
| 3 | Data Model | specs/DATA_MODEL.md | 7 (DM-001 to DM-007) | 80+ |
| 4 | API Contract | specs/API_CONTRACT.md | 19 (AC-001 to AC-019) | 120+ |
| 5 | Security Model | specs/SECURITY_MODEL.md | 13 (SEC-001 to SEC-013) | 90+ |
| 6 | Testing Strategy | specs/TESTING_STRATEGY.md | 8 (TS-001 to TS-008) | 70+ |
| 7 | UI Specification | specs/UI_SPECIFICATION.md | 28 (UI-001 to UI-028) | 100+ |

**Total VERIFY tags: 92**

### Dependency Graph

```
PRODUCT_VISION
    ├──> SYSTEM_ARCHITECTURE (implements the vision)
    │       ├──> DATA_MODEL (defines entities)
    │       │       └──> SECURITY_MODEL (RLS on data model)
    │       ├──> API_CONTRACT (exposes modules as endpoints)
    │       │       └──> SECURITY_MODEL (auth on endpoints)
    │       └──> UI_SPECIFICATION (presents the system)
    │               └──> TESTING_STRATEGY (validates the UI)
    └──> TESTING_STRATEGY (validates the product)
            ├──> DATA_MODEL (test fixtures match schema)
            └──> API_CONTRACT (integration tests hit endpoints)
```

### Traceability Summary

Every VERIFY tag in the spec documents has a corresponding TRACED tag in the
source code. The TRACED comments are placed at the top of the referenced file
or near the relevant implementation.

#### VERIFY Tag Distribution by Prefix

| Prefix | Count | Spec Document |
|--------|-------|---------------|
| PV | 3 | PRODUCT_VISION.md |
| SA | 14 | SYSTEM_ARCHITECTURE.md |
| DM | 7 | DATA_MODEL.md |
| AC | 19 | API_CONTRACT.md |
| SEC | 13 | SECURITY_MODEL.md |
| TS | 8 | TESTING_STRATEGY.md |
| UI | 28 | UI_SPECIFICATION.md |

#### Source Files with TRACED Tags

| Source File | TRACED Tags |
|-------------|-------------|
| prisma/schema.prisma | DM-001, DM-002, DM-003, DM-004, DM-005, SA-001, SEC-001 |
| prisma/rls.sql | SEC-002, SEC-003, DM-006 |
| src/main.ts | SEC-004, SEC-005, SA-002 |
| src/app.module.ts | SA-003 |
| src/prisma/prisma.module.ts | SA-004 |
| src/prisma/prisma.service.ts | SA-005, SEC-006 |
| src/tenant-context/tenant-context.module.ts | SA-006 |
| src/tenant-context/tenant-context.middleware.ts | SEC-007 |
| src/auth/auth.module.ts | SA-007 |
| src/auth/auth.service.ts | SEC-008, SEC-009, AC-001 |
| src/auth/auth.controller.ts | AC-002 |
| src/auth/dto/register.dto.ts | AC-003, SEC-010 |
| src/auth/dto/login.dto.ts | AC-004 |
| src/auth/jwt.strategy.ts | SEC-011 |
| src/auth/jwt-auth.guard.ts | SEC-012 |
| src/dashboard/dashboard.module.ts | SA-008 |
| src/dashboard/dashboard.service.ts | AC-005 |
| src/dashboard/dashboard.controller.ts | AC-006 |
| src/data-source/data-source.module.ts | SA-009 |
| src/data-source/data-source.service.ts | AC-007 |
| src/data-source/data-source.controller.ts | AC-008 |
| src/data-point/data-point.module.ts | SA-010 |
| src/data-point/data-point.service.ts | AC-009 |
| src/data-point/data-point.controller.ts | AC-010 |
| src/pipeline/pipeline.module.ts | SA-011 |
| src/pipeline/pipeline.service.ts | AC-011, PV-001 |
| src/pipeline/pipeline.controller.ts | AC-012 |
| src/widget/widget.module.ts | SA-012 |
| src/widget/widget.service.ts | AC-013 |
| src/widget/widget.controller.ts | AC-014 |
| src/embed/embed.module.ts | SA-013 |
| src/embed/embed.service.ts | AC-015 |
| src/embed/embed.controller.ts | AC-016 |
| src/sync-run/sync-run.module.ts | SA-014 |
| src/sync-run/sync-run.service.ts | AC-017, PV-002 |
| src/sync-run/sync-run.controller.ts | AC-018 |
| docker-compose.test.yml | TS-001 |
| __integration__/auth.integration.spec.ts | TS-002, TS-003 |
| __integration__/pipeline.integration.spec.ts | TS-004 |
| frontend/lib/types.ts | DM-007 |
| frontend/lib/utils.ts | UI-001 |
| frontend/app/globals.css | UI-002 |
| frontend/components/nav.tsx | UI-003 |
| frontend/app/layout.tsx | UI-004 |
| frontend/app/page.tsx | UI-005 |
| frontend/app/loading.tsx | UI-006 |
| frontend/app/error.tsx | UI-007 |
| frontend/app/dashboard/page.tsx | UI-008 |
| frontend/app/dashboard/loading.tsx | UI-009 |
| frontend/app/dashboard/error.tsx | UI-010 |
| frontend/app/data-sources/page.tsx | UI-011 |
| frontend/app/data-sources/loading.tsx | UI-012 |
| frontend/app/data-sources/error.tsx | UI-013 |
| frontend/app/pipelines/page.tsx | UI-014 |
| frontend/app/pipelines/loading.tsx | UI-015 |
| frontend/app/pipelines/error.tsx | UI-016 |
| frontend/app/login/page.tsx | UI-017 |
| frontend/app/login/loading.tsx | UI-018 |
| frontend/app/login/error.tsx | UI-019 |
| frontend/components/ui/button.tsx | UI-020 |
| frontend/components/ui/card.tsx | UI-021 |
| frontend/components/ui/input.tsx | UI-022 |
| frontend/components/ui/label.tsx | UI-023 |
| frontend/components/ui/badge.tsx | UI-024 |
| frontend/components/ui/select.tsx | UI-025 |
| frontend/components/ui/table.tsx | UI-026 |
| frontend/components/ui/dialog.tsx | UI-027 |
| frontend/app/actions.ts | AC-019, SEC-013 |
| frontend/__tests__/nav.test.tsx | TS-005 |
| frontend/__tests__/loading.test.tsx | TS-006 |
| frontend/__tests__/button.test.tsx | TS-007 |
| frontend/__tests__/keyboard-navigation.test.tsx | TS-008, UI-028 |

### Cross-Reference Matrix

| Spec | References To | Referenced By |
|------|--------------|---------------|
| PRODUCT_VISION | - | SYSTEM_ARCHITECTURE, TESTING_STRATEGY |
| SYSTEM_ARCHITECTURE | DATA_MODEL, API_CONTRACT, SECURITY_MODEL, UI_SPECIFICATION, TESTING_STRATEGY | PRODUCT_VISION |
| DATA_MODEL | SECURITY_MODEL, API_CONTRACT, SYSTEM_ARCHITECTURE | SYSTEM_ARCHITECTURE, TESTING_STRATEGY |
| API_CONTRACT | SECURITY_MODEL, DATA_MODEL, UI_SPECIFICATION | SYSTEM_ARCHITECTURE, TESTING_STRATEGY |
| SECURITY_MODEL | DATA_MODEL, SYSTEM_ARCHITECTURE, API_CONTRACT | DATA_MODEL, API_CONTRACT |
| TESTING_STRATEGY | API_CONTRACT, DATA_MODEL, UI_SPECIFICATION | PRODUCT_VISION, UI_SPECIFICATION |
| UI_SPECIFICATION | TESTING_STRATEGY, API_CONTRACT | SYSTEM_ARCHITECTURE |
