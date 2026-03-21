# Software Requirements Specification — Architecture (SRS-1)

## Escrow Marketplace — Conditional Payment Platform

| Field            | Value                          |
|------------------|--------------------------------|
| Version          | 1.0                            |
| Date             | 2026-03-20                     |
| Status           | Draft                          |
| Owner            | Platform Engineering           |
| Classification   | Internal                       |

> **Legal Notice:** This platform uses "payment hold" and "conditional release"
> terminology. Stripe Connect handles all money transmission. This is a demo
> application — no real funds are processed.

---

## 1. Monorepo Structure

### 1.1 Tooling

| Tool          | Version   | Purpose                                    |
|---------------|-----------|--------------------------------------------|
| Turborepo     | 2.x       | Monorepo orchestration, task caching       |
| pnpm          | 9.x       | Package manager (workspace protocol)       |
| TypeScript    | 5.7+      | Type safety across all packages            |

### 1.2 Directory Layout

```
escrow-marketplace/
+-- turbo.json
+-- pnpm-workspace.yaml
+-- package.json
+-- apps/
|   +-- api/                    # NestJS 11 backend
|   |   +-- src/
|   |   |   +-- modules/
|   |   |   |   +-- auth/
|   |   |   |   +-- users/
|   |   |   |   +-- transactions/
|   |   |   |   +-- disputes/
|   |   |   |   +-- payments/
|   |   |   |   +-- payouts/
|   |   |   |   +-- webhooks/
|   |   |   |   +-- admin/
|   |   |   +-- common/
|   |   |   |   +-- guards/
|   |   |   |   +-- decorators/
|   |   |   |   +-- filters/
|   |   |   |   +-- interceptors/
|   |   |   +-- config/
|   |   |   +-- prisma/
|   |   |   +-- queue/
|   |   |   +-- main.ts
|   |   +-- prisma/
|   |   |   +-- schema.prisma
|   |   |   +-- migrations/
|   |   |   +-- seed.ts
|   |   +-- test/
|   +-- web/                    # Next.js 15 frontend
|   |   +-- src/
|   |   |   +-- app/
|   |   |   |   +-- (auth)/
|   |   |   |   +-- (buyer)/
|   |   |   |   +-- (provider)/
|   |   |   |   +-- (admin)/
|   |   |   |   +-- layout.tsx
|   |   |   +-- components/
|   |   |   |   +-- ui/         # shadcn/ui components
|   |   |   |   +-- forms/
|   |   |   |   +-- layout/
|   |   |   |   +-- transactions/
|   |   |   |   +-- disputes/
|   |   |   +-- lib/
|   |   |   |   +-- api.ts
|   |   |   |   +-- stripe.ts
|   |   |   |   +-- auth.ts
|   |   |   +-- hooks/
|   |   |   +-- types/
+-- packages/
|   +-- shared/                 # Shared types, constants, utilities
|   |   +-- src/
|   |   |   +-- types/
|   |   |   +-- constants/
|   |   |   +-- utils/
|   |   +-- package.json
+-- specs/                      # This specification suite
+-- .github/
|   +-- workflows/
+-- docker-compose.yml          # Local dev (PostgreSQL + Redis)
```

### 1.3 Workspace Dependencies

| Package          | Depends On       | Purpose                            |
|------------------|------------------|------------------------------------|
| `apps/api`       | `packages/shared`| Shared types, constants            |
| `apps/web`       | `packages/shared`| Shared types, constants            |
| `packages/shared`| (none)           | Root shared package                |

---

## 2. Technology Stack

### 2.1 Backend — `apps/api`

| Technology       | Version   | Purpose                                    |
|------------------|-----------|--------------------------------------------|
| NestJS           | 11.x      | API framework (modular, DI, guards)        |
| Prisma           | 6.x       | ORM and migration management               |
| PostgreSQL       | 16        | Primary database with RLS                  |
| BullMQ           | 5.x       | Job queue (webhook processing, timers)     |
| Redis            | 7+        | BullMQ backing store                       |
| Stripe SDK       | 17.x      | Stripe Connect API integration             |
| Passport         | 0.7+      | JWT authentication strategy                |
| class-validator  | 0.14+     | Request validation                         |
| class-transformer| 0.5+      | DTO transformation                         |

### 2.2 Frontend — `apps/web`

| Technology       | Version   | Purpose                                    |
|------------------|-----------|--------------------------------------------|
| Next.js          | 15.x      | React framework (App Router, RSC)          |
| React            | 19.x      | UI library                                 |
| shadcn/ui        | latest    | Component library (Radix + Tailwind)       |
| Tailwind CSS     | 4.x       | Utility-first styling                      |
| Stripe.js        | latest    | Client-side Stripe Elements                |
| React Query      | 5.x       | Server state management                    |
| Zod              | 3.x       | Client-side validation                     |
| Recharts         | 2.x       | Analytics charts                           |

### 2.3 Testing

| Technology       | Scope     | Purpose                                    |
|------------------|-----------|--------------------------------------------|
| Vitest           | All       | Unit and integration tests                 |
| Testing Library  | Frontend  | Component testing                          |
| Supertest        | API       | HTTP endpoint testing                      |
| MSW              | All       | Stripe API mocking                         |

---

## 3. Stripe Connect Integration Architecture

### 3.1 Account Model

```
Platform Account (Escrow Marketplace)
  |
  +-- Express Connected Account (Provider A)
  +-- Express Connected Account (Provider B)
  +-- Express Connected Account (Provider N)
```

- **Account Type:** Express (Stripe-hosted onboarding, minimal platform data exposure)
- **Charge Flow:** Separate Charges and Transfers
  1. Charge the buyer's card to the platform account
  2. Hold funds via uncaptured PaymentIntent (`capture_method: manual`)
  3. On release: capture the PaymentIntent, then create a Transfer to the provider's connected account
  4. Platform fee = charge amount - transfer amount

### 3.2 Payment Flow Sequence

```
Buyer          Platform API        Stripe           Provider
  |                |                  |                 |
  |--Create Hold-->|                  |                 |
  |                |--PaymentIntent-->|                 |
  |                |    (manual)      |                 |
  |                |<--PI confirmed---|                 |
  |                |                  |                 |
  |                |--Notify----------|---------------->|
  |                |                  |                 |
  |  (delivery)    |                  |                 |
  |                |<--Mark Delivered-|-----------------|
  |<--Notify-------|                  |                 |
  |                |                  |                 |
  |--Confirm------>|                  |                 |
  |                |--Capture PI----->|                 |
  |                |--Transfer------->|                 |
  |                |   (minus fee)    |                 |
  |                |<--transfer.ok----|                 |
  |                |--Notify----------|---------------->|
```

### 3.3 Webhook Processing Pipeline

```
Stripe --> POST /api/webhooks/stripe
              |
              v
        Signature Verification (stripe.webhooks.constructEvent)
              |
              v
        Idempotency Check (WebhookLog lookup by event ID)
              |
              +-- Already processed? --> 200 OK (skip)
              |
              v
        Write WebhookLog record (status: PROCESSING)
              |
              v
        Enqueue to BullMQ (event-type-specific queue)
              |
              v
        Return 200 OK (acknowledge receipt)
              |
              v
        [BullMQ Worker]
              |
              v
        Process event (update entities, trigger side effects)
              |
              v
        Update WebhookLog (status: PROCESSED or FAILED)
```

Key design decisions:
- Acknowledge webhooks immediately (200 OK) before processing
- BullMQ provides retry with exponential backoff on failure
- WebhookLog dedup prevents double-processing on Stripe retries
- Each event type maps to a dedicated handler function

---

## 4. Deployment Architecture

### 4.1 Infrastructure

| Component        | Platform     | Configuration                          |
|------------------|--------------|----------------------------------------|
| Frontend (web)   | Vercel       | Next.js automatic deployment           |
| API (api)        | Railway      | NestJS with Dockerfile                 |
| PostgreSQL       | Railway      | Managed PostgreSQL 16                  |
| Redis            | Railway      | Managed Redis 7+                       |
| Stripe Webhooks  | Stripe       | Points to Railway API URL              |

### 4.2 Environment Configuration

| Variable                  | Service | Description                        |
|---------------------------|---------|------------------------------------|
| `DATABASE_URL`            | API     | PostgreSQL connection string       |
| `REDIS_URL`               | API     | Redis connection string            |
| `STRIPE_SECRET_KEY`       | API     | Stripe test mode secret key        |
| `STRIPE_WEBHOOK_SECRET`   | API     | Webhook endpoint signing secret    |
| `STRIPE_PUBLISHABLE_KEY`  | Web     | Stripe test mode publishable key   |
| `JWT_SECRET`              | API     | JWT signing secret                 |
| `JWT_EXPIRY`              | API     | Token expiration (default: 24h)    |
| `PLATFORM_FEE_PERCENT`    | API     | Platform fee (default: 10)         |
| `AUTO_RELEASE_HOURS`      | API     | Auto-release timer (default: 72)   |
| `FRONTEND_URL`            | API     | Frontend URL for CORS and redirects|
| `API_URL`                 | Web     | API URL for frontend requests      |

### 4.3 Network Topology

```
[Browser] --HTTPS--> [Vercel CDN] --SSR--> [Next.js]
                                              |
                                         [API_URL]
                                              |
                                              v
[Stripe] --webhook--> [Railway] <---> [PostgreSQL]
                          |
                          +---------> [Redis/BullMQ]
```

---

## 5. CI/CD Pipeline

### 5.1 Four-Stage Pipeline

```
Stage 1: Validate          Stage 2: Test           Stage 3: Build          Stage 4: Deploy
+------------------+      +------------------+    +------------------+    +------------------+
| - Lint (ESLint)  |      | - Unit tests     |    | - Build api      |    | - Deploy web     |
| - Type check     | ---> | - Integration    | -> | - Build web      | -> |   (Vercel)       |
| - Format check   |      |   tests          |    | - Prisma generate|    | - Deploy api     |
| - Prisma validate|      | - Stripe mock    |    |                  |    |   (Railway)      |
+------------------+      +------------------+    +------------------+    +------------------+
```

### 5.2 CI Triggers

| Trigger          | Pipeline Stages    | Target Branch        |
|------------------|--------------------|----------------------|
| Pull Request     | Validate + Test    | Any                  |
| Push to main     | All four stages    | main                 |
| Push to develop  | Validate + Test + Build | develop         |

### 5.3 Turborepo Caching

- Remote cache via Vercel (Turborepo native integration)
- Task dependency graph ensures correct build order
- `packages/shared` changes invalidate both `apps/api` and `apps/web` caches

---

## 6. Non-Functional Requirements

### 6.1 Performance

| Metric                              | Target          | Measurement               |
|-------------------------------------|-----------------|---------------------------|
| Payment API endpoint latency (p95)  | < 500ms         | Excluding Stripe latency  |
| Webhook acknowledgment time         | < 200ms         | Time to return 200 OK     |
| Dashboard page load (LCP)           | < 2.5s          | Core Web Vitals           |
| Database query time (p95)           | < 100ms         | Prisma query logging      |
| BullMQ job pickup latency           | < 1s            | Queue metrics             |

### 6.2 Reliability

| Metric                              | Target          | Measurement               |
|-------------------------------------|-----------------|---------------------------|
| API uptime                          | 99.9%           | Health check monitoring   |
| Webhook processing success rate     | 99.9%           | Processed / Received      |
| Zero data loss on payment state     | 100%            | Audit trail completeness  |
| Auto-release timer accuracy         | +/- 60 seconds  | BullMQ delayed job timing |

### 6.3 Scalability

| Dimension                           | Target          | Approach                  |
|-------------------------------------|-----------------|---------------------------|
| Concurrent transactions             | 1,000           | Connection pooling, queue |
| Webhook throughput                   | 100/second      | BullMQ worker concurrency |
| Database connections                 | 20 pool size    | Prisma connection pool    |
| File upload (dispute evidence)       | 10 MB max       | Direct-to-S3 presigned    |

### 6.4 Observability

| Component                           | Tool            | Purpose                   |
|-------------------------------------|-----------------|---------------------------|
| API logging                         | Pino (NestJS)   | Structured JSON logs      |
| Error tracking                      | Sentry          | Exception capture         |
| Uptime monitoring                   | Railway metrics  | Health check polling      |
| Queue monitoring                    | BullMQ dashboard | Job status, failure rates |

---

## 7. API Design Principles

### 7.1 REST Conventions

| Convention                          | Standard                                |
|-------------------------------------|-----------------------------------------|
| Base path                           | `/api/v1`                               |
| Authentication                      | Bearer JWT in Authorization header      |
| Content type                        | `application/json`                      |
| Error format                        | `{ statusCode, message, error }`        |
| Pagination                          | `?page=1&limit=20` with total count     |
| Filtering                           | Query parameters per resource           |
| Sorting                             | `?sort=createdAt&order=desc`            |

### 7.2 Endpoint Naming

| Pattern                             | Example                                 |
|-------------------------------------|-----------------------------------------|
| Collection                          | `GET /api/v1/transactions`              |
| Single resource                     | `GET /api/v1/transactions/:id`          |
| Action on resource                  | `POST /api/v1/transactions/:id/release` |
| Nested resource                     | `GET /api/v1/transactions/:id/history`  |
| Webhook receiver                    | `POST /api/v1/webhooks/stripe`          |

---

## 8. Local Development

### 8.1 Docker Compose Services

```yaml
services:
  postgres:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: escrow_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
```

### 8.2 Development Workflow

```bash
# 1. Start infrastructure
docker compose up -d

# 2. Install dependencies
pnpm install

# 3. Generate Prisma client + run migrations
pnpm --filter api prisma:generate
pnpm --filter api prisma:migrate

# 4. Seed test data
pnpm --filter api prisma:seed

# 5. Start dev servers (Turborepo parallel)
pnpm dev

# 6. Stripe webhook forwarding (separate terminal)
stripe listen --forward-to localhost:3000/api/v1/webhooks/stripe
```

### 8.3 Stripe CLI Integration

- `stripe listen` forwards webhook events to local API
- `stripe trigger` simulates specific events for testing
- Test card numbers documented in frontend UI

---

## 9. Document References

| Document   | Section  | Relationship                                     |
|------------|----------|--------------------------------------------------|
| §PVD       | 6        | Scope boundaries for architecture                |
| §BRD       | 3        | Stripe Connect requirements                      |
| §PRD       | All      | Functional requirements this architecture serves |
| §SRS-2     | All      | Data model within this architecture              |
| §SRS-3     | All      | Domain logic running on this architecture        |
| §SRS-4     | All      | Security layers in this architecture             |

---

*End of SRS-1 — Escrow Marketplace v1.0*
