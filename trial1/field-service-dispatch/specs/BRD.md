# Business Requirements Document (BRD)

**Project:** Field Service Dispatch
**Version:** 1.0
**Date:** 2026-03-20
**Status:** Draft

---

## 1. Purpose

This document defines the business requirements for the Field Service Dispatch platform. Every requirement is testable and traceable to the personas and vision defined in §PVD. These requirements constrain the product design (§PRD) and technical architecture (§SRS-1 through §SRS-4).

## 2. Business Context

Field service companies need a unified platform that replaces phone-based dispatching, paper work orders, and manual invoicing. The platform must support multiple independent companies (tenants) on a single infrastructure, provide real-time visibility into field operations, and deliver a modern customer experience.

## 3. Business Rules

### 3.1 Multi-Tenant Isolation

**BR-100: Tenant Data Isolation**
All data belonging to a company (tenant) must be completely isolated from other tenants. No API endpoint, query, or UI view shall return data from a different tenant. Isolation is enforced at the database level via PostgreSQL Row Level Security (RLS).

- **Test:** Create two tenants with identical work order data. Authenticate as Tenant A and verify zero results from Tenant B are returned across all endpoints.

**BR-101: Tenant-Scoped Authentication**
Every authenticated user session must be bound to exactly one company. A user cannot access resources outside their company scope.

- **Test:** Authenticate as a user in Company A, attempt to access a Company B work order by ID. Verify HTTP 404 (not 403, to prevent enumeration).

**BR-102: Tenant Onboarding**
A new company account must be provisionable within 60 seconds. The onboarding flow creates the company record, admin user, and applies RLS policies.

- **Test:** Measure time from signup form submission to first successful authenticated API call. Must be < 60 seconds.

### 3.2 Work Order Management

**BR-200: Work Order Lifecycle**
Every work order must progress through a defined state machine: UNASSIGNED -> ASSIGNED -> EN_ROUTE -> ON_SITE -> IN_PROGRESS -> COMPLETED -> INVOICED -> PAID. No state may be skipped except by explicit business rule (see §SRS-3 for the full transition table).

- **Test:** Attempt to transition a work order from UNASSIGNED directly to ON_SITE. Verify the transition is rejected.

**BR-201: Work Order Assignment**
A work order may be assigned to exactly one technician at a time. Reassignment is permitted but must first unassign the current technician.

- **Test:** Assign a work order to Technician A, then assign to Technician B. Verify Technician A is unassigned and the work order history records both events.

**BR-202: Work Order History**
Every state transition must be recorded in an immutable audit log with timestamp, actor (user ID), previous state, new state, and optional notes.

- **Test:** Transition a work order through all states. Query the history table. Verify one record per transition with correct metadata.

**BR-203: Work Order Priority**
Work orders must support priority levels: LOW, NORMAL, HIGH, URGENT. Priority affects sort order on the dispatch board and auto-assignment scoring.

- **Test:** Create work orders at each priority level. Verify the dispatch board sorts URGENT first, then HIGH, then NORMAL, then LOW.

**BR-204: Service Area Constraint**
A company may define a service area as a geographic polygon. Work orders with addresses outside the service area must trigger a warning (not a hard block) during creation.

- **Test:** Define a service area polygon. Create a work order with an address outside it. Verify a warning is returned in the API response.

**BR-205: Scheduling Constraints**
Work orders must support a scheduled date/time window (start and end). A technician cannot be assigned to overlapping time windows unless explicitly overridden by a dispatcher.

- **Test:** Create two work orders with overlapping windows. Attempt to assign both to the same technician. Verify a conflict warning is returned.

### 3.3 Technician Management

**BR-300: Technician Capacity**
Each technician has a configurable maximum number of jobs per day (default: 8). The system must warn when assigning beyond capacity but allow dispatcher override.

- **Test:** Set a technician's daily capacity to 3. Assign 3 jobs, then attempt a 4th. Verify a capacity warning is returned.

**BR-301: Technician Skills**
Technicians have a set of skill tags (e.g., "HVAC", "Plumbing", "Electrical"). Auto-assignment must only match technicians whose skills include the work order's required service type.

- **Test:** Create a work order requiring "Plumbing". Run auto-assign with available technicians where only one has the "Plumbing" skill. Verify that technician is selected.

**BR-302: Technician Status**
Technicians must have a real-time status: AVAILABLE, ON_JOB, EN_ROUTE, OFF_DUTY, ON_BREAK. Status is derived from work order state transitions and explicit actions.

- **Test:** Assign a technician and transition work order to EN_ROUTE. Verify technician status is EN_ROUTE. Complete the job. Verify status returns to AVAILABLE.

**BR-303: Technician Location**
The system must track and store technician GPS positions in real time (configurable interval, default 10 seconds). Positions must be associated with the technician and timestamp.

- **Test:** Stream GPS positions for a technician at 10-second intervals. Query positions for the last 5 minutes. Verify count and ordering.

### 3.4 Dispatch Operations

**BR-400: Dispatch Board**
The dispatch board must display all work orders for the selected date organized by status columns (Kanban layout). Dispatchers must be able to drag work orders between columns and onto technicians.

- **Test:** Load the dispatch board with 50 work orders. Drag a work order from UNASSIGNED to ASSIGNED (onto a technician). Verify the work order state updates and the board reflects the change within 1 second.

**BR-401: Live Map**
The dispatch dashboard must include a live map showing all active technician positions, work order locations, and active routes. Positions must update in real time without page refresh.

- **Test:** Open the dispatch dashboard with 20 active technicians. Verify all markers appear on the map. Stream a position update for one technician. Verify the marker moves within 2 seconds.

**BR-402: Auto-Assignment**
The system must support automatic assignment of unassigned work orders to the nearest available technician with matching skills. The algorithm considers: distance, current workload, skills match, and priority.

- **Test:** Create 5 unassigned work orders and 3 available technicians with known positions and skills. Run auto-assign. Verify each work order is assigned to the optimal technician per the algorithm spec (§SRS-3).

**BR-403: Route Optimization**
The system must optimize the visit order for a technician's daily jobs to minimize total drive time. Optimization uses the OpenRouteService Optimization API (Vroom engine).

- **Test:** Create a technician with 5 jobs in known locations. Run route optimization. Verify the returned order has lower total drive time than the original order.

### 3.5 Customer Experience

**BR-500: Customer Tracking Portal**
When a technician is en route, the customer must receive a link to a tracking page that shows the technician's live position on a map and an estimated arrival time. No login required.

- **Test:** Transition a work order to EN_ROUTE. Access the tracking link. Verify the map shows the technician marker and an ETA. Stream a position update. Verify the map updates and ETA recalculates.

**BR-501: Customer Notifications**
Customers must receive notifications at key work order milestones:
- Technician dispatched (SMS + email)
- Technician arriving in ~15 minutes (SMS)
- Technician arriving in ~5 minutes (SMS)
- Job completed (email with invoice link)

- **Test:** Transition a work order through all states. Verify notification records are created at each milestone with correct channel and content.

**BR-502: Customer Self-Service**
Customers must be able to view their work order history, upcoming appointments, and invoices through a portal. Authentication is via a magic link sent to their email.

- **Test:** Send a magic link to a customer email. Click the link. Verify access to the customer portal with correct work order data.

### 3.6 Invoicing and Payment

**BR-600: Automated Invoice Generation**
When a work order transitions to COMPLETED, the system must automatically generate a draft invoice based on the work order's line items (labor, materials, flat-rate service fees).

- **Test:** Complete a work order with 2 labor hours and 1 material item. Verify a draft invoice is created with correct line items and total.

**BR-601: Stripe Integration**
Invoices must be sent to customers via Stripe Invoicing. Customers pay through Stripe's hosted payment page. Payment status syncs back via webhooks.

- **Test:** Generate an invoice, send via Stripe. Simulate a successful payment webhook. Verify the work order transitions to PAID and the invoice status updates.

**BR-602: Invoice Approval**
Draft invoices may be edited by dispatchers or admins before being sent. Once sent, invoices are immutable.

- **Test:** Create a draft invoice. Edit a line item. Send the invoice. Attempt to edit again. Verify the edit is rejected.

### 3.7 Analytics and Reporting

**BR-700: Operational Dashboard**
Company admins must have access to a dashboard showing:
- Jobs completed per day (7-day trend)
- Average job completion time
- Technician utilization rate (on-job time / available time)
- Revenue collected (daily/weekly/monthly)
- Open vs completed jobs ratio

- **Test:** Seed 30 days of work order data. Load the analytics dashboard. Verify all metrics render with correct values against seed data.

**BR-701: Data Export**
Analytics data must be exportable to CSV format.

- **Test:** Request a CSV export of jobs completed in the last 30 days. Verify the file downloads and contains correct row counts and columns.

## 4. External Dependencies

| Dependency | Purpose | Risk | Mitigation |
|-----------|---------|------|------------|
| **OpenRouteService Directions API** | Turn-by-turn route geometry for map display and ETA calculation | Free tier: 2,000 requests/day. Exceeding limit returns HTTP 429. | Cache route geometry aggressively (same origin/destination = cache hit). Implement OSRM self-hosted fallback for directions. Batch requests during off-peak. |
| **OpenRouteService Optimization API** | Route optimization (Vroom engine) for multi-stop ordering | Free tier: 2,000 requests/day. Optimization requests are heavier. | Run optimization once per technician per day (on schedule finalization). Cache results. Allow manual override if API is unavailable. |
| **OpenStreetMap Tile Servers** | Map tile rendering in Leaflet | Public tile servers have usage policies (max 2 req/s, no heavy use). | Use a CDN-backed tile server or self-host tiles for production. Respect usage policy. Implement tile caching. |
| **Stripe** | Invoice creation, payment processing, webhooks | API availability, webhook delivery delays | Implement webhook retry handling. Store invoice state locally. Reconcile daily. |
| **PostgreSQL + PostGIS** | Spatial queries, RLS, primary data store | PostGIS extension availability on Railway | Use Railway's PostGIS template. Test spatial queries in CI. Document manual PostGIS setup as fallback. |
| **Redis** | BullMQ job queue, Socket.io adapter, caching | Memory limits, connection limits | Configure maxmemory with eviction policy. Monitor queue depth. Implement circuit breaker for non-critical jobs. |
| **Browser Geolocation API** | Technician GPS position acquisition | User must grant permission. Accuracy varies. Drains battery. | Prompt with clear explanation. Fall back to last known position. Configurable update frequency. |

## 5. Compliance and Legal

**BR-800: GPS Data Privacy**
Technician GPS data must only be collected during working hours (as defined by the technician's schedule). GPS tracking must be transparently disclosed to technicians. Customers see technician position only when the technician is en route to their job.

- **Test:** Attempt to access GPS data for a technician outside their scheduled hours. Verify no positions are recorded or returned.

**BR-801: Data Retention**
GPS position data must be retained for a configurable period (default: 90 days) and then automatically purged. Work order data is retained indefinitely. Invoice data follows Stripe's retention policies.

- **Test:** Insert GPS positions older than 90 days. Run the purge job. Verify old positions are deleted and recent ones remain.

**BR-802: PII Handling**
Customer personal information (name, address, phone, email) must be encrypted at rest. API responses must not leak PII across tenant boundaries.

- **Test:** Query the database directly. Verify PII columns are encrypted. Authenticate as Tenant B and attempt to access Tenant A customer data. Verify 404.

## 6. Constraints

1. **No proprietary mapping APIs.** The platform must not use Google Maps, Apple Maps, or Mapbox APIs. These services have terms of service that prohibit dispatch, fleet management, and asset tracking use cases. The platform uses Leaflet + OpenStreetMap + OpenRouteService exclusively.

2. **Budget constraint.** Infrastructure costs must stay under $100/month for a deployment supporting up to 50 concurrent users and 20 active technicians.

3. **Browser support.** The web application must support the latest two versions of Chrome, Firefox, Safari, and Edge. The technician mobile UI must function on Android Chrome and iOS Safari.

4. **Progressive enhancement.** Core work order management must function without WebSocket connectivity (polling fallback). GPS tracking and live map require WebSocket support.

## 7. Performance Requirements

**BR-900: Dispatch Board Performance**
The dispatch board must load and render within 2 seconds with up to 100 work order cards. Drag-and-drop interactions must complete (visual + server confirmation) within 1 second.

- **Test:** Load the dispatch board with 100 seeded work orders. Measure time to interactive. Perform 10 drag-and-drop operations. All must complete within 1 second.

**BR-901: GPS Update Latency**
End-to-end GPS update latency (from technician browser to dispatch dashboard render) must be under 2 seconds at the 95th percentile.

- **Test:** Stream 100 GPS positions from a test client. Measure the delta between client emit timestamp and dashboard receive timestamp. 95th percentile must be < 2000ms.

**BR-902: Map Rendering**
The live map must render 50 animated technician markers at 30 FPS without frame drops on a mid-range laptop.

- **Test:** Place 50 markers on the map with simulated movement (10s update interval). Monitor FPS via Chrome DevTools. Average must be >= 30 FPS.

**BR-903: API Response Time**
REST API endpoints must respond within 200ms (p95) for list operations and 100ms (p95) for detail operations under normal load (50 concurrent users).

- **Test:** Run a load test with 50 concurrent users hitting list and detail endpoints. Measure p95 response times.

**BR-904: Search Performance**
Work order search must return results within 500ms for up to 1,000 records matching the filter criteria.

- **Test:** Seed 10,000 work orders. Execute search queries with various filter combinations. Verify results return within 500ms.

## 8. Glossary

| Term | Definition |
|------|-----------|
| Tenant | A company using the platform. Each tenant's data is isolated. |
| Dispatcher | A user who assigns and manages work orders from the office. |
| Technician | A field worker who travels to customer locations to perform services. |
| Work Order | A unit of work to be performed at a customer location. |
| Route | An ordered sequence of work orders for a technician on a given day. |
| ETA | Estimated Time of Arrival — the predicted time a technician will arrive at a customer's location. |
| RLS | Row Level Security — a PostgreSQL feature that restricts which rows a query can access based on the current session context. |
| PostGIS | A PostgreSQL extension that adds support for geographic objects and spatial queries. |
| Kanban | A visual workflow management method using columns to represent stages. |
| Vroom | An open-source vehicle routing optimization engine used by OpenRouteService. |
| Magic Link | A single-use, time-limited URL sent via email for passwordless authentication. |
| GPS Streaming | Continuous transmission of geographic coordinates from a technician's device to the server via WebSocket. |

## 9. Acceptance Criteria Summary

The platform is accepted when:
1. All BR-* requirements pass their specified tests
2. Multi-tenant isolation is verified by a dedicated security test suite
3. End-to-end flow works: create work order -> assign -> track GPS -> complete -> invoice -> pay
4. GPS update latency is under 2 seconds (§PVD success metrics)
5. Dispatch board handles 100+ work orders without performance degradation
6. Route optimization reduces total drive time by at least 10% vs original order in test scenarios

## 8. Cross-References

- Product vision and personas: §PVD
- Product requirements (functional): §PRD
- Architecture: §SRS-1
- Data model: §SRS-2
- Domain logic and state machine: §SRS-3
- Security and communications: §SRS-4
- UI wireframes: §WIREFRAMES
- Document index: §SPEC-INDEX

---

*End of Business Requirements Document*
