# Business Requirements Document (BRD) — Field Service Dispatch

**Version:** 1.0 | **Date:** 2026-03-20

---

## 1. Business Objectives

| ID | Objective | Success Criteria |
|----|-----------|-----------------|
| BO-1 | Demonstrate real-time geospatial systems | WebSocket GPS streaming + Leaflet map visualization |
| BO-2 | Demonstrate route optimization | OpenRouteService integration with before/after visualization |
| BO-3 | Demonstrate multi-tenant field service management | Company-scoped data isolation with RLS |
| BO-4 | Demonstrate full job lifecycle | 8-state work order flow from creation to payment |

## 2. Stakeholder Requirements

### 2.1 Dispatch Admin
- **BR-001:** Create and manage work orders with priority and scheduling
- **BR-002:** Assign work orders to technicians (manual or auto-assign)
- **BR-003:** View live technician positions on map
- **BR-004:** Optimize technician routes for the day
- **BR-005:** View dispatch board (Kanban by status)
- **BR-006:** View dispatch analytics (jobs/day, completion time, utilization)

### 2.2 Technician
- **BR-007:** View assigned job list for the day
- **BR-008:** Update work order status (en route, on site, in progress, completed)
- **BR-009:** Upload job completion photos
- **BR-010:** Stream GPS position to dispatch

### 2.3 Customer
- **BR-011:** View live technician location on map
- **BR-012:** View ETA ("technician is X minutes away")
- **BR-013:** View job status timeline

### 2.4 Company Admin
- **BR-014:** Manage technicians (add, edit, skills, availability)
- **BR-015:** View job completion analytics
- **BR-016:** View and manage invoices

## 3. Business Rules

| ID | Rule |
|----|------|
| BRU-1 | Each company's data is isolated — technicians, customers, and work orders are company-scoped |
| BRU-2 | Work orders follow the defined state machine (8 states) |
| BRU-3 | Only valid state transitions are permitted |
| BRU-4 | Auto-assign selects nearest available technician with matching skills |
| BRU-5 | Route optimization uses OpenRouteService Vroom engine |
| BRU-6 | Customer portal requires a tracking token (no authentication) |
| BRU-7 | GPS positions are broadcast via WebSocket to authorized viewers only |
| BRU-8 | Invoice is generated automatically on work order completion |
| BRU-9 | NO Google Maps API — Leaflet + OSM only |

## 4. Data Requirements

### 4.1 Core Entities
- Company, Technician, Customer, WorkOrder, WorkOrderStatusHistory
- Route, JobPhoto, Invoice

### 4.2 Work Order States
- UNASSIGNED → ASSIGNED → EN_ROUTE → ON_SITE → IN_PROGRESS → COMPLETED → INVOICED → PAID

## 5. Integration Requirements

| System | Integration Type | Purpose |
|--------|-----------------|---------|
| OpenRouteService | REST API | Route optimization + directions |
| OpenStreetMap | Tile server | Map rendering |
| Leaflet | Client library | Map interaction |
| Socket.io | WebSocket | Real-time GPS streaming |
| Redis | Cache + Queue | BullMQ for job assignment and route recalculation |
| PostGIS | Database extension | Geospatial queries |

## 6. Compliance & Security

- **[VERIFY:RLS]** — All data tables have RLS policies scoped by companyId
- **[VERIFY:NO_GOOGLE_MAPS]** — Zero references to Google Maps API
- **[VERIFY:STATE_MACHINE]** — Only valid work order transitions execute
- **[VERIFY:TENANT_ISOLATION]** — Cross-company data access returns 404
- **[VERIFY:ROUTE_ORDERING]** — Static routes before parameterized routes in all controllers
