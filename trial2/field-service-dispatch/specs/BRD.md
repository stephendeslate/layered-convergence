# Business Requirements Document (BRD)

## Field Service Dispatch & Management Platform

**Version:** 1.0
**Date:** 2026-03-20
**Status:** Approved

---

## 1. Executive Summary

This document defines the business requirements for a multi-tenant field service dispatch and
management platform. The system enables service companies to manage work orders, dispatch
technicians with route optimization, track technicians in real-time via GPS, provide customers
with live ETA tracking, and process invoices — all within a tenant-isolated architecture.

---

## 2. Business Objectives

### 2.1 Primary Objectives
1. **Automate Dispatch Operations:** Replace manual phone/spreadsheet dispatch with a
   map-driven, real-time dispatch board
2. **Optimize Field Routes:** Reduce drive time by 20-30% through algorithmic route
   optimization using OpenRouteService
3. **Improve Customer Experience:** Provide real-time technician tracking and ETA to
   eliminate "where's my technician" calls
4. **Streamline Job-to-Invoice:** Automate the flow from job completion to invoice
   generation to payment collection
5. **Enable Multi-Tenancy:** Support multiple service companies on a single platform
   with strict data isolation

### 2.2 Key Performance Indicators (KPIs)
| KPI | Target | Measurement |
|-----|--------|-------------|
| Dispatch time per job | < 30 seconds | Time from work order creation to technician assignment |
| Route optimization savings | 20-30% fewer miles | Optimized vs. naive route ordering |
| Customer portal engagement | > 60% link opens | Tracking link clicks / tracking links sent |
| Invoice generation time | < 5 seconds | Time from job completion to invoice created |
| GPS update latency | < 500ms | Time from technician position change to dashboard update |
| Tenant data isolation | 100% | Zero cross-tenant data access in security audits |

---

## 3. Multi-Tenancy Requirements

### 3.1 Tenant Model

Each **Company** is a tenant. All data is scoped to a company. The platform supports multiple
companies on a shared database with PostgreSQL Row-Level Security (RLS) enforcing isolation.

### 3.2 Tenant Isolation Requirements

| Requirement ID | Requirement | Priority |
|----------------|-------------|----------|
| MT-001 | Every data table with `companyId` MUST have an RLS policy restricting access to the owning company | CRITICAL |
| MT-002 | RLS policies MUST be implemented as actual `CREATE POLICY` SQL, not application-level WHERE clauses | CRITICAL |
| MT-003 | The tenant context MUST be set from JWT claims via middleware before any database query | HIGH |
| MT-004 | WebSocket connections MUST authenticate with JWT and scope to the company | CRITICAL |
| MT-005 | GPS position broadcasts MUST be isolated to company-specific WebSocket rooms | CRITICAL |
| MT-006 | API responses MUST never include data from other tenants | CRITICAL |
| MT-007 | Search and filtering MUST operate within tenant boundaries | HIGH |
| MT-008 | Seed data MUST include at least 3 companies to verify isolation | HIGH |

### 3.3 Tenant Data Scope
The following entities are company-scoped:
- Technician
- Customer
- WorkOrder
- WorkOrderStatusHistory
- Route
- JobPhoto
- Invoice

---

## 4. Dispatch Workflow Requirements

### 4.1 Work Order Lifecycle

The work order follows a strict state machine:

```
UNASSIGNED → ASSIGNED → EN_ROUTE → ON_SITE → IN_PROGRESS → COMPLETED → INVOICED → PAID
```

| Requirement ID | Requirement | Priority |
|----------------|-------------|----------|
| DW-001 | State transitions MUST follow the defined state machine — no skipping states | CRITICAL |
| DW-002 | Every state transition MUST be logged in WorkOrderStatusHistory with timestamp, actor, and optional note | HIGH |
| DW-003 | The state machine definition MUST be the single source of truth in the shared package | HIGH |
| DW-004 | Only valid transitions are permitted — invalid transitions return 400 with clear error message | HIGH |
| DW-005 | Assignment (UNASSIGNED → ASSIGNED) MUST set the technicianId on the work order | HIGH |
| DW-006 | Completion (IN_PROGRESS → COMPLETED) SHOULD trigger invoice generation | MEDIUM |
| DW-007 | The dispatcher MUST be able to reassign a work order (back to UNASSIGNED) | MEDIUM |

### 4.2 Dispatch Board

| Requirement ID | Requirement | Priority |
|----------------|-------------|----------|
| DB-001 | Dispatch board MUST show a split view: Leaflet map (left) + Kanban columns (right) | HIGH |
| DB-002 | Kanban columns MUST represent work order statuses | HIGH |
| DB-003 | Dispatchers MUST be able to drag-and-drop work orders between status columns | HIGH |
| DB-004 | Map MUST show technician markers (color-coded by skill) and customer markers (color-coded by priority) | HIGH |
| DB-005 | Clicking a technician marker MUST show assigned jobs and current route | MEDIUM |
| DB-006 | Clicking a customer marker MUST show the work order details | MEDIUM |
| DB-007 | Map MUST update in real-time as technicians move | HIGH |

### 4.3 Assignment

| Requirement ID | Requirement | Priority |
|----------------|-------------|----------|
| AS-001 | Manual assignment: dispatcher selects technician from available list | HIGH |
| AS-002 | Auto-assign: system selects nearest available technician with matching skills | HIGH |
| AS-003 | Auto-assign MUST consider: proximity (PostGIS distance), skill match, availability status | HIGH |
| AS-004 | Auto-assign MUST NOT assign to technicians from a different company | CRITICAL |

---

## 5. Real-Time Requirements

### 5.1 GPS Tracking

| Requirement ID | Requirement | Priority |
|----------------|-------------|----------|
| RT-001 | Technician browser sends GPS position via WebSocket at configurable interval (default 5s) | HIGH |
| RT-002 | GPS positions are broadcast to the dispatch dashboard in real-time | HIGH |
| RT-003 | GPS positions are broadcast to the customer tracking portal for their assigned technician | HIGH |
| RT-004 | GPS data MUST be tenant-isolated — technicians from Company A MUST NOT appear on Company B's dashboard | CRITICAL |
| RT-005 | WebSocket gateway MUST authenticate connections with JWT tokens | CRITICAL |
| RT-006 | Technician position updates MUST include: technicianId, latitude, longitude, timestamp, heading, speed | HIGH |
| RT-007 | The system MUST support simulated GPS movement for demo purposes | MEDIUM |

### 5.2 Real-Time Notifications

| Requirement ID | Requirement | Priority |
|----------------|-------------|----------|
| RN-001 | Work order status changes MUST be broadcast via WebSocket to relevant subscribers | HIGH |
| RN-002 | New work order assignments MUST notify the assigned technician | HIGH |
| RN-003 | ETA updates MUST be pushed to the customer tracking portal | HIGH |

### 5.3 WebSocket Architecture

| Requirement ID | Requirement | Priority |
|----------------|-------------|----------|
| WS-001 | WebSocket rooms MUST be scoped by company: `company:{companyId}` | CRITICAL |
| WS-002 | Customer tracking rooms: `tracking:{workOrderId}` — accessible only to the owning company and the customer | HIGH |
| WS-003 | Authentication MUST occur during WebSocket handshake, not after connection | CRITICAL |
| WS-004 | Unauthenticated WebSocket connections MUST be rejected | CRITICAL |

---

## 6. Route Optimization Requirements

### 6.1 Optimization Engine

| Requirement ID | Requirement | Priority |
|----------------|-------------|----------|
| RO-001 | Route optimization MUST use OpenRouteService Optimization API (Vroom engine) | HIGH |
| RO-002 | Optimization input: technician start location, list of job locations, time windows | HIGH |
| RO-003 | Optimization output: ordered list of stops, estimated duration, estimated distance | HIGH |
| RO-004 | The system MUST handle OpenRouteService being unavailable with a cached or mock fallback | HIGH |
| RO-005 | Mock/fallback MUST throw an error in production to prevent silent degradation | HIGH |
| RO-006 | Route results MUST be cached in Redis with a configurable TTL | MEDIUM |
| RO-007 | Route polylines MUST be visualized on the map with numbered stop markers | HIGH |

### 6.2 ETA Calculation

| Requirement ID | Requirement | Priority |
|----------------|-------------|----------|
| ET-001 | ETA MUST be calculated using OpenRouteService directions between technician current position and next stop | HIGH |
| ET-002 | ETA MUST update as technician position changes | HIGH |
| ET-003 | ETA MUST be displayed on the customer tracking portal | HIGH |
| ET-004 | ETA format: "Your technician is X minutes away" | HIGH |

---

## 7. Invoicing Requirements

### 7.1 Invoice Generation

| Requirement ID | Requirement | Priority |
|----------------|-------------|----------|
| IN-001 | Invoice MUST be auto-generated when a work order transitions to COMPLETED | MEDIUM |
| IN-002 | Invoice MUST include: work order details, service description, labor hours, amount | HIGH |
| IN-003 | Invoice status: DRAFT → SENT → PAID | HIGH |
| IN-004 | Invoice amount can be manually adjusted before sending | MEDIUM |

### 7.2 Payment Collection

| Requirement ID | Requirement | Priority |
|----------------|-------------|----------|
| PA-001 | Payment MUST be processed via Stripe payment intents | HIGH |
| PA-002 | Successful payment MUST transition the work order to PAID status | HIGH |
| PA-003 | Payment confirmation MUST be sent to the customer | MEDIUM |

---

## 8. Compliance and Security Requirements

### 8.1 Data Security

| Requirement ID | Requirement | Priority |
|----------------|-------------|----------|
| SE-001 | All API endpoints MUST require JWT authentication (except customer tracking portal with token) | CRITICAL |
| SE-002 | Role-based access control: ADMIN, DISPATCHER, TECHNICIAN, CUSTOMER | HIGH |
| SE-003 | SQL injection prevention: NO raw SQL string interpolation — use Prisma tagged templates only | CRITICAL |
| SE-004 | Rate limiting MUST be applied to all public-facing endpoints | HIGH |
| SE-005 | GPS data MUST be tenant-isolated at every layer (database, WebSocket, API) | CRITICAL |

### 8.2 Data Privacy

| Requirement ID | Requirement | Priority |
|----------------|-------------|----------|
| DP-001 | Customer PII (name, address, phone, email) MUST be accessible only within the owning company | HIGH |
| DP-002 | GPS location data MUST NOT be shared across tenants | CRITICAL |
| DP-003 | Customer tracking portal MUST use a time-limited, work-order-specific token | MEDIUM |

### 8.3 Audit Trail

| Requirement ID | Requirement | Priority |
|----------------|-------------|----------|
| AU-001 | All work order state transitions MUST be logged with actor, timestamp, and previous/new state | HIGH |
| AU-002 | Audit logs MUST be immutable — no UPDATE or DELETE on history records | HIGH |

---

## 9. User Interface Requirements

### 9.1 Dispatch Dashboard
- Split view: interactive map (Leaflet) on the left, Kanban board on the right
- Map shows all technicians (colored by skill type) and customers (colored by priority)
- Kanban columns: one per work order status
- Drag-and-drop between columns to change status
- Click technician marker to see assigned jobs and route
- Real-time updates without page refresh

### 9.2 Technician Mobile Interface
- Responsive web interface optimized for mobile devices
- Job list showing today's assigned work orders
- Large touch-target buttons for status transitions: "Start Route" → "Arrived" → "Start Work" → "Complete"
- Navigation link to external maps app (Google Maps, Apple Maps, Waze)
- Photo upload capability for job documentation
- Minimal text input — pre-filled fields where possible

### 9.3 Customer Tracking Portal
- Accessible via unique link (SMS/email) — no login required
- Live map showing technician's current position moving toward customer
- ETA display: "Your technician is X minutes away"
- Status timeline: dispatched → en route → arriving → on site
- Company branding (logo, colors)

### 9.4 Admin Panel
- Company settings: name, service area, branding
- Technician management: add/edit/deactivate, assign skills
- Service catalog management
- Analytics dashboard: jobs/day, completion rate, avg completion time, technician utilization

---

## 10. Integration Requirements

### 10.1 External Services

| Service | Purpose | Integration Type |
|---------|---------|------------------|
| OpenRouteService | Route optimization + directions | REST API |
| OpenStreetMap | Map tiles | Tile server URL |
| Stripe | Payment processing | REST API + webhooks |
| SMS Provider | Customer notifications | REST API (mock for MVP) |

### 10.2 Integration Constraints
- OpenRouteService free tier: 2,000 directions requests/day, ~500 optimization requests/day
- All external service calls MUST have timeout and retry logic
- External service failures MUST NOT crash the application — graceful degradation required
- Mock/demo fallbacks MUST throw errors in production environment

---

## 11. Non-Functional Requirements

### 11.1 Performance
| Metric | Target |
|--------|--------|
| API response time (95th percentile) | < 200ms |
| Map tile loading | < 1s (CDN-cached OSM tiles) |
| WebSocket message delivery | < 500ms |
| Route optimization response | < 5s for 20 stops |
| Page load (initial) | < 3s |

### 11.2 Scalability
- MVP target: 3 companies, 50 technicians, 500 work orders
- Architecture should support horizontal scaling via Redis adapter for WebSocket

### 11.3 Availability
- Target: 99.5% uptime for production
- Graceful degradation when external services (OpenRouteService, Stripe) are unavailable

### 11.4 Browser Support
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile: Chrome Android, Safari iOS

---

## 12. Assumptions and Constraints

### 12.1 Assumptions
1. Technicians have smartphones with GPS capability and mobile data
2. Service areas are within regions covered by OpenRouteService
3. Customers have SMS-capable phones or email for tracking link delivery
4. Companies have Stripe accounts for payment processing

### 12.2 Constraints
1. **No Google Maps API** — Terms of Service prohibit dispatch/fleet management use
2. **OpenRouteService rate limits** — must cache routes and batch requests
3. **Responsive web only** — no native mobile apps in MVP
4. **Demo data** — synthetic GPS data for demonstrations, not real tracking
5. **Single currency** — USD for MVP invoicing

---

## 13. Acceptance Criteria Summary

The platform is considered business-ready when:

1. A dispatcher can create a work order, assign it to a technician (manually or auto), and
   track the technician's position on a live map
2. A technician can see their assigned jobs, update status with one tap, and upload completion
   photos
3. A customer can open a tracking link and see "Your technician is X minutes away" with a
   live map
4. Routes are optimized to reduce total drive distance by at least 20% vs. naive ordering
5. Invoices are auto-generated on job completion and payable via Stripe
6. Data from Company A is never visible to Company B (verified by integration tests)
7. WebSocket connections require authentication and GPS data is tenant-isolated
8. No SQL injection vulnerabilities exist (no raw string interpolation in queries)

---

## 14. Glossary

| Term | Definition |
|------|-----------|
| Tenant | A company using the platform; all data is isolated per tenant |
| Work Order | A service request from a customer requiring a technician visit |
| Dispatch | The act of assigning a work order to a technician |
| Route | An ordered sequence of stops (work orders) for a technician on a given day |
| ETA | Estimated Time of Arrival — minutes until technician reaches next stop |
| RLS | Row-Level Security — PostgreSQL feature enforcing data isolation at the database level |
| PostGIS | PostgreSQL extension for geographic/spatial data types and queries |
| VRP | Vehicle Routing Problem — the optimization problem of finding optimal routes for multiple vehicles |
