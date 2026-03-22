# Infrastructure Specification

## Overview

Analytics Engine is containerized with Docker and orchestrated via Docker Compose.
CI/CD is handled by GitHub Actions with PostgreSQL service containers for testing.

## Docker

### Dockerfile (3-stage build)

1. **deps**: Install dependencies from lockfile
   - Base: node:20-alpine
   - Copies: package.json, pnpm-lock.yaml, pnpm-workspace.yaml, turbo.json
   - Runs: pnpm install --frozen-lockfile

2. **build**: Compile applications
   - Copies dependencies from deps stage
   - Copies source code
   - Runs: pnpm run build

3. **production**: Runtime image
   - Copies: compiled outputs, prisma schema, package files
   - Runs as: USER node (non-root)
   - HEALTHCHECK: wget to /health endpoint
   - Exposes: 3001, 3000

### Docker Compose

**docker-compose.yml** (production):
- `db`: PostgreSQL 16 with health check and persistent volume
- `api`: Built from Dockerfile, depends on healthy db
- `web`: Built from Dockerfile, depends on api

**docker-compose.test.yml** (testing):
- `db-test`: PostgreSQL with tmpfs for fast ephemeral storage
- `test-runner`: Runs test suite against test database

## CI/CD (GitHub Actions)

### Workflow: ci.yml

Triggers: push to main/develop, PRs to main

Steps:
1. Checkout code
2. Setup Node.js 20 and pnpm 9.15.4
3. Install dependencies (frozen lockfile)
4. Security audit (pnpm audit --audit-level=high)
5. Generate Prisma client
6. Run database migrations
7. Build all packages
8. Lint
9. Unit tests
10. Integration tests

PostgreSQL service container runs alongside the workflow.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | Yes | - | PostgreSQL connection string |
| JWT_SECRET | Yes | - | Secret for JWT signing (fail-fast) |
| CORS_ORIGIN | Yes | - | Allowed CORS origin (fail-fast) |
| RATE_LIMIT_TTL | No | 60000 | Rate limit window in ms |
| RATE_LIMIT_MAX | No | 100 | Max requests per window |
| API_PORT | No | 3001 | API server port |
| JWT_EXPIRES_IN | No | 1h | JWT token expiration |
| NEXT_PUBLIC_API_URL | No | http://localhost:3001 | API URL for frontend |

## VERIFY Tags

- `AE-INFRA-001`: 3-stage Dockerfile with non-root user <!-- VERIFY: AE-INFRA-001 -->
- `AE-INFRA-002`: Docker Compose with health checks <!-- VERIFY: AE-INFRA-002 -->
- `AE-INFRA-003`: CI workflow with security audit step <!-- VERIFY: AE-INFRA-003 -->
- `AE-INFRA-004`: Environment variable fail-fast for JWT_SECRET and CORS_ORIGIN <!-- VERIFY: AE-INFRA-004 -->
