# Specification Index — Escrow Marketplace

## Documents

| # | Document | Path | VERIFY Count | Description |
|---|----------|------|-------------|-------------|
| 1 | Product Vision | [specs/PRODUCT_VISION.md](specs/PRODUCT_VISION.md) | 3 (PV-001..PV-003) | Business goals, target users, transaction lifecycle |
| 2 | System Architecture | [specs/SYSTEM_ARCHITECTURE.md](specs/SYSTEM_ARCHITECTURE.md) | 5 (SA-001..SA-005) | Technical stack, module structure, state machine |
| 3 | Data Model | [specs/DATA_MODEL.md](specs/DATA_MODEL.md) | 6 (DM-001..DM-006) | Prisma schema, enums, RLS policies |
| 4 | API Contract | [specs/API_CONTRACT.md](specs/API_CONTRACT.md) | 10 (AC-001..AC-010) | REST endpoints, request/response formats |
| 5 | Security Model | [specs/SECURITY_MODEL.md](specs/SECURITY_MODEL.md) | 6 (SM-001..SM-006) | Auth, RLS, input validation, threat model |
| 6 | Testing Strategy | [specs/TESTING_STRATEGY.md](specs/TESTING_STRATEGY.md) | 5 (TS-001..TS-005) | Jest backend, Vitest frontend, accessibility |
| 7 | UI Specification | [specs/UI_SPECIFICATION.md](specs/UI_SPECIFICATION.md) | 6 (UI-001..UI-006) | Routes, components, accessibility, dark mode |

## Total VERIFY Tags: 41

## VERIFY Tag Inventory

### PV — Product Vision
- `PV-001` — Platform supports BUYER and SELLER roles
- `PV-002` — Transaction state machine enforces escrow lifecycle
- `PV-003` — Dispute resolution flow exists for contested transactions

### SA — System Architecture
- `SA-001` — NestJS backend with modular architecture
- `SA-002` — Prisma 6 ORM with PostgreSQL 16
- `SA-003` — JWT-based authentication with fail-fast validation
- `SA-004` — Transaction state machine enforced in service layer
- `SA-005` — Webhook delivery system for event notifications

### DM — Data Model
- `DM-001` — All models use @@map for table names
- `DM-002` — All columns use @map for column names
- `DM-003` — Monetary values use Decimal(12,2)
- `DM-004` — Role enum contains only BUYER and SELLER
- `DM-005` — TransactionStatus enum matches state machine
- `DM-006` — RLS migration exists for user-scoped tables

### AC — API Contract
- `AC-001` — POST /auth/register with email, password, role
- `AC-002` — POST /auth/login returns JWT access token
- `AC-003` — POST /transactions creates a new escrow transaction
- `AC-004` — PATCH /transactions/:id/status transitions state machine
- `AC-005` — GET /transactions returns user's transactions
- `AC-006` — POST /disputes creates a dispute on a transaction
- `AC-007` — PATCH /disputes/:id/resolve resolves a dispute
- `AC-008` — GET /payouts returns user's payouts
- `AC-009` — POST /webhooks registers a webhook subscription
- `AC-010` — All protected routes require Authorization: Bearer <token>

### SM — Security Model
- `SM-001` — bcrypt with salt rounds = 12
- `SM-002` — JWT_SECRET fail-fast validation in main.ts
- `SM-003` — CORS_ORIGIN fail-fast validation in main.ts
- `SM-004` — Defense-in-depth ADMIN rejection in auth service
- `SM-005` — Row-Level Security FORCE on user-scoped tables
- `SM-006` — No $executeRawUnsafe anywhere in codebase

### TS — Testing Strategy
- `TS-001` — Backend tests use Test.createTestingModule with real modules
- `TS-002` — Integration tests run against real PostgreSQL database
- `TS-003` — All frontend tests include axe-core accessibility checks
- `TS-004` — Keyboard navigation tests exist for interactive components
- `TS-005` — State machine transition tests cover all valid and invalid paths

### UI — UI Specification
- `UI-001` — Skip-to-content link in root layout
- `UI-002` — loading.tsx in every route with role="status" and aria-busy="true"
- `UI-003` — error.tsx in every route with role="alert"
- `UI-004` — Dark mode via prefers-color-scheme
- `UI-005` — 8 shadcn/ui components used
- `UI-006` — Nav component in root layout

## Cross-Reference Matrix

Each spec document links to at least 2 other specs:

| Document | References |
|----------|-----------|
| PRODUCT_VISION | DATA_MODEL, API_CONTRACT, SYSTEM_ARCHITECTURE, SECURITY_MODEL, TESTING_STRATEGY, UI_SPECIFICATION |
| SYSTEM_ARCHITECTURE | PRODUCT_VISION, SECURITY_MODEL, API_CONTRACT, DATA_MODEL, UI_SPECIFICATION, TESTING_STRATEGY |
| DATA_MODEL | SYSTEM_ARCHITECTURE, SECURITY_MODEL, PRODUCT_VISION, API_CONTRACT, TESTING_STRATEGY |
| API_CONTRACT | SYSTEM_ARCHITECTURE, DATA_MODEL, SECURITY_MODEL, PRODUCT_VISION, TESTING_STRATEGY, UI_SPECIFICATION |
| SECURITY_MODEL | SYSTEM_ARCHITECTURE, DATA_MODEL, API_CONTRACT, TESTING_STRATEGY, PRODUCT_VISION |
| TESTING_STRATEGY | SYSTEM_ARCHITECTURE, API_CONTRACT, SECURITY_MODEL, DATA_MODEL, PRODUCT_VISION, UI_SPECIFICATION |
| UI_SPECIFICATION | SYSTEM_ARCHITECTURE, API_CONTRACT, SECURITY_MODEL, TESTING_STRATEGY, PRODUCT_VISION |
