# Escrow Marketplace — Specification Index

## Overview

This document serves as the central index for all specification documents
in the Escrow Marketplace (EM) project. Each specification covers a
distinct architectural concern and includes VERIFY tags for traceability.

## Specification Hierarchy

| # | Document | Scope | VERIFY Tags |
|---|----------|-------|-------------|
| 1 | [architecture.md](./architecture.md) | System architecture, monorepo structure | EM-ARCH-* |
| 2 | [data-model.md](./data-model.md) | Prisma schema, models, enums, money fields | EM-DATA-* |
| 3 | [auth.md](./auth.md) | JWT authentication, bcrypt, role guards | EM-AUTH-*, EM-SEC-* |
| 4 | [api.md](./api.md) | REST endpoints, CRUD, DTOs, validation | EM-API-* |
| 5 | [security.md](./security.md) | Helmet CSP, CORS, throttling, RLS | EM-SEC-* |
| 6 | [performance.md](./performance.md) | Pagination, caching, response time | EM-PERF-* |
| 7 | [monitoring.md](./monitoring.md) | Logging, correlation IDs, health, metrics | EM-MON-* |

## Cross-Reference Matrix

- security.md references auth.md for role validation
- performance.md references data-model.md for indexing strategy
- monitoring.md references security.md for error sanitization
- api.md references data-model.md for DTO field constraints

## VERIFY Tag Naming Convention

All VERIFY tags use the EM- prefix followed by a category code:
- EM-ARCH: Architecture decisions
- EM-DATA: Data model and Prisma schema
- EM-AUTH: Authentication flow
- EM-SEC: Security controls
- EM-API: API endpoint contracts
- EM-PERF: Performance optimizations
- EM-MON: Monitoring and observability
- EM-UI: Frontend components
- EM-SHARED: Shared package utilities
- EM-INFRA: Infrastructure and CI/CD
- EM-SEED: Database seeding
- EM-TEST: Test coverage
- EM-A11Y: Accessibility
- EM-LISTING: Listing domain
- EM-TXN: Transaction domain
- EM-ESCROW: Escrow domain
- EM-DISPUTE: Dispute domain
- EM-APP: Application bootstrap

## Traceability Rules

1. Every VERIFY tag MUST have a corresponding TRACED tag in source code
2. Every TRACED tag MUST have a corresponding VERIFY tag in specs
3. TRACED tags appear ONLY in .ts/.tsx source files
4. Zero orphans permitted in either direction

## Document Standards

- All spec files must be >= 55 lines
- Specs must use markdown format
- Cross-references between specs are required (>= 2 non-index specs)

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-01-01 | EM Team | Initial specification set |
| 1.1 | 2024-01-15 | EM Team | Added L8 monitoring spec |
