# Specification Index — Escrow Marketplace (Trial 32)

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
| EM-PV-001 | Transaction belongs to one Tenant | apps/api/prisma/schema.prisma:62 |
| EM-PV-002 | Dispute state machine | apps/api/src/dispute/dispute.service.ts:3 |
| EM-PV-003 | Transaction state machine enforces valid transitions | apps/api/src/transaction/transaction.service.ts:3 |
| EM-PV-004 | Webhook configuration scoped to Tenant | apps/api/prisma/schema.prisma:110 |
| EM-PV-005 | BUYER role assigned at registration | apps/api/src/auth/auth.service.ts:8 |
| EM-PV-006 | ARBITER role available at registration | apps/api/src/auth/auth.service.ts:8 |
| EM-PV-007 | ADMIN role rejected at registration | apps/api/src/auth/auth.service.ts:8 |

### System Architecture (SA) — 7 tags
| Tag | Description | Implementation |
|-----|-------------|----------------|
| EM-SA-001 | NestJS modules in app.module.ts | apps/api/src/app.module.ts:1 |
| EM-SA-002 | PrismaModule is global | apps/api/src/prisma/prisma.module.ts:4 |
| EM-SA-003 | JwtAuthGuard protects endpoints | apps/api/src/auth/jwt-auth.guard.ts:2 |
| EM-SA-004 | findFirst justification comments | apps/api/src/transaction/transaction.service.ts:4 |
| EM-SA-005 | @@map on all models | apps/api/prisma/schema.prisma:8 |
| EM-SA-006 | 8 shadcn/ui components | apps/web/components/ui/button.tsx:1 |
| EM-SA-007 | Skip-to-content link in layout | apps/web/app/layout.tsx:2 |

### Data Model (DM) — 4 tags
| Tag | Description | Implementation |
|-----|-------------|----------------|
| EM-DM-001 | @@map on all models | apps/api/prisma/schema.prisma:1 |
| EM-DM-002 | @map on multi-word columns | apps/api/prisma/schema.prisma:2 |
| EM-DM-003 | Transaction Decimal(20,2) | apps/api/prisma/schema.prisma:3 |
| EM-DM-004 | Payout Decimal(20,2) | apps/api/prisma/schema.prisma:4 |

### API Contract (AC) — 6 tags
| Tag | Description | Implementation |
|-----|-------------|----------------|
| EM-AC-001 | Transaction CRUD with tenant isolation | apps/api/src/transaction/transaction.service.ts:1 |
| EM-AC-002 | Transaction state machine validation | apps/api/src/transaction/transaction.service.ts:2 |
| EM-AC-003 | Dispute CRUD with tenant isolation | apps/api/src/dispute/dispute.service.ts:1 |
| EM-AC-004 | Dispute state machine validation | apps/api/src/dispute/dispute.service.ts:2 |
| EM-AC-005 | Payout CRUD with tenant isolation | apps/api/src/payout/payout.service.ts:1 |
| EM-AC-006 | Webhook CRUD with tenant isolation | apps/api/src/webhook/webhook.service.ts:1 |

### Security Model (SM) — 7 tags
| Tag | Description | Implementation |
|-----|-------------|----------------|
| EM-SM-001 | RLS FORCE on all tenant tables | apps/api/prisma/migrations/20240101000000_init/migration.sql:1 |
| EM-SM-002 | JWT_SECRET fail-fast | apps/api/src/main.ts:1 |
| EM-SM-003 | Global ValidationPipe config | apps/api/src/main.ts:2 |
| EM-SM-004 | bcrypt salt 12 | apps/api/src/auth/auth.service.ts:1 |
| EM-SM-005 | ADMIN role rejected | apps/api/src/auth/auth.service.ts:2 |
| EM-SM-006 | @IsIn excludes ADMIN in DTO | apps/api/src/auth/dto/register.dto.ts:1 |
| EM-SM-007 | TenantContextService sets RLS variable | apps/api/src/tenant-context/tenant-context.service.ts:1 |

### Testing Strategy (TS) — 4 tags
| Tag | Description | Implementation |
|-----|-------------|----------------|
| EM-TS-001 | Docker Compose for test DB | docker-compose.test.yml:1 |
| EM-TS-002 | Integration test auth | apps/api/__integration__/auth.spec.ts:1 |
| EM-TS-003 | Integration test transaction | apps/api/__integration__/transaction.spec.ts:1 |
| EM-TS-004 | Frontend axe-core tests | apps/web/__tests__/pages.test.tsx:1 |

### UI Specification (UI) — 7 tags
| Tag | Description | Implementation |
|-----|-------------|----------------|
| EM-UI-001 | Tailwind CSS 4 import syntax | apps/web/app/globals.css:1 |
| EM-UI-002 | Dark mode prefers-color-scheme | apps/web/app/globals.css:22 |
| EM-UI-003 | Button component with variants | apps/web/components/ui/button.tsx:1 |
| EM-UI-004 | Nav component in layout | apps/web/components/nav.tsx:1 |
| EM-UI-005 | Root layout skip-to-content | apps/web/app/layout.tsx:1 |
| EM-UI-006 | Server actions with response.ok | apps/web/app/actions.ts:1 |
| EM-UI-007 | Keyboard navigation tests | apps/web/__tests__/keyboard-navigation.test.tsx:1 |

## Summary

- **Total VERIFY tags**: 42
- **Total TRACED tags**: 42 (matching 1:1)
- **All specs cross-reference at least 2 other specs**: Yes
- **All specs >= 50 lines**: Yes
