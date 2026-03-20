# Field Service Dispatch & Management Platform — Build Plan

## Verified Score: 8.90 (upgraded from 8.75 post-legal review)
| CD | DI | TS | VI | SY | BF |
|----|----|----|----|----|-----|
| 7  | 9  | 9  | 10 | 9  | 9.5 |

## Overview
A multi-tenant platform for managing field service operations. Job scheduling and dispatch, technician GPS tracking on a live map, route optimization, customer status portal, work order management, invoicing, and real-time status updates. Uses open-source mapping (NOT Google Maps).

## Legal Caveats
- **DO NOT use Google Maps API** — ToS explicitly prohibits dispatch/fleet management
- Use Leaflet + OpenStreetMap + OpenRouteService instead ($0 cost, no ToS issues)
- GPS tracking laws don't apply to synthetic data demos
- Use neutral terminology: "technician" / "field worker" (not "employee")
- Standard demo disclaimer sufficient
- Avoid features implying employment classification control

## Tech Stack
- **Backend:** NestJS 11 + Prisma 6 + PostgreSQL 16 (RLS) + PostGIS
- **Frontend:** Next.js 15 App Router + shadcn/ui + Tailwind CSS 4
- **Maps:** Leaflet + React Leaflet + OpenStreetMap tiles
- **Routing:** OpenRouteService Directions API (free tier: 2,000 req/day) or OSRM (self-hosted)
- **Route Optimization:** OpenRouteService Optimization API (Vroom engine, free tier: ~500 req/day, 50 waypoints/req)
- **Payments:** Stripe (invoicing for completed jobs)
- **Real-time:** WebSocket (Gateway) for live technician positions
- **Queue:** BullMQ + Redis (job assignment, route recalculation, reminders)
- **Testing:** Vitest
- **Deployment:** Vercel (frontend) + Railway (API + PostgreSQL + Redis)

## Architecture

### Dispatch Flow
```
Admin creates work orders → Assigns to technicians (manual or auto-optimize)
  → Technician receives mobile notification
  → Technician starts route → GPS position streams to server
  → Customer sees "technician is X minutes away" on portal
  → Technician arrives → Updates status → Completes work → Photos uploaded
  → Invoice generated → Customer pays
```

### Real-Time Tracking
```
Technician browser → navigator.geolocation.watchPosition()
  → WebSocket → Server → Broadcast to dispatch dashboard + customer portal
  → Leaflet map updates marker positions in real-time
```

### Data Model (Key Entities)
- `Company` (tenant — name, branding, serviceArea)
- `Technician` (companyId, name, skills[], phone, currentLat, currentLng, status)
- `Customer` (companyId, name, address, lat, lng, phone, email)
- `WorkOrder` (companyId, customerId, technicianId, priority, scheduledAt, status)
- `WorkOrderStatusHistory` (workOrderId, fromStatus, toStatus, timestamp, note)
- `Route` (technicianId, date, waypoints JSONB, optimizedOrder, estimatedDuration)
- `JobPhoto` (workOrderId, url, uploadedAt, caption)
- `Invoice` (workOrderId, amount, status, stripePaymentIntentId)

### Work Order Statuses
`UNASSIGNED` → `ASSIGNED` → `EN_ROUTE` → `ON_SITE` → `IN_PROGRESS` → `COMPLETED` → `INVOICED` → `PAID`

## SavSpot Module Reuse Map

| SavSpot Module | Reuse | Adaptation Needed |
|----------------|-------|-------------------|
| `bookings/` | Adapt | Rename to work orders, add location/priority |
| `booking-sessions/` | Adapt | Job assignment sessions |
| `availability/` | Adapt | Technician availability/schedule management |
| `services/` | Direct | Service type catalog (HVAC, plumbing, electrical) |
| `clients/` | Direct | Customer management |
| `team/` | Adapt | Technician management with skills/location |
| `invoices/` | Direct | Job invoicing with PDF generation |
| `payments/` | Direct | Stripe payment collection |
| `notifications/` | Direct | Job assignment, status change notifications |
| `sms/` | Direct | Customer SMS updates ("technician arriving in 15 min") |
| `communications/` | Direct | Email confirmations and receipts |
| `upload/` | Direct | Job completion photo uploads |
| `audit/` | Direct | Work order audit trail |
| `tenant-context/` | Direct | Company-scoped data isolation |

### New Code Required
- **Map integration** — Leaflet + React Leaflet with custom markers
- **Route optimization** — OpenRouteService Optimization API integration
- **Real-time GPS** — WebSocket gateway for position streaming
- **Dispatch board** — Kanban-style drag-and-drop (dnd-kit)
- **Customer tracking portal** — "Your technician is X min away" page
- **Technician mobile UI** — Responsive interface for status updates + photos
- **Route visualization** — Polylines on map with stop markers

## 2-Week Sprint Plan

### Week 1: Core Dispatch + Maps
| Day | Task | Hours |
|-----|------|-------|
| 1 | Project scaffold + Prisma schema + PostGIS setup | 6 |
| 1 | Seed data: 3 companies, 20 technicians, 100 work orders, geocoded addresses | 2 |
| 2 | Leaflet map integration with React Leaflet | 4 |
| 2 | Custom markers: technician (skill-colored), customer (priority-colored) | 4 |
| 3 | Work order CRUD API + status state machine | 6 |
| 3 | Dispatch board UI — Kanban columns by status, drag to assign | 2 |
| 4 | Route optimization — OpenRouteService Optimization API integration | 6 |
| 4 | Route visualization — polylines on map with numbered stop markers | 2 |
| 5 | Technician schedule management (daily view with assigned jobs) | 4 |
| 5 | Auto-assign algorithm (nearest available technician with matching skills) | 4 |

### Week 2: Real-Time, Portals, Polish
| Day | Task | Hours |
|-----|------|-------|
| 6 | WebSocket gateway for GPS position streaming | 4 |
| 6 | Live map — technician markers move in real-time | 4 |
| 7 | Technician mobile UI — job list, navigation, status buttons, photo upload | 8 |
| 8 | Customer tracking portal — live map, ETA, status timeline | 6 |
| 8 | SMS notifications — "technician dispatched", "arriving in 15 min" | 2 |
| 9 | Job completion flow — photos, notes, customer signature (canvas) | 4 |
| 9 | Invoice generation on job completion | 4 |
| 10 | Simulated GPS movement for demo (animate markers along cached routes) | 3 |
| 10 | Dispatch analytics — jobs/day, avg completion time, technician utilization | 4 |
| 11 | Demo banner, README, deploy to Vercel + Railway (PostGIS template) | 4 |
| 11 | Cross-origin WebSocket testing, CORS config, final polish | 4 |

## Demo Strategy
- **Hero screenshot:** Split-screen dispatch view — map with live technician markers + Kanban board
- **Live demo:** Simulated GPS — technician markers animate along optimized routes
- **Customer portal:** "Your technician is 12 minutes away" with live map
- **Route optimization:** Before/after visualization (unoptimized vs optimized route)
- **Mobile view:** Technician interface on phone viewport — tap "Arrived", take photo, complete job
- **Record a 60-second screen capture** for Upwork profile — maps + real-time is incredibly compelling on video

### Simulated GPS for Demo
```typescript
// Pre-computed route waypoints from OpenRouteService
// setInterval moves technician marker to next waypoint every 2 seconds
// Broadcasts via WebSocket to all connected clients
```

## Key Dependencies
```json
{
  "leaflet": "^1.9.x",
  "react-leaflet": "^5.x",
  "@dnd-kit/core": "^6.x",
  "@dnd-kit/sortable": "^10.x",
  "@nestjs/websockets": "^11.x",
  "@nestjs/platform-socket.io": "^11.x",
  "socket.io-client": "^4.x",
  "stripe": "^17.x",
  "@prisma/client": "^6.x",
  "date-fns": "^4.x"
}
```

## Risk Mitigation
| Risk | Mitigation |
|------|------------|
| Google Maps ToS violation | Use Leaflet + OSM + OpenRouteService (explicitly permitted) |
| OpenRouteService rate limits | Cache routes, batch optimize daily, OSRM self-host as fallback |
| OpenRouteService downtime | Cache at least one demo route as static JSON for fallback during live demo |
| WebSocket scaling | Demo handles < 50 connections; Railway supports WS natively |
| Cross-origin WebSocket | Vercel frontend → Railway API requires explicit CORS + Socket.io URL config |
| PostGIS setup | Use Railway's **PostGIS template** (not default PostgreSQL — `CREATE EXTENSION` fails on default) |
| Leaflet + Next.js SSR | Leaflet requires `window`/`document` — use `next/dynamic` with `ssr: false` for all map components |
| Mobile UX quality | Focus on large touch targets, simple flows — responsive web, not native |
| Route optimization accuracy | Vroom engine handles 20-job VRP in milliseconds — more than sufficient |
| Timeline buffer | Budget 11-12 working days (Day 10 was overloaded with 3 workstreams) |
