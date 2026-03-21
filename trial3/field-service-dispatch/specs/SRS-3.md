# Software Requirements Specification — Part 3: Business Logic
# Field Service Dispatch

**Version:** 1.0 | **Date:** 2026-03-20

---

## 1. Work Order State Machine [VERIFY:STATE_MACHINE]

### 1.1 States and Transitions
```
UNASSIGNED ──► ASSIGNED ──► EN_ROUTE ──► ON_SITE ──► IN_PROGRESS ──► COMPLETED ──► INVOICED ──► PAID
                  │             │
                  ▼             ▼
              UNASSIGNED    ASSIGNED
              (unassign)   (abort travel)
```

### 1.2 Transition Logic
- **UNASSIGNED → ASSIGNED:** Work order assigned to technician (manual or auto-assign)
- **ASSIGNED → EN_ROUTE:** Technician starts travel to customer
- **ASSIGNED → UNASSIGNED:** Dispatcher unassigns technician
- **EN_ROUTE → ON_SITE:** Technician arrives at customer location
- **EN_ROUTE → ASSIGNED:** Technician aborts travel (reassignment)
- **ON_SITE → IN_PROGRESS:** Technician begins work
- **IN_PROGRESS → COMPLETED:** Technician finishes work
- **COMPLETED → INVOICED:** Invoice generated
- **INVOICED → PAID:** Payment received

### 1.3 Transition Validation
```typescript
function validateTransition(from: WorkOrderStatus, to: WorkOrderStatus): void {
  if (!isValidTransition(from, to)) {
    throw new BadRequestException(
      `Invalid transition from ${from} to ${to}`
    );
  }
}
```

### 1.4 Side Effects on Transition
| Transition | Side Effect |
|-----------|-------------|
| → ASSIGNED | Set technicianId, update technician status to BUSY |
| → EN_ROUTE | Begin GPS tracking, notify customer |
| → ON_SITE | Update ETA to 0, notify customer "technician arrived" |
| → COMPLETED | Set completedAt, update technician status to AVAILABLE |
| → INVOICED | Create Invoice record |
| → UNASSIGNED | Clear technicianId, update technician status to AVAILABLE |

## 2. Auto-Assignment Algorithm

### 2.1 Nearest Qualified Technician
```typescript
async autoAssign(workOrderId: string, companyId: string) {
  const workOrder = await this.prisma.workOrder.findFirstOrThrow({
    where: { id: workOrderId, companyId },
    include: { customer: true }
  });

  // 1. Find available technicians in same company
  // 2. Filter by matching skills (serviceType ∈ technician.skills)
  // 3. Calculate distance from each technician to customer
  // 4. Sort by distance ascending
  // 5. Assign to nearest
}
```

### 2.2 Distance Calculation
- Haversine formula for straight-line distance
- Used for initial sorting (not actual route distance)
- Actual route distance calculated by OpenRouteService after assignment

## 3. Route Optimization

### 3.1 OpenRouteService Integration
```typescript
async optimizeRoute(technicianId: string, date: Date, companyId: string) {
  // 1. Get all work orders for technician on date
  // 2. Get technician current/start location
  // 3. Build vehicle routing problem (VRP) request
  // 4. Call OpenRouteService Optimization API
  // 5. Store optimized waypoint order in Route record
  // 6. Store route geometry (GeoJSON) for map visualization
}
```

### 3.2 VRP Request Format
```json
{
  "jobs": [
    { "id": 1, "location": [lng, lat], "service": 3600 }
  ],
  "vehicles": [
    { "id": 1, "start": [lng, lat], "profile": "driving-car" }
  ]
}
```

### 3.3 Cached Routes
- Routes cached for demo reliability
- If OpenRouteService is unavailable, return cached route
- Cache includes geometry for polyline visualization

## 4. GPS Tracking (WebSocket)

### 4.1 WebSocket Gateway
```typescript
@WebSocketGateway({ cors: true })
export class TrackingGateway {
  // Client events:
  // - GPS_UPDATE: technician sends position
  // - JOIN_TRACKING: customer joins work order tracking room

  // Server broadcasts:
  // - TECHNICIAN_POSITION: to dispatch dashboard + tracking rooms
  // - ETA_UPDATE: to customer tracking rooms
  // - STATUS_UPDATE: to all relevant rooms
}
```

### 4.2 Position Update Flow
```
Technician browser → navigator.geolocation.watchPosition()
  → WebSocket GPS_UPDATE { lat, lng }
  → Server updates technician.currentLat/currentLng in DB
  → Server broadcasts TECHNICIAN_POSITION to:
    - Dispatch dashboard room (all company admins)
    - Customer tracking room (specific work order)
  → Server calculates ETA (straight-line distance / avg speed)
  → Server broadcasts ETA_UPDATE to customer tracking room
```

### 4.3 Room Structure
- `company:{companyId}` — dispatch dashboard room
- `tracking:{workOrderId}` — customer tracking room
- Technicians join their company room on connect
- Customers join tracking room via tracking token

### 4.4 Simulated GPS for Demo
```typescript
// Pre-computed route waypoints from optimization
// setInterval moves marker to next waypoint every 2 seconds
// Broadcasts real WebSocket events
// Enables demo without real GPS hardware
```

## 5. Customer Tracking Portal

### 5.1 Access
- No authentication required
- Access via tracking token: `/tracking/:token`
- Token generated on work order creation

### 5.2 Features
- Live map showing technician position (when EN_ROUTE or ON_SITE)
- ETA display ("Your technician is X minutes away")
- Status timeline showing all status transitions
- Customer and work order details (address, service type)

### 5.3 Data Restrictions
- Only shows data for the specific work order
- Technician name and photo visible
- Company details visible
- No access to other work orders or company data

## 6. Invoicing

### 6.1 Auto-Generation on Completion
```typescript
async generateInvoice(workOrderId: string, companyId: string) {
  const workOrder = await this.prisma.workOrder.findFirstOrThrow({
    where: { id: workOrderId, companyId, status: 'COMPLETED' }
  });

  // 1. Calculate amount from service type rates
  // 2. Build line items
  // 3. Create Invoice record (status: DRAFT)
  // 4. Transition work order to INVOICED
}
```

### 6.2 Invoice Status Flow
- DRAFT → SENT → PAID
- SENT triggers notification to customer

## 7. Analytics

### 7.1 Dispatch Metrics
- Jobs per day (last 30 days trend)
- Average completion time (scheduledAt → completedAt)
- Technician utilization rate (BUSY hours / total hours)
- Jobs by status breakdown
- Jobs by priority breakdown
- Jobs by service type breakdown
