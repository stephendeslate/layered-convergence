# Specification Index — Analytics Engine (Trial 24)

**Last Updated:** 2026-03-21

## Documents

| Document | Path | Description | Last Updated |
|----------|------|-------------|-------------|
| Product Vision | [specs/PRODUCT_VISION.md](specs/PRODUCT_VISION.md) | Business goals, capabilities, user types | 2026-03-21 |
| System Architecture | [specs/SYSTEM_ARCHITECTURE.md](specs/SYSTEM_ARCHITECTURE.md) | Technical stack, module structure, deployment | 2026-03-21 |
| Data Model | [specs/DATA_MODEL.md](specs/DATA_MODEL.md) | Entity definitions, relationships, constraints | 2026-03-21 |
| API Contract | [specs/API_CONTRACT.md](specs/API_CONTRACT.md) | REST endpoints, request/response formats | 2026-03-21 |
| Security Model | [specs/SECURITY_MODEL.md](specs/SECURITY_MODEL.md) | Auth, RLS, input validation, threat model | 2026-03-21 |
| Testing Strategy | [specs/TESTING_STRATEGY.md](specs/TESTING_STRATEGY.md) | Unit, integration, frontend test approach | 2026-03-21 |
| UI Specification | [specs/UI_SPECIFICATION.md](specs/UI_SPECIFICATION.md) | Frontend routes, components, accessibility | 2026-03-21 |

## Spec Dependency Graph

```
PRODUCT_VISION
  -> SYSTEM_ARCHITECTURE
  -> DATA_MODEL
  -> SECURITY_MODEL

SYSTEM_ARCHITECTURE
  -> DATA_MODEL
  -> API_CONTRACT
  -> TESTING_STRATEGY

DATA_MODEL
  -> API_CONTRACT
  -> SECURITY_MODEL

API_CONTRACT
  -> SECURITY_MODEL

SECURITY_MODEL
  -> TESTING_STRATEGY

TESTING_STRATEGY
  -> UI_SPECIFICATION

UI_SPECIFICATION
  -> PRODUCT_VISION
  -> SYSTEM_ARCHITECTURE
```

## VERIFY Tag Inventory

### Product Vision (PV) — 7 tags
| Tag | Description | Implementation |
|-----|-------------|----------------|
| PV-001 | DataSource belongs to one Tenant | backend/prisma/schema.prisma:77 |
| PV-002 | SyncRun state machine | backend/src/sync-run/sync-run.service.ts:14 |
| PV-003 | Pipeline state machine enforces valid transitions | backend/src/pipeline/pipeline.service.ts:10 |
| PV-004 | Pipeline starts in DRAFT status | backend/prisma/schema.prisma:102 |
| PV-005 | Dashboard contains Widgets | backend/prisma/schema.prisma:121 |
| PV-006 | Embed uses unique token | backend/prisma/schema.prisma:143 |
| PV-007 | ADMIN role rejected at registration | backend/src/auth/auth.service.ts:22 |

### System Architecture (SA) — 7 tags
| Tag | Description | Implementation |
|-----|-------------|----------------|
| SA-001 | NestJS modules in app.module.ts | backend/src/app.module.ts:2 |
| SA-002 | PrismaService extends PrismaClient | backend/src/prisma/prisma.service.ts:5 |
| SA-003 | PrismaModule is global | backend/src/prisma/prisma.module.ts:4 |
| SA-004 | JwtStrategy validates tokens | backend/src/auth/jwt.strategy.ts:11 |
| SA-005 | @@map on all models | backend/prisma/schema.prisma:51 |
| SA-006 | 8 shadcn/ui components | frontend/components/ui/button.tsx:3 |
| SA-007 | Skip-to-content link in layout | frontend/app/layout.tsx:3 |

### Data Model (DM) — 5 tags
| Tag | Description | Implementation |
|-----|-------------|----------------|
| DM-001 | @@map on all models | backend/prisma/schema.prisma:1 |
| DM-002 | @map on multi-word columns | backend/prisma/schema.prisma:2 |
| DM-003 | DataPoint Decimal(20,6) | backend/prisma/schema.prisma:86 |
| DM-004 | DataPoint value with precision | backend/src/data-point/data-point.service.ts:3 |
| DM-005 | findFirst justification comments | backend/src/pipeline/pipeline.service.ts:4 |

### API Contract (AC) — 10 tags
| Tag | Description | Implementation |
|-----|-------------|----------------|
| AC-001 | Pipeline CRUD with tenant isolation | backend/src/pipeline/pipeline.service.ts:1 |
| AC-002 | Pipeline transition validates state machine | backend/src/pipeline/pipeline.service.ts:2 |
| AC-003 | Dashboard CRUD with tenant isolation | backend/src/dashboard/dashboard.service.ts:1 |
| AC-004 | DataSource CRUD with tenant isolation | backend/src/data-source/data-source.service.ts:1 |
| AC-005 | DataPoint CRUD with tenant isolation | backend/src/data-point/data-point.service.ts:1 |
| AC-006 | Widget CRUD operations | backend/src/widget/widget.service.ts:1 |
| AC-007 | Embed CRUD with tenant isolation | backend/src/embed/embed.service.ts:1 |
| AC-008 | SyncRun CRUD with tenant isolation | backend/src/sync-run/sync-run.service.ts:1 |
| AC-009 | SyncRun state machine validation | backend/src/sync-run/sync-run.service.ts:2 |
| AC-010 | JwtAuthGuard protects endpoints | backend/src/auth/jwt-auth.guard.ts:3 |

### Security Model (SEC) — 7 tags
| Tag | Description | Implementation |
|-----|-------------|----------------|
| SEC-001 | RLS FORCE on all tenant tables | backend/prisma/rls.sql:1 |
| SEC-002 | JWT_SECRET fail-fast | backend/src/main.ts:1 |
| SEC-003 | Global ValidationPipe config | backend/src/main.ts:2 |
| SEC-004 | bcrypt salt 12 | backend/src/auth/auth.service.ts:1 |
| SEC-005 | ADMIN role rejected | backend/src/auth/auth.service.ts:2 |
| SEC-006 | @IsIn excludes ADMIN in DTO | backend/src/auth/dto/register.dto.ts:1 |
| SEC-007 | TenantContextService sets RLS variable | backend/src/tenant-context/tenant-context.service.ts:1 |

### Testing Strategy (TS) — 4 tags
| Tag | Description | Implementation |
|-----|-------------|----------------|
| TS-001 | Docker Compose for test DB | backend/docker-compose.test.yml:1 |
| TS-002 | Integration test auth | backend/__integration__/auth.spec.ts:1 |
| TS-003 | Integration test pipeline | backend/__integration__/pipeline.spec.ts:1 |
| TS-004 | Frontend axe-core tests | frontend/__tests__/pages.test.tsx:1 |

### UI Specification (UI) — 7 tags
| Tag | Description | Implementation |
|-----|-------------|----------------|
| UI-001 | Tailwind CSS 4 import syntax | frontend/app/globals.css:2 |
| UI-002 | Dark mode prefers-color-scheme | frontend/app/globals.css:4 |
| UI-003 | Button component with variants | frontend/components/ui/button.tsx:1 |
| UI-004 | Nav component in layout | frontend/components/nav.tsx:1 |
| UI-005 | Root layout skip-to-content | frontend/app/layout.tsx:1 |
| UI-006 | Server actions with response.ok | frontend/app/actions.ts:1 |
| UI-007 | Keyboard navigation tests | frontend/__tests__/keyboard-navigation.test.tsx:1 |

## Traceability Summary

- **Total VERIFY tags**: 47
- **Total TRACED tags**: 47 (matching 1:1)
- **Orphan VERIFY tags**: 0
- **Orphan TRACED tags**: 0
- **All specs cross-reference at least 2 other specs**: Yes
- **All specs >= 50 lines**: Yes
- **Bidirectional traceability**: 100%
