# Business Requirements Document (BRD)
# Embeddable Analytics Dashboard Engine

## Document Info
- **Version:** 1.0
- **Last Updated:** 2026-03-20
- **Status:** Approved

---

## 1. Business Objectives

### 1.1 Primary Objective

Deliver a fully functional, multi-tenant analytics embedding platform that
demonstrates end-to-end engineering competence in data ingestion, pipeline
processing, real-time visualization, and secure embedding.

### 1.2 Secondary Objectives

1. **Demonstrate multi-tenant architecture** — PostgreSQL RLS, tenant-scoped
   API keys, isolated data access patterns
2. **Showcase data pipeline engineering** — connectors, schema mapping,
   transforms, scheduling, error handling, dead letter queues
3. **Prove embedding capability** — iframe + postMessage API, CSP, CORS,
   origin whitelisting, white-label theming
4. **Exhibit full-stack proficiency** — NestJS backend, Next.js frontend,
   Recharts visualizations, BullMQ job processing, Redis caching

### 1.3 Business Context

This project serves as a portfolio demonstration of building complex
infrastructure from scratch. It proves the ability to:

- Design and implement a connector framework for diverse data sources
- Build a data ingestion pipeline with error handling and retry logic
- Implement database-level tenant isolation (not just app-level filtering)
- Create an embeddable visualization layer with real-time updates
- Handle security concerns: API key auth, CORS, CSP, input validation

---

## 2. Stakeholder Analysis

### 2.1 Stakeholder Map

| Stakeholder | Role | Interest | Influence |
|-------------|------|----------|-----------|
| Portfolio Reviewer | Evaluates technical depth | High | High |
| SaaS Developer (hypothetical user) | Would use for embedding | High | Medium |
| Tenant Admin (hypothetical user) | Would configure dashboards | Medium | Low |
| End User (hypothetical viewer) | Would view embedded dashboards | Low | Low |

### 2.2 Stakeholder Needs

#### Portfolio Reviewer
- **Needs:** Clean architecture, real implementations (not stubs), security
  best practices, comprehensive testing
- **Success criteria:** Can read the code and understand the system; tests pass;
  security claims are verifiable; CI pipeline is real

#### SaaS Developer
- **Needs:** Simple embed integration, reliable data ingestion, clear API docs
- **Success criteria:** Embed code snippet works; API responses are predictable;
  data appears in dashboards after connector configuration

#### Tenant Admin
- **Needs:** Visual connector configuration, dashboard builder, sync monitoring
- **Success criteria:** Can add a data source, map fields, build a dashboard,
  and see data without writing code

---

## 3. Business Requirements

### BR-1: Multi-Tenant Data Isolation

**Requirement:** The system SHALL enforce data isolation between tenants at the
database level using PostgreSQL Row-Level Security (RLS).

**Rationale:** Application-level filtering (`WHERE tenant_id = ?`) is
insufficient — a single bug could expose one tenant's data to another. RLS
provides defense-in-depth at the database layer.

**Acceptance Criteria:**
- RLS policies exist on every tenant-scoped table
- Policies are defined in migration SQL (not application code)
- E2E tests verify tenant isolation (Tenant A cannot see Tenant B's data)
- Tenant context is set via `SET LOCAL` on each request

### BR-2: Data Ingestion Pipeline

**Requirement:** The system SHALL support data ingestion from at least 4
connector types: REST API, PostgreSQL, CSV upload, and Webhook.

**Rationale:** SaaS products have diverse data sources. Supporting multiple
connector types demonstrates pipeline flexibility and connector framework design.

**Acceptance Criteria:**
- REST API connector polls an external endpoint on a configurable schedule
- PostgreSQL connector executes a read-only query and maps columns
- CSV connector parses uploaded files and maps columns
- Webhook connector accepts POST requests at a tenant-specific URL
- Each connector supports schema mapping (source fields → dimensions/metrics)
- Each connector supports configurable transform steps
- Failed ingestion events are captured in a dead letter queue

### BR-3: Dashboard Builder

**Requirement:** The system SHALL provide a visual dashboard builder that allows
tenants to create dashboards with multiple widget types.

**Rationale:** A dashboard builder demonstrates UI engineering and provides the
core product experience.

**Acceptance Criteria:**
- Tenants can create dashboards and add widgets
- 7 widget types available: Line, Bar, Pie/Donut, Area, KPI Card, Table, Funnel
- Widget configuration via dropdowns (chart type, data source, dimensions, metrics)
- Dashboard layout using CSS Grid (position, size)
- Dashboards can be published for embedding

### BR-4: Embeddable Dashboards

**Requirement:** The system SHALL provide an embedding mechanism that allows
tenants to embed dashboards in their own products.

**Rationale:** Embedding is the core value proposition. The embed flow must be
secure, performant, and customizable.

**Acceptance Criteria:**
- Embed via iframe with API key authentication
- postMessage API for host ↔ embed communication
- Allowed origins whitelist per embed configuration
- Embed renders with tenant branding (colors, fonts, logo)
- Embed code snippet available in tenant admin panel

### BR-5: Real-Time Updates

**Requirement:** The system SHALL push updated data to embedded dashboards
without requiring page refresh.

**Rationale:** Real-time updates demonstrate SSE implementation and improve the
user experience for monitoring dashboards.

**Acceptance Criteria:**
- SSE endpoint streams dashboard updates to embed renderer
- Updates triggered when new data is ingested
- 10-second maximum interval between updates
- SSE connections are tenant-scoped

### BR-6: White-Label Theming

**Requirement:** The system SHALL apply tenant-specific branding to embedded
dashboards.

**Rationale:** White-labeling allows tenants to present analytics as part of
their own product, not a third-party tool.

**Acceptance Criteria:**
- Tenant configures primary color, font family, and logo URL
- Embed renderer applies branding via CSS custom properties
- Theme overrides available per embed configuration
- No visible branding from the analytics platform itself

### BR-7: Sync Monitoring

**Requirement:** The system SHALL provide visibility into the data ingestion
pipeline's health and history.

**Rationale:** Data pipeline observability is critical for troubleshooting.
Without it, tenants cannot diagnose ingestion issues.

**Acceptance Criteria:**
- Sync history page shows each pipeline run with status, row count, errors
- Dead letter queue shows failed events with error details
- Sync runs are logged with timestamps and duration
- Failed syncs can be retried

---

## 4. Constraints

### 4.1 Technical Constraints

| Constraint | Description | Rationale |
|------------|-------------|-----------|
| **PostgreSQL 16** | Primary database | RLS support, JSONB, mature ecosystem |
| **NestJS 11** | Backend framework | Module system, DI, decorator patterns |
| **Next.js 15** | Frontend framework | App Router, React Server Components |
| **Recharts** | Charting library | MIT-licensed, React-native, composable |
| **No drag-and-drop** | Dashboard layout via CSS Grid config | Scope control |
| **4 connector types max** | REST API, PostgreSQL, CSV, Webhook | Scope control |
| **No user management** | Single admin per tenant | MVP scope |
| **No billing** | No subscription or payment handling | Out of scope |

### 4.2 Security Constraints

| Constraint | Description |
|------------|-------------|
| **RLS required** | Every tenant-scoped table must have RLS policies |
| **No raw SQL** | Prisma `$queryRawUnsafe` is banned (ESLint rule) |
| **API key auth** | Embed endpoints authenticated via API key |
| **JWT auth** | Admin endpoints authenticated via JWT |
| **CORS restricted** | No wildcard origins on SSE endpoints |
| **CSP enforced** | frame-ancestors set per tenant allowedOrigins |
| **Input validation** | Every DTO uses class-validator decorators |
| **Encrypted configs** | Database connection strings encrypted at rest |

### 4.3 Quality Constraints

| Constraint | Description |
|------------|-------------|
| **Real CI pipeline** | No echo/no-op stages — real lint + test commands |
| **No `as any`** | TypeScript strict mode, no type escape hatches |
| **Integration tests** | Critical paths tested against real database |
| **E2E tests** | Full pipeline lifecycle tested with HTTP requests |
| **Single source of truth** | Enums and types defined once in packages/shared |

---

## 5. Assumptions

### 5.1 Technical Assumptions

1. PostgreSQL 16 is available with RLS capability enabled
2. Redis is available for BullMQ job queue and query caching
3. The system will be deployed as a monorepo with separate frontend and backend
4. NestJS 11 supports the module patterns used in this architecture
5. Recharts v3 provides the chart types required (Line, Bar, Pie, Area, Funnel)
6. BullMQ supports repeatable jobs for sync scheduling
7. SSE is sufficient for real-time updates (WebSockets not required)

### 5.2 Scope Assumptions

1. Each tenant has a single admin (no role-based access within tenants)
2. Data volumes are moderate (thousands of data points per tenant, not millions)
3. Sync schedules are at most every 15 minutes (no sub-minute polling)
4. Dashboards have at most 12 widgets (practical CSS Grid limit)
5. CSV uploads are limited to reasonable file sizes (< 10MB)
6. Webhook payloads are limited to 1MB per event

### 5.3 Demo Assumptions

1. Seed data provides realistic-looking analytics for 3+ tenants
2. At least one sample host site demonstrates embedding
3. The demo can run locally with Docker Compose (PostgreSQL + Redis)

---

## 6. Revenue Model (Hypothetical)

### 6.1 Pricing Tiers (If This Were a Real Product)

| Tier | Price | Features |
|------|-------|----------|
| **Starter** | Free | 1 dashboard, 2 connectors, 1000 data points/month |
| **Pro** | $49/month | 10 dashboards, unlimited connectors, 100K data points/month |
| **Enterprise** | Custom | Unlimited, SSO, dedicated support, SLA |

### 6.2 Value Metrics

- **Data points ingested** — primary usage metric
- **Dashboards created** — engagement metric
- **Embed views** — value delivery metric
- **Connector count** — expansion metric

### 6.3 Note

This is a portfolio project. The pricing model is hypothetical and included
to demonstrate product thinking, not because billing will be implemented.

---

## 7. Dependencies

### 7.1 External Dependencies

| Dependency | Type | Risk |
|------------|------|------|
| PostgreSQL 16 | Database | Low — mature, widely available |
| Redis 7+ | Cache/Queue | Low — mature, widely available |
| Recharts 3.x | Charting | Medium — v3 API changes from v2 |
| NestJS 11 | Backend framework | Low — stable release |
| Next.js 15 | Frontend framework | Low — stable release |
| Prisma 6 | ORM | Low — stable release |
| BullMQ 5.x | Job queue | Low — mature library |

### 7.2 Internal Dependencies

| Dependency | Description |
|------------|-------------|
| packages/shared | Enums, types, interfaces — imported by api and web |
| packages/config | Shared ESLint and TypeScript configs |
| Prisma schema | Single schema generates client for api |
| Migration SQL | RLS policies defined in migration files |

---

## 8. Acceptance Criteria Summary

### 8.1 Must Have (MVP)

- [ ] RLS policies on all tenant-scoped tables
- [ ] 4 connector types operational (REST API, PostgreSQL, CSV, Webhook)
- [ ] Schema mapping and transform engine
- [ ] Sync scheduling with BullMQ
- [ ] 7 widget types rendering with Recharts
- [ ] Dashboard builder (dropdown-based config)
- [ ] CSS Grid dashboard layout
- [ ] iframe embed with API key auth
- [ ] postMessage API for host ↔ embed communication
- [ ] White-label theming (colors, fonts, logo)
- [ ] SSE for real-time dashboard updates
- [ ] Dead letter queue for failed ingestion
- [ ] Sync history with status, row counts, errors
- [ ] Integration tests against real database
- [ ] E2E tests for critical paths
- [ ] Real CI pipeline (no placeholders)
- [ ] Security audit with verifiable claims

### 8.2 Should Have

- [ ] Query caching in Redis (TTL-based)
- [ ] Rate limiting on API endpoints
- [ ] Webhook signature verification
- [ ] Tenant admin panel with embed code snippet
- [ ] Seed script with realistic data for 3+ tenants

### 8.3 Could Have

- [ ] Backfill capability (re-run connector for historical range)
- [ ] Sample host sites demonstrating embedding
- [ ] Connection config encryption at rest

---

## 9. Glossary

| Term | Definition |
|------|------------|
| **Tenant** | An organization using the platform |
| **Connector** | A configured data source integration |
| **Sync Run** | A single pipeline execution |
| **DataPoint** | An ingested data record |
| **Widget** | A chart or visualization in a dashboard |
| **Embed** | A dashboard rendered in an iframe |
| **RLS** | PostgreSQL Row-Level Security |
| **SSE** | Server-Sent Events |
| **DLQ** | Dead Letter Queue |
| **Pipeline** | The full data flow: ingest → transform → store → aggregate |
| **Schema Mapping** | Source field → analytics dimension/metric mapping |
| **White-Label** | Tenant branding applied to embedded content |
