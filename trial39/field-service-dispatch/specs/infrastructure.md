# Infrastructure Specification

## Overview

The infrastructure layer covers containerization, CI/CD pipelines,
database setup, and deployment configuration.

## Docker

The application uses a three-stage Dockerfile based on node:20-alpine:

1. **deps** — Installs dependencies with pnpm frozen lockfile. Copies
   turbo.json in the deps stage for build orchestration.
2. **build** — Copies source code and runs turbo build for the API.
3. **production** — Minimal runtime image with compiled output.

The production stage includes:
- LABEL maintainer metadata
- USER node (non-root execution)
- HEALTHCHECK with wget against /health endpoint
- EXPOSE 3001

## Docker Compose

docker-compose.yml provides PostgreSQL 16 with:
- Healthcheck via pg_isready
- Named volume for data persistence
- Port 5432 mapping

docker-compose.test.yml provides an isolated PostgreSQL instance
on port 5433 for testing.

## CI/CD

The GitHub Actions pipeline (.github/workflows/ci.yml) runs:

1. **Lint** — ESLint via pnpm turbo run lint
2. **Typecheck** — TypeScript compiler via pnpm turbo run typecheck
3. **Test** — Jest with PostgreSQL 16 service container
4. **Build** — Full turbo build (depends on lint + typecheck)
5. **Migration Check** — Prisma migrate deploy verification
6. **Audit** — pnpm audit for dependency vulnerabilities

The test job configures DATABASE_URL, JWT_SECRET, and CORS_ORIGIN
environment variables for the PostgreSQL service container.

## Environment

Required environment variables (documented in .env.example):

- DATABASE_URL — PostgreSQL connection with connection_limit parameter
- JWT_SECRET — Minimum 32 character signing secret
- CORS_ORIGIN — Allowed CORS origin (no fallback)
- PORT — API server port (default 3001)
- API_URL — Backend URL for frontend API calls

## Cross-References

- See [Database](./database.md) for schema and migration details
- See [Security](./security.md) for security audit configuration
