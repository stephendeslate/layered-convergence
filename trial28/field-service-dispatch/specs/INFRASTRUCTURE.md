# Infrastructure — Field Service Dispatch

## Container Architecture

### Dockerfile
Multi-stage build with three stages:
1. deps — installs production dependencies only
2. build — compiles TypeScript and generates Prisma client
3. production — minimal runtime with compiled output

Base image: node:20-alpine for minimal attack surface.
Non-root execution: USER node directive.
HEALTHCHECK: wget to /auth/health every 30 seconds.

### Docker Compose
Production compose file:
- PostgreSQL 16 service with health check
- Backend service with environment variables
- Named volume for database persistence

Test compose file:
- PostgreSQL 16 with tmpfs for ephemeral data
- Isolated port to avoid conflicts

## CI/CD Pipeline

### GitHub Actions Workflow
Four parallel jobs:

1. **lint** — Code style enforcement
   - Checkout, setup Node 20, install deps, run lint

2. **test** — Automated testing
   - PostgreSQL 16 service container
   - Prisma generate and migrate
   - Run test suite

3. **build** — Compilation verification
   - Prisma generate
   - NestJS build

4. **migration-check** — Schema alignment
   - Apply migrations to fresh database
   - Diff migrations against schema
   - Exit with error if out of sync

## Environment Configuration

### Required Variables
- DATABASE_URL — PostgreSQL connection string
- JWT_SECRET — Token signing secret (fail-fast)
- CORS_ORIGIN — Allowed origin for CORS (fail-fast)
- PORT — Server port (default: 4002)

### .env.example
Template file with documented defaults.
Never committed with real secrets.

## Database

### PostgreSQL 16
Latest stable PostgreSQL version.
Row Level Security enabled on all tables.
Snake_case naming convention for tables, columns, and enums.

### Migrations
Single initial migration creating all tables.
Foreign key constraints with appropriate cascade rules.
Unique indexes on email fields and invoice numbers.

## Monitoring
HEALTHCHECK endpoint for container orchestration.
Application startup validation prevents silent failures.
