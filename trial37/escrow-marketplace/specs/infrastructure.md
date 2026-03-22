# Infrastructure Specification

## Overview

Docker-based deployment with multi-stage builds, CI/CD via GitHub Actions,
and PostgreSQL 16 Alpine as the database engine. All infrastructure is
configured for security and reproducibility.

## Dockerfile

Three-stage build using node:20-alpine:

1. **deps** — Install dependencies with pnpm, copies turbo.json
2. **builder** — Build all packages and applications
3. **runner** — Production stage with:
   - USER node (non-root)
   - HEALTHCHECK for container orchestration
   - Only production artifacts copied

## Docker Compose

### Production (docker-compose.yml)
- PostgreSQL 16 Alpine with healthcheck
- Named volume for data persistence
- API service depends on postgres with service_healthy condition

### Testing (docker-compose.test.yml)
- Ephemeral PostgreSQL with tmpfs for fast test cycles
- Separate port (5433) to avoid conflicts

## CI/CD Pipeline

GitHub Actions workflow with ALL 5 required steps:

1. **Lint** — `pnpm turbo run lint`
2. **Typecheck** — `pnpm turbo run typecheck`
3. **Test** — `pnpm turbo run test`
4. **Build** — `pnpm turbo run build`
5. **Migration check** — `pnpm turbo run db:migrate`

Additional steps: security audit via `pnpm audit --audit-level=high`,
Prisma client generation, and Docker image build verification.

## Environment Variables

Required at startup (fail-fast validation):
- DATABASE_URL — PostgreSQL connection string
- JWT_SECRET — No fallback value allowed
- CORS_ORIGIN — Frontend URL for CORS configuration

## Cross-References

- Security: [security.md](./security.md)
- Database: [database.md](./database.md)
- Testing: [testing.md](./testing.md)

## Verification Tags

<!-- VERIFY: EM-INFRA-001 — 3-stage Dockerfile with node:20-alpine -->
<!-- VERIFY: EM-INFRA-002 — USER node in production stage -->
<!-- VERIFY: EM-INFRA-003 — HEALTHCHECK in Dockerfile -->
<!-- VERIFY: EM-INFRA-004 — pnpm audit in CI pipeline -->
<!-- VERIFY: EM-INFRA-005 — turbo.json copied in deps stage -->
