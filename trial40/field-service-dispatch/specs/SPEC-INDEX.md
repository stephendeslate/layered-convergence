# Field Service Dispatch — Specification Index

Trial 40 | Layer 8: Monitoring | Layered Convergence Methodology

## Specification Documents

| Document | Description | Layer Coverage |
|----------|-------------|----------------|
| [System Architecture](system-architecture.md) | Monorepo structure, deployment, CI/CD, shared package | L0, L1 |
| [Authentication](auth.md) | JWT auth, bcrypt hashing, role-based access | L2 |
| [API](api.md) | REST endpoints, DTOs, validation, controllers | L3 |
| [Database](database.md) | Prisma schema, migrations, RLS, seed data | L4 |
| [Frontend](frontend.md) | Next.js pages, components, dark mode, a11y | L5 |
| [Security](security.md) | XSS prevention, rate limiting, sanitization, CORS | L6 |
| [Performance](performance.md) | Timeouts, pagination, select optimization, bundle | L7 |
| [Monitoring](monitoring.md) | Pino logging, correlation IDs, health, metrics | L8 |
| [Infrastructure](infrastructure.md) | Docker, Compose, HEALTHCHECK, env config | L0, L8 |
| [Testing](testing.md) | Unit, integration, a11y, keyboard tests | All |

## Traceability

All VERIFY tags in spec documents must have a matching TRACED tag in source code.
VERIFY tags appear only in .md spec files. TRACED tags appear only in .ts/.tsx source files.

Tag prefix: `FD-`

## VERIFY Tag Summary by Spec

| Spec Document | Tag Prefixes | Count |
|---------------|-------------|-------|
| system-architecture.md | FD-DB, FD-SHARED | 4 |
| auth.md | FD-AUTH | 6 |
| api.md | FD-WO, FD-TECH, FD-SCHED, FD-SA, FD-API | 14 |
| database.md | FD-DB, FD-SEED | 5 |
| frontend.md | FD-SA, FD-API, FD-PERF | 3 |
| security.md | FD-SEC | 4 |
| performance.md | FD-PERF | 8 |
| monitoring.md | FD-MON | 11 |
| infrastructure.md | FD-DB | 2 |
| testing.md | FD-AUTH, FD-WO, FD-TECH, FD-SEC, FD-PERF, FD-MON | 13 |

## Cross-Reference Summary

Specs reference each other to show dependencies:
- monitoring.md references api.md (request pipeline) and infrastructure.md (HEALTHCHECK)
- security.md references auth.md (JWT, password hashing) and monitoring.md (exception filter)

## Layer Progression (L0-L8)

- **L0**: Project scaffold, monorepo, CI
- **L1**: Prisma schema, migrations, seed
- **L2**: JWT auth, bcrypt, role whitelist
- **L3**: REST CRUD endpoints with DTOs
- **L4**: Multi-tenant scoping, RLS
- **L5**: Next.js frontend with shadcn/ui
- **L6**: Security hardening (Helmet, sanitize, rate limit)
- **L7**: Performance (timeout, pagination, select opt)
- **L8**: Monitoring (Pino, correlation IDs, health, metrics)

## T40 Variation

- `createCorrelationId()` and `formatLogEntry()` exported from `packages/shared/`
- Used by `CorrelationMiddleware`, `RequestLoggerMiddleware`, `GlobalExceptionFilter`
- Shared package also exports utility functions: paginate, slugify, generateId, maskSensitive, etc.
