# Software Requirements Specification — Part 1: API Contracts
# Field Service Dispatch

**Version:** 1.0 | **Date:** 2026-03-20

---

## 1. API Endpoints

### 1.1 Authentication

```
POST   /api/auth/register              — Register user
POST   /api/auth/login                 — Login, returns JWT with companyId
GET    /api/auth/me                    — Get current user profile
```

### 1.2 Companies

```
POST   /api/companies                  — Create company
GET    /api/companies/:id              — Get company detail
PATCH  /api/companies/:id              — Update company settings
```

### 1.3 Technicians

```
POST   /api/technicians                        — Create technician
GET    /api/technicians                        — List technicians (company-scoped)
GET    /api/technicians/available              — List available technicians (static route BEFORE :id)
GET    /api/technicians/:id                    — Get technician detail
PATCH  /api/technicians/:id                    — Update technician
PATCH  /api/technicians/:id/status             — Update technician status
PATCH  /api/technicians/:id/location           — Update technician GPS position
```

### 1.4 Customers

```
POST   /api/customers                          — Create customer
GET    /api/customers                          — List customers (company-scoped)
GET    /api/customers/:id                      — Get customer detail
PATCH  /api/customers/:id                      — Update customer
```

### 1.5 Work Orders

```
POST   /api/work-orders                        — Create work order
GET    /api/work-orders                        — List work orders (company-scoped)
GET    /api/work-orders/stats                  — Work order statistics (static route BEFORE :id)
GET    /api/work-orders/tracking/:token        — Customer tracking (static route BEFORE :id)
GET    /api/work-orders/:id                    — Get work order detail
PATCH  /api/work-orders/:id                    — Update work order
POST   /api/work-orders/:id/assign             — Assign to technician
POST   /api/work-orders/:id/status             — Update status (state machine)
POST   /api/work-orders/:id/auto-assign        — Auto-assign nearest qualified technician
GET    /api/work-orders/:id/timeline           — Get status history timeline
```

### 1.6 Routes

```
POST   /api/routes/optimize                    — Optimize technician route for day
GET    /api/routes/technician/:techId/today     — Get today's route for technician
GET    /api/routes/:id                         — Get route detail
```

### 1.7 Job Photos

```
POST   /api/work-orders/:id/photos             — Upload job photo
GET    /api/work-orders/:id/photos             — List photos for work order
```

### 1.8 Invoices

```
POST   /api/work-orders/:id/invoice            — Generate invoice for completed work order
GET    /api/invoices                           — List invoices (company-scoped)
GET    /api/invoices/:id                       — Get invoice detail
PATCH  /api/invoices/:id/status                — Update invoice status
```

### 1.9 Analytics

```
GET    /api/analytics/dispatch                 — Jobs/day, avg completion time, utilization
```

### 1.10 WebSocket Events

```
// Client → Server
GPS_UPDATE    { lat, lng, technicianId }       — Technician sends position
JOIN_TRACKING { workOrderId }                  — Customer joins tracking room

// Server → Client
TECHNICIAN_POSITION { technicianId, lat, lng, timestamp }  — Broadcast position
ETA_UPDATE    { workOrderId, etaMinutes }      — ETA update for customer
STATUS_UPDATE { workOrderId, status }          — Work order status change
```

## 2. Request/Response Schemas

### Create Work Order
```json
// POST /api/work-orders
{
  "customerId": "uuid",
  "priority": "LOW | MEDIUM | HIGH | URGENT",
  "scheduledAt": "ISO8601",
  "description": "Fix leaking pipe in kitchen",
  "serviceType": "PLUMBING",
  "estimatedDuration": 60
}
// Response: 201
{
  "id": "uuid",
  "companyId": "uuid",
  "customerId": "uuid",
  "status": "UNASSIGNED",
  "priority": "HIGH",
  "scheduledAt": "ISO8601",
  "trackingToken": "string",
  "createdAt": "ISO8601"
}
```

### Work Order State Transitions
```
UNASSIGNED → ASSIGNED (on assignment)
ASSIGNED → EN_ROUTE (technician starts travel)
EN_ROUTE → ON_SITE (technician arrives)
ON_SITE → IN_PROGRESS (work begins)
IN_PROGRESS → COMPLETED (work finished)
COMPLETED → INVOICED (invoice generated)
INVOICED → PAID (payment received)

// Reverse/cancel transitions:
ASSIGNED → UNASSIGNED (unassign)
EN_ROUTE → ASSIGNED (abort travel)
```

## 3. Route Ordering Convention

**Critical:** In all controllers, define routes in this order:
1. Static routes (`/stats`, `/available`, `/tracking/:token`)
2. Parameterized routes (`/:id`)

This prevents NestJS route shadowing where `:id` matches `stats` or `tracking`.

## 4. Authentication & Authorization

| Role | Accessible Endpoints |
|------|---------------------|
| ADMIN | All company-scoped endpoints |
| DISPATCHER | Work orders, technicians, routes, analytics |
| TECHNICIAN | Own work orders, status updates, GPS, photos |
| CUSTOMER | Tracking portal (via token, no auth) |

## 5. Error Responses

All company-scoped lookups use `findFirstOrThrow` — cross-company access returns 404.
Invalid state transitions return 400 with descriptive error message.
