# Analytics Engine - Specification Index

## Trial 38 | Layered Convergence

This document serves as the master index for all specification files in the
Analytics Engine project. Each spec contains VERIFY tags that map bidirectionally
to TRACED comments in source code, ensuring full traceability.

## Specification Files

| File | Domain | VERIFY Tags | Line Count |
|------|--------|-------------|------------|
| [system-architecture.md](./system-architecture.md) | Architecture | AE-ARCH-01..08 | 55+ |
| [api.md](./api.md) | API Endpoints | AE-API-01..08 | 55+ |
| [auth.md](./auth.md) | Authentication | AE-AUTH-01..08 | 55+ |
| [database.md](./database.md) | Database & ORM | AE-DB-01..08 | 55+ |
| [frontend.md](./frontend.md) | Frontend | AE-FE-01..08 | 55+ |
| [security.md](./security.md) | Security | AE-SEC-01..08 | 60+ |
| [infrastructure.md](./infrastructure.md) | Infrastructure | AE-INFRA-01..05 | 55+ |
| [testing.md](./testing.md) | Testing | AE-TEST-01..08 | 55+ |
| [performance.md](./performance.md) | Performance (L7) | AE-PERF-01..13 | 55+ |

## Tag Ranges

Total VERIFY tags: 74
Total TRACED comments in source: 63+

### Tag Allocation

- **AE-ARCH-01 to AE-ARCH-08** - System architecture decisions
- **AE-API-01 to AE-API-08** - REST API design and controller patterns
- **AE-AUTH-01 to AE-AUTH-08** - Authentication and authorization
- **AE-DB-01 to AE-DB-08** - Database schema, migrations, seeding
- **AE-FE-01 to AE-FE-08** - Frontend components, routing, state
- **AE-SEC-01 to AE-SEC-08** - Security headers, validation, RLS
- **AE-INFRA-01 to AE-INFRA-05** - Docker, CI/CD, deployment
- **AE-TEST-01 to AE-TEST-08** - Test strategy and coverage
- **AE-PERF-01 to AE-PERF-13** - L7 performance requirements

## Parity Rules

1. Every VERIFY tag in a spec file MUST have a corresponding TRACED comment in source
2. Every TRACED comment in source MUST reference a valid VERIFY tag from a spec
3. Tags follow the pattern `AE-{DOMAIN}-{NN}` where NN is zero-padded
4. No tag may appear in more than one spec file
5. Source files may contain multiple TRACED comments

## Layer Coverage

| Layer | Description | Status |
|-------|-------------|--------|
| L0 | Monorepo scaffold | Covered by AE-ARCH |
| L1 | Schema + migrations | Covered by AE-DB |
| L2 | CRUD controllers | Covered by AE-API |
| L3 | Auth + guards | Covered by AE-AUTH |
| L4 | Security hardening | Covered by AE-SEC |
| L5 | Frontend + UI | Covered by AE-FE |
| L6 | Testing + CI | Covered by AE-TEST, AE-INFRA |
| L7 | Performance | Covered by AE-PERF |

## T38 Variations

This trial introduces the following T38-specific features:
- `measureDuration(fn)` utility in shared package
- `clampPageSize(requested, max)` utility in shared package
- ResponseTimeInterceptor for request duration logging
- Pagination guard via clamping (not rejection)
- Prisma query optimization with explicit `select`/`include`
- Bundle optimization via `next/dynamic`
- Cache-Control headers on list endpoints
