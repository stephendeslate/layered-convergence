# Infrastructure Specification

## Trial 38 | Analytics Engine

### Overview

Containerized deployment with Docker, orchestrated by docker-compose
for development, with GitHub Actions CI pipeline for automated testing
and quality checks.

### VERIFY: AE-INFRA-01 - Dockerfile

Three-stage Dockerfile for optimized production builds:

1. **deps** stage: `node:20-alpine`, installs pnpm, copies lockfile,
   runs `pnpm install --frozen-lockfile`
2. **build** stage: copies source, runs `pnpm build`, prunes dev deps
3. **production** stage: copies built artifacts, sets `USER node`,
   adds `HEALTHCHECK`, includes `LABEL maintainer`

No root user in production. Health check pings `/` endpoint.

TRACED in: `Dockerfile`

### VERIFY: AE-INFRA-02 - Docker Compose

Two compose files:

- `docker-compose.yml`: PostgreSQL 16 + API service with named volume
  for data persistence. Environment variables from `.env` file.
- `docker-compose.test.yml`: PostgreSQL with `tmpfs` for fast,
  ephemeral test databases. No data persistence.

TRACED in: `docker-compose.yml`, `docker-compose.test.yml`

### VERIFY: AE-INFRA-03 - CI Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`) with jobs:

1. **lint** - ESLint across all packages
2. **typecheck** - TypeScript compilation check
3. **test** - Unit and integration tests
4. **build** - Production build verification
5. **migration-check** - Prisma migration consistency
6. **audit** - `pnpm audit` for vulnerability scanning

Runs on push to main and all pull requests.

TRACED in: `.github/workflows/ci.yml`

### VERIFY: AE-INFRA-04 - Environment Configuration

Environment variables documented in `.env.example`:

| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | PostgreSQL connection with pooling params | Yes |
| JWT_SECRET | Secret for JWT signing | Yes |
| CORS_ORIGIN | Allowed CORS origin | Yes |
| PORT | API server port (default 3001) | No |
| BCRYPT_SALT_ROUNDS | Override default 12 | No |

Connection string includes `connection_limit` for connection pooling.

TRACED in: `.env.example`

### VERIFY: AE-INFRA-05 - Build Configuration

Turborepo pipeline defines task dependencies:

- `build` depends on `^build` (topological)
- `test` depends on `^build`
- `lint` has no dependencies (parallel)
- `typecheck` depends on `^build`

Outputs are cached in `.turbo/` directory.

TRACED in: `turbo.json`
