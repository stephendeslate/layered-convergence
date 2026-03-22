# Specification Index

## Overview

Master index of all specification documents for the Escrow Marketplace (EM) project.
Each spec file contains VERIFY tags that trace back to TRACED tags in source files (.ts/.tsx).

## Spec Files

| File                     | Domain                        | Tag Ranges                  |
|--------------------------|-------------------------------|------------------------------|
| system-architecture.md   | Monorepo, modules, data flow  | EM-ARCH-001..006            |
| auth.md                  | JWT, bcrypt, roles, guards    | EM-AUTH-001..007            |
| api.md                   | Controllers, DTOs, CRUD       | EM-API-001..010             |
| database.md              | Prisma schema, RLS, indexes   | EM-DB-001..004              |
| frontend.md              | Next.js 15, shadcn/ui, a11y   | EM-FE-001..014, EM-UI-001..008 |
| security.md              | Helmet, CORS, throttle, XSS   | EM-SEC-001..006             |
| infrastructure.md        | Docker, CI/CD, env config     | EM-INFRA-001..004           |
| testing.md               | Unit, integration, a11y tests | EM-TEST-001..009            |
| performance.md           | L7 perf, caching, pagination  | EM-PERF-001..007            |

## Tag Ranges Summary

| Prefix   | Count | Range         | Spec File              |
|----------|-------|---------------|------------------------|
| EM-ARCH  | 6     | 001 -- 006    | system-architecture.md |
| EM-AUTH  | 7     | 001 -- 007    | auth.md                |
| EM-API   | 10    | 001 -- 010    | api.md                 |
| EM-DB    | 4     | 001 -- 004    | database.md            |
| EM-FE    | 14    | 001 -- 014    | frontend.md            |
| EM-UI    | 8     | 001 -- 008    | frontend.md            |
| EM-SEC   | 6     | 001 -- 006    | security.md            |
| EM-INFRA | 4     | 001 -- 004    | infrastructure.md      |
| EM-TEST  | 9     | 001 -- 009    | testing.md             |
| EM-PERF  | 7     | 001 -- 007    | performance.md         |
| **Total**| **75**|               |                        |

## Cross-Reference Map

- auth.md references security.md (rate limiting, input validation)
- api.md references security.md (DTO validation, auth guards) and auth.md (JWT, roles)
- database.md references auth.md (email uniqueness) and infrastructure.md (migrations)
- frontend.md references system-architecture.md (shared package) and performance.md (dynamic imports)
- infrastructure.md references database.md (Prisma migrations) and security.md (Helmet, CORS)
- testing.md references security.md (security tests) and performance.md (performance tests)
- performance.md references api.md (pagination) and database.md (indexes)
- security.md references auth.md (bcrypt, JWT) and api.md (DTO validation)

## Conventions

- VERIFY tags appear only in spec .md files under specs/
- TRACED tags appear only in .ts/.tsx source files
- Every VERIFY tag has exactly one corresponding TRACED tag in source
- Tag format: `EM-{DOMAIN}-{NNN}` where NNN is zero-padded to 3 digits
- All monetary values use Decimal(12,2) -- never Float
- Dark mode uses @media (prefers-color-scheme: dark), not .dark class
- cn() utility uses clsx + tailwind-merge
- bcrypt salt rounds: 12 via BCRYPT_SALT_ROUNDS constant
- No `as any`, no raw `<select>`, no dangerouslySetInnerHTML
