# Infrastructure Specification

## Docker

### Dockerfile (3-stage build)

The Dockerfile uses a 3-stage build pattern with `node:20-alpine` as the base image:

1. **deps** -- Installs pnpm via corepack, copies workspace config files (package.json, pnpm-workspace.yaml, turbo.json), and installs dependencies with `--frozen-lockfile`.
2. **builder** -- Copies source code and node_modules from deps stage, runs `pnpm build` to compile all packages.
3. **runner** -- Production image with NODE_ENV=production. Copies only built artifacts (dist, .next, prisma). Runs as `USER node` for security. Includes HEALTHCHECK targeting `/auth/health`.

Labels on the runner stage:
- `maintainer="sjd-labs"`
- `version="1.0"`
- `description="escrow-marketplace-t38"`

### HEALTHCHECK

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/auth/health || exit 1
```

### docker-compose.yml
- **postgres** -- `postgres:16-alpine` with pg_isready healthcheck
- **api** -- Built from Dockerfile, depends on healthy postgres
- Volumes: postgres data persisted via named volume

### docker-compose.test.yml
- **postgres-test** -- tmpfs storage for fast ephemeral test runs
- Port: 5433 to avoid conflicts with development database

## CI/CD (.github/workflows/ci.yml)

### Pipeline Jobs

**ci job** (with PostgreSQL 16 service container):
1. Checkout code
2. Setup pnpm 9.15.4 and Node.js 20
3. Install dependencies (`pnpm install --frozen-lockfile`)
4. Security audit (`pnpm audit --audit-level=high`)
5. Generate Prisma client
6. Lint (`pnpm turbo run lint`)
7. Typecheck (`pnpm turbo run typecheck`)
8. Test (`pnpm turbo run test`)
9. Build (`pnpm turbo run build`)
10. Migration check (`pnpm turbo run db:migrate`)

**docker-build job**:
- Build Docker image (build-only, no registry push)

### Triggers
- Push to main or develop branches
- Pull requests targeting main

## Environment Variables

| Variable       | Description                            | Required |
|----------------|----------------------------------------|----------|
| DATABASE_URL   | PostgreSQL connection string           | Yes      |
| DIRECT_URL     | Direct PostgreSQL URL (Prisma)         | No       |
| JWT_SECRET     | Secret for JWT signing (min 32 chars)  | Yes      |
| JWT_EXPIRES_IN | Token expiration (e.g., "1h", "24h")   | No       |
| CORS_ORIGIN    | Allowed CORS origin URL                | Yes      |
| API_PORT       | API server port (default 3001)         | No       |
| NODE_ENV       | Environment (development/test/production) | No    |

## Verification Tags

<!-- VERIFY: EM-INFRA-001 — 3-stage Dockerfile with node:20-alpine -->
<!-- VERIFY: EM-INFRA-002 — USER node in production stage -->
<!-- VERIFY: EM-INFRA-003 — HEALTHCHECK target in Dockerfile -->
<!-- VERIFY: EM-INFRA-004 — pnpm audit in CI pipeline for dependency security -->
<!-- VERIFY: EM-INFRA-005 — turbo.json copied in deps stage for build orchestration -->

## Cross-References

- See [database.md](database.md) for Prisma schema, migrations, and PostgreSQL config
- See [security.md](security.md) for Helmet, CORS, and rate limiting configuration
