# Software Requirements Specification — Domain Logic (SRS-3)

**Project:** Field Service Dispatch
**Version:** 1.0
**Date:** 2026-03-20
**Status:** Draft

---

## 1. Purpose

This document specifies the domain logic for the Field Service Dispatch platform: the work order state machine, auto-assignment algorithm, route optimization integration, GPS streaming protocol, ETA calculation, dispatch board logic, background job processing, simulated GPS, and API contracts. It implements the business rules from §BRD and functional requirements from §PRD.

## 2. Notation

- **Guard**: A precondition that must be true for a transition to execute
- **Effect**: A side effect triggered by a transition
- **Actor**: The user role permitted to trigger the transition

## 3. Work Order State Machine

### 3.1 States

| State | Description |
|-------|-------------|
| UNASSIGNED | Work order created, no technician assigned |
| ASSIGNED | Technician assigned, not yet dispatched |
| EN_ROUTE | Technician is driving to the job site |
| ON_SITE | Technician has arrived at the location |
| IN_PROGRESS | Technician is actively working on the job |
| COMPLETED | Job is finished, awaiting invoicing |
| INVOICED | Invoice has been sent to the customer |
| PAID | Customer has paid the invoice |
| CANCELLED | Work order has been cancelled |

### 3.2 Transition Table

| # | From | To | Actor | Guard | Effects |
|---|------|-----|-------|-------|---------|
| T1 | UNASSIGNED | ASSIGNED | Dispatcher | technicianId provided; technician belongs to same company; technician status is AVAILABLE or ON_BREAK; no overlapping scheduled work orders for the technician unless overridden | Record status history; Set technician on work order; Increment technician's daily job count; Send NEW_ASSIGNMENT push notification to technician; Create audit log entry |
| T2 | ASSIGNED | EN_ROUTE | Technician | Actor is the assigned technician; Technician has a current GPS position | Record status history; Update technician status to EN_ROUTE; Generate tracking token (UUID) and set trackingExpiresAt to +24h; Send TECHNICIAN_EN_ROUTE SMS + email to customer with tracking link; Begin GPS broadcasting to customer tracking portal; Start ETA calculation job; Create audit log entry |
| T3 | EN_ROUTE | ON_SITE | Technician | Actor is the assigned technician; Distance from technician's current position to work order location is < 500m (configurable); OR manual override allowed | Record status history with GPS coordinates; Update technician status to ON_JOB; Send TECHNICIAN_ARRIVED notification to customer; Update ETA to 0; Record actualStart timestamp if not yet set; Create audit log entry |
| T4 | ON_SITE | IN_PROGRESS | Technician | Actor is the assigned technician | Record status history; Record actualStart timestamp (if ON_SITE didn't set it); Create audit log entry |
| T5 | IN_PROGRESS | COMPLETED | Technician | Actor is the assigned technician; At least one line item exists on the work order (configurable: can be disabled) | Record status history with GPS coordinates; Record actualEnd timestamp; Update technician status to AVAILABLE; Stop GPS broadcasting to customer; Enqueue invoice generation job; Send JOB_COMPLETED notification to customer; Enqueue route recalculation for remaining jobs; Create audit log entry |
| T6 | COMPLETED | INVOICED | System | Invoice has been created and sent via Stripe | Record status history; Update work order status; Send INVOICE_SENT email to customer; Create audit log entry |
| T7 | INVOICED | PAID | System (webhook) | Stripe webhook confirms payment | Record status history; Record paidAt on invoice; Send PAYMENT_RECEIVED email to customer; Create audit log entry |
| T8 | ASSIGNED | UNASSIGNED | Dispatcher | Work order is in ASSIGNED state | Record status history; Clear technicianId on work order; Update technician status to AVAILABLE (if no other active jobs); Send JOB_CANCELLED push to technician; Create audit log entry |
| T9 | UNASSIGNED | CANCELLED | Dispatcher, Admin | None | Record status history; Send JOB_CANCELLED email to customer; Create audit log entry |
| T10 | ASSIGNED | CANCELLED | Dispatcher, Admin | None | Record status history; Clear technicianId; Update technician status to AVAILABLE (if no other active jobs); Send JOB_CANCELLED notification to technician + customer; Remove from route if present; Create audit log entry |
| T11 | EN_ROUTE | CANCELLED | Dispatcher, Admin | Confirmation dialog required (technician is already driving) | Record status history; Clear technicianId; Update technician status to AVAILABLE; Expire tracking token; Send JOB_CANCELLED notification to technician + customer; Remove from route; Recalculate remaining route; Create audit log entry |
| T12 | ON_SITE | CANCELLED | Admin only | Confirmation dialog required; Reason required | Record status history; Clear technicianId; Update technician status to AVAILABLE; Send JOB_CANCELLED notification to technician + customer; Create audit log entry |
| T13 | IN_PROGRESS | CANCELLED | Admin only | Confirmation dialog required; Reason required | Record status history; Record actualEnd; Clear technicianId; Update technician status to AVAILABLE; Send JOB_CANCELLED notification to technician + customer; Create audit log entry |
| T14 | EN_ROUTE | ASSIGNED | Dispatcher | Technician has not yet arrived (reassign scenario) | Record status history; Expire tracking token; Stop GPS broadcasting to customer; Update technician status to AVAILABLE; Send notification to customer that ETA is being updated; Create audit log entry |
| T15 | COMPLETED | COMPLETED | Dispatcher | Allow adding notes/photos after completion | Update fields only (no state change recorded); Create audit log entry for field edit |
| T16 | INVOICED | VOID | Admin | Invoice is in SENT status in Stripe | Record status history; Void invoice in Stripe; Update invoice status to VOID; Return work order to COMPLETED state; Create audit log entry |
| T17 | PAID | — | — | Terminal state — no outbound transitions | — |

### 3.3 State Diagram

```
                        ┌──────────────────────────────────────────┐
                        │                CANCELLED                  │
                        └──────────────────────────────────────────┘
                          ▲        ▲         ▲         ▲
                     T9   │   T10  │    T11  │    T12  │ T13
                          │        │         │         │
┌──────────┐  T1  ┌──────┴───┐ T2 ┌────┴────┐ T3 ┌───┴─────┐ T4
│UNASSIGNED├─────►│ ASSIGNED ├───►│EN_ROUTE ├───►│ ON_SITE ├───►
└──────────┘      └─────┬────┘    └────┬────┘    └─────────┘
     ▲              T8  │          T14 │                    ┌──────────────┐
     │                  │              │                T4  │              │
     └──────────────────┘              └─────►ASSIGNED      │ IN_PROGRESS  │
                                                            └──────┬───────┘
                                                              T5   │
                                                                   ▼
                                                            ┌──────────────┐
                                                            │  COMPLETED   │
                                                            └──────┬───────┘
                                                              T6   │    ▲
                                                                   ▼    │ T16
                                                            ┌──────────────┐
                                                            │  INVOICED    │
                                                            └──────┬───────┘
                                                              T7   │
                                                                   ▼
                                                            ┌──────────────┐
                                                            │     PAID     │
                                                            └──────────────┘
```

### 3.4 State Machine Implementation

```typescript
// packages/shared/src/constants/work-order-transitions.ts

export interface Transition {
  from: WorkOrderStatus;
  to: WorkOrderStatus;
  actors: UserRole[];
  guards: string[]; // Guard function names
}

export const WORK_ORDER_TRANSITIONS: Transition[] = [
  {
    from: 'UNASSIGNED', to: 'ASSIGNED',
    actors: ['DISPATCHER', 'ADMIN'],
    guards: ['hasTechnician', 'technicianAvailable', 'noOverlap']
  },
  {
    from: 'ASSIGNED', to: 'EN_ROUTE',
    actors: ['TECHNICIAN'],
    guards: ['isAssignedTechnician', 'hasGpsPosition']
  },
  {
    from: 'EN_ROUTE', to: 'ON_SITE',
    actors: ['TECHNICIAN'],
    guards: ['isAssignedTechnician', 'withinArrivalRadius']
  },
  {
    from: 'ON_SITE', to: 'IN_PROGRESS',
    actors: ['TECHNICIAN'],
    guards: ['isAssignedTechnician']
  },
  {
    from: 'IN_PROGRESS', to: 'COMPLETED',
    actors: ['TECHNICIAN'],
    guards: ['isAssignedTechnician', 'hasLineItems']
  },
  {
    from: 'COMPLETED', to: 'INVOICED',
    actors: ['SYSTEM'],
    guards: ['invoiceCreatedAndSent']
  },
  {
    from: 'INVOICED', to: 'PAID',
    actors: ['SYSTEM'],
    guards: ['stripePaymentConfirmed']
  },
  {
    from: 'ASSIGNED', to: 'UNASSIGNED',
    actors: ['DISPATCHER', 'ADMIN'],
    guards: []
  },
  {
    from: 'EN_ROUTE', to: 'ASSIGNED',
    actors: ['DISPATCHER', 'ADMIN'],
    guards: []
  },
  // Cancellation transitions
  {
    from: 'UNASSIGNED', to: 'CANCELLED',
    actors: ['DISPATCHER', 'ADMIN'],
    guards: []
  },
  {
    from: 'ASSIGNED', to: 'CANCELLED',
    actors: ['DISPATCHER', 'ADMIN'],
    guards: []
  },
  {
    from: 'EN_ROUTE', to: 'CANCELLED',
    actors: ['DISPATCHER', 'ADMIN'],
    guards: ['confirmationRequired']
  },
  {
    from: 'ON_SITE', to: 'CANCELLED',
    actors: ['ADMIN'],
    guards: ['confirmationRequired', 'reasonRequired']
  },
  {
    from: 'IN_PROGRESS', to: 'CANCELLED',
    actors: ['ADMIN'],
    guards: ['confirmationRequired', 'reasonRequired']
  },
  // Void (back to completed)
  {
    from: 'INVOICED', to: 'COMPLETED',
    actors: ['ADMIN'],
    guards: ['invoiceVoidable']
  },
];
```

### 3.5 Guard Implementations

| Guard | Logic |
|-------|-------|
| `hasTechnician` | `body.technicianId` is provided and exists in the same company |
| `technicianAvailable` | Technician status is AVAILABLE or ON_BREAK |
| `noOverlap` | No other non-cancelled work orders assigned to this technician have overlapping `scheduledStart`/`scheduledEnd` windows (returns warning, not hard block, if `body.overrideOverlap` is true) |
| `isAssignedTechnician` | The acting user's technician profile matches the work order's `technicianId` |
| `hasGpsPosition` | The technician has a GPS position recorded within the last 5 minutes |
| `withinArrivalRadius` | Distance between technician's current position and work order lat/lng is < 500 meters. If `body.overrideRadius` is true, skip this check |
| `hasLineItems` | The work order has at least one line item. Configurable per company via `settings.requireLineItemsForCompletion` |
| `invoiceCreatedAndSent` | An invoice exists for this work order with `stripeInvoiceId` populated and status SENT |
| `stripePaymentConfirmed` | Invoice's `paidAt` is set (populated by Stripe webhook handler) |
| `confirmationRequired` | Request body contains `confirmed: true` (frontend shows confirmation dialog) |
| `reasonRequired` | Request body contains `cancellationReason` with length > 10 characters |
| `invoiceVoidable` | Invoice status is SENT (not PAID). Stripe invoice can be voided |

## 4. Auto-Assignment Algorithm

### 4.1 Overview

Auto-assignment matches unassigned work orders to the best available technician based on a weighted scoring algorithm. It is triggered manually by a dispatcher (§PRD FR-402) or can be scheduled as a BullMQ job.

### 4.2 Algorithm

```
Input:
  - workOrders: WorkOrder[] (status = UNASSIGNED, sorted by priority DESC then scheduledStart ASC)
  - technicians: Technician[] (status = AVAILABLE, has GPS position)
  - date: Date

For each workOrder in workOrders:
  1. Filter technicians to those whose skills include workOrder.serviceType
  2. Filter technicians to those with daily job count < maxJobsPerDay
  3. Filter technicians to those with no overlapping scheduled windows
     (unless no technicians remain, then include with overlap flag)
  4. For each remaining technician, calculate score:

     score = (w_distance * distanceScore)
           + (w_workload * workloadScore)
           + (w_priority * priorityScore)
           + (w_skill    * skillMatchScore)

     Where:
       distanceScore = 1 - (distance_km / max_distance_km)
         - distance_km: ST_Distance from technician's current position to work order
         - max_distance_km: company's max service radius (default 50km)
         - Score: 0 (farthest) to 1 (closest)

       workloadScore = 1 - (activeJobCount / maxJobsPerDay)
         - Score: 0 (at capacity) to 1 (empty schedule)

       priorityScore = { URGENT: 1.0, HIGH: 0.75, NORMAL: 0.5, LOW: 0.25 }
         - Higher priority work orders get assigned first (input sort)
         - This score acts as a tiebreaker within the technician scoring

       skillMatchScore = matchingSkillCount / totalRequiredSkillCount
         - For single-skill work orders: 1.0 if matched (guaranteed by filter)
         - For future multi-skill requirements: partial matches scored proportionally

     Default weights:
       w_distance = 0.45
       w_workload = 0.30
       w_priority = 0.10
       w_skill    = 0.15

  5. Select technician with highest score
  6. If score < minimum threshold (0.2): skip this work order, flag for manual review
  7. Execute T1 transition (UNASSIGNED -> ASSIGNED)
  8. Update technician's active job count for subsequent iterations

Output:
  - assignments: { workOrderId, technicianId, score, warnings[] }[]
  - unassigned: { workOrderId, reason }[]
```

### 4.3 API Contract

```
POST /api/work-orders/auto-assign

Request Body:
{
  "date": "2026-03-20",             // Required: date to auto-assign for
  "workOrderIds": ["wo1", "wo2"],   // Optional: specific work orders (default: all unassigned for date)
  "technicianIds": ["t1", "t2"],    // Optional: restrict to specific technicians (default: all available)
  "dryRun": false                   // Optional: if true, return assignments without executing
}

Response (200):
{
  "assignments": [
    {
      "workOrderId": "wo1",
      "technicianId": "t1",
      "technicianName": "Tyler Smith",
      "score": 0.82,
      "distanceKm": 3.2,
      "warnings": []
    },
    {
      "workOrderId": "wo2",
      "technicianId": "t2",
      "technicianName": "Jake Miller",
      "score": 0.65,
      "distanceKm": 8.7,
      "warnings": ["OVERLAP: Overlaps with WO-00035 by 30 minutes"]
    }
  ],
  "unassigned": [
    {
      "workOrderId": "wo3",
      "reason": "No technicians with matching skill: PEST_CONTROL"
    }
  ],
  "summary": {
    "totalProcessed": 3,
    "assigned": 2,
    "unassigned": 1
  }
}
```

## 5. Route Optimization Integration

### 5.1 OpenRouteService Optimization API

The route optimization feature uses the OpenRouteService Optimization API, which implements the Vroom engine for vehicle routing problems (VRP).

### 5.2 API Integration

```
POST https://api.openrouteservice.org/optimization

Request:
{
  "jobs": [
    {
      "id": 1,
      "location": [-73.985, 40.748],  // [lng, lat]
      "service": 3600,                 // Service duration in seconds (from estimatedMinutes)
      "time_windows": [[1710936000, 1710950400]]  // Unix timestamps for scheduled window
    },
    {
      "id": 2,
      "location": [-73.978, 40.763],
      "service": 5400,
      "time_windows": [[1710943200, 1710957600]]
    }
  ],
  "vehicles": [
    {
      "id": 1,
      "profile": "driving-car",
      "start": [-73.990, 40.735],      // Technician's current/home location
      "end": [-73.990, 40.735],        // Return to start
      "time_window": [1710928800, 1710972000],  // Working hours
      "capacity": [8]                   // Max jobs
    }
  ],
  "options": {
    "g": true                           // Return route geometry
  }
}

Response:
{
  "summary": {
    "cost": 12345,
    "routes": 1,
    "unassigned": 0,
    "delivery": [5],
    "distance": 28500,       // Total distance in meters
    "duration": 14200        // Total duration in seconds
  },
  "routes": [
    {
      "vehicle": 1,
      "steps": [
        { "type": "start", "location": [-73.990, 40.735], "arrival": 1710928800 },
        { "type": "job", "id": 2, "location": [-73.978, 40.763], "arrival": 1710930600, "service": 5400 },
        { "type": "job", "id": 1, "location": [-73.985, 40.748], "arrival": 1710937200, "service": 3600 },
        { "type": "end", "location": [-73.990, 40.735], "arrival": 1710942000 }
      ],
      "geometry": "encoded_polyline_string"
    }
  ],
  "unassigned": []
}
```

### 5.3 Optimization Flow

```
1. Dispatcher clicks "Optimize Route" for a technician on a given date
2. Frontend calls POST /api/routes/optimize
3. Backend:
   a. Fetch technician's assigned work orders for the date
   b. Fetch technician's starting position (current GPS or home address)
   c. Build ORS Optimization API request
   d. Call ORS API (with retry + timeout)
   e. Parse response: extract optimized order, distances, durations, geometry
   f. Store the optimized route and stops in the Route/RouteStop tables
   g. Fetch direction geometry for each leg via ORS Directions API (or use response geometry)
   h. Return before/after comparison to frontend

4. Frontend displays:
   - Original order vs optimized order
   - Time savings estimate
   - Route drawn on map
   - "Apply" / "Cancel" buttons

5. On "Apply":
   - Route stops are saved with sort order
   - Technician's job list reorders to match
   - Dispatch board reflects new order
```

### 5.4 Route Optimization API Contract

```
POST /api/routes/optimize

Request Body:
{
  "technicianId": "tech-123",
  "date": "2026-03-20",
  "startLocation": {            // Optional: override technician's current position
    "latitude": 40.735,
    "longitude": -73.990
  },
  "returnToStart": true         // Optional: round trip (default true)
}

Response (200):
{
  "routeId": "route-456",
  "technician": {
    "id": "tech-123",
    "name": "Tyler Smith"
  },
  "original": {
    "stops": [
      { "workOrderId": "wo1", "address": "123 Main St", "sortOrder": 0 },
      { "workOrderId": "wo2", "address": "456 Oak Ave", "sortOrder": 1 },
      { "workOrderId": "wo3", "address": "789 Elm Dr", "sortOrder": 2 }
    ],
    "totalDistanceMeters": 45200,
    "totalDurationSeconds": 5400
  },
  "optimized": {
    "stops": [
      {
        "workOrderId": "wo2",
        "address": "456 Oak Ave",
        "sortOrder": 0,
        "estimatedArrival": "2026-03-20T09:15:00Z",
        "distanceFromPrevMeters": 3200,
        "durationFromPrevSeconds": 480
      },
      {
        "workOrderId": "wo3",
        "address": "789 Elm Dr",
        "sortOrder": 1,
        "estimatedArrival": "2026-03-20T10:45:00Z",
        "distanceFromPrevMeters": 5100,
        "durationFromPrevSeconds": 720
      },
      {
        "workOrderId": "wo1",
        "address": "123 Main St",
        "sortOrder": 2,
        "estimatedArrival": "2026-03-20T12:30:00Z",
        "distanceFromPrevMeters": 4800,
        "durationFromPrevSeconds": 660
      }
    ],
    "totalDistanceMeters": 32500,
    "totalDurationSeconds": 3900
  },
  "savings": {
    "distanceMeters": 12700,
    "durationSeconds": 1500,
    "percentageTimeSaved": 27.8
  },
  "geometry": "encoded_polyline_for_map_rendering"
}
```

### 5.5 Caching Strategy

- Route geometry between two points is cached in Redis for 24 hours (key: `route:{origin_lat},{origin_lng}:{dest_lat},{dest_lng}`)
- Optimization results are stored in the Route table (database) and do not expire
- Direction API calls are deduplicated: if the same origin/destination pair is requested within the cache window, the cached result is returned
- Cache invalidation: routes are re-fetched only when a work order's address changes or a new work order is added to the route

### 5.6 OSRM Fallback

If OpenRouteService is unavailable (rate limited or down), the system falls back to OSRM for direction queries:

```
GET http://router.project-osrm.org/route/v1/driving/{lng1},{lat1};{lng2},{lat2}?overview=full&geometries=geojson

Response:
{
  "routes": [
    {
      "distance": 12345.6,  // meters
      "duration": 890.1,    // seconds
      "geometry": { "type": "LineString", "coordinates": [...] }
    }
  ]
}
```

OSRM does not provide an optimization endpoint, so route optimization is unavailable during OSRM fallback. The UI displays a notice and allows manual reordering via drag-and-drop.

## 6. GPS Position Streaming Protocol

### 6.1 Overview

GPS positions flow from the technician's browser to the server via WebSocket and are broadcast to interested clients (dispatch dashboards, customer tracking portals).

### 6.2 Client-Side Collection

```typescript
// Technician client: GPS collection
const GPS_CONFIG = {
  enableHighAccuracy: true,
  maximumAge: 5000,        // Accept positions up to 5s old
  timeout: 10000,          // Wait up to 10s for a position
};

const UPDATE_INTERVAL_MOVING = 10000;   // 10s when moving
const UPDATE_INTERVAL_STATIONARY = 30000; // 30s when stationary
const STATIONARY_SPEED_THRESHOLD = 1;    // m/s

let watchId: number;
let lastEmitTime = 0;
let currentInterval = UPDATE_INTERVAL_MOVING;

function startGpsTracking(socket: Socket) {
  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const now = Date.now();
      const speed = position.coords.speed ?? 0;

      // Adjust interval based on movement
      currentInterval = speed < STATIONARY_SPEED_THRESHOLD
        ? UPDATE_INTERVAL_STATIONARY
        : UPDATE_INTERVAL_MOVING;

      // Throttle emissions
      if (now - lastEmitTime < currentInterval) return;
      lastEmitTime = now;

      socket.emit('gps:position', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: new Date(position.timestamp).toISOString(),
      });
    },
    (error) => {
      socket.emit('gps:error', {
        code: error.code,
        message: error.message,
      });
    },
    GPS_CONFIG
  );
}

function stopGpsTracking() {
  if (watchId) navigator.geolocation.clearWatch(watchId);
}
```

### 6.3 Server-Side Processing

```
On "gps:position" event:
  1. Validate payload schema (latitude, longitude, timestamp required)
  2. Verify the technician belongs to the company (from JWT context)
  3. Check if technician is within scheduled working hours (§BRD BR-800)
     - If outside hours: discard position, do not store
  4. Accuracy filter: discard positions with accuracy > 200m
  5. Store position in TechnicianPosition table (batch insert, flush every 5s or 10 positions)
  6. Update Technician.currentLatitude, currentLongitude, lastPositionAt
  7. Broadcast to room company:{companyId} on /gps namespace:
     Event: "gps:update"
     Payload: { technicianId, latitude, longitude, accuracy, heading, speed, timestamp }
  8. If technician has an active EN_ROUTE work order:
     a. Broadcast to room workorder:{workOrderId} on /tracking namespace:
        Event: "tracking:position"
        Payload: { latitude, longitude, eta, distance }
     b. Check proximity to work order location:
        - If < 2km and no "arriving_15" notification sent: send ARRIVING_SOON_15
        - If < 500m and no "arriving_5" notification sent: send ARRIVING_SOON_5
```

### 6.4 Batching Strategy

To reduce database write pressure, GPS positions are batched:

```
Position Buffer (per technician):
  - Buffer size: 10 positions
  - Flush interval: 5 seconds
  - Flush on: buffer full OR interval elapsed OR technician disconnects
  - Implementation: In-memory Map<technicianId, Position[]> on the gateway
  - Batch insert: INSERT INTO technician_positions (columns) VALUES (...), (...), (...)
```

### 6.5 Connection Lifecycle

```
Connect:
  1. Client sends WebSocket handshake with JWT in auth
  2. Server validates JWT, extracts companyId and userId
  3. Server looks up technician profile for userId
  4. Server joins client to rooms: company:{companyId}, technician:{techId}
  5. Server sets technician status: emit "technician:online"

Disconnect:
  1. Flush position buffer for this technician
  2. Leave all rooms
  3. Emit "technician:offline" to company room
  4. If technician was EN_ROUTE: log warning, keep last known position

Reconnect:
  1. Socket.io automatic reconnection with exponential backoff
  2. Client re-authenticates on reconnect (send latest JWT)
  3. Client resumes GPS streaming from current position
  4. Any queued positions (stored locally during disconnect) are sent
```

### 6.6 WebSocket Events Summary

| Namespace | Event | Direction | Payload |
|-----------|-------|-----------|---------|
| /gps | gps:position | Client->Server | { latitude, longitude, accuracy, heading, speed, timestamp } |
| /gps | gps:error | Client->Server | { code, message } |
| /gps | gps:update | Server->Client | { technicianId, latitude, longitude, accuracy, heading, speed, timestamp } |
| /gps | technician:online | Server->Client | { technicianId, name } |
| /gps | technician:offline | Server->Client | { technicianId, lastPosition } |
| /dispatch | workorder:updated | Server->Client | { workOrderId, status, technicianId, updatedFields } |
| /dispatch | workorder:created | Server->Client | { workOrder } |
| /dispatch | workorder:assigned | Server->Client | { workOrderId, technicianId, technicianName } |
| /dispatch | board:refresh | Server->Client | { reason } |
| /tracking | tracking:position | Server->Client | { latitude, longitude, eta, distance } |
| /tracking | tracking:arrived | Server->Client | { workOrderId } |
| /tracking | tracking:completed | Server->Client | { workOrderId, invoiceUrl } |

## 7. ETA Calculation Algorithm

### 7.1 Overview

ETA (Estimated Time of Arrival) is calculated for technicians en route to a work order. It is displayed on the customer tracking portal and the dispatch dashboard.

### 7.2 Calculation Method

```
calculateETA(technicianPosition, workOrderLocation):
  1. Check Redis cache for route: key = "eta:{techId}:{woId}"
     If cached and age < 60s: return cached ETA

  2. Call OpenRouteService Directions API:
     GET /v2/directions/driving-car
     ?start={techLng},{techLat}
     &end={woLng},{woLat}

  3. Extract:
     - duration_seconds from response.features[0].properties.summary.duration
     - distance_meters from response.features[0].properties.summary.distance

  4. Apply traffic factor (time-of-day heuristic):
     - 7:00-9:00: factor = 1.3 (morning rush)
     - 9:00-16:00: factor = 1.0 (normal)
     - 16:00-18:30: factor = 1.35 (evening rush)
     - 18:30-7:00: factor = 0.9 (off-peak)

  5. eta_seconds = duration_seconds * traffic_factor
  6. eta_arrival = now() + eta_seconds

  7. Cache result in Redis (TTL: 60s)

  8. Return:
     {
       etaMinutes: Math.ceil(eta_seconds / 60),
       etaArrival: eta_arrival.toISOString(),
       distanceMeters: distance_meters,
       distanceKm: (distance_meters / 1000).toFixed(1)
     }
```

### 7.3 ETA Recalculation Triggers

| Trigger | Action |
|---------|--------|
| New GPS position received (while EN_ROUTE) | Recalculate if last calc > 30s ago |
| Work order address changed | Invalidate cache, recalculate immediately |
| Technician deviates > 500m from cached route | Recalculate with new directions |
| Manual recalculation request | Invalidate cache, recalculate immediately |

### 7.4 Proximity-Based Notifications

```
On each GPS update for an EN_ROUTE technician:
  1. Calculate straight-line distance to work order (Haversine)
  2. If distance < 2000m AND etaMinutes <= 15:
     - If ARRIVING_SOON_15 not yet sent for this work order:
       Send SMS: "[Name] will arrive in approximately 15 minutes."
       Set flag: arriving_15_sent = true

  3. If distance < 500m AND etaMinutes <= 5:
     - If ARRIVING_SOON_5 not yet sent for this work order:
       Send SMS: "[Name] is almost there — arriving in about 5 minutes."
       Set flag: arriving_5_sent = true
```

## 8. Dispatch Board Logic

### 8.1 Data Loading

```
GET /api/dispatch/board?date=2026-03-20

Response:
{
  "date": "2026-03-20",
  "columns": {
    "UNASSIGNED": [{ workOrder... }],
    "ASSIGNED": [{ workOrder..., technician: {...} }],
    "EN_ROUTE": [{ workOrder..., technician: {...}, eta: {...} }],
    "ON_SITE": [{ workOrder..., technician: {...} }],
    "IN_PROGRESS": [{ workOrder..., technician: {...} }],
    "COMPLETED": [{ workOrder... }]
  },
  "technicians": [
    {
      "id": "tech-1",
      "name": "Tyler Smith",
      "status": "AVAILABLE",
      "jobCount": 3,
      "latitude": 40.748,
      "longitude": -73.985
    }
  ],
  "stats": {
    "total": 47,
    "unassigned": 8,
    "inProgress": 12,
    "completed": 22,
    "cancelled": 5
  }
}
```

### 8.2 Drag-and-Drop Actions

| Drag Source | Drop Target | Action |
|------------|-------------|--------|
| UNASSIGNED card | Technician avatar | Execute T1 (assign to technician) |
| UNASSIGNED card | ASSIGNED column | Show technician selector modal, then T1 |
| ASSIGNED card | UNASSIGNED column | Execute T8 (unassign) |
| ASSIGNED card | Different technician | Execute T8 then T1 (reassign) |
| Any card | CANCELLED column | Execute T9-T13 (cancel with confirmation) |

### 8.3 Real-Time Sync

The dispatch board maintains a WebSocket connection to the /dispatch namespace. On receiving events:

```
workorder:updated → Update the affected card's data and move to correct column
workorder:created → Add new card to UNASSIGNED column
workorder:assigned → Move card to ASSIGNED column, update technician panel
board:refresh → Refetch entire board data (used for bulk operations)
```

Optimistic updates: when a dispatcher drags a card, the UI moves the card immediately. If the server rejects the transition, the card snaps back with an error toast.

## 9. BullMQ Background Jobs

### 9.1 Queue Configuration

```typescript
const QUEUES = {
  'route-optimization': {
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 500,
    }
  },
  'notifications': {
    defaultJobOptions: {
      attempts: 5,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 1000,
      removeOnFail: 1000,
    }
  },
  'invoicing': {
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 10000 },
      removeOnComplete: 100,
      removeOnFail: 500,
    }
  },
  'maintenance': {
    defaultJobOptions: {
      attempts: 1,
      removeOnComplete: 10,
      removeOnFail: 50,
    }
  },
};
```

### 9.2 Job Definitions

| Queue | Job Name | Trigger | Logic |
|-------|----------|---------|-------|
| route-optimization | `recalculate-route` | Work order completed (T5), work order cancelled (T10-T13), new assignment | Fetch remaining work orders for the technician's route on that date. Re-optimize via ORS Optimization API. Update Route and RouteStop records. Broadcast route update to dispatch. |
| route-optimization | `calculate-eta` | Technician goes EN_ROUTE (T2), periodic (every 60s while EN_ROUTE) | Calculate ETA via ORS Directions API. Cache result. Broadcast to tracking portal. |
| notifications | `send-sms` | State transitions, proximity triggers | Format SMS template with work order and technician data. Send via Twilio. Record in Notification table. |
| notifications | `send-email` | State transitions, invoice events | Format email template. Send via Resend. Record in Notification table. |
| notifications | `send-push` | New assignment, schedule changes | Send web push notification via Web Push API. Record in Notification table. |
| notifications | `proximity-check` | GPS position update (batched) | Check distance-based notification triggers (15 min, 5 min). Enqueue send-sms if triggered. |
| invoicing | `generate-invoice` | Work order completed (T5) | Create draft Invoice record from work order line items. Calculate tax. Mark work order as ready for invoicing. |
| invoicing | `send-invoice-stripe` | Dispatcher clicks "Send Invoice" | Create Stripe Invoice via API. Store stripeInvoiceId. Send email notification. Execute T6 transition. |
| invoicing | `process-stripe-webhook` | Stripe webhook received | Parse webhook event. If `invoice.paid`: update Invoice, execute T7 transition. If `invoice.payment_failed`: log failure. |
| maintenance | `purge-gps-positions` | Cron: daily at 3:00 AM UTC | DELETE FROM technician_positions WHERE recorded_at < NOW() - INTERVAL '90 days'. Log row count. |
| maintenance | `purge-audit-logs` | Cron: weekly, Sunday 3:00 AM UTC | DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '1 year'. Log row count. |
| maintenance | `expire-tracking-tokens` | Cron: hourly | UPDATE work_orders SET tracking_token = NULL WHERE tracking_expires_at < NOW(). |
| maintenance | `expire-magic-links` | Cron: hourly | DELETE FROM magic_links WHERE expires_at < NOW() AND used_at IS NULL. |
| maintenance | `daily-analytics-snapshot` | Cron: daily at 1:00 AM UTC | Pre-compute analytics aggregations for the previous day. Store in a denormalized analytics table for fast dashboard queries. |

### 9.3 Cron Schedule

```typescript
// Scheduled jobs (registered on application startup)
const CRON_JOBS = [
  { queue: 'maintenance', name: 'purge-gps-positions', cron: '0 3 * * *' },
  { queue: 'maintenance', name: 'purge-audit-logs', cron: '0 3 * * 0' },
  { queue: 'maintenance', name: 'expire-tracking-tokens', cron: '0 * * * *' },
  { queue: 'maintenance', name: 'expire-magic-links', cron: '0 * * * *' },
  { queue: 'maintenance', name: 'daily-analytics-snapshot', cron: '0 1 * * *' },
];
```

## 10. Simulated GPS for Demos

### 10.1 Overview

Simulated GPS generates realistic technician movement along a route for demonstration purposes. When enabled on a technician, the system emits GPS positions that follow the route geometry at configurable speeds.

### 10.2 Simulation Algorithm

```
Input:
  - route: Route with geometry (GeoJSON LineString coordinates)
  - speed: configurable (default: 40 km/h = 11.1 m/s)
  - updateInterval: 10 seconds

Algorithm:
  1. Decode route geometry into an array of [lng, lat] coordinates
  2. Calculate cumulative distances along the route (Haversine between each consecutive pair)
  3. Total route distance = sum of all segment distances
  4. Start simulation:
     - currentDistance = 0
     - Each tick (every updateInterval):
       a. currentDistance += speed * updateInterval
       b. If currentDistance >= totalDistance: simulation complete, emit final position
       c. Find the segment where currentDistance falls
       d. Interpolate position within that segment:
          segmentProgress = (currentDistance - segmentStartDistance) / segmentLength
          lat = startLat + segmentProgress * (endLat - startLat)
          lng = startLng + segmentProgress * (endLng - startLng)
       e. Calculate heading from current position to next waypoint:
          heading = atan2(endLng - startLng, endLat - startLat) * 180 / PI
       f. Emit position via WebSocket (same format as real GPS):
          { latitude, longitude, accuracy: 5, heading, speed, timestamp: now() }

  5. On completion:
     - Emit final position at the work order location
     - If auto-advance enabled: trigger T3 (ON_SITE) transition after 30s delay
```

### 10.3 Simulation Controls

```
POST /api/technicians/:id/simulation/start
{
  "workOrderId": "wo-123",       // Route to simulate along
  "speedKmh": 40,                // Default: 40
  "autoAdvance": true            // Auto-transition to ON_SITE on arrival
}

POST /api/technicians/:id/simulation/stop

GET /api/technicians/:id/simulation/status
→ { active: true, progress: 0.65, etaSeconds: 180 }
```

### 10.4 Implementation Notes

- Simulated positions are stored in the same TechnicianPosition table as real positions (no distinction needed for the demo)
- Simulation runs as a BullMQ repeatable job with the configured update interval
- Multiple technicians can be simulated simultaneously
- Simulation respects the same WebSocket broadcasting pipeline as real GPS

## 11. Directions API Contract

### 11.1 Get Directions Between Two Points

```
POST /api/routes/directions

Request:
{
  "origin": { "latitude": 40.735, "longitude": -73.990 },
  "destination": { "latitude": 40.758, "longitude": -73.985 },
  "profile": "driving-car"   // Optional, default: driving-car
}

Response (200):
{
  "distance": {
    "meters": 4520,
    "km": 4.52,
    "text": "4.5 km"
  },
  "duration": {
    "seconds": 780,
    "minutes": 13,
    "text": "13 min"
  },
  "geometry": {
    "type": "LineString",
    "coordinates": [[-73.990, 40.735], [-73.988, 40.740], ...]
  },
  "steps": [
    {
      "instruction": "Turn right onto Broadway",
      "distance": 450,
      "duration": 60
    }
  ],
  "source": "openrouteservice",  // or "osrm" if fallback
  "cached": false
}
```

### 11.2 Get ETA

```
GET /api/routes/eta?technicianId=tech-123&workOrderId=wo-456

Response (200):
{
  "etaMinutes": 12,
  "etaArrival": "2026-03-20T14:32:00Z",
  "distanceMeters": 5200,
  "distanceKm": "5.2",
  "trafficFactor": 1.3,
  "lastCalculated": "2026-03-20T14:20:15Z",
  "cached": true
}
```

## 12. Work Order Transition API Contract

```
POST /api/work-orders/:id/transition

Request:
{
  "toStatus": "EN_ROUTE",
  "notes": "Starting drive to customer",       // Optional
  "technicianId": "tech-123",                   // Required for ASSIGNED transition
  "overrideOverlap": false,                     // Optional: skip overlap check
  "overrideRadius": false,                      // Optional: skip arrival radius check
  "confirmed": true,                            // Required for cancellation
  "cancellationReason": "Customer cancelled"    // Required for ON_SITE/IN_PROGRESS cancellation
}

Response (200):
{
  "workOrder": {
    "id": "wo-456",
    "status": "EN_ROUTE",
    "technicianId": "tech-123",
    "trackingToken": "uuid-tracking-token",
    "trackingUrl": "https://app.example.com/track/uuid-tracking-token"
  },
  "transition": {
    "from": "ASSIGNED",
    "to": "EN_ROUTE",
    "timestamp": "2026-03-20T09:15:00Z",
    "actor": "user-789"
  },
  "warnings": []
}

Response (400 — invalid transition):
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Invalid transition: cannot move from UNASSIGNED to ON_SITE",
  "details": {
    "currentStatus": "UNASSIGNED",
    "requestedStatus": "ON_SITE",
    "allowedTransitions": ["ASSIGNED", "CANCELLED"]
  }
}

Response (400 — guard failure):
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Guard failed: withinArrivalRadius",
  "details": {
    "guard": "withinArrivalRadius",
    "currentDistance": 2340,
    "requiredDistance": 500,
    "hint": "Technician is 2.3 km from the work order location. Set overrideRadius=true to bypass."
  }
}
```

## 13. Cross-References

- Business rules: §BRD (BR-200 through BR-403)
- Product requirements: §PRD (FR-100 through FR-902)
- Data model (tables, enums): §SRS-2
- WebSocket architecture: §SRS-1 Section 7
- Security and auth: §SRS-4
- UI for dispatch board: §WIREFRAMES

---

*End of Software Requirements Specification — Domain Logic*
