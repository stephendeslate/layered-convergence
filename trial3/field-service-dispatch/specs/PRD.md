# Product Requirements Document (PRD) — Field Service Dispatch

**Version:** 1.0 | **Date:** 2026-03-20

---

## 1. Feature Requirements

### F1: Work Order Management
- **F1.1:** CRUD operations for work orders (create, read, update, delete)
- **F1.2:** Priority levels (LOW, MEDIUM, HIGH, URGENT)
- **F1.3:** Scheduling (date, time window)
- **F1.4:** Assignment to technicians (manual or auto-assign)
- **F1.5:** Status state machine (8 states with valid transitions)
- **F1.6:** Status history logging

### F2: Technician Management
- **F2.1:** CRUD operations for technicians
- **F2.2:** Skills tracking (HVAC, plumbing, electrical, etc.)
- **F2.3:** Availability/schedule management
- **F2.4:** Current location tracking (lat/lng)
- **F2.5:** Status (AVAILABLE, BUSY, OFF_DUTY)

### F3: Map & GPS Integration
- **F3.1:** Leaflet + React Leaflet map with OpenStreetMap tiles
- **F3.2:** Custom markers — technician (skill-colored), customer (priority-colored)
- **F3.3:** WebSocket GPS position streaming
- **F3.4:** Live marker position updates on map
- **F3.5:** Route visualization — polylines with numbered stop markers
- **F3.6:** Simulated GPS movement for demo

### F4: Route Optimization
- **F4.1:** OpenRouteService Optimization API integration
- **F4.2:** Multi-stop route optimization for daily schedules
- **F4.3:** Before/after optimization visualization
- **F4.4:** Cached routes for demo reliability

### F5: Dispatch Board
- **F5.1:** Kanban-style columns by work order status
- **F5.2:** Drag-and-drop work order assignment (dnd-kit)
- **F5.3:** Filter by technician, priority, date

### F6: Customer Portal
- **F6.1:** Tracking page with live technician map
- **F6.2:** ETA display ("technician is X minutes away")
- **F6.3:** Job status timeline
- **F6.4:** Access via tracking token (no auth required)

### F7: Technician Mobile UI
- **F7.1:** Job list for the day
- **F7.2:** Status update buttons (en route, arrived, in progress, completed)
- **F7.3:** Photo upload for job completion
- **F7.4:** GPS streaming toggle

### F8: Invoicing
- **F8.1:** Auto-generate invoice on work order completion
- **F8.2:** Invoice with line items, total, company branding
- **F8.3:** Invoice status tracking (DRAFT, SENT, PAID)

### F9: Analytics
- **F9.1:** Jobs per day chart
- **F9.2:** Average completion time
- **F9.3:** Technician utilization rate

## 2. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-1 | GPS update latency | < 3 seconds via WebSocket |
| NFR-2 | Map tile loading | < 2 seconds for initial render |
| NFR-3 | Route optimization | < 5 seconds for 20 waypoints |
| NFR-4 | Data isolation | RLS + application-level WHERE companyId |
| NFR-5 | Concurrent WebSocket connections | Support 50+ for demo |

## 3. Acceptance Criteria

- All 8 work order states with valid transitions tested
- Invalid transitions throw appropriate errors
- WebSocket GPS streaming works with live map updates
- Route optimization produces optimized waypoint order
- Dispatch board drag-and-drop assigns work orders
- Customer portal shows live technician position
- Cross-company data access returns 404
- `findFirstOrThrow` used for all company-scoped lookups
- Static routes defined before parameterized routes
- E2E tests use real PostgreSQL
- `fileParallelism: false` in E2E vitest config
- State machine defined once in packages/shared
- NO Google Maps references in codebase
