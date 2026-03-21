# Specification Index — Analytics Engine (Trial 32)

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

### Product Vision (PV) — 7 tags
| Tag | Description | Implementation |
|-----|-------------|----------------|
| AE-PV-001 | DataSource belongs to one Tenant | apps/api/prisma/schema.prisma:62 |
| AE-PV-002 | SyncRun state machine | apps/api/src/sync-run/sync-run.service.ts:3 |
| AE-PV-003 | Pipeline state machine enforces valid transitions | apps/api/src/pipeline/pipeline.service.ts:3 |
| AE-PV-004 | Pipeline starts in DRAFT status | apps/api/prisma/schema.prisma:90 |
| AE-PV-005 | Dashboard contains Widgets | apps/api/prisma/schema.prisma:101 |
| AE-PV-006 | Embed uses unique token | apps/api/prisma/schema.prisma:113 |
| AE-PV-007 | ADMIN role rejected at registration | apps/api/src/auth/auth.service.ts:8 |

### System Architecture (SA) — 7 tags
| Tag | Description | Implementation |
|-----|-------------|----------------|
| AE-SA-001 | NestJS modules in app.module.ts | apps/api/src/app.module.ts:1 |
| AE-SA-002 | PrismaModule is global | apps/api/src/prisma/prisma.module.ts:4 |
| AE-SA-003 | JwtAuthGuard protects endpoints | apps/api/src/auth/jwt-auth.guard.ts:2 |
| AE-SA-004 | findFirst justification comments | apps/api/src/pipeline/pipeline.service.ts:4 |
| AE-SA-005 | @@map on all models | apps/api/prisma/schema.prisma:8 |
| AE-SA-006 | 8 shadcn/ui components | apps/web/components/ui/button.tsx:1 |
| AE-SA-007 | Skip-to-content link in layout | apps/web/app/layout.tsx:2 |

### Data Model (DM) — 4 tags
| Tag | Description | Implementation |
|-----|-------------|----------------|
| AE-DM-001 | @@map on all models | apps/api/prisma/schema.prisma:1 |
| AE-DM-002 | @map on multi-word columns | apps/api/prisma/schema.prisma:2 |
| AE-DM-003 | DataPoint Decimal(20,6) | apps/api/prisma/schema.prisma:3 |
| AE-DM-004 | DataPoint value with precision | apps/api/src/data-point/data-point.service.ts:2 |

### API Contract (AC) — 9 tags
| Tag | Description | Implementation |
|-----|-------------|----------------|
| AE-AC-001 | Pipeline CRUD with tenant isolation | apps/api/src/pipeline/pipeline.service.ts:1 |
| AE-AC-002 | Pipeline transition validates state machine | apps/api/src/pipeline/pipeline.service.ts:2 |
| AE-AC-003 | Dashboard CRUD with tenant isolation | apps/api/src/dashboard/dashboard.service.ts:1 |
| AE-AC-004 | DataSource CRUD with tenant isolation | apps/api/src/data-source/data-source.service.ts:1 |
| AE-AC-005 | DataPoint CRUD with tenant isolation | apps/api/src/data-point/data-point.service.ts:1 |
| AE-AC-006 | Widget CRUD operations | apps/api/src/widget/widget.service.ts:1 |
| AE-AC-007 | Embed CRUD with tenant isolation | apps/api/src/embed/embed.service.ts:1 |
| AE-AC-008 | SyncRun CRUD with tenant isolation | apps/api/src/sync-run/sync-run.service.ts:1 |
| AE-AC-009 | SyncRun state machine validation | apps/api/src/sync-run/sync-run.service.ts:2 |

### Security Model (SM) — 7 tags
| Tag | Description | Implementation |
|-----|-------------|----------------|
| AE-SM-001 | RLS FORCE on all tenant tables | apps/api/prisma/migrations/20240101000000_init/migration.sql:1 |
| AE-SM-002 | JWT_SECRET fail-fast | apps/api/src/main.ts:1 |
| AE-SM-003 | Global ValidationPipe config | apps/api/src/main.ts:2 |
| AE-SM-004 | bcrypt salt 12 | apps/api/src/auth/auth.service.ts:1 |
| AE-SM-005 | ADMIN role rejected | apps/api/src/auth/auth.service.ts:2 |
| AE-SM-006 | @IsIn excludes ADMIN in DTO | apps/api/src/auth/dto/register.dto.ts:1 |
| AE-SM-007 | TenantContextService sets RLS variable | apps/api/src/tenant-context/tenant-context.service.ts:1 |

### Testing Strategy (TS) — 4 tags
| Tag | Description | Implementation |
|-----|-------------|----------------|
| AE-TS-001 | Docker Compose for test DB | docker-compose.test.yml:1 |
| AE-TS-002 | Integration test auth | apps/api/__integration__/auth.spec.ts:1 |
| AE-TS-003 | Integration test pipeline | apps/api/__integration__/pipeline.spec.ts:1 |
| AE-TS-004 | Frontend axe-core tests | apps/web/__tests__/pages.test.tsx:1 |

### UI Specification (UI) — 7 tags
| Tag | Description | Implementation |
|-----|-------------|----------------|
| AE-UI-001 | Tailwind CSS 4 import syntax | apps/web/app/globals.css:1 |
| AE-UI-002 | Dark mode prefers-color-scheme | apps/web/app/globals.css:22 |
| AE-UI-003 | Button component with variants | apps/web/components/ui/button.tsx:1 |
| AE-UI-004 | Nav component in layout | apps/web/components/nav.tsx:1 |
| AE-UI-005 | Root layout skip-to-content | apps/web/app/layout.tsx:1 |
| AE-UI-006 | Server actions with response.ok | apps/web/app/actions.ts:1 |
| AE-UI-007 | Keyboard navigation tests | apps/web/__tests__/keyboard-navigation.test.tsx:1 |

## Summary

- **Total VERIFY tags**: 45
- **Total TRACED tags**: 45 (matching 1:1)
- **All specs cross-reference at least 2 other specs**: Yes
- **All specs >= 50 lines**: Yes
