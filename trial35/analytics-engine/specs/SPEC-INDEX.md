# Analytics Engine — Specification Index

**Project:** analytics-engine
**Version:** 1.0.0
**Last Updated:** 2026-03-21

---

## Document Hierarchy

This specification index provides a comprehensive overview of all specification
documents for the Analytics Engine multi-tenant analytics platform. Each document
covers a specific domain or cross-cutting concern of the system.

## Specifications

### 1. System Architecture (system-architecture.md)
Defines the monorepo structure, workspace configuration, shared package design,
and overall system topology including NestJS API and Next.js frontend.
- VERIFY: AE-SHARED-001 — Shared package barrel export
- VERIFY: AE-SHARED-002 — Registration role whitelist
- VERIFY: AE-SHARED-003 — Pipeline status transitions
- VERIFY: AE-SHARED-004 — Pagination utility
- VERIFY: AE-SHARED-005 — Role validation function
- VERIFY: AE-SHARED-006 — Format bytes utility
- VERIFY: AE-SHARED-007 — Generate ID utility
- VERIFY: AE-SHARED-008 — Slug generation utility

### 2. Authentication & Authorization (auth.md)
Covers JWT-based authentication, bcrypt password hashing, role-based access
control, and registration restrictions.
- VERIFY: AE-AUTH-001 — Auth module with JWT
- VERIFY: AE-AUTH-002 — Auth controller
- VERIFY: AE-AUTH-003 — Auth service with bcrypt salt 12
- VERIFY: AE-AUTH-004 — DTO role validation excluding ADMIN
- VERIFY: AE-AUTH-005 — JWT strategy and guard

### 3. API Layer (api.md)
Documents the NestJS backend structure including modules, controllers,
services, and fail-fast environment validation.
- VERIFY: AE-API-001 — Fail-fast environment validation
- VERIFY: AE-API-002 — Root application module
- VERIFY: AE-API-003 — Prisma service with safe queries

### 4. Database Schema (database.md)
Defines the Prisma schema, model mappings, enum mappings, and migration
strategy with Row Level Security.
Cross-references: auth.md, api.md

### 5. Frontend UI (frontend.md)
Covers the Next.js frontend including component library, routing, loading
and error states, and accessibility requirements.
Cross-references: system-architecture.md

### 6. Testing Strategy (testing.md)
Documents unit tests, integration tests, accessibility tests, and keyboard
navigation tests across both API and web applications.
Cross-references: auth.md, api.md, frontend.md

### 7. Infrastructure (infrastructure.md)
Covers Docker, CI/CD, environment configuration, and deployment strategy
for the analytics engine platform.
Cross-references: database.md, api.md

---

## Tag Ranges

| Prefix | Range | Domain |
|--------|-------|--------|
| AE-SHARED | 001-008 | Shared package |
| AE-AUTH | 001-005 | Authentication |
| AE-API | 001-003 | API layer |
| AE-DB | 001-010 | Database |
| AE-MIG | 001-002 | Migrations |
| AE-SEED | 001 | Seeding |
| AE-DASH | 001-003 | Dashboards |
| AE-PIPE | 001-003 | Pipelines |
| AE-UI | Various | Frontend |
| AE-ACTION | 001-002 | Server actions |
| AE-TEST | 001-007 | Tests |
| AE-CI | 001 | CI/CD |
| AE-DOCKER | 001 | Docker |
| AE-ENV | 001 | Environment |

**Total VERIFY tags:** 55
**Total TRACED tags:** 55
