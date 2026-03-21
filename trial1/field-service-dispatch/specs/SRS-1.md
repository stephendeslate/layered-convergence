# Software Requirements Specification — Architecture (SRS-1)

**Project:** Field Service Dispatch
**Version:** 1.0
**Date:** 2026-03-20
**Status:** Draft

---

## 1. Purpose

This document specifies the system architecture, infrastructure, deployment, and non-functional requirements for the Field Service Dispatch platform. It translates the business and product requirements (§BRD, §PRD) into a technical design.

## 2. System Overview

Field Service Dispatch is a multi-tenant SaaS platform with three primary interfaces:
1. **Dispatch Dashboard** — Web application for dispatchers and admins (desktop-optimized)
2. **Technician UI** — Mobile-responsive web application for field technicians
3. **Customer Portal** — Public-facing tracking and self-service portal

All interfaces communicate with a single backend API that manages state, real-time events, and external integrations.

## 3. Monorepo Structure

The project uses a Turborepo monorepo with pnpm workspaces.

```
field-service-dispatch/
├── apps/
│   ├── api/                    # NestJS 11 backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/       # JWT authentication, guards
│   │   │   │   ├── company/    # Tenant management
│   │   │   │   ├── customer/   # Customer CRUD, portal auth
│   │   │   │   ├── dispatch/   # Dispatch board logic
│   │   │   │   ├── gps/        # GPS streaming, position storage
│   │   │   │   ├── invoice/    # Stripe integration, invoice CRUD
│   │   │   │   ├── notification/ # SMS, email, push dispatch
│   │   │   │   ├── route/      # Route optimization, ORS integration
│   │   │   │   ├── technician/ # Technician CRUD, skills, status
│   │   │   │   └── work-order/ # Work order CRUD, state machine
│   │   │   ├── common/
│   │   │   │   ├── guards/     # RLS guard, role guard
│   │   │   │   ├── decorators/ # @CurrentUser, @TenantId
│   │   │   │   ├── filters/    # Exception filters
│   │   │   │   ├── interceptors/ # Logging, transform
│   │   │   │   └── pipes/      # Validation pipes
│   │   │   ├── config/         # Environment config, validation
│   │   │   ├── prisma/         # Prisma service, middleware
│   │   │   ├── gateway/        # WebSocket gateway (Socket.io)
│   │   │   └── queue/          # BullMQ processors
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   └── test/               # E2E tests
│   └── web/                    # Next.js 15 frontend
│       ├── src/
│       │   ├── app/            # App Router pages
│       │   │   ├── (auth)/     # Login, register, forgot-password
│       │   │   ├── (dashboard)/
│       │   │   │   ├── dispatch/ # Dispatch board + map
│       │   │   │   ├── work-orders/ # Work order list + detail
│       │   │   │   ├── technicians/ # Technician management
│       │   │   │   ├── customers/ # Customer management
│       │   │   │   ├── routes/  # Route optimization view
│       │   │   │   ├── schedule/ # Calendar view
│       │   │   │   ├── analytics/ # Analytics dashboard
│       │   │   │   ├── invoices/ # Invoice management
│       │   │   │   └── settings/ # Company settings
│       │   │   ├── technician/  # Technician mobile UI
│       │   │   ├── track/[token]/ # Customer tracking portal
│       │   │   └── portal/     # Customer self-service portal
│       │   ├── components/
│       │   │   ├── ui/         # shadcn/ui components
│       │   │   ├── map/        # Leaflet map components
│       │   │   ├── dispatch/   # Dispatch board components
│       │   │   ├── work-order/ # Work order components
│       │   │   └── layout/     # Shell, sidebar, header
│       │   ├── hooks/          # Custom React hooks
│       │   ├── lib/            # Utilities, API client, socket client
│       │   └── stores/         # Zustand stores
│       └── public/
├── packages/
│   └── shared/                 # Shared types, enums, constants
│       ├── src/
│       │   ├── types/          # TypeScript interfaces
│       │   ├── enums/          # WorkOrderStatus, etc.
│       │   ├── constants/      # Status transitions, config
│       │   └── validators/     # Zod schemas
│       └── package.json
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── specs/                      # This specification suite
```

## 4. Technology Stack

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| Backend Runtime | Node.js | 22 LTS | Long-term support, performance |
| Backend Framework | NestJS | 11 | Modular architecture, DI, WebSocket support |
| ORM | Prisma | 6 | Type-safe queries, migrations, PostGIS support via extensions |
| Database | PostgreSQL | 16 | RLS, PostGIS, mature ecosystem |
| Spatial Extension | PostGIS | 3.4 | Spatial queries, geography types |
| Frontend Framework | Next.js | 15 | App Router, SSR/RSC, API routes for BFF |
| UI Components | shadcn/ui | latest | Accessible, customizable, Tailwind-based |
| CSS | Tailwind CSS | 4 | Utility-first, design system consistency |
| Maps | Leaflet + React Leaflet | 1.9 / 5.x | Open-source, no license restrictions on dispatch use cases |
| Map Tiles | OpenStreetMap | — | Free, open data, no usage-based pricing |
| Routing/Directions | OpenRouteService | v2 API | Free tier (2,000 req/day), open-source engine |
| Route Optimization | OpenRouteService Optimization | v2 API | Vroom engine, vehicle routing problem solver |
| Real-time | Socket.io | 4.x | WebSocket with automatic fallback, rooms, namespaces |
| Job Queue | BullMQ | 5.x | Redis-backed, reliable, retries, scheduled jobs |
| Cache/Pub-Sub | Redis | 7 | BullMQ backend, Socket.io adapter, caching |
| Payments | Stripe | latest SDK | Invoicing API, hosted payment pages, webhooks |
| Testing | Vitest | 3.x | Fast, ESM-native, compatible with NestJS and Next.js |
| Drag-and-Drop | dnd-kit | 6.x | Accessible, performant, React-native DnD |
| State Management | Zustand | 5.x | Lightweight, no boilerplate |
| Monorepo | Turborepo | 2.x | Fast builds, caching, task orchestration |
| Package Manager | pnpm | 9.x | Efficient disk usage, strict dependency resolution |

## 5. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                    │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Dispatch UI  │  │ Technician   │  │ Customer Portal          │  │
│  │ (Next.js)    │  │ Mobile UI    │  │ (Public, no auth)        │  │
│  │ Desktop      │  │ (Next.js)    │  │ (Next.js)                │  │
│  └──────┬───────┘  └──────┬───────┘  └────────────┬─────────────┘  │
│         │                  │                        │                 │
│         │    REST + WebSocket (Socket.io)           │                 │
└─────────┼──────────────────┼────────────────────────┼────────────────┘
          │                  │                        │
          ▼                  ▼                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        VERCEL (Frontend)                             │
│  Next.js 15 App Router — SSR, RSC, API Routes (BFF)                │
│  - Dynamic import for Leaflet (no SSR for map components)           │
│  - Socket.io client connects directly to API server                 │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │ HTTPS
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      RAILWAY (Backend Services)                      │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    NestJS 11 API Server                       │   │
│  │                                                               │   │
│  │  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌──────────────────┐ │   │
│  │  │  REST   │ │ WebSocket│ │ BullMQ  │ │ Cron Scheduler   │ │   │
│  │  │  API    │ │ Gateway  │ │ Workers │ │ (GPS purge, etc) │ │   │
│  │  └────┬────┘ └────┬─────┘ └────┬────┘ └───────┬──────────┘ │   │
│  │       │           │            │               │             │   │
│  │       └───────────┴────────────┴───────────────┘             │   │
│  │                         │                                     │   │
│  │              ┌──────────┴──────────┐                         │   │
│  │              │   Prisma ORM +      │                         │   │
│  │              │   RLS Middleware     │                         │   │
│  │              └──────────┬──────────┘                         │   │
│  └─────────────────────────┼────────────────────────────────────┘   │
│                            │                                         │
│  ┌─────────────────────────┴──────────────────────┐                 │
│  │         PostgreSQL 16 + PostGIS 3.4            │                 │
│  │  - Row Level Security (all tables)              │                 │
│  │  - Spatial indexes (technician positions)       │                 │
│  │  - Connection pooling via PgBouncer             │                 │
│  └────────────────────────────────────────────────┘                 │
│                                                                      │
│  ┌────────────────────────────────────────────────┐                 │
│  │                    Redis 7                      │                 │
│  │  - BullMQ job queues                            │                 │
│  │  - Socket.io adapter (pub/sub for scaling)      │                 │
│  │  - Route cache, ETA cache                       │                 │
│  └────────────────────────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────────────┘

          External Services:
          ┌─────────────────────────┐
          │ OpenRouteService API    │ ← Directions + Optimization
          │ OpenStreetMap Tiles     │ ← Map rendering
          │ Stripe API + Webhooks  │ ← Invoicing + Payments
          │ Email Service (Resend) │ ← Transactional emails
          │ SMS Service (Twilio)   │ ← SMS notifications
          └─────────────────────────┘
```

## 6. PostGIS Setup on Railway

Railway provides a PostgreSQL template with PostGIS pre-installed. Configuration:

1. **Railway PostgreSQL service** with PostGIS extension enabled
2. **Connection string** provided as `DATABASE_URL` environment variable
3. **PostGIS initialization** in Prisma migration:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
```

4. **Spatial columns** use `Decimal` in Prisma with raw SQL for spatial queries:
   - Technician positions: `latitude Decimal`, `longitude Decimal`
   - Work order locations: `latitude Decimal`, `longitude Decimal`
   - Spatial index on `(latitude, longitude)` for proximity queries

5. **PostGIS queries** for nearest-technician lookup:

```sql
SELECT id, name,
  ST_Distance(
    ST_MakePoint(longitude, latitude)::geography,
    ST_MakePoint($1, $2)::geography
  ) AS distance_meters
FROM technicians
WHERE company_id = $3 AND status = 'AVAILABLE'
ORDER BY distance_meters ASC
LIMIT 5;
```

## 7. WebSocket Architecture

### 7.1 Socket.io Configuration

The NestJS API server hosts a Socket.io WebSocket gateway for real-time communication.

```
Namespaces:
  /gps          — GPS position streaming (technician -> server -> dashboards)
  /dispatch     — Work order status updates, board sync
  /tracking     — Customer tracking portal updates

Rooms (within /gps namespace):
  company:{companyId}   — All dashboard clients for a company
  technician:{techId}   — Specific technician's channel

Rooms (within /dispatch namespace):
  company:{companyId}   — All dispatch board clients

Rooms (within /tracking namespace):
  workorder:{woId}      — Customer tracking a specific work order
```

### 7.2 GPS Streaming Protocol

```
Client (Technician) → Server:
  Event: "gps:position"
  Payload: {
    latitude: number,
    longitude: number,
    accuracy: number,       // meters
    heading: number | null, // degrees, 0 = north
    speed: number | null,   // m/s
    timestamp: string       // ISO 8601
  }

Server → Dashboard Clients:
  Event: "gps:update"
  Payload: {
    technicianId: string,
    latitude: number,
    longitude: number,
    accuracy: number,
    heading: number | null,
    speed: number | null,
    timestamp: string
  }

Server → Customer Tracking:
  Event: "tracking:position"
  Payload: {
    latitude: number,
    longitude: number,
    eta: number,            // minutes
    distance: number        // meters
  }
```

### 7.3 Connection Authentication

WebSocket connections authenticate via JWT token passed in the `auth` handshake:

```typescript
io.connect('wss://api.example.com/gps', {
  auth: { token: 'jwt-token-here' }
});
```

The server validates the token in the `handleConnection` lifecycle hook, extracts `companyId` and `userId`, and joins the appropriate rooms. Invalid tokens result in immediate disconnection.

### 7.4 Scaling with Redis Adapter

Socket.io uses the Redis adapter to enable horizontal scaling across multiple API server instances. GPS events published on one instance are delivered to clients connected to any instance.

```typescript
import { createAdapter } from '@socket.io/redis-adapter';
const pubClient = createClient({ url: REDIS_URL });
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));
```

## 8. Leaflet Map Integration

### 8.1 Dynamic Import (No SSR)

Leaflet requires browser APIs (`window`, `document`) and cannot render during server-side rendering. All map components must be dynamically imported with SSR disabled:

```typescript
import dynamic from 'next/dynamic';

const DispatchMap = dynamic(
  () => import('@/components/map/DispatchMap'),
  { ssr: false, loading: () => <MapSkeleton /> }
);
```

### 8.2 Tile Configuration

```typescript
const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '&copy; OpenStreetMap contributors';
```

For production, a self-hosted tile server or CDN-backed tile proxy should be used to respect OpenStreetMap's tile usage policy.

### 8.3 Map Component Architecture

```
<DispatchMap>
  ├── <TileLayer />                    — OpenStreetMap tiles
  ├── <TechnicianMarkerLayer />        — Live technician positions
  │   └── <AnimatedMarker /> (per tech) — Smooth position interpolation
  ├── <WorkOrderMarkerLayer />         — Job location pins
  ├── <RoutePolylineLayer />           — Optimized route lines
  └── <BoundsController />             — Auto-fit markers in view
```

## 9. Deployment Architecture

### 9.1 Vercel (Frontend)

- **Framework:** Next.js 15 with App Router
- **Build:** Turborepo `turbo run build --filter=web`
- **Environment variables:** API URL, Socket.io URL, public keys
- **Edge config:** ISR for static pages, SSR for dynamic pages
- **Domain:** Custom domain with SSL

### 9.2 Railway (Backend)

- **API Service:** NestJS Docker container
  - Dockerfile with multi-stage build
  - Health check endpoint at `/api/health`
  - Autoscaling: 1-3 instances based on CPU/memory
- **PostgreSQL:** Railway managed PostgreSQL with PostGIS template
  - Automated backups (daily)
  - Connection pooling via PgBouncer
- **Redis:** Railway managed Redis
  - Persistence: AOF
  - maxmemory-policy: allkeys-lru

### 9.3 Environment Variables

```
# API Server
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
JWT_EXPIRY=24h
ORS_API_KEY=...                  # OpenRouteService
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
RESEND_API_KEY=...               # Email
TWILIO_ACCOUNT_SID=...           # SMS
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
CORS_ORIGINS=https://app.example.com
GPS_UPDATE_INTERVAL_MS=10000
GPS_RETENTION_DAYS=90

# Frontend
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_WS_URL=wss://api.example.com
NEXT_PUBLIC_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

## 10. CI/CD Pipeline

### 10.1 Four-Stage Pipeline (GitHub Actions)

```
Stage 1: Lint + Type Check
  - pnpm install --frozen-lockfile
  - turbo run lint --parallel
  - turbo run type-check --parallel
  Duration: ~2 min

Stage 2: Unit + Integration Tests
  - turbo run test --parallel
  - PostgreSQL service container with PostGIS
  - Redis service container
  - Coverage threshold: 80% lines
  Duration: ~5 min

Stage 3: E2E Tests
  - Start API server with test database
  - Run Vitest E2E suite against API
  - Tenant isolation tests
  - State machine transition tests
  Duration: ~3 min

Stage 4: Deploy
  - On merge to main:
    - Railway: auto-deploy API from Dockerfile
    - Vercel: auto-deploy frontend from git integration
  - On PR: preview deployments on both platforms
  Duration: ~3 min
```

### 10.2 Pre-commit Hooks

```
husky + lint-staged:
  - ESLint fix on staged .ts/.tsx files
  - Prettier format on staged files
  - Type check (tsc --noEmit)
```

## 11. Non-Functional Requirements

### 11.1 Performance

**NFR-100: GPS Update Latency**
End-to-end latency from technician browser emitting a GPS position to the dispatch dashboard displaying the update must be < 2 seconds at the 95th percentile.

- **Measurement:** Timestamp comparison between client emit and client receive events.
- **Budget breakdown:** Client emit (5ms) + network to server (50ms) + server processing + storage (50ms) + Redis pub/sub (10ms) + network to dashboard (50ms) + client render (50ms) = ~215ms typical. 2s budget accommodates network variability.

**NFR-101: Map Rendering**
The dispatch map must render 50 technician markers with smooth animation at 30 FPS on a mid-range laptop (Intel i5, 8GB RAM, integrated graphics).

- **Measurement:** Chrome DevTools Performance panel, FPS counter during marker animation.

**NFR-102: API Response Time**
REST API endpoints must respond within:
- List endpoints: < 200ms (p95) for up to 100 items
- Detail endpoints: < 100ms (p95)
- Write endpoints: < 300ms (p95)
- Search endpoints: < 500ms (p95) for up to 1000 results

**NFR-103: Dispatch Board Load**
The dispatch board must render and become interactive within 2 seconds with 100 work order cards.

### 11.2 Scalability

**NFR-200: Concurrent WebSocket Connections**
The system must support 500 concurrent WebSocket connections per API server instance. With Redis adapter and 3 instances, this provides 1,500 concurrent connections.

**NFR-201: Concurrent Users**
The system must support 200 concurrent authenticated users across all tenants.

**NFR-202: Data Volume**
The system must handle:
- 10,000 work orders per tenant per month
- 1,000 GPS positions per technician per day
- 50 technicians per tenant

### 11.3 Reliability

**NFR-300: Uptime**
System uptime target: 99.9% (< 8.76 hours downtime per year).

**NFR-301: Data Durability**
Zero data loss for work orders, invoices, and customer records. GPS position data is best-effort (acceptable to lose individual positions under high load).

**NFR-302: Graceful Degradation**
If external services are unavailable:
- OpenRouteService down: Route optimization disabled, manual assignment still works, cached routes still display
- Stripe down: Invoice generation queued, retried when available
- SMS/Email service down: Notifications queued, retried when available
- Redis down: WebSocket falls back to single-instance mode, queue operations fail gracefully

### 11.4 Security

**NFR-400: Authentication**
All API endpoints (except customer tracking portal and health check) require JWT authentication. Tokens expire after 24 hours with refresh token rotation.

**NFR-401: Tenant Isolation**
PostgreSQL RLS enforces tenant isolation at the database level. Application-level middleware sets the RLS context on every request. Detailed in §SRS-4.

**NFR-402: HTTPS**
All communications must use HTTPS/WSS. HTTP requests are redirected to HTTPS.

**NFR-403: Input Validation**
All API inputs are validated using class-validator (NestJS) and Zod (shared schemas). SQL injection is prevented by Prisma's parameterized queries.

## 12. Monitoring and Observability

| Concern | Tool | Implementation |
|---------|------|----------------|
| Application logs | Railway built-in logging | Structured JSON logs via NestJS Logger |
| Error tracking | Sentry | NestJS + Next.js Sentry integration |
| Uptime monitoring | Railway health checks | `/api/health` endpoint, 30s interval |
| WebSocket metrics | Custom metrics | Connection count, message rate, latency — logged to stdout |
| Database monitoring | Railway PostgreSQL dashboard | Query performance, connection count, storage |

## 13. Cross-References

- Business requirements: §BRD
- Product requirements: §PRD
- Data model: §SRS-2
- Domain logic: §SRS-3
- Security: §SRS-4
- UI wireframes: §WIREFRAMES

---

*End of Software Requirements Specification — Architecture*
