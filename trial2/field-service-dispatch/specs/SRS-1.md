# System Requirements Specification — Part 1: System Architecture

## Field Service Dispatch & Management Platform

**Version:** 1.0
**Date:** 2026-03-20
**Status:** Approved

---

## 1. Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENTS                                     │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Dispatch      │  │ Technician   │  │ Customer Tracking        │  │
│  │ Dashboard     │  │ Mobile UI    │  │ Portal                   │  │
│  │ (Next.js)     │  │ (Next.js)    │  │ (Next.js)                │  │
│  └──────┬───────┘  └──────┬───────┘  └────────────┬─────────────┘  │
│         │                  │                       │                  │
│         │    HTTP/REST     │    WebSocket           │   HTTP + WS     │
│         └──────────────────┴───────────────────────┘                  │
└─────────────────────────────┬────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY (NestJS)                          │
│                                                                      │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────────────┐    │
│  │ Auth Guard  │  │ Tenant       │  │ Rate Limiter             │    │
│  │ (JWT)       │  │ Context MW   │  │ (Throttler)              │    │
│  └─────┬──────┘  └──────┬───────┘  └──────────┬───────────────┘    │
│        │                 │                      │                     │
│        └─────────────────┴──────────────────────┘                    │
│                          │                                           │
│  ┌───────────────────────┼──────────────────────────────────────┐   │
│  │                   MODULE LAYER                                │   │
│  │                                                               │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │   │
│  │  │ Auth     │  │ Company  │  │ Work     │  │ Techni-  │    │   │
│  │  │ Module   │  │ Module   │  │ Orders   │  │ cians    │    │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │   │
│  │                                                               │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │   │
│  │  │ Custom-  │  │ Routes   │  │ Dispatch │  │ GPS      │    │   │
│  │  │ ers      │  │ Module   │  │ Module   │  │ Gateway  │    │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │   │
│  │                                                               │   │
│  │  ┌──────────┐  ┌──────────┐                                  │   │
│  │  │ Invoice  │  │ Notifi-  │                                  │   │
│  │  │ Module   │  │ cations  │                                  │   │
│  │  └──────────┘  └──────────┘                                  │   │
│  └───────────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
│ PostgreSQL 16    │ │ Redis        │ │ External     │
│ + PostGIS        │ │              │ │ Services     │
│                  │ │ - BullMQ     │ │              │
│ - RLS Policies   │ │ - Route Cache│ │ - ORS API    │
│ - Geometry cols  │ │ - Sessions   │ │ - Stripe     │
│ - Company tenants│ │              │ │ - SMS        │
└──────────────────┘ └──────────────┘ └──────────────┘
```

### 1.2 Monorepo Structure

```
field-service-dispatch/
├── apps/
│   ├── api/                        # NestJS 11 backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/           # JWT authentication + guards
│   │   │   │   ├── company/        # Tenant management
│   │   │   │   ├── work-orders/    # Work order CRUD + state machine
│   │   │   │   ├── technicians/    # Technician management
│   │   │   │   ├── customers/      # Customer management
│   │   │   │   ├── routes/         # Route optimization
│   │   │   │   ├── dispatch/       # Dispatch logic + auto-assign
│   │   │   │   ├── gps-gateway/    # WebSocket GPS streaming
│   │   │   │   ├── invoices/       # Invoice generation + Stripe
│   │   │   │   └── notifications/  # SMS + push notifications
│   │   │   ├── common/
│   │   │   │   ├── guards/         # Auth guard, roles guard
│   │   │   │   ├── middleware/     # Tenant context middleware
│   │   │   │   ├── decorators/     # Custom decorators
│   │   │   │   ├── filters/        # Exception filters
│   │   │   │   └── interceptors/   # Logging, transform interceptors
│   │   │   ├── prisma/
│   │   │   │   ├── schema.prisma   # Database schema
│   │   │   │   ├── migrations/     # Database migrations
│   │   │   │   └── seed.ts         # Seed data (3 companies)
│   │   │   └── app.module.ts
│   │   ├── test/
│   │   │   ├── integration/        # Integration tests (real DB)
│   │   │   └── e2e/               # E2E tests (real HTTP + DB)
│   │   └── vitest.config.ts
│   │
│   └── web/                        # Next.js 15 frontend
│       ├── src/
│       │   ├── app/                # App Router pages
│       │   │   ├── (dashboard)/    # Authenticated layout
│       │   │   │   ├── dispatch/   # Dispatch board
│       │   │   │   ├── work-orders/# Work order management
│       │   │   │   ├── technicians/# Technician views
│       │   │   │   ├── customers/  # Customer management
│       │   │   │   ├── routes/     # Route optimization view
│       │   │   │   ├── analytics/  # Analytics dashboard
│       │   │   │   └── admin/      # Admin panel
│       │   │   ├── tracking/       # Customer tracking portal (public)
│       │   │   │   └── [token]/    # Token-based access
│       │   │   ├── technician/     # Technician mobile UI
│       │   │   └── auth/           # Login/register
│       │   ├── components/
│       │   │   ├── map/            # Leaflet map components
│       │   │   ├── dispatch/       # Dispatch board components
│       │   │   ├── work-orders/    # Work order components
│       │   │   └── ui/             # shadcn/ui components
│       │   ├── hooks/              # Custom React hooks
│       │   ├── lib/                # Utilities, API client, WebSocket
│       │   └── types/              # Frontend-specific types
│       └── next.config.ts
│
├── packages/
│   ├── shared/                     # Shared types, enums, state machines
│   │   ├── src/
│   │   │   ├── enums/             # WorkOrderStatus, UserRole, etc.
│   │   │   ├── types/             # Shared interfaces
│   │   │   ├── state-machine/     # Work order state machine
│   │   │   └── index.ts           # Public exports
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── config/                     # Shared configs
│       ├── eslint/                 # ESLint config
│       └── typescript/             # TypeScript base config
│
├── turbo.json
├── package.json
└── .github/workflows/ci.yml
```

---

## 2. Service Boundaries

### 2.1 Module Responsibilities

| Module | Responsibility | Dependencies |
|--------|---------------|--------------|
| auth | JWT generation, validation, role-based access | None |
| company | Company (tenant) CRUD, tenant context | auth |
| work-orders | Work order CRUD, state transitions, history logging | auth, company, shared (state machine) |
| technicians | Technician CRUD, skills, availability, location | auth, company |
| customers | Customer CRUD, geocoding | auth, company |
| routes | Route optimization via OpenRouteService, caching | auth, company, technicians, work-orders |
| dispatch | Auto-assign algorithm, dispatch operations | auth, company, work-orders, technicians, routes |
| gps-gateway | WebSocket GPS streaming, tenant-isolated rooms | auth (JWT validation) |
| invoices | Invoice generation, Stripe integration | auth, company, work-orders |
| notifications | SMS/email dispatch, notification queueing | auth, company, BullMQ |

### 2.2 Module Communication

Modules communicate via:
1. **Direct service injection:** NestJS dependency injection for synchronous operations
2. **Events:** NestJS EventEmitter for decoupled operations (e.g., work order completion triggers invoice)
3. **WebSocket:** GPS gateway broadcasts to subscribed clients
4. **BullMQ queues:** Async processing for notifications, route recalculation

```
Work Order Completion Event Flow:
WorkOrderService.transition(COMPLETED)
  → EventEmitter.emit('work-order.completed', { workOrderId })
  → InvoiceService.onWorkOrderCompleted()    → creates invoice
  → NotificationService.onWorkOrderCompleted() → sends SMS to customer
```

---

## 3. WebSocket Architecture

### 3.1 Gateway Design

```typescript
// GPS Gateway — handles real-time position streaming
@WebSocketGateway({
  namespace: '/gps',
  cors: { origin: process.env.FRONTEND_URL }
})
export class GpsGateway {
  // Authentication on handshake
  handleConnection(client: Socket) {
    // 1. Extract JWT from handshake auth
    // 2. Validate token
    // 3. Extract companyId from token
    // 4. Join company room: `company:${companyId}`
    // 5. Reject if invalid
  }

  // Technician sends position update
  @SubscribeMessage('position:update')
  handlePositionUpdate(client: Socket, data: PositionUpdateDto) {
    // 1. Validate data (lat, lng, timestamp)
    // 2. Verify technician belongs to client's company (TENANT ISOLATION)
    // 3. Update technician position in database
    // 4. Broadcast to company room: `company:${companyId}`
    // 5. Broadcast to relevant tracking rooms: `tracking:${workOrderId}`
  }
}
```

### 3.2 Room Structure

```
WebSocket Rooms:
├── company:{companyId}          # All events for a company
│   ├── GPS position updates     # Technician markers move
│   ├── Work order status changes # Kanban column updates
│   └── Assignment notifications # New job assigned
│
├── tracking:{workOrderId}       # Customer tracking portal
│   ├── Technician position      # Single technician marker
│   └── ETA updates              # "X minutes away"
│
└── technician:{technicianId}    # Individual technician channel
    ├── New assignment            # "You have a new job"
    └── Route updates             # Route recalculated
```

### 3.3 Authentication Flow

```
Client                          Server
  │                               │
  ├── Connect with JWT ──────────►│
  │                               ├── Verify JWT
  │                               ├── Extract companyId, userId, role
  │                               ├── Join company:{companyId} room
  │   ◄── Connection accepted ────┤
  │                               │
  ├── position:update ───────────►│
  │   { lat, lng, ts }            ├── Validate payload
  │                               ├── Verify technician.companyId === jwt.companyId
  │                               ├── Update DB
  │                               ├── Emit to company:{companyId}
  │                               ├── Emit to tracking:{workOrderId}
  │   ◄── position:broadcast ────┤
  │                               │

  INVALID:
  ├── Connect WITHOUT JWT ───────►│
  │                               ├── Reject connection
  │   ◄── Error: Unauthorized ───┤
```

### 3.4 Tenant Isolation in WebSocket

**CRITICAL:** The GPS gateway MUST enforce tenant isolation:

1. **On connect:** Extract `companyId` from JWT, store on socket instance
2. **On position:update:** Verify the `technicianId` in the payload belongs to the same
   `companyId` as the connected socket
3. **Room joining:** Only join `company:{companyId}` matching the JWT
4. **Broadcasting:** Never broadcast to rooms of other companies
5. **Customer tracking:** `tracking:{workOrderId}` — verify work order belongs to the
   technician's company before broadcasting

---

## 4. PostGIS Integration

### 4.1 Spatial Data Model

```sql
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Technician table with location
ALTER TABLE "Technician" ADD COLUMN "location" geometry(Point, 4326);

-- Create spatial index
CREATE INDEX idx_technician_location ON "Technician" USING GIST("location");

-- Customer table with location
ALTER TABLE "Customer" ADD COLUMN "location" geometry(Point, 4326);

-- Create spatial index
CREATE INDEX idx_customer_location ON "Customer" USING GIST("location");
```

### 4.2 Spatial Queries

**Nearest Technician Query (Auto-Assign):**
```sql
SELECT t.id, t.name, t.skills,
  ST_Distance(
    t.location::geography,
    ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
  ) as distance_meters
FROM "Technician" t
WHERE t."companyId" = current_setting('app.company_id')::uuid
  AND t.status = 'AVAILABLE'
  AND t.skills @> $3::text[]
ORDER BY distance_meters ASC
LIMIT 1;
```

**Technicians Within Radius:**
```sql
SELECT t.id, t.name, t.location
FROM "Technician" t
WHERE t."companyId" = current_setting('app.company_id')::uuid
  AND ST_DWithin(
    t.location::geography,
    ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
    $3  -- radius in meters
  );
```

### 4.3 Coordinate System

- All coordinates use **SRID 4326** (WGS 84) — standard GPS coordinate system
- Stored as `geometry(Point, 4326)` in PostGIS
- Distance calculations use `::geography` cast for accurate meters
- Frontend sends/receives standard `{ lat: number, lng: number }` objects
- Conversion: `ST_MakePoint(longitude, latitude)` — note the order (lng, lat)

---

## 5. OpenRouteService Integration

### 5.1 API Endpoints Used

| ORS Endpoint | Purpose | Rate Limit |
|--------------|---------|------------|
| `/v2/directions/{profile}` | Point-to-point directions + polyline | 2,000/day |
| `/optimization` | Multi-stop route optimization (Vroom) | ~500/day |

### 5.2 Route Optimization Request

```typescript
// POST https://api.openrouteservice.org/optimization
{
  "jobs": [
    {
      "id": 1,
      "location": [-73.9857, 40.7484],  // [lng, lat]
      "service": 3600  // seconds on-site
    },
    {
      "id": 2,
      "location": [-73.9712, 40.7614],
      "service": 1800
    }
  ],
  "vehicles": [
    {
      "id": 1,
      "start": [-73.9903, 40.7351],     // technician start
      "profile": "driving-car"
    }
  ]
}
```

### 5.3 Response Processing

```typescript
// Response contains optimized route
{
  "routes": [
    {
      "vehicle": 1,
      "steps": [
        { "type": "start", "location": [-73.9903, 40.7351] },
        { "type": "job", "id": 2, "location": [-73.9712, 40.7614], "arrival": 600 },
        { "type": "job", "id": 1, "location": [-73.9857, 40.7484], "arrival": 1800 },
        { "type": "end", "location": [-73.9857, 40.7484] }
      ],
      "duration": 2400,
      "distance": 8500
    }
  ]
}
```

### 5.4 Directions for Polylines

After optimization, fetch directions between each consecutive stop to get polylines
for map rendering:

```typescript
// POST https://api.openrouteservice.org/v2/directions/driving-car/geojson
{
  "coordinates": [
    [-73.9903, 40.7351],  // start
    [-73.9712, 40.7614],  // stop 1
    [-73.9857, 40.7484]   // stop 2
  ]
}
// Response includes GeoJSON LineString geometry for the route polyline
```

### 5.5 Fallback Strategy

```typescript
if (process.env.NODE_ENV === 'production') {
  // In production, throw if ORS is unavailable
  throw new ServiceUnavailableException('Route optimization service unavailable');
}
// In development/demo, use mock with realistic data
return mockOptimizationResult;
```

---

## 6. Real-Time Data Flow

### 6.1 GPS Position Flow

```
┌──────────────┐    WebSocket     ┌──────────────┐    Broadcast    ┌──────────────┐
│ Technician   │ ──position:update──► GPS Gateway │ ──position:broadcast──► Dispatch  │
│ Browser      │                   │              │                  │ Dashboard    │
│              │                   │              │                  └──────────────┘
│ watchPosition│                   │ Validate     │
│ every 5s     │                   │ Tenant check │    Broadcast    ┌──────────────┐
│              │                   │ Update DB    │ ──position:broadcast──► Customer  │
└──────────────┘                   │ Emit to rooms│                  │ Portal       │
                                   └──────────────┘                  └──────────────┘
```

### 6.2 Work Order Status Change Flow

```
┌──────────────┐    HTTP POST     ┌──────────────┐    Event        ┌──────────────┐
│ Technician   │ ──status update────► Work Order │ ──wo.completed───► Invoice     │
│ or Dispatcher│                   │ Service      │                  │ Service      │
│              │                   │              │    Event        ┌──────────────┐
│              │                   │ Validate     │ ──wo.status────► Notification │
│              │                   │ Transition   │                  │ Service      │
│              │                   │ Log History  │                  └──────────────┘
│              │                   │              │    WebSocket    ┌──────────────┐
│              │                   │ Emit event   │ ──wo:updated────► All         │
│              │                   │              │                  │ Subscribers  │
└──────────────┘                   └──────────────┘                  └──────────────┘
```

### 6.3 ETA Calculation Flow

```
┌──────────────┐    Position      ┌──────────────┐    ORS API     ┌──────────────┐
│ GPS Gateway  │ ──new position───► ETA Service  │ ──directions───► OpenRoute   │
│              │                   │              │                  │ Service      │
│              │                   │ Cache check  │ ◄──duration──── │              │
│              │                   │ Debounce     │                  └──────────────┘
│              │                   │              │    WebSocket    ┌──────────────┐
│              │                   │ Calculate    │ ──eta:update────► Customer    │
│              │                   │              │                  │ Portal       │
└──────────────┘                   └──────────────┘                  └──────────────┘
```

---

## 7. Security Architecture

### 7.1 Authentication Layers

```
Layer 1: HTTP Request
  → JWT Bearer token in Authorization header
  → AuthGuard validates token
  → Extracts userId, companyId, role

Layer 2: Tenant Context
  → TenantContextMiddleware reads companyId from JWT
  → Sets PostgreSQL session variable: SET app.company_id = '{companyId}'
  → All subsequent Prisma queries are filtered by RLS

Layer 3: Role-Based Access
  → RolesGuard checks user role against endpoint requirements
  → ADMIN: full access within tenant
  → DISPATCHER: manage work orders, view technicians
  → TECHNICIAN: own jobs only
  → CUSTOMER: own data only

Layer 4: WebSocket
  → JWT in handshake auth
  → Company room assignment based on JWT companyId
  → Technician ownership verification on GPS updates
```

### 7.2 Database Security

```
PostgreSQL RLS Flow:
1. Middleware: SET app.company_id = '{companyId from JWT}'
2. Prisma query: SELECT * FROM "WorkOrder"
3. RLS policy: WHERE "companyId" = current_setting('app.company_id')::uuid
4. Result: Only rows from the authenticated company
```

### 7.3 Input Validation

```
Request → ValidationPipe (class-validator) → DTO → Controller → Service
              ↓ (invalid)
         400 Bad Request with field-level errors
```

---

## 8. Infrastructure

### 8.1 Deployment Architecture

```
┌──────────────────────────────────────────────┐
│                   Vercel                       │
│  ┌────────────────────────────────────────┐   │
│  │ Next.js 15 (apps/web)                  │   │
│  │ - Static + SSR pages                   │   │
│  │ - API routes (BFF if needed)           │   │
│  └────────────────────────────────────────┘   │
└──────────────────────┬───────────────────────┘
                       │ HTTPS
                       ▼
┌──────────────────────────────────────────────┐
│                  Railway                       │
│  ┌──────────────┐  ┌──────────────────────┐  │
│  │ NestJS API   │  │ PostgreSQL 16        │  │
│  │ + WebSocket  │  │ + PostGIS            │  │
│  │ + BullMQ     │  │ + RLS Policies       │  │
│  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────┐                             │
│  │ Redis        │                             │
│  │ - Queues     │                             │
│  │ - Cache      │                             │
│  └──────────────┘                             │
└──────────────────────────────────────────────┘
```

### 8.2 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/field_service?schema=public

# Redis
REDIS_URL=redis://host:6379

# JWT
JWT_SECRET=<256-bit secret>
JWT_EXPIRATION=24h

# OpenRouteService
ORS_API_KEY=<api-key>
ORS_BASE_URL=https://api.openrouteservice.org

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_WS_URL=wss://api.example.com

# General
NODE_ENV=production
FRONTEND_URL=https://app.example.com
```

---

## 9. Technology Stack Details

### 9.1 Backend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| @nestjs/core | ^11.x | Framework core |
| @nestjs/platform-express | ^11.x | HTTP adapter |
| @nestjs/websockets | ^11.x | WebSocket support |
| @nestjs/platform-socket.io | ^11.x | Socket.io adapter |
| @nestjs/jwt | ^11.x | JWT generation/validation |
| @nestjs/passport | ^11.x | Authentication |
| @nestjs/throttler | ^6.x | Rate limiting |
| @nestjs/event-emitter | ^3.x | Internal events |
| @nestjs/bullmq | ^11.x | Job queues |
| @prisma/client | ^6.x | Database ORM |
| prisma | ^6.x | Schema/migration tooling |
| class-validator | ^0.14.x | DTO validation |
| class-transformer | ^0.5.x | DTO transformation |
| passport-jwt | ^4.x | JWT strategy |
| socket.io | ^4.x | WebSocket server |
| stripe | ^17.x | Payment processing |

### 9.2 Frontend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| next | ^15.x | React framework |
| react | ^19.x | UI library |
| leaflet | ^1.9.x | Map rendering |
| react-leaflet | ^5.x | React Leaflet bindings |
| @dnd-kit/core | ^6.x | Drag and drop |
| @dnd-kit/sortable | ^10.x | Sortable lists |
| socket.io-client | ^4.x | WebSocket client |
| tailwindcss | ^4.x | CSS framework |
| date-fns | ^4.x | Date utilities |
| @stripe/stripe-js | ^5.x | Stripe frontend |

### 9.3 Testing Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| vitest | ^3.x | Test runner |
| unplugin-swc | ^1.x | SWC transform for Vitest + NestJS |
| @vitest/coverage-v8 | ^3.x | Code coverage |
| supertest | ^7.x | HTTP integration tests |

---

## 10. Build and Development

### 10.1 Turborepo Pipeline

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### 10.2 Development Workflow

```bash
# Install dependencies
pnpm install

# Start development servers (API + Web)
pnpm dev

# Run database migrations
pnpm --filter api prisma migrate dev

# Seed database
pnpm --filter api prisma db seed

# Run tests
pnpm test

# Lint
pnpm lint

# Build all
pnpm build
```
