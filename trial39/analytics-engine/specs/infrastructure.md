# Infrastructure Specification

**Project:** Analytics Engine
**Prefix:** AE-INFRA
**Cross-references:** [Database](database.md), [Performance](performance.md)

---

## Overview

Infrastructure covers Docker containerization, CI/CD pipeline, and deployment configuration.
The application runs as a multi-stage Docker image with PostgreSQL 16.

---

## Requirements

### AE-INFRA-01: Multi-Stage Dockerfile
- VERIFY:AE-INFRA-01 — Dockerfile has 3 stages (deps, builder, production) using node:20-alpine
- Stage 1 (deps): installs dependencies with frozen lockfile
- Stage 2 (builder): builds all packages via turbo
- Stage 3 (production): minimal runtime image
- LABEL maintainer metadata present in deps stage
- USER node for non-root execution in production
- HEALTHCHECK with wget to /auth/health endpoint
- turbo.json COPYed in deps stage for proper dependency caching
- See [Performance](performance.md) for connection pooling configuration

### AE-INFRA-02: Docker Compose
- VERIFY:AE-INFRA-02 — docker-compose.yml defines PostgreSQL 16 with healthcheck and named volume
- API service depends on postgres with service_healthy condition
- DATABASE_URL includes connection_limit parameter
- Named volume pg_data for data persistence across restarts

### AE-INFRA-03: Test Compose
- VERIFY:AE-INFRA-03 — docker-compose.test.yml defines isolated test database
- Uses tmpfs for faster test execution (no disk persistence)
- Separate port (5433) to avoid conflicts with development database
- Separate credentials from development environment

### AE-INFRA-04: Environment Configuration
- VERIFY:AE-INFRA-04 — .env.example documents all required environment variables
- DATABASE_URL includes connection_limit parameter for pool sizing
- No default values for secrets (JWT_SECRET must be changed)
- CORS_ORIGIN required for frontend communication
- See [Database](database.md) for connection string format

### AE-INFRA-05: CI/CD Pipeline
- VERIFY:AE-INFRA-05 — .github/workflows/ci.yml runs lint, test, build, typecheck, migration-check, audit
- Six parallel jobs for fast feedback
- Uses pnpm turbo run for task execution
- PostgreSQL service container for integration tests
- pnpm audit --audit-level=high for dependency security
- Migration drift detection via prisma migrate diff

---

**SJD Labs, LLC** — Analytics Engine T39
