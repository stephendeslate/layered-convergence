# Field Service Dispatch — Specification Index

**Project:** field-service-dispatch
**Version:** 1.0.0
**Last Updated:** 2026-03-21

---

## Document Hierarchy

This specification index provides a comprehensive overview of all specification
documents for the Field Service Dispatch multi-tenant platform. Each document
covers a specific domain or cross-cutting concern of the system.

## Specifications

### 1. System Architecture (system-architecture.md)
Defines the monorepo structure, workspace configuration, shared package design,
and overall system topology including NestJS API and Next.js frontend.
Tags: FD-SHARED-001 through FD-SHARED-008

### 2. Authentication & Authorization (auth.md)
Covers JWT-based authentication, bcrypt password hashing, role-based access
control, and registration restrictions for dispatcher/technician/viewer roles.
Tags: FD-AUTH-001 through FD-AUTH-005

### 3. API Layer (api.md)
Documents the NestJS backend structure including modules, controllers,
services, fail-fast validation, and server actions for the frontend.
Tags: FD-API-001 through FD-API-003, FD-WO-001 through FD-WO-003,
FD-TECH-001 through FD-TECH-003, FD-ACTION-001 through FD-ACTION-002

### 4. Database Schema (database.md)
Defines the Prisma schema, model mappings, enum mappings, and migration
strategy with Row Level Security and Decimal(10,7) for GPS coordinates.
Tags: FD-DB-001 through FD-DB-003, FD-DB-005, FD-DB-006, FD-DB-008,
FD-MIG-001 through FD-MIG-002, FD-SEED-001
Cross-references: auth.md, api.md

### 5. Frontend UI (frontend.md)
Covers the Next.js frontend including component library, routing, loading
and error states, GPS coordinate display, and accessibility requirements.
Tags: FD-UI-COMP-001, FD-UI-UTIL-001, FD-UI-BASE-001, FD-UI-DARK-001,
FD-UI-LAYOUT-001, FD-UI-NAV-001, FD-UI-HOME-001, FD-UI-WO-001,
FD-UI-TECH-001, FD-UI-MAP-001, FD-UI-SET-001, FD-UI-LOAD-001,
FD-UI-ERR-001, FD-UI-ERR-002
Cross-references: system-architecture.md

### 6. Testing Strategy (testing.md)
Documents unit tests, integration tests, accessibility tests, and keyboard
navigation tests across both API and web applications.
Tags: FD-TEST-001 through FD-TEST-007
Cross-references: auth.md, api.md, frontend.md

### 7. Infrastructure (infrastructure.md)
Covers Docker, CI/CD, environment configuration, and deployment strategy
for the field service dispatch platform.
Tags: FD-CI-001
Cross-references: database.md, api.md

---

## Tag Ranges

| Prefix | Range | Domain |
|--------|-------|--------|
| FD-SHARED | 001-008 | Shared package |
| FD-AUTH | 001-005 | Authentication |
| FD-API | 001-003 | API layer |
| FD-DB | 001-003, 005-006, 008 | Database |
| FD-MIG | 001-002 | Migrations |
| FD-SEED | 001 | Seeding |
| FD-WO | 001-003 | Work orders |
| FD-TECH | 001-003 | Technicians |
| FD-UI | Various | Frontend |
| FD-ACTION | 001-002 | Server actions |
| FD-TEST | 001-007 | Tests |
| FD-CI | 001 | CI/CD |

**Total VERIFY tags:** 55
**Total TRACED tags:** 55
