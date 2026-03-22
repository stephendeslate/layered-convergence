# Infrastructure Specification

## Overview

The infrastructure layer covers containerization, CI/CD, database
provisioning, and deployment configuration.

## Docker

### Dockerfile

Three-stage build optimized for production:

1. **deps** — `node:20-alpine`, installs production dependencies
   with `pnpm install --frozen-lockfile`
2. **build** — Copies source, runs `pnpm turbo build`
3. **production** — Copies built artifacts, runs as `node` user

Labels:
- `maintainer` label for image metadata

Security:
- Runs as non-root `node` user via `USER node`
- Health check with `wget --spider` to `/health`

### docker-compose.yml

Services:
- **postgres** — PostgreSQL 16 Alpine with health check
  - Volume: `pgdata` (named volume for persistence)
  - Health check: `pg_isready -U postgres`
  - Port: 5432

### docker-compose.test.yml

Services:
- **postgres-test** — PostgreSQL 16 Alpine with tmpfs storage
  - Uses tmpfs for fast, ephemeral test data
  - Port: 5433 (avoids conflict with dev DB)

## CI/CD Pipeline

The GitHub Actions workflow runs on push to main/develop and on
pull requests targeting main.

### Jobs

1. **lint** — Runs ESLint across all packages
2. **typecheck** — Runs TypeScript compiler in check mode
3. **test** — Runs all unit and integration tests
4. **build** — Builds all packages via Turborepo
5. **migration-check** — Validates Prisma migrations are up to date
6. **audit** — Runs `pnpm audit` for known vulnerabilities

### Environment

- Node.js 20
- pnpm 9.15.4 (via corepack)
- PostgreSQL 16 service container for tests

### Caching

- pnpm store cached between runs
- Turborepo cache for build artifacts

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | Yes | — | PostgreSQL connection string |
| JWT_SECRET | Yes | — | Secret for JWT signing |
| CORS_ORIGIN | No | * | Allowed CORS origin |
| PORT | No | 3001 | API server port |

### Connection Pooling

The DATABASE_URL includes connection pool parameters:
- `connection_limit=10` — Max concurrent connections
- `pool_timeout=30` — Wait time for available connection

## .env.example

Provides a template with all required and optional variables,
including the connection pooling parameters for documentation.

## .dockerignore

Excludes from Docker context:
- node_modules
- .git
- .env files
- dist directories
- IDE configuration

## Cross-References

- [Database Specification](./database.md) — Prisma schema and PostgreSQL configuration
- [API Specification](./api.md) — NestJS application bootstrapping and modules
