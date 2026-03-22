# Infrastructure Specification

## Overview

Containerized deployment with Docker and Docker Compose. CI/CD via GitHub Actions.
Turborepo for monorepo build orchestration.

## Docker

### Dockerfile
3-stage build:
1. **deps** — Install dependencies with pnpm, copy turbo.json
2. **builder** — Build all packages
3. **runner** — Production image with USER node and HEALTHCHECK

Base image: node:20-alpine

### docker-compose.yml
Services: db (PostgreSQL 16), api, web

### docker-compose.test.yml
Ephemeral test database with tmpfs for fast teardown.

## CI/CD (GitHub Actions)

### ci.yml Pipeline
1. Checkout + setup pnpm + Node 20
2. Install dependencies
3. Security audit: `pnpm audit --audit-level=high`
4. Generate Prisma client
5. Run migrations
6. Build all packages
7. Run tests

## Environment Variables

See `.env.example` for required variables:
- DATABASE_URL, DIRECT_URL
- JWT_SECRET, JWT_EXPIRES_IN
- API_PORT, CORS_ORIGIN
- NEXT_PUBLIC_API_URL
- NODE_ENV

## Verification Tags

<!-- VERIFY: EM-INFRA-001 — 3-stage Dockerfile with node:20-alpine -->
<!-- VERIFY: EM-INFRA-002 — USER node in production stage -->
<!-- VERIFY: EM-INFRA-003 — HEALTHCHECK in Dockerfile -->
<!-- VERIFY: EM-INFRA-004 — pnpm audit in CI pipeline -->
<!-- VERIFY: EM-INFRA-005 — turbo.json copied in deps stage -->
