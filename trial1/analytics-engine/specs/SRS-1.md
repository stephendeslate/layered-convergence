# Software Requirements Specification — Architecture (SRS-1)

## Analytics Engine — Embeddable Multi-Tenant Analytics Platform

| Field          | Value                          |
|----------------|--------------------------------|
| Version        | 1.0                            |
| Date           | 2026-03-20                     |
| Status         | Draft                          |
| Owner          | Engineering Team               |
| Classification | Internal                       |

---

## 1. Monorepo Structure

### 1.1 Tooling

- **Monorepo manager:** Turborepo 2.x
- **Package manager:** pnpm 9.x (workspace protocol)
- **Node.js:** 22 LTS

### 1.2 Directory Layout

```
analytics-engine/
├── apps/
│   ├── api/                    # NestJS 11 backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/       # JWT + API key authentication
│   │   │   │   ├── tenant/     # Tenant CRUD, tier management
│   │   │   │   ├── datasource/ # Data source CRUD, connector configs
│   │   │   │   ├── ingestion/  # Sync scheduler, transform engine
│   │   │   │   ├── dashboard/  # Dashboard CRUD, layout management
│   │   │   │   ├── widget/     # Widget CRUD, query engine
│   │   │   │   ├── embed/      # Embed API, SSE endpoints
│   │   │   │   ├── theme/      # Theme configuration
│   │   │   │   ├── billing/    # Stripe integration
│   │   │   │   └── audit/      # Audit logging
│   │   │   ├── connectors/
│   │   │   │   ├── rest-api.connector.ts
│   │   │   │   ├── postgresql.connector.ts
│   │   │   │   ├── csv.connector.ts
│   │   │   │   └── webhook.connector.ts
│   │   │   ├── jobs/
│   │   │   │   ├── sync.processor.ts
│   │   │   │   ├── aggregation.processor.ts
│   │   │   │   ├── cache-invalidation.processor.ts
│   │   │   │   └── cleanup.processor.ts
│   │   │   ├── common/
│   │   │   │   ├── guards/
│   │   │   │   ├── interceptors/
│   │   │   │   ├── filters/
│   │   │   │   ├── decorators/
│   │   │   │   └── pipes/
│   │   │   └── prisma/
│   │   │       ├── schema.prisma
│   │   │       └── migrations/
│   │   ├── test/
│   │   └── package.json
│   ├── web/                    # Next.js 15 admin portal
│   │   ├── src/
│   │   │   ├── app/            # App Router pages
│   │   │   │   ├── (auth)/     # Login, register, verify
│   │   │   │   ├── (dashboard)/# Authenticated layout
│   │   │   │   │   ├── data-sources/
│   │   │   │   │   ├── dashboards/
│   │   │   │   │   │   └── [id]/
│   │   │   │   │   │       └── builder/
│   │   │   │   │   ├── settings/
│   │   │   │   │   │   ├── theme/
│   │   │   │   │   │   ├── api-keys/
│   │   │   │   │   │   └── billing/
│   │   │   │   │   └── sync-history/
│   │   │   │   └── layout.tsx
│   │   │   ├── components/
│   │   │   │   ├── ui/         # shadcn/ui components
│   │   │   │   ├── charts/     # Chart wrapper components
│   │   │   │   ├── dashboard/  # Dashboard builder components
│   │   │   │   └── data-source/# Data source wizard components
│   │   │   ├── lib/
│   │   │   │   ├── api.ts      # API client (fetch wrapper)
│   │   │   │   ├── auth.ts     # Auth utilities
│   │   │   │   └── utils.ts
│   │   │   └── hooks/
│   │   └── package.json
│   └── embed/                  # Next.js 15 embed renderer (lightweight)
│       ├── src/
│       │   ├── app/
│       │   │   ├── d/[dashboardId]/
│       │   │   │   └── page.tsx  # Embed entry point
│       │   │   └── layout.tsx
│       │   ├── components/
│       │   │   ├── charts/       # Shared chart components
│       │   │   ├── EmbedDashboard.tsx
│       │   │   └── PoweredByBadge.tsx
│       │   └── lib/
│       │       ├── sse.ts        # SSE client
│       │       └── postMessage.ts# postMessage handler
│       └── package.json
├── packages/
│   └── shared/                 # Shared types, constants, utilities
│       ├── src/
│       │   ├── types/
│       │   │   ├── tenant.ts
│       │   │   ├── dashboard.ts
│       │   │   ├── widget.ts
│       │   │   ├── datasource.ts
│       │   │   ├── embed.ts
│       │   │   └── index.ts
│       │   ├── constants/
│       │   │   ├── tier-limits.ts
│       │   │   ├── widget-types.ts
│       │   │   └── sync-schedules.ts
│       │   ├── validators/
│       │   │   └── schemas.ts   # Zod schemas shared between API and frontend
│       │   └── utils/
│       │       ├── date.ts
│       │       └── format.ts
│       └── package.json
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── .env.example
├── .gitignore
└── tsconfig.base.json
```

### 1.3 Workspace Dependencies

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

| Package | Internal Dependencies | Key External Dependencies |
|---------|----------------------|--------------------------|
| `apps/api` | `@analytics-engine/shared` | `@nestjs/core`, `@prisma/client`, `bullmq`, `ioredis`, `stripe` |
| `apps/web` | `@analytics-engine/shared` | `next`, `recharts`, `@radix-ui/*`, `tailwindcss` |
| `apps/embed` | `@analytics-engine/shared` | `next`, `recharts`, `d3` |
| `packages/shared` | — | `zod` |

---

## 2. Tech Stack Justification

| Technology | Choice | Justification |
|------------|--------|---------------|
| **Backend framework** | NestJS 11 | Module-based architecture maps cleanly to domain modules; first-class DI; built-in guards, interceptors, and pipes for cross-cutting concerns; strong TypeScript support |
| **ORM** | Prisma 6 | Type-safe database access; declarative schema with migration tooling; supports PostgreSQL RLS via raw queries for policy creation |
| **Database** | PostgreSQL 16 | RLS for multi-tenant isolation; JSONB for flexible connector configs; window functions for time-series aggregation; mature and reliable |
| **Frontend framework** | Next.js 15 (App Router) | Server components reduce client bundle; App Router provides clean nested layouts for the admin portal; built-in API routes not needed (separate API server) |
| **UI components** | shadcn/ui + Tailwind CSS 4 | Copy-paste components (no dependency lock-in); Tailwind v4 CSS-first config; consistent design system |
| **Charts** | Recharts + D3.js | Recharts for standard charts (Line, Bar, Pie, Area); D3 for custom visualizations (Funnel); both MIT/ISC licensed |
| **Queue** | BullMQ + Redis | Robust job scheduling with cron support; dead letter queues; job priority; dashboard UI (Bull Board) |
| **Real-time** | Server-Sent Events | Simpler than WebSocket for one-directional data push; native browser support; auto-reconnect; works through most proxies and CDNs |
| **Testing** | Vitest | Fast execution; native ESM support; compatible with the monorepo structure; Jest-compatible API |
| **Deployment (frontend)** | Vercel | Optimized for Next.js; edge network for low-latency embed serving; preview deployments for PRs |
| **Deployment (backend)** | Railway | Managed PostgreSQL and Redis; easy deployment from Git; autoscaling; private networking between services |

---

## 3. Deployment Architecture

### 3.1 Production Topology

```
                    ┌─────────────────────────┐
                    │        Vercel CDN        │
                    │   (Edge Network)         │
                    ├─────────┬───────────────┤
                    │ apps/web│  apps/embed    │
                    │ (Admin) │  (Dashboard)   │
                    └────┬────┴───────┬───────┘
                         │            │
                         ▼            ▼
                    ┌─────────────────────────┐
                    │     Railway (API)        │
                    │    apps/api (NestJS)     │
                    │    ┌───────────────┐     │
                    │    │  BullMQ       │     │
                    │    │  Workers      │     │
                    │    └───────────────┘     │
                    └────┬──────────┬─────────┘
                         │          │
                    ┌────▼────┐ ┌──▼──────────┐
                    │PostgreSQL│ │    Redis     │
                    │   16     │ │  (Railway)   │
                    │(Railway) │ │              │
                    └──────────┘ └─────────────┘
```

### 3.2 Environment Configuration

| Environment | API URL | Frontend URL | Embed URL | Database |
|-------------|---------|-------------|-----------|----------|
| Development | `localhost:3001` | `localhost:3000` | `localhost:3002` | Local PostgreSQL |
| Staging | `api-staging.analyticsengine.dev` | `staging.analyticsengine.dev` | `embed-staging.analyticsengine.dev` | Railway (staging) |
| Production | `api.analyticsengine.dev` | `app.analyticsengine.dev` | `embed.analyticsengine.dev` | Railway (production) |

### 3.3 Environment Variables

| Variable | Service | Description |
|----------|---------|-------------|
| `DATABASE_URL` | API | PostgreSQL connection string |
| `REDIS_URL` | API | Redis connection string |
| `JWT_SECRET` | API | Secret for signing JWT tokens |
| `ENCRYPTION_KEY` | API | AES-256-GCM key for encrypting connection configs |
| `STRIPE_SECRET_KEY` | API | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | API | Stripe webhook signing secret |
| `SMTP_API_KEY` | API | Resend API key for transactional emails |
| `NEXT_PUBLIC_API_URL` | Web, Embed | API base URL for client-side requests |
| `NEXT_PUBLIC_EMBED_URL` | Web | Embed app URL for generating embed codes |

---

## 4. CI/CD Pipeline

### 4.1 Four-Stage Pipeline

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Stage 1  │───▶│  Stage 2  │───▶│  Stage 3  │───▶│  Stage 4  │
│   Lint    │    │   Test    │    │   Build   │    │  Deploy   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

### Stage 1: Lint (parallel)

| Task | Command | Timeout |
|------|---------|---------|
| ESLint | `turbo lint` | 2 min |
| TypeScript type check | `turbo typecheck` | 3 min |
| Prisma schema validation | `prisma validate` | 30 sec |

### Stage 2: Test (parallel)

| Task | Command | Timeout |
|------|---------|---------|
| Unit tests | `turbo test --filter=...` (scoped to affected packages) | 5 min |
| Integration tests | `turbo test:integration` (requires PostgreSQL + Redis test containers) | 10 min |
| RLS isolation tests | Custom test suite verifying cross-tenant isolation | 3 min |

### Stage 3: Build (parallel)

| Task | Command | Timeout |
|------|---------|---------|
| API build | `turbo build --filter=api` | 3 min |
| Web build | `turbo build --filter=web` | 5 min |
| Embed build | `turbo build --filter=embed` | 3 min |

### Stage 4: Deploy (sequential)

| Task | Trigger | Target |
|------|---------|--------|
| Database migration | On schema changes | Railway PostgreSQL |
| API deploy | On main branch push | Railway |
| Web deploy | On main branch push | Vercel |
| Embed deploy | On main branch push | Vercel |

### 4.2 Branch Strategy

| Branch | Purpose | Deploy target |
|--------|---------|---------------|
| `main` | Production releases | Production |
| `develop` | Integration branch | Staging |
| `feature/*` | Feature development | Preview (Vercel) |
| `hotfix/*` | Production fixes | Production (fast-track) |

---

## 5. SSE Architecture

### 5.1 Channel Design

| Channel Pattern | Purpose | Publisher | Subscriber |
|-----------------|---------|-----------|------------|
| `dashboard:{dashboardId}` | Widget data updates | Sync worker (after successful sync) | Embed client |
| `tenant:{tenantId}:sync` | Sync status updates | Sync worker (status changes) | Admin portal |
| `tenant:{tenantId}:alerts` | System alerts (sync failures, limit warnings) | Various workers | Admin portal |

### 5.2 Event Flow

```
Sync Worker completes
        │
        ▼
Redis PUBLISH to channel "dashboard:{dashboardId}"
        │
        ▼
API SSE endpoint receives via Redis SUBSCRIBE
        │
        ▼
API pushes event to all connected SSE clients for that dashboard
        │
        ▼
Embed client receives event, re-renders affected widgets
```

### 5.3 SSE Event Schema

```typescript
interface SSEEvent {
  id: string;          // Unique event ID (UUID)
  type: string;        // Event type (see table below)
  data: string;        // JSON-encoded payload
  retry?: number;      // Reconnection interval in ms
}
```

| Event Type | Payload | When |
|------------|---------|------|
| `heartbeat` | `{}` | Every 30 seconds |
| `widget:update` | `{ widgetId, data: [...] }` | After sync completes for widget's data source |
| `sync:status` | `{ dataSourceId, status, rowsSynced }` | On sync state transition |
| `sync:error` | `{ dataSourceId, error }` | On sync failure |
| `cache:invalidated` | `{ widgetIds: [...] }` | After cache eviction |

### 5.4 Connection Limits

| Tier | Max SSE connections per dashboard | Max total SSE connections per tenant |
|------|----------------------------------|-------------------------------------|
| Free | 10 | 20 |
| Pro | 100 | 500 |
| Enterprise | 1,000 | 5,000 |

---

## 6. Non-Functional Requirements

### 6.1 Performance

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|--------------------|
| NFR-001 | Dashboard load time (embed, P95) | < 2 seconds | Synthetic monitoring from 3 regions |
| NFR-002 | API response time (admin CRUD, P95) | < 500ms | APM instrumentation |
| NFR-003 | Widget query time (P95) | < 1 second | Query timing logs |
| NFR-004 | SSE event delivery latency (sync complete → widget update) | < 3 seconds | End-to-end timing |
| NFR-005 | Sync throughput (rows/sec per worker) | > 1,000 rows/sec | Sync run metrics |
| NFR-006 | Concurrent SSE connections per API instance | > 5,000 | Load testing |
| NFR-007 | Cold start time (API) | < 5 seconds | Deployment monitoring |

### 6.2 Scalability

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|--------------------|
| NFR-008 | Tenants supported | > 10,000 | Load testing with simulated tenants |
| NFR-009 | Data points per tenant | > 10 million | Query performance benchmarks |
| NFR-010 | Concurrent dashboard viewers | > 50,000 | SSE connection load testing |
| NFR-011 | Concurrent sync jobs | > 100 | BullMQ concurrency settings |

### 6.3 Availability

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|--------------------|
| NFR-012 | API uptime | 99.9% (8.7 hours downtime/year) | Uptime monitoring |
| NFR-013 | Embed uptime | 99.95% (4.4 hours downtime/year) | Uptime monitoring |
| NFR-014 | Database uptime | 99.95% | Railway SLA + monitoring |
| NFR-015 | Recovery Time Objective (RTO) | < 15 minutes | Incident response drill |
| NFR-016 | Recovery Point Objective (RPO) | < 1 hour | Backup frequency verification |

### 6.4 Security

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|--------------------|
| NFR-017 | OWASP Top 10 compliance | All 10 categories addressed | Security audit checklist (§SRS-4) |
| NFR-018 | Dependency vulnerability scanning | Zero critical/high CVEs in production | `npm audit` in CI pipeline |
| NFR-019 | Secrets management | No secrets in source code | Secret scanning in CI |
| NFR-020 | Penetration testing | Annual third-party pen test | External audit report |

### 6.5 Observability

| ID | Requirement | Target | Measurement Method |
|----|-------------|--------|--------------------|
| NFR-021 | Structured logging | All API requests logged with correlation ID | Log review |
| NFR-022 | Error tracking | All unhandled exceptions captured | Error tracking dashboard |
| NFR-023 | Metrics collection | CPU, memory, request rate, error rate, queue depth | Metrics dashboard |
| NFR-024 | Health check endpoint | `GET /health` returns 200 with dependency statuses | Uptime monitor polling |

---

## 7. API Design Principles

| Principle | Implementation |
|-----------|---------------|
| RESTful resource naming | Plural nouns: `/api/data-sources`, `/api/dashboards` |
| Consistent response envelope | `{ data: T, meta?: { pagination } }` for success; `{ error: { code, message, details } }` for errors |
| Pagination | Cursor-based for lists: `?cursor=xxx&limit=20` |
| Filtering | Query parameters: `?status=completed&from=2026-01-01` |
| Sorting | Query parameter: `?sort=createdAt:desc` |
| Versioning | URL prefix: `/api/v1/...` (v1 is implicit in v1.0, prefix added when v2 is needed) |
| CORS | Allowed origins configured per tenant for embed; admin portal uses same-origin |
| Content type | `application/json` for all endpoints except CSV upload (`multipart/form-data`) |

---

## 8. Error Handling Strategy

### 8.1 Error Response Format

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Dashboard with ID abc123 not found",
    "details": [],
    "requestId": "req_abc123def456"
  }
}
```

### 8.2 Error Code Catalog

| HTTP Status | Error Code | Description |
|-------------|-----------|-------------|
| 400 | `VALIDATION_ERROR` | Request body/params failed validation |
| 401 | `UNAUTHORIZED` | Missing or invalid authentication |
| 403 | `FORBIDDEN` | Authenticated but insufficient permissions |
| 403 | `TIER_LIMIT_EXCEEDED` | Resource limit for current tier reached |
| 404 | `RESOURCE_NOT_FOUND` | Resource does not exist or belongs to another tenant |
| 409 | `CONFLICT` | State conflict (e.g., editing a published dashboard) |
| 413 | `PAYLOAD_TOO_LARGE` | Request body exceeds size limit |
| 422 | `UNPROCESSABLE_ENTITY` | Semantically invalid (e.g., 21st widget on a dashboard) |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Unhandled server error |

---

## 9. Document References

| Document | Section | Relationship |
|----------|---------|-------------|
| §PVD | Tech Stack | Architecture choices align with product pillars |
| §BRD | External Dependencies | Deployment topology hosts all dependencies |
| §PRD | All Modules | Monorepo structure maps to PRD modules |
| §SRS-2 | Data Model | Prisma schema lives in `apps/api/src/prisma/` |
| §SRS-3 | Domain Logic | Job processors live in `apps/api/src/jobs/` |
| §SRS-4 | Security | Auth guards live in `apps/api/src/common/guards/` |
