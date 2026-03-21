# Product Vision Document (PVD) — Field Service Dispatch & Management Platform

**Version:** 1.0
**Date:** 2026-03-20
**Project:** Field Service Dispatch (Trial 3)

---

## 1. Vision Statement

Build a multi-tenant field service management platform with job scheduling, dispatch optimization, real-time GPS tracking, customer status portal, and invoicing. Demonstrates enterprise-grade real-time systems, geospatial data handling, and multi-tenant isolation using open-source mapping.

## 2. Problem Statement

Field service companies need to dispatch technicians efficiently, track their location in real-time, keep customers informed, and manage the full job lifecycle from scheduling to invoicing. Commercial solutions are expensive and monolithic. This platform demonstrates the full stack — real-time WebSocket communication, route optimization, geospatial queries, and multi-tenant isolation.

## 3. Target Users

| User Type | Description | Key Needs |
|-----------|-------------|-----------|
| **Dispatch Admin** | Company dispatcher managing technicians and work orders | Create/assign work orders, view live map, optimize routes, manage schedules |
| **Technician** | Field worker completing jobs | View job list, navigate to jobs, update status, upload photos, complete work orders |
| **Customer** | Service recipient tracking technician arrival | View live technician location, ETA, job status timeline |
| **Company Admin** | Business owner managing the service company | Analytics, technician utilization, invoicing, company settings |

## 4. Core Value Propositions

1. **Live GPS Tracking** — WebSocket-powered real-time technician position streaming on Leaflet maps
2. **Route Optimization** — OpenRouteService Optimization API (Vroom engine) for multi-stop routing
3. **Dispatch Board** — Kanban-style drag-and-drop work order management
4. **Customer Portal** — "Your technician is X minutes away" with live map and ETA
5. **Full Job Lifecycle** — UNASSIGNED → ASSIGNED → EN_ROUTE → ON_SITE → IN_PROGRESS → COMPLETED → INVOICED → PAID
6. **Multi-Tenant Isolation** — Company-scoped data with RLS policies

## 5. Success Metrics

| Metric | Target |
|--------|--------|
| Work order state transitions | All 8 states with valid transitions tested |
| Real-time GPS streaming | WebSocket position updates < 3 second latency |
| Route optimization | OpenRouteService integration with route visualization |
| Tenant isolation | Cross-company access returns 404 |
| E2E tests with real DB | No mocked Prisma in E2E tests |
| Static routes before parameterized | Route ordering convention enforced |

## 6. Scope Boundaries

### In Scope
- Work order CRUD with status state machine
- Technician management with skills and availability
- Leaflet + React Leaflet map integration
- OpenRouteService route optimization
- WebSocket gateway for GPS position streaming
- Dispatch board (Kanban-style)
- Customer tracking portal with live ETA
- Technician mobile UI (responsive web)
- Job completion flow (photos, notes)
- Invoice generation on completion
- Simulated GPS movement for demo
- Dispatch analytics
- Multi-tenant RLS isolation with PostGIS

### Out of Scope
- Google Maps API (ToS violation for dispatch)
- Native mobile apps
- Customer signature capture
- SMS integration (simulated only)
- Payment processing (invoice generation only)
- OSRM self-hosting

## 7. Technical Constraints

- **Maps:** Leaflet + OpenStreetMap — NO Google Maps (ToS violation)
- **Routing:** OpenRouteService free tier (2,000 req/day)
- **Optimization:** OpenRouteService Optimization API (500 req/day, 50 waypoints)
- **Database:** PostgreSQL 16 + PostGIS for geospatial queries
- **ORM:** Prisma 6 — `findFirstOrThrow` as default
- **Real-time:** WebSocket (Socket.io) for bidirectional GPS streaming
- **SSR:** Leaflet requires `next/dynamic` with `ssr: false`

## 8. Key Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Google Maps ToS violation | CRITICAL | Use Leaflet + OSM + OpenRouteService |
| OpenRouteService rate limits | MEDIUM | Cache routes, batch optimize daily |
| WebSocket scaling | LOW | Demo handles < 50 connections |
| PostGIS setup | MEDIUM | Railway PostGIS template |
| Leaflet + Next.js SSR | MEDIUM | Dynamic imports with ssr: false |
| Route shadowing in NestJS | MEDIUM | Static routes before parameterized |
