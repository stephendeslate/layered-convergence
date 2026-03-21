# System Requirements Specification — Part 1: System Architecture
# Embeddable Analytics Dashboard Engine

## Document Info
- **Version:** 1.0
- **Last Updated:** 2026-03-20
- **Status:** Approved

---

## 1. Tech Stack Decisions

### 1.1 Backend

| Technology | Version | Rationale |
|------------|---------|-----------|
| **NestJS** | 11.x | Module-based architecture; decorator-based DI maps cleanly to domain boundaries; built-in support for guards, pipes, interceptors |
| **Prisma** | 6.x | Type-safe ORM; schema-as-code; migration management; generated TypeScript types |
| **PostgreSQL** | 16 | RLS for tenant isolation; JSONB for flexible configs; window functions for analytics; mature and battle-tested |
| **BullMQ** | 5.x | Redis-backed job queue; repeatable jobs for sync scheduling; built-in retry and dead letter support |
| **Redis** | 7+ | BullMQ backing store; query result caching with TTL; simple key-value operations |

### 1.2 Frontend

| Technology | Version | Rationale |
|------------|---------|-----------|
| **Next.js** | 15.x | App Router for modern React patterns; server components for initial render; API routes for embed renderer |
| **React** | 19.x | Component-based UI; hooks for state management; virtual DOM for efficient updates |
| **Recharts** | 3.x | MIT-licensed; React-native chart components; composable and customizable |
| **shadcn/ui** | latest | Copy-paste UI components; Radix primitives; consistent design system |
| **Tailwind CSS** | 4.x | Utility-first CSS; small bundle size; CSS custom properties for theming |

### 1.3 Testing

| Technology | Version | Rationale |
|------------|---------|-----------|
| **Vitest** | 3.x | Fast ESM-native test runner; compatible with NestJS via unplugin-swc; watch mode |
| **supertest** | 7.x | HTTP assertion library for E2E tests; works with NestJS test module |
| **unplugin-swc** | latest | SWC-based transform for Vitest; handles NestJS decorators and metadata |

### 1.4 Infrastructure

| Technology | Rationale |
|------------|-----------|
| **Turborepo** | Monorepo build orchestration; caching; dependency graph |
| **Docker Compose** | Local development with PostgreSQL + Redis |
| **GitHub Actions** | CI pipeline for lint + test |

---

## 2. Monorepo Structure

```
analytics-engine/
├── apps/
│   ├── api/                          # NestJS 11 backend
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── auth/                 # JWT + API key authentication
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.guard.ts
│   │   │   │   ├── api-key.guard.ts
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── auth.service.ts
│   │   │   ├── tenant-context/       # RLS tenant context
│   │   │   │   ├── tenant-context.module.ts
│   │   │   │   ├── tenant-context.middleware.ts
│   │   │   │   └── tenant-context.service.ts
│   │   │   ├── data-sources/         # Connector management
│   │   │   │   ├── data-sources.module.ts
│   │   │   │   ├── data-sources.controller.ts
│   │   │   │   ├── data-sources.service.ts
│   │   │   │   └── dto/
│   │   │   ├── dashboards/           # Dashboard CRUD
│   │   │   │   ├── dashboards.module.ts
│   │   │   │   ├── dashboards.controller.ts
│   │   │   │   ├── dashboards.service.ts
│   │   │   │   └── dto/
│   │   │   ├── widgets/              # Widget CRUD
│   │   │   │   ├── widgets.module.ts
│   │   │   │   ├── widgets.controller.ts
│   │   │   │   ├── widgets.service.ts
│   │   │   │   └── dto/
│   │   │   ├── ingestion/            # Data ingestion pipeline
│   │   │   │   ├── ingestion.module.ts
│   │   │   │   ├── ingestion.service.ts
│   │   │   │   ├── connectors/
│   │   │   │   │   ├── base.connector.ts
│   │   │   │   │   ├── rest-api.connector.ts
│   │   │   │   │   ├── postgresql.connector.ts
│   │   │   │   │   ├── csv.connector.ts
│   │   │   │   │   └── webhook.connector.ts
│   │   │   │   ├── schema-mapper.ts
│   │   │   │   ├── transform-engine.ts
│   │   │   │   └── sync-scheduler.ts
│   │   │   ├── aggregation/          # Data aggregation
│   │   │   │   ├── aggregation.module.ts
│   │   │   │   ├── aggregation.service.ts
│   │   │   │   └── aggregation.processor.ts
│   │   │   ├── query/                # Query engine
│   │   │   │   ├── query.module.ts
│   │   │   │   ├── query.service.ts
│   │   │   │   └── query.controller.ts
│   │   │   ├── embed/                # Embed API
│   │   │   │   ├── embed.module.ts
│   │   │   │   ├── embed.controller.ts
│   │   │   │   └── embed.service.ts
│   │   │   ├── sse/                  # Server-Sent Events
│   │   │   │   ├── sse.module.ts
│   │   │   │   ├── sse.controller.ts
│   │   │   │   └── sse.service.ts
│   │   │   ├── cache/                # Redis query caching
│   │   │   │   ├── cache.module.ts
│   │   │   │   └── cache.service.ts
│   │   │   ├── prisma/               # Prisma service
│   │   │   │   ├── prisma.module.ts
│   │   │   │   └── prisma.service.ts
│   │   │   └── common/               # Shared guards, pipes, filters
│   │   │       ├── guards/
│   │   │       │   └── throttle.guard.ts
│   │   │       ├── pipes/
│   │   │       ├── filters/
│   │   │       └── decorators/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── test/
│   │   │   ├── app.e2e-spec.ts
│   │   │   └── setup.ts
│   │   ├── vitest.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── web/                          # Next.js 15 frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx
│       │   │   ├── dashboards/       # Dashboard builder pages
│       │   │   ├── connectors/       # Connector config pages
│       │   │   ├── admin/            # Tenant admin panel
│       │   │   └── embed/[embedId]/  # Embed renderer route
│       │   ├── components/
│       │   │   ├── ui/               # shadcn/ui components
│       │   │   ├── charts/           # Recharts widget components
│       │   │   │   ├── line-chart.tsx
│       │   │   │   ├── bar-chart.tsx
│       │   │   │   ├── pie-chart.tsx
│       │   │   │   ├── area-chart.tsx
│       │   │   │   ├── kpi-card.tsx
│       │   │   │   ├── data-table.tsx
│       │   │   │   └── funnel-chart.tsx
│       │   │   ├── dashboard/        # Dashboard layout components
│       │   │   │   ├── dashboard-grid.tsx
│       │   │   │   ├── widget-wrapper.tsx
│       │   │   │   └── widget-config.tsx
│       │   │   └── embed/            # Embed-specific components
│       │   │       ├── embed-renderer.tsx
│       │   │       └── theme-provider.tsx
│       │   ├── hooks/
│       │   │   ├── use-sse.ts
│       │   │   ├── use-dashboard.ts
│       │   │   └── use-post-message.ts
│       │   └── lib/
│       │       ├── api.ts
│       │       └── theme.ts
│       ├── vitest.config.ts
│       ├── tsconfig.json
│       ├── tailwind.config.ts
│       ├── next.config.ts
│       └── package.json
│
├── packages/
│   ├── shared/                       # Shared types, enums, interfaces
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── enums.ts             # ConnectorType, WidgetType, SyncStatus, etc.
│   │   │   ├── types.ts             # Shared TypeScript interfaces
│   │   │   ├── connectors.ts        # Connector interface definitions
│   │   │   └── state-machines.ts    # SyncRun state machine
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── config/                       # Shared configs
│       ├── eslint/
│       │   └── base.js
│       ├── typescript/
│       │   └── base.json
│       └── package.json
│
├── turbo.json
├── package.json
├── tsconfig.json
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── ci.yml
├── CLAUDE.md
└── BUILD_PLAN.md
```

---

## 3. Service Boundaries

### 3.1 NestJS Module Map

```
AppModule
├── AuthModule
│   ├── JwtStrategy
│   ├── AuthGuard (JWT for admin endpoints)
│   └── ApiKeyGuard (for embed endpoints)
│
├── TenantContextModule
│   ├── TenantContextMiddleware (sets RLS context)
│   └── TenantContextService (manages SET LOCAL)
│
├── PrismaModule
│   └── PrismaService (database connection, RLS integration)
│
├── DataSourcesModule
│   ├── DataSourcesController (CRUD endpoints)
│   └── DataSourcesService (connector management)
│
├── IngestionModule
│   ├── IngestionService (pipeline orchestration)
│   ├── SchemaMapper (field mapping)
│   ├── TransformEngine (data transformation)
│   ├── SyncScheduler (BullMQ job management)
│   └── Connectors (REST, PostgreSQL, CSV, Webhook)
│
├── AggregationModule
│   ├── AggregationService (rollup logic)
│   └── AggregationProcessor (BullMQ worker)
│
├── DashboardsModule
│   ├── DashboardsController (CRUD)
│   └── DashboardsService
│
├── WidgetsModule
│   ├── WidgetsController (CRUD)
│   └── WidgetsService
│
├── QueryModule
│   ├── QueryController (data query endpoint)
│   └── QueryService (filter, group, aggregate)
│
├── EmbedModule
│   ├── EmbedController (embed config, render data)
│   └── EmbedService (validation, theme resolution)
│
├── SseModule
│   ├── SseController (SSE endpoint)
│   └── SseService (event publishing)
│
└── CacheModule
    └── CacheService (Redis TTL cache)
```

### 3.2 Module Dependencies

```
AuthModule ─────────────────┐
TenantContextModule ────────┤
PrismaModule ───────────────┤
                            ▼
DataSourcesModule ──► IngestionModule ──► AggregationModule
                                                │
DashboardsModule ──► WidgetsModule              │
       │                   │                    │
       ▼                   ▼                    ▼
    EmbedModule ──► QueryModule ◄── CacheModule
       │
       ▼
    SseModule
```

---

## 4. Data Flow Diagrams

### 4.1 Data Ingestion Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  External    │     │  Connector   │     │  Schema      │
│  Data Source │────►│  (fetch)     │────►│  Mapper      │
│  (API/DB/    │     │              │     │  (map fields)│
│   CSV/WH)    │     └──────────────┘     └──────┬───────┘
└──────────────┘                                  │
                                                  ▼
                     ┌──────────────┐     ┌──────────────┐
                     │  DataPoint   │     │  Transform   │
                     │  Storage     │◄────│  Engine      │
                     │  (Prisma)    │     │  (rename,    │
                     └──────┬───────┘     │   cast, etc) │
                            │             └──────────────┘
                            ▼
                     ┌──────────────┐     ┌──────────────┐
                     │  Aggregation │     │  SSE         │
                     │  Job         │────►│  Publish     │
                     │  (BullMQ)    │     │  (notify     │
                     └──────────────┘     │   embeds)    │
                                          └──────────────┘
```

### 4.2 Dashboard Rendering Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Embed       │     │  API Key     │     │  Embed       │
│  Request     │────►│  Validation  │────►│  Config      │
│  (iframe)    │     │              │     │  Resolution  │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                                  ▼
                     ┌──────────────┐     ┌──────────────┐
                     │  Widget      │     │  Query       │
                     │  Rendering   │◄────│  Execution   │
                     │  (Recharts)  │     │  (cached)    │
                     └──────┬───────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐     ┌──────────────┐
                     │  Theme       │     │  SSE         │
                     │  Application │     │  Connection  │
                     │  (CSS vars)  │     │  (updates)   │
                     └──────────────┘     └──────────────┘
```

### 4.3 Sync Scheduling Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Tenant      │     │  Sync        │     │  BullMQ      │
│  Configures  │────►│  Scheduler   │────►│  Repeatable  │
│  Schedule    │     │  (create/    │     │  Job         │
│              │     │   update job)│     │  (cron)      │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                          ┌───────┴───────┐
                                          │  On Schedule  │
                                          │  Trigger      │
                                          └───────┬───────┘
                                                  │
                     ┌──────────────┐     ┌───────▼───────┐
                     │  SyncRun     │     │  Ingestion    │
                     │  Logging     │◄────│  Pipeline     │
                     │  (status,   │     │  Execution    │
                     │   rows, err)│     │               │
                     └──────────────┘     └──────┬───────┘
                                                  │
                            ┌─────────────────────┤
                            ▼                     ▼
                     ┌──────────────┐     ┌──────────────┐
                     │  Success:    │     │  Failure:    │
                     │  DataPoints  │     │  DeadLetter  │
                     │  Stored      │     │  Event       │
                     └──────────────┘     └──────────────┘
```

### 4.4 Authentication Flows

```
Admin Endpoints (JWT):
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Request     │     │  JWT Guard   │     │  Tenant      │
│  with JWT    │────►│  Validate    │────►│  Context     │
│  Bearer      │     │  Token       │     │  Middleware   │
│  Token       │     │              │     │  (SET LOCAL)  │
└──────────────┘     └──────────────┘     └──────────────┘

Embed Endpoints (API Key):
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Request     │     │  API Key     │     │  Tenant      │
│  with API    │────►│  Guard       │────►│  Context     │
│  Key         │     │  Validate    │     │  Middleware   │
│              │     │  Key         │     │  (SET LOCAL)  │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## 5. Deployment Architecture

### 5.1 Production Architecture

```
┌─────────────────────────────────────────────────────────┐
│  CDN / Edge                                             │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Static assets, Next.js pages                    │    │
│  └─────────────────────────────────────────────────┘    │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  Application Layer                                       │
│                                                          │
│  ┌──────────────────┐    ┌──────────────────────┐       │
│  │  Next.js 15      │    │  NestJS 11           │       │
│  │  (Vercel)        │◄──►│  (Railway)           │       │
│  │                  │    │                      │       │
│  │  - Dashboard UI  │    │  - REST API          │       │
│  │  - Admin Panel   │    │  - SSE endpoint      │       │
│  │  - Embed Route   │    │  - BullMQ workers    │       │
│  └──────────────────┘    └──────────┬───────────┘       │
│                                      │                   │
└──────────────────────────────────────┼───────────────────┘
                                       │
┌──────────────────────────────────────▼───────────────────┐
│  Data Layer (Railway)                                     │
│                                                          │
│  ┌──────────────────┐    ┌──────────────────────┐       │
│  │  PostgreSQL 16   │    │  Redis 7             │       │
│  │                  │    │                      │       │
│  │  - RLS policies  │    │  - BullMQ store      │       │
│  │  - JSONB configs │    │  - Query cache       │       │
│  │  - Migrations    │    │  - Rate limit state  │       │
│  └──────────────────┘    └──────────────────────┘       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 5.2 Local Development

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: analytics
      POSTGRES_USER: analytics
      POSTGRES_PASSWORD: analytics
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

volumes:
  pgdata:
```

### 5.3 Environment Variables

```
# Database
DATABASE_URL=postgresql://analytics:analytics@localhost:5432/analytics

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Auth
JWT_SECRET=<secret>
JWT_EXPIRY=24h

# Encryption
ENCRYPTION_KEY=<32-byte-hex-key>

# App
API_PORT=3001
WEB_PORT=3000
NODE_ENV=development
```

---

## 6. Cross-Cutting Concerns

### 6.1 Error Handling

All API errors follow a consistent format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "name", "message": "name must not be empty" }
  ]
}
```

- 400: Validation errors (class-validator)
- 401: Missing or invalid authentication
- 403: Forbidden (wrong tenant, insufficient permissions)
- 404: Resource not found
- 429: Rate limit exceeded
- 500: Internal server error (logged, not exposed)

### 6.2 Logging

- Structured JSON logging in production
- Request ID tracking across service calls
- Sync run logging with timestamps and duration
- Error logging with stack traces (not exposed to client)

### 6.3 Configuration

- Environment variables for secrets (JWT_SECRET, ENCRYPTION_KEY)
- NestJS ConfigModule for typed configuration
- Prisma schema for database configuration
- BullMQ options for queue configuration

### 6.4 Health Checks

- `GET /health` — API health check
- `GET /health/db` — Database connectivity
- `GET /health/redis` — Redis connectivity
- Used by Railway for deployment health monitoring

---

## 7. API Versioning Strategy

The API uses URL-based versioning:

```
/api/v1/dashboards
/api/v1/data-sources
/api/v1/widgets
/api/v1/query
/api/v1/embed
/api/v1/sse
```

For this MVP, only v1 is implemented. The versioning prefix allows future
evolution without breaking embed integrations.

---

## 8. Performance Strategy

### 8.1 Query Caching

- Redis-based cache with TTL per query type
- Cache key: hash of query parameters + tenant ID
- Invalidation: on new data ingestion for the relevant data source
- Default TTL: 60 seconds for real-time dashboards, 300 seconds for static

### 8.2 Data Aggregation

- Pre-aggregate data into time buckets (hourly, daily, weekly)
- Widgets query aggregated data, not raw DataPoints
- Aggregation runs as BullMQ job after each ingestion
- Reduces query complexity from O(n) to O(buckets)

### 8.3 Connection Pooling

- Prisma connection pool with configurable size
- Separate connection for RLS context (SET LOCAL per request)
- Redis connection reuse via ioredis

### 8.4 Frontend Performance

- React Server Components for initial render
- Lazy loading for chart components
- Skeleton loading states
- SSE for incremental updates (no full refetch)
