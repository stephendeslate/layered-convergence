# Escrow Marketplace — Specification Index

**Project:** escrow-marketplace
**Version:** 1.0.0
**Last Updated:** 2026-03-21

---

## Document Hierarchy

This specification index provides a comprehensive overview of all specification
documents for the Escrow Marketplace multi-tenant escrow platform. Each document
covers a specific domain or cross-cutting concern of the system.

## Specifications

### 1. System Architecture (system-architecture.md)
Defines the monorepo structure, workspace configuration, shared package design,
and overall system topology including NestJS API and Next.js frontend.
Tags: EM-SHARED-001 through EM-SHARED-008

### 2. Authentication & Authorization (auth.md)
Covers JWT-based authentication, bcrypt password hashing, role-based access
control, and registration restrictions.
Tags: EM-AUTH-001 through EM-AUTH-005

### 3. API Layer (api.md)
Documents the NestJS backend structure including modules, controllers,
services, and fail-fast environment validation.
Tags: EM-API-001 through EM-API-003, EM-LIST-001 through EM-LIST-003,
EM-TXN-001 through EM-TXN-003, EM-ACTION-001 through EM-ACTION-002

### 4. Database Schema (database.md)
Defines the Prisma schema, model mappings, enum mappings, and migration
strategy with Row Level Security and Decimal for money fields.
Tags: EM-DB-001 through EM-DB-008, EM-MIG-001 through EM-MIG-002, EM-SEED-001
Cross-references: auth.md, api.md

### 5. Frontend UI (frontend.md)
Covers the Next.js frontend including component library, routing, loading
and error states, and accessibility requirements.
Tags: EM-UI-COMP-001, EM-UI-UTIL-001, EM-UI-BASE-001, EM-UI-DARK-001,
EM-UI-LAYOUT-001, EM-UI-NAV-001, EM-UI-HOME-001, EM-UI-LIST-001,
EM-UI-TXN-001, EM-UI-DISP-001, EM-UI-SET-001, EM-UI-LOAD-001,
EM-UI-ERR-001, EM-UI-ERR-002
Cross-references: system-architecture.md

### 6. Testing Strategy (testing.md)
Documents unit tests, integration tests, accessibility tests, and keyboard
navigation tests across both API and web applications.
Tags: EM-TEST-001 through EM-TEST-007
Cross-references: auth.md, api.md, frontend.md

### 7. Infrastructure (infrastructure.md)
Covers Docker, CI/CD, environment configuration, and deployment strategy
for the escrow marketplace platform.
Tags: EM-CI-001
Cross-references: database.md, api.md

---

## Tag Ranges

| Prefix | Range | Domain |
|--------|-------|--------|
| EM-SHARED | 001-008 | Shared package |
| EM-AUTH | 001-005 | Authentication |
| EM-API | 001-003 | API layer |
| EM-DB | 001-008 | Database |
| EM-MIG | 001-002 | Migrations |
| EM-SEED | 001 | Seeding |
| EM-LIST | 001-003 | Listings |
| EM-TXN | 001-003 | Transactions |
| EM-UI | Various | Frontend |
| EM-ACTION | 001-002 | Server actions |
| EM-TEST | 001-007 | Tests |
| EM-CI | 001 | CI/CD |
| EM-DOCKER | 001 | Docker |
| EM-ENV | 001 | Environment |

**Total VERIFY tags:** 55
**Total TRACED tags:** 55
