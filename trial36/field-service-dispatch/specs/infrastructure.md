# Infrastructure

**Project:** field-service-dispatch
**Layer:** 6 — Security
**Version:** 1.0.0

---

## Overview

The infrastructure configuration covers Docker containerization, CI/CD
pipelines, environment management, and deployment strategy for the
field service dispatch platform.
See also: database.md for migration strategy, api.md for bootstrap.

## Docker

The Dockerfile uses a 3-stage build process:
1. **deps** — Installs dependencies with pnpm frozen lockfile
2. **build** — Compiles TypeScript and builds the NestJS application
3. **production** — Minimal runtime image with compiled output

- VERIFY: FD-DOCKER-001 — 3-stage Dockerfile with node:20-alpine, USER node, HEALTHCHECK

Base image: node:20-alpine
Security: Runs as non-root `node` user
Health: HEALTHCHECK pings /health endpoint every 30 seconds

## CI/CD Pipeline

The GitHub Actions CI pipeline runs on every push and pull request
to the main branch. Includes security audit step.

- VERIFY: FD-CI-001 — CI pipeline runs audit, lint, typecheck, test, build, migration check

### Pipeline Steps

1. Checkout code
2. Setup pnpm 9.15.4 and Node.js 20
3. Install frozen dependencies
4. Security audit (pnpm audit --audit-level=high)
5. Run lint across all packages
6. Run type checking across all packages
7. Deploy database migrations
8. Execute all test suites
9. Build all packages
10. Check for migration drift

## Environment

Required environment variables:
- DATABASE_URL — PostgreSQL connection string
- JWT_SECRET — Secret for JWT signing (validated at startup)
- CORS_ORIGIN — Allowed origin for CORS (validated at startup)
- API_URL — Backend URL for frontend server actions

## Docker Compose

Development uses docker-compose.yml with PostgreSQL 16-alpine and
persistent volume storage. Testing uses docker-compose.test.yml with
tmpfs for fast, ephemeral test databases on port 5433.

## Deployment Considerations

- Database migrations run before application starts
- Health check endpoint returns 200 when API is ready
- Graceful shutdown handled by NestJS lifecycle hooks
- Row Level Security provides tenant isolation at database level
- GPS coordinate precision maintained through DECIMAL column types

## Monitoring

The /health endpoint serves as the primary liveness probe. Container
orchestrators should configure readiness probes separately based on
database connectivity status.
