# Analytics Engine — Specification Index

## Project Overview
Analytics Engine (AE) is a full-stack analytics platform built with NestJS 11 and Next.js 15.
This document indexes all specification documents for the AE project (Trial 42, Layer 8).

## Specification Documents

| Document | Description | Layer |
|----------|-------------|-------|
| [architecture.md](./architecture.md) | System architecture and module structure | L0-L5 |
| [api-contracts.md](./api-contracts.md) | REST API endpoints, DTOs, and responses | L0-L2 |
| [authentication.md](./authentication.md) | Auth flow, JWT strategy, role management | L0-L2 |
| [data-model.md](./data-model.md) | Prisma schema, models, enums, relations | L0-L4 |
| [security.md](./security.md) | Security controls: helmet, CORS, throttle, validation | L6 |
| [performance.md](./performance.md) | Performance optimizations: caching, pagination, response time | L7 |
| [monitoring.md](./monitoring.md) | Structured logging, correlation IDs, health checks, metrics | L8 |

## Verification Tags

All VERIFY tags in specs use the AE- prefix. Every VERIFY tag has a corresponding
TRACED tag in the .ts/.tsx source code. No orphans in either direction.

### Tag Categories
- **AE-ARCH**: Architecture and module structure
- **AE-AUTH**: Authentication and authorization
- **AE-API**: API endpoints and DTOs
- **AE-DATA**: Data model and database
- **AE-SEC**: Security controls
- **AE-PERF**: Performance optimizations
- **AE-MON**: Monitoring and observability
- **AE-UI**: Frontend components and patterns
- **AE-TEST**: Test coverage requirements

## Cross-References
- security.md references authentication.md for auth guard details
- monitoring.md references performance.md for response time interceptor
- api-contracts.md references data-model.md for schema definitions
- architecture.md references monitoring.md for middleware pipeline

## Trial 42 Variation
LogSanitizer utility in packages/shared/ redacts sensitive fields from log contexts.
See monitoring.md for full specification of the sanitizer behavior and integration points.

## Layer Coverage
- Layers 0-2: Base project structure, shadcn/ui, integration tests
- Layer 3: Specification hierarchy (this index + 7 specs)
- Layer 4: Docker, CI/CD, migrations, seed data
- Layer 5: Turborepo monorepo with pnpm workspaces
- Layer 6: Security hardening (Helmet, CORS, throttle, validation)
- Layer 7: Performance (response time, pagination, caching, indexes)
- Layer 8: Monitoring (Pino logging, correlation IDs, health, metrics)

## Tag Count Summary
Total VERIFY tags across all specs: 66
Total TRACED tags across all source files: 66
Orphan VERIFY tags (no matching TRACED): 0
Orphan TRACED tags (no matching VERIFY): 0
Bidirectional parity: 100%

## Infrastructure
- Dockerfile: multi-stage (deps -> build -> production), node:20-alpine, USER node, HEALTHCHECK
- CI: lint, test, build, typecheck, migration-check, audit (pnpm audit --audit-level=high)
- Docker Compose: PostgreSQL 16 with healthcheck and named volume
- Turborepo 2 with turbo in root devDependencies
