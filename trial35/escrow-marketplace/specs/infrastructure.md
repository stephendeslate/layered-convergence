# Infrastructure

**Project:** escrow-marketplace
**Layer:** 5 — Monorepo
**Version:** 1.0.0
**Cross-references:** database.md, api.md, system-architecture.md

---

## Overview

The infrastructure layer covers Docker containerization, CI/CD pipeline,
environment configuration, and deployment strategy for the escrow
marketplace platform. All infrastructure follows production-ready patterns.

## Docker

The Dockerfile uses a 3-stage build process optimized for production:
1. deps: installs dependencies with pnpm frozen lockfile
2. build: compiles TypeScript and builds applications
3. production: minimal runtime with node:20-alpine

The Dockerfile includes USER node, HEALTHCHECK, and LABEL metadata.

### Docker Compose

Development environment uses PostgreSQL 16-alpine with healthcheck
and named volume for data persistence. A separate test compose file
provides an ephemeral database for integration testing.

## CI/CD

The GitHub Actions workflow runs on push to main and pull requests.
It uses a PostgreSQL service container and pnpm for dependency management.

- VERIFY: EM-CI-001 — CI pipeline with lint, typecheck, test, build, migration check

### Pipeline Steps

1. Checkout repository
2. Setup pnpm 9.15.4 with caching
3. Setup Node.js 20
4. Install dependencies (frozen lockfile)
5. Run lint via turbo
6. Run typecheck via turbo
7. Run tests via turbo
8. Run build via turbo
9. Verify migration consistency

## Environment Configuration

Environment variables are documented in .env.example. Required variables
include DATABASE_URL, JWT_SECRET, CORS_ORIGIN, API_URL, and PORT.

The .env.example documents all required environment variables.

### Security Notes

- JWT_SECRET must never have a hardcoded fallback
- CORS_ORIGIN restricts cross-origin requests
- DATABASE_URL uses PostgreSQL connection string
- No secrets are committed to version control

## Health Checks

The Docker HEALTHCHECK uses wget to verify the application is responding
on port 3001. The PostgreSQL service container uses pg_isready for
readiness checks with configurable interval and retry settings.

## Monitoring

Application health can be monitored via:
- Docker HEALTHCHECK status
- PostgreSQL pg_isready
- API health endpoint response times
- Transaction status tracking
- Dispute resolution metrics

## Deployment Strategy

1. Build Docker image from multi-stage Dockerfile
2. Run database migrations with prisma migrate deploy
3. Start application container with health monitoring
4. Verify health check passes before routing traffic
