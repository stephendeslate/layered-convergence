# Field Service Dispatch — Specification Index (Trial 38)

This document indexes all specification documents for the Field Service Dispatch platform
built as part of Trial 38 of the Layered Convergence methodology.

## Specifications

| ID | Document | Description |
|----|----------|-------------|
| 1 | [System Architecture](./system-architecture.md) | Monorepo structure, packages, deployment |
| 2 | [Authentication](./auth.md) | JWT auth, registration, role-based access |
| 3 | [API](./api.md) | REST endpoints, DTOs, controllers |
| 4 | [Database](./database.md) | Prisma schema, models, enums, RLS |
| 5 | [Frontend](./frontend.md) | Next.js pages, components, server actions |
| 6 | [Security](./security.md) | Helmet, rate limiting, input validation |
| 7 | [Performance](./performance.md) | L7 optimizations, caching, pagination |
| 8 | [Testing](./testing.md) | Unit, integration, accessibility tests |
| 9 | [Infrastructure](./infrastructure.md) | Docker, CI/CD, deployment |

## Traceability

Each specification contains VERIFY tags that map bidirectionally to TRACED tags in source
code. This ensures 100% parity between requirements and implementation.

### Tag Prefix Convention

All traceability tags use the `FD-` prefix (Field Service Dispatch).

### Tag Categories

| Prefix | Domain |
|--------|--------|
| FD-SHARED-* | Shared package types, constants, utilities |
| FD-API-* | API bootstrap, modules, configuration |
| FD-AUTH-* | Authentication module |
| FD-WO-* | Work orders domain |
| FD-TECH-* | Technicians domain |
| FD-DB-* | Database schema and Prisma |
| FD-SEC-* | Security hardening |
| FD-PERF-* | Performance optimizations (L7) |
| FD-UI-* | Frontend components and pages |
| FD-SEED-* | Database seeding |
| FD-TEST-* | Test files |

### Parity Summary

All VERIFY tags in spec files must have a corresponding TRACED tag in source code.
All TRACED tags in source code must have a corresponding VERIFY tag in spec files.

Total VERIFY tags: 81
Total TRACED tags: 81
Parity: 100%

### Layer Coverage

| Layer | Requirement | Status |
|-------|------------|--------|
| L0 | Turborepo monorepo with pnpm | Covered |
| L1 | NestJS 11 + Prisma 6 + Next.js 15 | Covered |
| L2 | Full CRUD endpoints | Covered |
| L3 | JWT auth with role-based access | Covered |
| L4 | Security hardening (Helmet, throttle, CSP) | Covered |
| L5 | Testing (unit, integration, accessibility) | Covered |
| L6 | Traceability (VERIFY/TRACED parity) | Covered |
| L7 | Performance (response time, pagination, caching) | Covered |
