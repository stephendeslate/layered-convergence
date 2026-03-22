# Analytics Engine — Specification Index

## Overview

This document serves as the central index for all specifications in the
Analytics Engine (AE) multi-tenant data analytics platform. Each spec file
addresses a distinct architectural concern and contains VERIFY tags that
map to TRACED comments in source code.

## Specification Files

| File | Domain | Description |
|------|--------|-------------|
| system-architecture.md | Architecture | Monorepo layout, package boundaries, build pipeline |
| api.md | API | REST endpoints, request/response contracts, pagination |
| auth.md | Authentication | JWT flow, role-based access, registration constraints |
| database.md | Database | Prisma schema, models, RLS policies, migrations |
| frontend.md | Frontend | Next.js app router pages, components, server actions |
| infrastructure.md | Infrastructure | Docker, CI/CD, environment configuration |
| security.md | Security | Helmet, CORS, throttling, input validation, CSP |
| testing.md | Testing | Unit tests, integration tests, accessibility tests |

## VERIFY Tag Ranges

Each spec file owns a range of VERIFY tags prefixed with AE-:

- system-architecture.md: AE-ARCH-01 through AE-ARCH-08
- api.md: AE-API-01 through AE-API-08
- auth.md: AE-AUTH-01 through AE-AUTH-08
- database.md: AE-DB-01 through AE-DB-08
- frontend.md: AE-FE-01 through AE-FE-08
- infrastructure.md: AE-INFRA-01 through AE-INFRA-05
- security.md: AE-SEC-01 through AE-SEC-08
- testing.md: AE-TEST-01 through AE-TEST-08

## Total VERIFY Count

61 VERIFY tags across all spec files, each with a corresponding TRACED
comment in a .ts or .tsx source file.

## Conventions

- All VERIFY tags use the format: `[VERIFY: AE-DOMAIN-NN]` (e.g., AE-AUTH-01, AE-SEC-03)
- All TRACED tags use the format: `// TRACED: AE-DOMAIN-NN`
- TRACED comments appear only in .ts or .tsx files (never YAML, Dockerfile, etc.)
- Infrastructure-related TRACED comments are placed in relevant .ts files
  such as main.ts, app.module.ts, or seed.ts

## Cross-References

Specs reference each other where concerns overlap. For example, auth.md
references security.md for throttling details, and database.md references
api.md for how models map to endpoints.

## TRACED Comment Locations

TRACED comments for infrastructure specs (AE-INFRA-*) are placed in:
- main.ts for server configuration (PORT, Helmet, CORS, ValidationPipe)
- app.module.ts for module-level configuration (ThrottlerModule, guards)
- seed.ts for database seeding behavior

TRACED comments for architecture specs (AE-ARCH-*) are placed in:
- packages/shared/src/index.ts for package structure and exports
- apps/api/src/app.module.ts for API framework verification
- apps/web/app/layout.tsx for web framework verification
