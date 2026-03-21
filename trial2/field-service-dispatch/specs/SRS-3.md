# System Requirements Specification — Part 3: Business Logic

## Field Service Dispatch & Management Platform

**Version:** 1.0
**Date:** 2026-03-20
**Status:** Approved

---

## 1. Work Order State Machine

### 1.1 State Definitions

| State | Description | Entry Conditions | Exit Actions |
|-------|-------------|------------------|-------------|
| UNASSIGNED | New work order, no technician assigned | Work order created | — |
| ASSIGNED | Technician assigned, not yet en route | technicianId set | Notify technician |
| EN_ROUTE | Technician traveling to job site | Technician taps "Start Route" | Begin GPS tracking |
| ON_SITE | Technician has arrived at location | Technician taps "Arrived" | Notify customer |
| IN_PROGRESS | Work is being performed | Technician taps "Start Work" | — |
| COMPLETED | Work finished, pending invoicing | Technician taps "Complete" | Generate invoice |
| INVOICED | Invoice generated and sent | Invoice created | Send invoice to customer |
| PAID | Payment received | Stripe payment confirmed | Send receipt |

### 1.2 Transition Matrix

```
FROM \ TO        | UNASSIGNED | ASSIGNED | EN_ROUTE | ON_SITE | IN_PROGRESS | COMPLETED | INVOICED | PAID
-----------------|------------|----------|----------|---------|-------------|-----------|----------|------
UNASSIGNED       |     -      |    YES   |    -     |    -    |      -      |     -     |    -     |  -
ASSIGNED         |    YES*    |    -     |   YES    |    -    |      -      |     -     |    -     |  -
EN_ROUTE         |    YES*    |    -     |    -     |   YES   |      -      |     -     |    -     |  -
ON_SITE          |    YES*    |    -     |    -     |    -    |     YES     |     -     |    -     |  -
IN_PROGRESS      |    YES*    |    -     |    -     |    -    |      -      |    YES    |    -     |  -
COMPLETED        |     -      |    -     |    -     |    -    |      -      |     -     |   YES    |  -
INVOICED         |     -      |    -     |    -     |    -    |      -      |     -     |    -     | YES
PAID             |     -      |    -     |    -     |    -    |      -      |     -     |    -     |  -

* = Requires ADMIN or DISPATCHER role (cancel/reassign)
```

### 1.3 State Machine Implementation (Single Source of Truth)

```typescript
// packages/shared/src/state-machine/work-order-state-machine.ts

export enum WorkOrderStatus {
  UNASSIGNED = 'UNASSIGNED',
  ASSIGNED = 'ASSIGNED',
  EN_ROUTE = 'EN_ROUTE',
  ON_SITE = 'ON_SITE',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  INVOICED = 'INVOICED',
  PAID = 'PAID',
}

export interface StateTransition {
  from: WorkOrderStatus;
  to: WorkOrderStatus;
  requiredRoles?: UserRole[];
  sideEffects?: string[];
}

export const VALID_TRANSITIONS: StateTransition[] = [
  // Forward flow
  {
    from: WorkOrderStatus.UNASSIGNED,
    to: WorkOrderStatus.ASSIGNED,
    requiredRoles: [UserRole.ADMIN, UserRole.DISPATCHER],
    sideEffects: ['notify-technician'],
  },
  {
    from: WorkOrderStatus.ASSIGNED,
    to: WorkOrderStatus.EN_ROUTE,
    requiredRoles: [UserRole.ADMIN, UserRole.DISPATCHER, UserRole.TECHNICIAN],
    sideEffects: ['start-gps-tracking', 'notify-customer-en-route'],
  },
  {
    from: WorkOrderStatus.EN_ROUTE,
    to: WorkOrderStatus.ON_SITE,
    requiredRoles: [UserRole.ADMIN, UserRole.DISPATCHER, UserRole.TECHNICIAN],
    sideEffects: ['notify-customer-arrived'],
  },
  {
    from: WorkOrderStatus.ON_SITE,
    to: WorkOrderStatus.IN_PROGRESS,
    requiredRoles: [UserRole.ADMIN, UserRole.DISPATCHER, UserRole.TECHNICIAN],
    sideEffects: [],
  },
  {
    from: WorkOrderStatus.IN_PROGRESS,
    to: WorkOrderStatus.COMPLETED,
    requiredRoles: [UserRole.ADMIN, UserRole.DISPATCHER, UserRole.TECHNICIAN],
    sideEffects: ['generate-invoice', 'stop-gps-tracking'],
  },
  {
    from: WorkOrderStatus.COMPLETED,
    to: WorkOrderStatus.INVOICED,
    requiredRoles: [UserRole.ADMIN],
    sideEffects: ['send-invoice-to-customer'],
  },
  {
    from: WorkOrderStatus.INVOICED,
    to: WorkOrderStatus.PAID,
    requiredRoles: [UserRole.ADMIN],
    sideEffects: ['send-payment-receipt'],
  },

  // Cancel/reassign flow (back to UNASSIGNED)
  {
    from: WorkOrderStatus.ASSIGNED,
    to: WorkOrderStatus.UNASSIGNED,
    requiredRoles: [UserRole.ADMIN, UserRole.DISPATCHER],
    sideEffects: ['clear-technician-assignment'],
  },
  {
    from: WorkOrderStatus.EN_ROUTE,
    to: WorkOrderStatus.UNASSIGNED,
    requiredRoles: [UserRole.ADMIN, UserRole.DISPATCHER],
    sideEffects: ['clear-technician-assignment', 'stop-gps-tracking'],
  },
  {
    from: WorkOrderStatus.ON_SITE,
    to: WorkOrderStatus.UNASSIGNED,
    requiredRoles: [UserRole.ADMIN, UserRole.DISPATCHER],
    sideEffects: ['clear-technician-assignment'],
  },
  {
    from: WorkOrderStatus.IN_PROGRESS,
    to: WorkOrderStatus.UNASSIGNED,
    requiredRoles: [UserRole.ADMIN, UserRole.DISPATCHER],
    sideEffects: ['clear-technician-assignment'],
  },
];

export function isValidTransition(
  from: WorkOrderStatus,
  to: WorkOrderStatus,
): boolean {
  return VALID_TRANSITIONS.some((t) => t.from === from && t.to === to);
}

export function getTransition(
  from: WorkOrderStatus,
  to: WorkOrderStatus,
): StateTransition | undefined {
  return VALID_TRANSITIONS.find((t) => t.from === from && t.to === to);
}

export function getValidNextStatuses(
  from: WorkOrderStatus,
): WorkOrderStatus[] {
  return VALID_TRANSITIONS
    .filter((t) => t.from === from)
    .map((t) => t.to);
}

export function canUserTransition(
  from: WorkOrderStatus,
  to: WorkOrderStatus,
  userRole: UserRole,
): boolean {
  const transition = getTransition(from, to);
  if (!transition) return false;
  if (!transition.requiredRoles || transition.requiredRoles.length === 0) return true;
  return transition.requiredRoles.includes(userRole);
}
```

### 1.4 State Machine Usage in Backend

```typescript
// apps/api/src/modules/work-orders/work-orders.service.ts

async transitionStatus(
  workOrderId: string,
  toStatus: WorkOrderStatus,
  userId: string,
  userRole: UserRole,
  note?: string,
): Promise<WorkOrder> {
  const workOrder = await this.prisma.workOrder.findUniqueOrThrow({
    where: { id: workOrderId },
  });

  // 1. Validate transition using shared state machine
  if (!isValidTransition(workOrder.status as WorkOrderStatus, toStatus)) {
    throw new BadRequestException(
      `Invalid transition from ${workOrder.status} to ${toStatus}`,
    );
  }

  // 2. Check role permission
  if (!canUserTransition(workOrder.status as WorkOrderStatus, toStatus, userRole)) {
    throw new ForbiddenException(
      `Role ${userRole} cannot perform transition from ${workOrder.status} to ${toStatus}`,
    );
  }

  // 3. Get side effects
  const transition = getTransition(workOrder.status as WorkOrderStatus, toStatus);

  // 4. Perform transition in a transaction
  const updated = await this.prisma.$transaction(async (tx) => {
    // Update work order status
    const wo = await tx.workOrder.update({
      where: { id: workOrderId },
      data: {
        status: toStatus,
        ...(toStatus === WorkOrderStatus.COMPLETED && { completedAt: new Date() }),
        ...(toStatus === WorkOrderStatus.IN_PROGRESS && { startedAt: new Date() }),
        ...(toStatus === WorkOrderStatus.UNASSIGNED && { technicianId: null }),
      },
    });

    // Log status history
    await tx.workOrderStatusHistory.create({
      data: {
        workOrderId,
        companyId: workOrder.companyId,
        fromStatus: workOrder.status,
        toStatus,
        changedBy: userId,
        note,
      },
    });

    return wo;
  });

  // 5. Execute side effects (after transaction commits)
  if (transition?.sideEffects) {
    for (const effect of transition.sideEffects) {
      await this.executeSideEffect(effect, updated);
    }
  }

  return updated;
}
```

---

## 2. Route Optimization Algorithm

### 2.1 Overview

Route optimization solves a simplified Vehicle Routing Problem (VRP):
- **Input:** One technician's start position + multiple job locations
- **Output:** Optimal visit order minimizing total travel time
- **Engine:** OpenRouteService Optimization API (Vroom engine)

### 2.2 Optimization Flow

```
1. Dispatcher triggers "Optimize Route" for a technician + date
2. System collects:
   - Technician's current/start position
   - All assigned work orders for that date
   - Time windows (if scheduledAt is set)
   - Estimated service duration per job
3. System sends to OpenRouteService Optimization API:
   - Vehicle: { start: technicianPosition, profile: "driving-car" }
   - Jobs: [{ id, location, service_time, time_windows? }]
4. API returns optimized route:
   - Ordered steps with arrival times
   - Total duration and distance
5. System fetches direction polylines for the optimized route
6. Route is saved to database and cached in Redis
7. Route is returned to frontend for map visualization
```

### 2.3 OpenRouteService Request Builder

```typescript
// apps/api/src/modules/routes/route-optimization.service.ts

interface OptimizationRequest {
  vehicles: [{
    id: number;
    start: [number, number];  // [lng, lat]
    profile: string;
    time_window?: [number, number];
  }];
  jobs: Array<{
    id: number;
    location: [number, number];  // [lng, lat]
    service: number;              // seconds
    time_windows?: [[number, number]];
  }>;
}

async buildOptimizationRequest(
  technician: Technician,
  workOrders: WorkOrder[],
): Promise<OptimizationRequest> {
  const now = Math.floor(Date.now() / 1000);
  const endOfDay = now + (12 * 3600); // 12-hour work window

  return {
    vehicles: [{
      id: 1,
      start: [technician.currentLng, technician.currentLat],
      profile: 'driving-car',
      time_window: [now, endOfDay],
    }],
    jobs: workOrders.map((wo, idx) => ({
      id: idx + 1,
      location: [wo.lng, wo.lat],
      service: (wo.estimatedDuration || 60) * 60, // minutes to seconds
      ...(wo.scheduledAt && {
        time_windows: [[
          Math.floor(new Date(wo.scheduledAt).getTime() / 1000),
          Math.floor(new Date(wo.scheduledAt).getTime() / 1000) + 7200,
        ]],
      }),
    })),
  };
}
```

### 2.4 Response Processing

```typescript
interface OptimizationResponse {
  code: number;
  summary: {
    cost: number;
    duration: number;
    distance: number;
  };
  routes: Array<{
    vehicle: number;
    steps: Array<{
      type: 'start' | 'job' | 'end';
      id?: number;
      location: [number, number];
      arrival: number;
      duration: number;
      distance: number;
    }>;
    duration: number;
    distance: number;
  }>;
  unassigned: Array<{ id: number; location: [number, number] }>;
}

async processOptimizationResponse(
  response: OptimizationResponse,
  workOrders: WorkOrder[],
  technicianId: string,
  companyId: string,
  date: Date,
): Promise<Route> {
  const route = response.routes[0];
  const jobSteps = route.steps.filter(s => s.type === 'job');

  // Map ORS job IDs back to work order IDs
  const waypoints = jobSteps.map((step, idx) => ({
    workOrderId: workOrders[step.id! - 1].id,
    lat: step.location[1],
    lng: step.location[0],
    order: idx,
    arrival: step.arrival,
  }));

  const optimizedOrder = jobSteps.map(s => s.id! - 1);

  // Fetch directions polyline for map rendering
  const coordinates = [
    route.steps[0].location, // start
    ...jobSteps.map(s => s.location),
  ];
  const polyline = await this.fetchDirectionsPolyline(coordinates);

  // Save route
  return this.prisma.route.upsert({
    where: {
      technicianId_date: { technicianId, date },
    },
    create: {
      companyId,
      technicianId,
      date,
      waypoints,
      optimizedOrder,
      polyline,
      estimatedDuration: route.duration,
      estimatedDistance: route.distance,
    },
    update: {
      waypoints,
      optimizedOrder,
      polyline,
      estimatedDuration: route.duration,
      estimatedDistance: route.distance,
    },
  });
}
```

### 2.5 Fallback Strategy

```typescript
async optimizeRoute(
  technicianId: string,
  date: Date,
): Promise<Route> {
  try {
    const result = await this.callOpenRouteService(request);
    return this.processOptimizationResponse(result, ...);
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      throw new ServiceUnavailableException(
        'Route optimization service is unavailable. Please try again later.',
      );
    }

    // Development/demo: return mock optimization (naive nearest-neighbor)
    this.logger.warn('ORS unavailable, using mock optimization');
    return this.mockOptimization(technicianId, date, workOrders);
  }
}

private mockOptimization(
  technicianId: string,
  date: Date,
  workOrders: WorkOrder[],
): Route {
  // Nearest-neighbor heuristic for demo
  // NOT production quality — throws in production
  const ordered = this.nearestNeighborSort(workOrders, startPosition);
  return {
    // ... mock route data
  };
}
```

---

## 3. Auto-Assign Algorithm

### 3.1 Algorithm Overview

Auto-assign finds the best technician for a work order based on:
1. **Skill match:** Technician must have the required skill for the service type
2. **Availability:** Technician status must be AVAILABLE
3. **Proximity:** Nearest technician (PostGIS distance calculation)
4. **Same company:** CRITICAL — only technicians from the same company

### 3.2 Algorithm Implementation

```typescript
// apps/api/src/modules/dispatch/auto-assign.service.ts

async autoAssign(workOrderId: string, companyId: string): Promise<WorkOrder> {
  const workOrder = await this.prisma.workOrder.findUniqueOrThrow({
    where: { id: workOrderId },
  });

  if (workOrder.status !== WorkOrderStatus.UNASSIGNED) {
    throw new BadRequestException(
      'Work order must be UNASSIGNED to auto-assign',
    );
  }

  // Find nearest available technician with matching skills
  // Using PostGIS for accurate distance calculation
  const nearestTechnicians = await this.prisma.$queryRaw<
    Array<{ id: string; name: string; distance_meters: number }>
  >`
    SELECT
      t.id,
      t.name,
      ST_Distance(
        t.location::geography,
        ST_SetSRID(ST_MakePoint(${workOrder.lng}, ${workOrder.lat}), 4326)::geography
      ) as distance_meters
    FROM technicians t
    WHERE t."companyId" = ${companyId}::uuid
      AND t.status = 'AVAILABLE'
      AND t."isActive" = true
      AND t.location IS NOT NULL
      AND t.skills @> ARRAY[${workOrder.serviceType}]::text[]
    ORDER BY distance_meters ASC
    LIMIT 1
  `;

  if (nearestTechnicians.length === 0) {
    throw new NotFoundException(
      'No available technician found with matching skills',
    );
  }

  const technician = nearestTechnicians[0];

  // Assign work order
  const updated = await this.workOrderService.transitionStatus(
    workOrderId,
    WorkOrderStatus.ASSIGNED,
    'system',
    UserRole.ADMIN,
    `Auto-assigned to ${technician.name} (${Math.round(technician.distance_meters)}m away)`,
  );

  await this.prisma.workOrder.update({
    where: { id: workOrderId },
    data: { technicianId: technician.id },
  });

  return updated;
}
```

### 3.3 Skill Matching

```typescript
// Service type to required skills mapping
// Companies can customize this mapping

const SERVICE_SKILL_MAP: Record<string, string[]> = {
  'HVAC Repair': ['HVAC'],
  'HVAC Installation': ['HVAC'],
  'Plumbing Repair': ['Plumbing'],
  'Plumbing Emergency': ['Plumbing'],
  'Electrical Repair': ['Electrical'],
  'Electrical Installation': ['Electrical'],
  'General Maintenance': ['General'],
  'Appliance Repair': ['Appliance'],
};

// A technician with skills: ['HVAC', 'Electrical'] can be assigned to:
// - HVAC Repair
// - HVAC Installation
// - Electrical Repair
// - Electrical Installation
```

### 3.4 Proximity Calculation

```
PostGIS distance calculation:
1. Technician location stored as geometry(Point, 4326)
2. Work order location: ST_MakePoint(lng, lat) with SRID 4326
3. Distance: ST_Distance(a::geography, b::geography) → meters
4. Geography cast ensures accurate great-circle distance
5. Spatial index (GIST) makes this efficient for many technicians
```

---

## 4. GPS Streaming Protocol

### 4.1 Position Update Flow

```
Technician Device                    Server                         Subscribers
     │                                │                                │
     ├── watchPosition() ────────────►│                                │
     │   interval: 5000ms              │                                │
     │                                 │                                │
     ├── position:update ────────────►│                                │
     │   { techId, lat, lng,           │                                │
     │     heading, speed, ts }        │                                │
     │                                 ├── Validate DTO                │
     │                                 ├── Verify tenant isolation     │
     │                                 ├── Update DB (debounced)       │
     │                                 ├── position:broadcast ────────►│
     │                                 │   to company:{companyId}       │
     │                                 ├── position:broadcast ────────►│
     │                                 │   to tracking:{workOrderId}   │
     │                                 │                                │
     │   [5 seconds later]             │                                │
     ├── position:update ────────────►│                                │
     │                                 │   ... repeat ...              │
```

### 4.2 Client-Side Implementation

```typescript
// Technician GPS tracking hook
function useGpsTracking(socket: Socket, technicianId: string) {
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        socket.emit('position:update', {
          technicianId,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: new Date().toISOString(),
        });
      },
      (error) => {
        console.error('GPS error:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [socket, technicianId]);
}
```

### 4.3 Server-Side Handler

```typescript
// GPS Gateway — server-side position handler

@SubscribeMessage('position:update')
async handlePositionUpdate(
  @ConnectedSocket() client: Socket,
  @MessageBody() data: PositionUpdateDto,
): Promise<void> {
  // 1. Get company context from socket
  const companyId = client.data.companyId;
  if (!companyId) {
    client.emit('error', { message: 'Not authenticated' });
    return;
  }

  // 2. CRITICAL: Verify technician belongs to same company
  const technician = await this.technicianService.findOne(data.technicianId);
  if (!technician || technician.companyId !== companyId) {
    client.emit('error', { message: 'Unauthorized: technician not in your company' });
    return;
  }

  // 3. Update technician position in database (debounced — every 10s)
  await this.updateTechnicianPosition(data);

  // 4. Broadcast to company room ONLY
  this.server.to(`company:${companyId}`).emit('position:broadcast', {
    technicianId: data.technicianId,
    lat: data.lat,
    lng: data.lng,
    heading: data.heading,
    speed: data.speed,
    timestamp: data.timestamp,
  });

  // 5. Broadcast to active tracking rooms for this technician's work orders
  const activeWorkOrders = await this.getActiveWorkOrders(data.technicianId);
  for (const wo of activeWorkOrders) {
    this.server.to(`tracking:${wo.id}`).emit('position:broadcast', {
      technicianId: data.technicianId,
      lat: data.lat,
      lng: data.lng,
      heading: data.heading,
      speed: data.speed,
      timestamp: data.timestamp,
    });
  }
}
```

### 4.4 Simulated GPS for Demo

```typescript
// apps/api/src/modules/gps-gateway/gps-simulator.service.ts

export class GpsSimulatorService {
  private intervals: Map<string, NodeJS.Timer> = new Map();

  async startSimulation(
    technicianId: string,
    routeCoordinates: [number, number][], // [lat, lng] pairs
    intervalMs: number = 2000,
  ): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('GPS simulation is not available in production');
    }

    let stepIndex = 0;

    const interval = setInterval(() => {
      if (stepIndex >= routeCoordinates.length) {
        this.stopSimulation(technicianId);
        return;
      }

      const [lat, lng] = routeCoordinates[stepIndex];
      const prevStep = stepIndex > 0 ? routeCoordinates[stepIndex - 1] : null;

      this.gpsGateway.handleSimulatedPosition({
        technicianId,
        lat,
        lng,
        heading: prevStep ? this.calculateHeading(prevStep, [lat, lng]) : 0,
        speed: prevStep ? this.calculateSpeed(prevStep, [lat, lng], intervalMs) : 0,
        timestamp: new Date().toISOString(),
      });

      stepIndex++;
    }, intervalMs);

    this.intervals.set(technicianId, interval);
  }

  stopSimulation(technicianId: string): void {
    const interval = this.intervals.get(technicianId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(technicianId);
    }
  }
}
```

---

## 5. ETA Calculation Service

### 5.1 ETA Flow

```
1. Technician GPS position update received
2. Check if technician has active EN_ROUTE work order
3. If yes, calculate ETA:
   a. Get technician current position
   b. Get next work order position
   c. Call OpenRouteService Directions API for duration
   d. Or estimate using straight-line distance + speed factor
4. Broadcast ETA to tracking:{workOrderId} room
5. Debounce: recalculate max every 30 seconds
```

### 5.2 Implementation

```typescript
// apps/api/src/modules/routes/eta.service.ts

export class EtaService {
  private etaCache: Map<string, { eta: number; calculatedAt: number }> = new Map();
  private readonly RECALCULATE_INTERVAL_MS = 30000; // 30 seconds

  async calculateEta(
    technicianLat: number,
    technicianLng: number,
    destinationLat: number,
    destinationLng: number,
    workOrderId: string,
  ): Promise<{ etaMinutes: number; distanceMeters: number }> {
    // Check cache
    const cached = this.etaCache.get(workOrderId);
    if (cached && Date.now() - cached.calculatedAt < this.RECALCULATE_INTERVAL_MS) {
      return { etaMinutes: cached.eta, distanceMeters: 0 };
    }

    try {
      // Use ORS Directions API
      const response = await this.orsClient.getDirections(
        [technicianLng, technicianLat],
        [destinationLng, destinationLat],
      );

      const durationSeconds = response.routes[0].summary.duration;
      const distanceMeters = response.routes[0].summary.distance;
      const etaMinutes = Math.ceil(durationSeconds / 60);

      this.etaCache.set(workOrderId, { eta: etaMinutes, calculatedAt: Date.now() });

      return { etaMinutes, distanceMeters };
    } catch (error) {
      // Fallback: estimate using straight-line distance
      const straightLineMeters = this.haversineDistance(
        technicianLat, technicianLng,
        destinationLat, destinationLng,
      );

      // Assume average speed of 40 km/h in urban areas
      // Road distance ≈ 1.3x straight-line distance
      const roadDistanceMeters = straightLineMeters * 1.3;
      const etaMinutes = Math.ceil(roadDistanceMeters / (40000 / 60));

      return { etaMinutes, distanceMeters: roadDistanceMeters };
    }
  }

  private haversineDistance(
    lat1: number, lng1: number,
    lat2: number, lng2: number,
  ): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
```

---

## 6. Invoice Generation Logic

### 6.1 Auto-Generation Flow

```
Work Order COMPLETED event
  → InvoiceService.onWorkOrderCompleted()
  → Calculate amount:
    1. Service base price (from service catalog)
    2. Labor: hourlyRate × actualDuration
    3. Tax calculation
  → Create Invoice record (status: DRAFT)
  → Update work order status to INVOICED
  → Send invoice to customer (email/SMS)
```

### 6.2 Implementation

```typescript
// apps/api/src/modules/invoices/invoice.service.ts

async generateInvoice(workOrderId: string): Promise<Invoice> {
  const workOrder = await this.prisma.workOrder.findUniqueOrThrow({
    where: { id: workOrderId },
    include: { technician: true, customer: true },
  });

  // Calculate labor hours
  const laborHours = workOrder.startedAt && workOrder.completedAt
    ? (workOrder.completedAt.getTime() - workOrder.startedAt.getTime()) / 3600000
    : (workOrder.estimatedDuration || 60) / 60;

  const hourlyRate = workOrder.technician?.hourlyRate || 75;
  const laborAmount = laborHours * Number(hourlyRate);

  // Build line items
  const lineItems = [
    {
      description: `${workOrder.serviceType} — Labor`,
      quantity: Math.round(laborHours * 100) / 100,
      unitPrice: Number(hourlyRate),
      amount: Math.round(laborAmount * 100) / 100,
    },
  ];

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const taxRate = 0.08; // 8% — configurable per company
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const total = subtotal + tax;

  // Generate invoice number
  const invoiceNumber = await this.generateInvoiceNumber(workOrder.companyId);

  return this.prisma.invoice.create({
    data: {
      companyId: workOrder.companyId,
      workOrderId: workOrder.id,
      invoiceNumber,
      amount: subtotal,
      tax,
      total,
      description: `${workOrder.serviceType} at ${workOrder.address}`,
      lineItems,
      dueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000), // Net 30
    },
  });
}

private async generateInvoiceNumber(companyId: string): Promise<string> {
  const count = await this.prisma.invoice.count({
    where: { companyId },
  });
  const year = new Date().getFullYear();
  return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
}
```

### 6.3 Stripe Payment Integration

```typescript
async createPaymentIntent(invoiceId: string): Promise<{ clientSecret: string }> {
  const invoice = await this.prisma.invoice.findUniqueOrThrow({
    where: { id: invoiceId },
    include: { workOrder: { include: { customer: true } } },
  });

  if (invoice.status === 'PAID') {
    throw new BadRequestException('Invoice is already paid');
  }

  const paymentIntent = await this.stripe.paymentIntents.create({
    amount: Math.round(Number(invoice.total) * 100), // cents
    currency: 'usd',
    metadata: {
      invoiceId: invoice.id,
      workOrderId: invoice.workOrderId,
      companyId: invoice.companyId,
    },
  });

  await this.prisma.invoice.update({
    where: { id: invoiceId },
    data: { stripePaymentIntentId: paymentIntent.id },
  });

  return { clientSecret: paymentIntent.client_secret! };
}

async handlePaymentSuccess(paymentIntentId: string): Promise<void> {
  const invoice = await this.prisma.invoice.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
  });

  if (!invoice) return;

  await this.prisma.$transaction(async (tx) => {
    await tx.invoice.update({
      where: { id: invoice.id },
      data: { status: 'PAID', paidAt: new Date() },
    });

    await tx.workOrder.update({
      where: { id: invoice.workOrderId },
      data: { status: 'PAID' },
    });

    await tx.workOrderStatusHistory.create({
      data: {
        workOrderId: invoice.workOrderId,
        companyId: invoice.companyId,
        fromStatus: 'INVOICED',
        toStatus: 'PAID',
        note: `Payment received via Stripe (${paymentIntentId})`,
      },
    });
  });
}
```

---

## 7. Notification Service

### 7.1 Notification Types

| Event | Channel | Recipient | Message |
|-------|---------|-----------|---------|
| Work order assigned | WebSocket + SMS | Technician | "New job assigned: {title} at {address}" |
| Technician en route | SMS | Customer | "Your technician {name} is on the way. Track: {trackingUrl}" |
| Technician arrived | SMS | Customer | "Your technician has arrived" |
| Invoice sent | Email | Customer | Invoice details + payment link |
| Payment received | Email | Customer | Payment confirmation receipt |

### 7.2 SMS Integration (Mock for MVP)

```typescript
// apps/api/src/modules/notifications/sms.service.ts

export class SmsService {
  async sendSms(to: string, message: string): Promise<void> {
    if (process.env.NODE_ENV === 'production' && !process.env.SMS_PROVIDER_KEY) {
      throw new Error('SMS provider not configured for production');
    }

    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`[MOCK SMS] To: ${to}, Message: ${message}`);
      return;
    }

    // Production: integrate with Twilio/MessageBird/etc.
    await this.smsProvider.send({ to, body: message });
  }
}
```

---

## 8. Dispatch Analytics

### 8.1 Metrics Calculations

```typescript
// apps/api/src/modules/dispatch/analytics.service.ts

async getAnalytics(companyId: string, startDate: Date, endDate: Date) {
  // Jobs completed in period
  const jobsCompleted = await this.prisma.workOrder.count({
    where: {
      companyId,
      completedAt: { gte: startDate, lte: endDate },
    },
  });

  // Average completion time (assigned → completed)
  const completionTimes = await this.prisma.$queryRaw<
    Array<{ avg_minutes: number }>
  >`
    SELECT AVG(
      EXTRACT(EPOCH FROM ("completedAt" - "startedAt")) / 60
    ) as avg_minutes
    FROM work_orders
    WHERE "companyId" = ${companyId}::uuid
      AND "completedAt" IS NOT NULL
      AND "startedAt" IS NOT NULL
      AND "completedAt" >= ${startDate}
      AND "completedAt" <= ${endDate}
  `;

  // Revenue metrics
  const revenue = await this.prisma.invoice.aggregate({
    where: {
      companyId,
      createdAt: { gte: startDate, lte: endDate },
    },
    _sum: { total: true },
  });

  const paid = await this.prisma.invoice.aggregate({
    where: {
      companyId,
      status: 'PAID',
      paidAt: { gte: startDate, lte: endDate },
    },
    _sum: { total: true },
  });

  // Jobs by status
  const jobsByStatus = await this.prisma.workOrder.groupBy({
    by: ['status'],
    where: { companyId },
    _count: true,
  });

  // Jobs by priority
  const jobsByPriority = await this.prisma.workOrder.groupBy({
    by: ['priority'],
    where: {
      companyId,
      createdAt: { gte: startDate, lte: endDate },
    },
    _count: true,
  });

  return {
    jobsCompleted,
    avgCompletionTimeMinutes: completionTimes[0]?.avg_minutes || 0,
    revenueInvoiced: Number(revenue._sum.total) || 0,
    revenuePaid: Number(paid._sum.total) || 0,
    revenueOutstanding: (Number(revenue._sum.total) || 0) - (Number(paid._sum.total) || 0),
    jobsByStatus: jobsByStatus.map(j => ({ status: j.status, count: j._count })),
    jobsByPriority: jobsByPriority.map(j => ({ priority: j.priority, count: j._count })),
  };
}
```

---

## 9. Rate Limiting Configuration

### 9.1 Throttle Settings

```typescript
// Rate limit tiers
const RATE_LIMITS = {
  // Default: 100 requests per 60 seconds
  default: { ttl: 60000, limit: 100 },

  // Auth endpoints: 10 attempts per 60 seconds
  auth: { ttl: 60000, limit: 10 },

  // GPS updates: 20 per 10 seconds per connection
  gps: { ttl: 10000, limit: 20 },

  // Route optimization: 10 per 60 seconds (ORS rate limit protection)
  optimization: { ttl: 60000, limit: 10 },

  // Photo upload: 20 per 60 seconds
  upload: { ttl: 60000, limit: 20 },
};
```

### 9.2 Registration and Application

```typescript
// app.module.ts — register throttler
ThrottlerModule.forRoot([{
  ttl: 60000,
  limit: 100,
}]),

// Controller-level override
@Throttle({ default: { ttl: 60000, limit: 10 } })
@Controller('auth')
export class AuthController { ... }

// Guard applied globally
app.useGlobalGuards(new ThrottlerGuard());
```

---

## 10. Caching Strategy

### 10.1 Redis Cache Keys

| Key Pattern | TTL | Content |
|-------------|-----|---------|
| `route:${technicianId}:${date}` | 1 hour | Optimized route data |
| `directions:${hash}` | 24 hours | ORS directions response |
| `eta:${workOrderId}` | 30 seconds | Current ETA |
| `technician:${id}:position` | 60 seconds | Latest GPS position |

### 10.2 Cache Implementation

```typescript
// Redis cache service
@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  async getRoute(technicianId: string, date: string): Promise<Route | null> {
    return this.cache.get(`route:${technicianId}:${date}`);
  }

  async setRoute(technicianId: string, date: string, route: Route): Promise<void> {
    await this.cache.set(`route:${technicianId}:${date}`, route, 3600);
  }

  async getEta(workOrderId: string): Promise<number | null> {
    return this.cache.get(`eta:${workOrderId}`);
  }

  async setEta(workOrderId: string, etaMinutes: number): Promise<void> {
    await this.cache.set(`eta:${workOrderId}`, etaMinutes, 30);
  }
}
```
