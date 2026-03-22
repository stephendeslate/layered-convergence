# Escrow Marketplace — Specification Index

## Project: Trial 40, Layer 8 (Monitoring)

This document indexes all specification files for the Escrow Marketplace project.
Each spec is authored in Markdown and lives under `specs/`.

## Specification Hierarchy

| # | Document | Description | Min Lines |
|---|----------|-------------|-----------|
| 1 | [api.md](./api.md) | REST API endpoints, DTOs, pagination | 60 |
| 2 | [data-model.md](./data-model.md) | Prisma schema, enums, indexes, RLS | 60 |
| 3 | [auth.md](./auth.md) | Authentication flow, JWT, bcrypt | 60 |
| 4 | [frontend.md](./frontend.md) | Next.js pages, components, accessibility | 60 |
| 5 | [security.md](./security.md) | Helmet, CORS, throttling, validation | 60 |
| 6 | [infrastructure.md](./infrastructure.md) | Docker, CI/CD, monorepo config | 55 |
| 7 | [monitoring.md](./monitoring.md) | Logging, health, correlation, metrics | 55 |

## VERIFY Tag Prefixes

All tags use the `EM-` prefix with the following domains:

- `EM-ARCH` — Architecture and shared package
- `EM-AUTH` — Authentication and authorization
- `EM-API` — API endpoints and DTOs
- `EM-DB` — Database schema and queries
- `EM-FE` — Frontend pages and components
- `EM-UI` — UI components (shadcn)
- `EM-SEC` — Security measures
- `EM-INFRA` — Infrastructure and deployment
- `EM-PERF` — Performance optimizations
- `EM-MON` — Monitoring and observability
- `EM-TEST` — Test coverage

## Cross-References

- api.md references auth.md for JWT guard details
- security.md references auth.md for throttle config
- monitoring.md references api.md for health endpoint contracts
- data-model.md references security.md for RLS policy details
- frontend.md references api.md for Server Action endpoints
- infrastructure.md references monitoring.md for health check paths

## Traceability Rules

1. VERIFY tags appear ONLY in spec `.md` files
2. TRACED tags appear ONLY in `.ts` / `.tsx` source files
3. Every VERIFY tag has exactly one matching TRACED tag
4. Tag format: `EM-{DOMAIN}-{NNN}` (zero-padded 3 digits)
5. Minimum 35 VERIFY tags across all specs
6. 100% bidirectional VERIFY-TRACED parity

## Document Standards

- All spec files >= 55 lines (target 60-80)
- SPEC-INDEX >= 55 lines
- Cross-references between >= 2 non-index specs
- Each VERIFY tag describes a testable requirement
