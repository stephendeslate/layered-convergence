# Infrastructure Specification

## Overview

Infrastructure includes Docker containerization, Docker Compose orchestration,
environment configuration, and CI/CD via GitHub Actions.

## Dockerfile

3-stage build:
1. **deps** — Install pnpm dependencies with frozen lockfile
2. **build** — Compile TypeScript and build NestJS application
3. **production** — Minimal runtime with node user, copy dist + node_modules

- VERIFY: FD-DB-001 — HEALTHCHECK uses `curl -f http://localhost:3000/health`
- LABEL maintainer for image metadata
- Runs as non-root `node` user

## Docker Compose

### Development (docker-compose.yml)

- PostgreSQL 16 with healthcheck (`pg_isready`)
- Named volume `fd_pgdata` for data persistence
- Port 5432 exposed
- Environment variables from .env file

### Testing (docker-compose.test.yml)

- VERIFY: FD-DB-002 — Separate PostgreSQL instance on port 5433
- Named volume `fd_pgdata_test` for test isolation
- Same healthcheck as development

## Environment Variables

| Variable | Required | Default | Notes |
|----------|---------|---------|-------|
| DATABASE_URL | Yes | - | Prisma connection string |
| JWT_SECRET | Yes | - | Fail-fast if missing |
| CORS_ORIGIN | No | http://localhost:3001 | Warning logged if missing |
| API_URL | No | http://localhost:3000 | Frontend API proxy target |
| NODE_ENV | No | development | Controls error verbosity |
| PORT | No | 3000 | API server port |

## CI/CD Pipeline

GitHub Actions workflow runs on push to main/develop and pull requests:

1. **lint** — ESLint across all packages
2. **typecheck** — TypeScript --noEmit validation
3. **test** — Jest with PostgreSQL service container
4. **build** — Turborepo build all packages
5. **migration-check** — Prisma migrate diff validation
6. **audit** — pnpm audit for security vulnerabilities

## Health Monitoring Integration

The Dockerfile HEALTHCHECK, Docker Compose healthcheck, and CI health job all
depend on the GET /health endpoint. Any path change must be synchronized across:
- `Dockerfile` HEALTHCHECK CMD
- `HealthController` route decorator
- CI workflow health check step

## Security Hardening

- Non-root user in production Docker image
- .dockerignore excludes .env, node_modules, .git
- .gitignore excludes .env, node_modules, dist, coverage
