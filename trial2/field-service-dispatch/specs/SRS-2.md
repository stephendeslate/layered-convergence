# System Requirements Specification — Part 2: Database Schema & API

## Field Service Dispatch & Management Platform

**Version:** 1.0
**Date:** 2026-03-20
**Status:** Approved

---

## 1. Database Schema

### 1.1 Prisma Schema

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [postgis]
}

// ============================================================================
// TENANT
// ============================================================================

model Company {
  id          String   @id @default(uuid()) @db.Uuid
  name        String
  slug        String   @unique
  address     String?
  phone       String?
  email       String?
  logoUrl     String?
  serviceArea Json?    // GeoJSON polygon of service area
  settings    Json?    // Company-specific settings
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  users       User[]
  technicians Technician[]
  customers   Customer[]
  workOrders  WorkOrder[]
  routes      Route[]
  invoices    Invoice[]

  @@map("companies")
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

enum UserRole {
  ADMIN
  DISPATCHER
  TECHNICIAN
  CUSTOMER
}

model User {
  id           String   @id @default(uuid()) @db.Uuid
  companyId    String   @db.Uuid
  email        String   @unique
  passwordHash String
  firstName    String
  lastName     String
  role         UserRole
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relations
  company      Company     @relation(fields: [companyId], references: [id])
  technician   Technician? @relation("UserTechnician")

  @@index([companyId])
  @@map("users")
}

// ============================================================================
// TECHNICIANS
// ============================================================================

enum TechnicianStatus {
  AVAILABLE
  BUSY
  OFF_DUTY
  ON_BREAK
}

model Technician {
  id          String           @id @default(uuid()) @db.Uuid
  companyId   String           @db.Uuid
  userId      String?          @unique @db.Uuid
  name        String
  email       String
  phone       String?
  skills      String[]         // e.g., ["HVAC", "Plumbing", "Electrical"]
  status      TechnicianStatus @default(AVAILABLE)
  currentLat  Float?
  currentLng  Float?
  hourlyRate  Decimal?         @db.Decimal(10, 2)
  isActive    Boolean          @default(true)
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  // PostGIS location column added via raw migration
  // location geometry(Point, 4326)

  // Relations
  company     Company      @relation(fields: [companyId], references: [id])
  user        User?        @relation("UserTechnician", fields: [userId], references: [id])
  workOrders  WorkOrder[]
  routes      Route[]

  @@index([companyId])
  @@index([companyId, status])
  @@map("technicians")
}

// ============================================================================
// CUSTOMERS
// ============================================================================

model Customer {
  id        String   @id @default(uuid()) @db.Uuid
  companyId String   @db.Uuid
  userId    String?  @unique @db.Uuid
  name      String
  email     String?
  phone     String?
  address   String
  lat       Float?
  lng       Float?
  notes     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // PostGIS location column added via raw migration
  // location geometry(Point, 4326)

  // Relations
  company    Company     @relation(fields: [companyId], references: [id])
  workOrders WorkOrder[]

  @@index([companyId])
  @@map("customers")
}

// ============================================================================
// WORK ORDERS
// ============================================================================

enum WorkOrderStatus {
  UNASSIGNED
  ASSIGNED
  EN_ROUTE
  ON_SITE
  IN_PROGRESS
  COMPLETED
  INVOICED
  PAID
}

enum WorkOrderPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}

model WorkOrder {
  id            String            @id @default(uuid()) @db.Uuid
  companyId     String            @db.Uuid
  customerId    String            @db.Uuid
  technicianId  String?           @db.Uuid
  title         String
  description   String?
  serviceType   String            // e.g., "HVAC Repair", "Plumbing"
  priority      WorkOrderPriority @default(NORMAL)
  status        WorkOrderStatus   @default(UNASSIGNED)
  scheduledAt   DateTime?
  startedAt     DateTime?
  completedAt   DateTime?
  estimatedDuration Int?          // minutes
  address       String
  lat           Float
  lng           Float
  notes         String?
  trackingToken String?           @unique // For customer tracking portal
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  // Relations
  company       Company                @relation(fields: [companyId], references: [id])
  customer      Customer               @relation(fields: [customerId], references: [id])
  technician    Technician?            @relation(fields: [technicianId], references: [id])
  statusHistory WorkOrderStatusHistory[]
  photos        JobPhoto[]
  invoice       Invoice?

  @@index([companyId])
  @@index([companyId, status])
  @@index([companyId, technicianId])
  @@index([trackingToken])
  @@map("work_orders")
}

// ============================================================================
// WORK ORDER STATUS HISTORY
// ============================================================================

model WorkOrderStatusHistory {
  id          String          @id @default(uuid()) @db.Uuid
  workOrderId String          @db.Uuid
  companyId   String          @db.Uuid
  fromStatus  WorkOrderStatus?
  toStatus    WorkOrderStatus
  changedBy   String?         @db.Uuid // userId
  note        String?
  createdAt   DateTime        @default(now())

  // Relations
  workOrder   WorkOrder @relation(fields: [workOrderId], references: [id])

  @@index([workOrderId])
  @@index([companyId])
  @@map("work_order_status_history")
}

// ============================================================================
// ROUTES
// ============================================================================

model Route {
  id                String   @id @default(uuid()) @db.Uuid
  companyId         String   @db.Uuid
  technicianId      String   @db.Uuid
  date              DateTime @db.Date
  waypoints         Json     // Array of { workOrderId, lat, lng, order }
  optimizedOrder    Int[]    // Ordered indices into waypoints
  polyline          Json?    // GeoJSON LineString for map rendering
  estimatedDuration Int?     // seconds
  estimatedDistance Int?     // meters
  status            String   @default("PLANNED") // PLANNED, IN_PROGRESS, COMPLETED
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  company    Company    @relation(fields: [companyId], references: [id])
  technician Technician @relation(fields: [technicianId], references: [id])

  @@unique([technicianId, date])
  @@index([companyId])
  @@map("routes")
}

// ============================================================================
// JOB PHOTOS
// ============================================================================

model JobPhoto {
  id          String   @id @default(uuid()) @db.Uuid
  workOrderId String   @db.Uuid
  companyId   String   @db.Uuid
  url         String
  caption     String?
  uploadedBy  String?  @db.Uuid // technicianId or userId
  createdAt   DateTime @default(now())

  // Relations
  workOrder WorkOrder @relation(fields: [workOrderId], references: [id])

  @@index([workOrderId])
  @@index([companyId])
  @@map("job_photos")
}

// ============================================================================
// INVOICES
// ============================================================================

enum InvoiceStatus {
  DRAFT
  SENT
  PAID
  VOID
}

model Invoice {
  id                    String        @id @default(uuid()) @db.Uuid
  companyId             String        @db.Uuid
  workOrderId           String        @unique @db.Uuid
  invoiceNumber         String
  amount                Decimal       @db.Decimal(10, 2)
  tax                   Decimal?      @db.Decimal(10, 2)
  total                 Decimal       @db.Decimal(10, 2)
  status                InvoiceStatus @default(DRAFT)
  description           String?
  lineItems             Json?         // Array of { description, quantity, unitPrice, amount }
  stripePaymentIntentId String?
  stripeInvoiceId       String?
  paidAt                DateTime?
  dueDate               DateTime?
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt

  // Relations
  company   Company   @relation(fields: [companyId], references: [id])
  workOrder WorkOrder @relation(fields: [workOrderId], references: [id])

  @@index([companyId])
  @@index([companyId, status])
  @@map("invoices")
}
```

### 1.2 PostGIS Migration

```sql
-- Migration: enable_postgis
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geometry columns to technicians
ALTER TABLE "technicians" ADD COLUMN IF NOT EXISTS
  "location" geometry(Point, 4326);

CREATE INDEX IF NOT EXISTS idx_technician_location
  ON "technicians" USING GIST("location");

-- Add geometry columns to customers
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS
  "location" geometry(Point, 4326);

CREATE INDEX IF NOT EXISTS idx_customer_location
  ON "customers" USING GIST("location");

-- Trigger to sync lat/lng with geometry on technician update
CREATE OR REPLACE FUNCTION sync_technician_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."currentLat" IS NOT NULL AND NEW."currentLng" IS NOT NULL THEN
    NEW."location" = ST_SetSRID(ST_MakePoint(NEW."currentLng", NEW."currentLat"), 4326);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_technician_location
  BEFORE INSERT OR UPDATE OF "currentLat", "currentLng"
  ON "technicians"
  FOR EACH ROW
  EXECUTE FUNCTION sync_technician_location();

-- Trigger to sync lat/lng with geometry on customer update
CREATE OR REPLACE FUNCTION sync_customer_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."lat" IS NOT NULL AND NEW."lng" IS NOT NULL THEN
    NEW."location" = ST_SetSRID(ST_MakePoint(NEW."lng", NEW."lat"), 4326);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_customer_location
  BEFORE INSERT OR UPDATE OF "lat", "lng"
  ON "customers"
  FOR EACH ROW
  EXECUTE FUNCTION sync_customer_location();
```

### 1.3 RLS Policies

```sql
-- Enable RLS on all company-scoped tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "technicians" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "work_orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "work_order_status_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "routes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "job_photos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;

-- Users policy
CREATE POLICY users_tenant_isolation ON "users"
  USING ("companyId" = current_setting('app.company_id', true)::uuid);

-- Technicians policy
CREATE POLICY technicians_tenant_isolation ON "technicians"
  USING ("companyId" = current_setting('app.company_id', true)::uuid);

-- Customers policy
CREATE POLICY customers_tenant_isolation ON "customers"
  USING ("companyId" = current_setting('app.company_id', true)::uuid);

-- Work Orders policy
CREATE POLICY work_orders_tenant_isolation ON "work_orders"
  USING ("companyId" = current_setting('app.company_id', true)::uuid);

-- Work Order Status History policy
CREATE POLICY work_order_status_history_tenant_isolation ON "work_order_status_history"
  USING ("companyId" = current_setting('app.company_id', true)::uuid);

-- Routes policy
CREATE POLICY routes_tenant_isolation ON "routes"
  USING ("companyId" = current_setting('app.company_id', true)::uuid);

-- Job Photos policy
CREATE POLICY job_photos_tenant_isolation ON "job_photos"
  USING ("companyId" = current_setting('app.company_id', true)::uuid);

-- Invoices policy
CREATE POLICY invoices_tenant_isolation ON "invoices"
  USING ("companyId" = current_setting('app.company_id', true)::uuid);

-- Bypass policy for the application role (Prisma connection)
-- The application sets company_id per-request, RLS filters accordingly
-- Superuser/owner bypasses RLS by default in PostgreSQL
```

---

## 2. REST API Endpoints

### 2.1 Authentication

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| POST | `/api/auth/register` | Register new company + admin user | None | — |
| POST | `/api/auth/login` | Login, returns JWT | None | — |
| POST | `/api/auth/refresh` | Refresh JWT token | JWT | Any |
| GET | `/api/auth/me` | Get current user profile | JWT | Any |

#### POST `/api/auth/register`
```typescript
// Request
{
  companyName: string;      // required
  email: string;            // required, valid email
  password: string;         // required, min 8 chars
  firstName: string;        // required
  lastName: string;         // required
}

// Response 201
{
  user: { id, email, firstName, lastName, role };
  company: { id, name, slug };
  accessToken: string;
}
```

#### POST `/api/auth/login`
```typescript
// Request
{
  email: string;
  password: string;
}

// Response 200
{
  user: { id, email, firstName, lastName, role, companyId };
  accessToken: string;
}
```

---

### 2.2 Companies

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| GET | `/api/companies/current` | Get current company details | JWT | ADMIN |
| PATCH | `/api/companies/current` | Update company settings | JWT | ADMIN |

---

### 2.3 Work Orders

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| GET | `/api/work-orders` | List work orders (filtered by company via RLS) | JWT | ADMIN, DISPATCHER |
| POST | `/api/work-orders` | Create work order | JWT | ADMIN, DISPATCHER |
| GET | `/api/work-orders/:id` | Get work order details | JWT | ADMIN, DISPATCHER, TECHNICIAN |
| PATCH | `/api/work-orders/:id` | Update work order | JWT | ADMIN, DISPATCHER |
| POST | `/api/work-orders/:id/transition` | Transition work order status | JWT | ADMIN, DISPATCHER, TECHNICIAN |
| GET | `/api/work-orders/:id/history` | Get status history | JWT | ADMIN, DISPATCHER |
| POST | `/api/work-orders/:id/assign` | Assign to technician | JWT | ADMIN, DISPATCHER |
| POST | `/api/work-orders/:id/auto-assign` | Auto-assign nearest technician | JWT | ADMIN, DISPATCHER |
| GET | `/api/work-orders/tracking/:token` | Get work order by tracking token | None | — |

#### POST `/api/work-orders`
```typescript
// Request
{
  customerId: string;       // required, UUID
  title: string;            // required
  description?: string;
  serviceType: string;      // required
  priority?: WorkOrderPriority; // default NORMAL
  scheduledAt?: string;     // ISO datetime
  estimatedDuration?: number; // minutes
  address: string;          // required
  lat: number;              // required
  lng: number;              // required
  notes?: string;
}

// Response 201
{
  id: string;
  companyId: string;
  customerId: string;
  title: string;
  status: "UNASSIGNED";
  trackingToken: string;
  // ... all fields
}
```

#### POST `/api/work-orders/:id/transition`
```typescript
// Request
{
  toStatus: WorkOrderStatus;  // required
  note?: string;
}

// Response 200
{
  id: string;
  status: WorkOrderStatus;   // new status
  statusHistory: WorkOrderStatusHistory[];
}

// Error 400
{
  statusCode: 400;
  message: "Invalid transition from UNASSIGNED to COMPLETED";
}
```

#### POST `/api/work-orders/:id/assign`
```typescript
// Request
{
  technicianId: string;   // required, UUID
}

// Response 200
{
  id: string;
  technicianId: string;
  status: "ASSIGNED";
}
```

---

### 2.4 Technicians

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| GET | `/api/technicians` | List company technicians | JWT | ADMIN, DISPATCHER |
| POST | `/api/technicians` | Create technician | JWT | ADMIN |
| GET | `/api/technicians/:id` | Get technician details | JWT | ADMIN, DISPATCHER |
| PATCH | `/api/technicians/:id` | Update technician | JWT | ADMIN |
| GET | `/api/technicians/:id/work-orders` | Get technician's assigned work orders | JWT | ADMIN, DISPATCHER, TECHNICIAN |
| PATCH | `/api/technicians/:id/status` | Update technician status | JWT | ADMIN, DISPATCHER, TECHNICIAN |
| PATCH | `/api/technicians/:id/location` | Update technician location | JWT | TECHNICIAN |
| GET | `/api/technicians/available` | List available technicians | JWT | ADMIN, DISPATCHER |
| GET | `/api/technicians/nearest` | Find nearest technician to a location | JWT | ADMIN, DISPATCHER |

#### POST `/api/technicians`
```typescript
// Request
{
  name: string;             // required
  email: string;            // required
  phone?: string;
  skills: string[];         // required, at least one
  hourlyRate?: number;
}

// Response 201
{
  id: string;
  companyId: string;
  name: string;
  skills: string[];
  status: "AVAILABLE";
}
```

#### GET `/api/technicians/nearest`
```typescript
// Query Parameters
{
  lat: number;              // required
  lng: number;              // required
  skills?: string[];        // optional filter
  radiusMeters?: number;    // default 50000 (50km)
}

// Response 200
{
  technicians: [
    {
      id: string;
      name: string;
      skills: string[];
      distanceMeters: number;
      currentLat: number;
      currentLng: number;
    }
  ]
}
```

---

### 2.5 Customers

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| GET | `/api/customers` | List company customers | JWT | ADMIN, DISPATCHER |
| POST | `/api/customers` | Create customer | JWT | ADMIN, DISPATCHER |
| GET | `/api/customers/:id` | Get customer details | JWT | ADMIN, DISPATCHER |
| PATCH | `/api/customers/:id` | Update customer | JWT | ADMIN, DISPATCHER |
| GET | `/api/customers/:id/work-orders` | Get customer's work orders | JWT | ADMIN, DISPATCHER, CUSTOMER |

#### POST `/api/customers`
```typescript
// Request
{
  name: string;             // required
  email?: string;
  phone?: string;
  address: string;          // required
  lat?: number;
  lng?: number;
  notes?: string;
}

// Response 201
{
  id: string;
  companyId: string;
  name: string;
  address: string;
}
```

---

### 2.6 Routes

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| GET | `/api/routes/technician/:technicianId` | Get technician's route for date | JWT | ADMIN, DISPATCHER, TECHNICIAN |
| POST | `/api/routes/optimize` | Optimize route for technician | JWT | ADMIN, DISPATCHER |
| GET | `/api/routes/:id` | Get route details | JWT | ADMIN, DISPATCHER |

#### POST `/api/routes/optimize`
```typescript
// Request
{
  technicianId: string;     // required, UUID
  date: string;             // required, YYYY-MM-DD
  workOrderIds?: string[];  // optional, specific work orders (default: all assigned for date)
}

// Response 200
{
  id: string;
  technicianId: string;
  date: string;
  waypoints: [
    { workOrderId: string; lat: number; lng: number; order: number; }
  ];
  optimizedOrder: number[];
  estimatedDuration: number;  // seconds
  estimatedDistance: number;  // meters
  polyline: GeoJSON.LineString;
}
```

---

### 2.7 Dispatch

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| GET | `/api/dispatch/board` | Get dispatch board data (work orders + technicians + routes) | JWT | ADMIN, DISPATCHER |
| POST | `/api/dispatch/auto-assign/:workOrderId` | Auto-assign nearest technician | JWT | ADMIN, DISPATCHER |
| GET | `/api/dispatch/analytics` | Get dispatch analytics | JWT | ADMIN |

#### GET `/api/dispatch/board`
```typescript
// Response 200
{
  workOrders: WorkOrder[];
  technicians: Technician[];
  routes: Route[];
  stats: {
    unassigned: number;
    assigned: number;
    enRoute: number;
    onSite: number;
    inProgress: number;
    completed: number;
    total: number;
  }
}
```

#### GET `/api/dispatch/analytics`
```typescript
// Query Parameters
{
  startDate: string;        // YYYY-MM-DD
  endDate: string;          // YYYY-MM-DD
}

// Response 200
{
  jobsCompleted: number;
  avgCompletionTimeMinutes: number;
  technicianUtilization: { technicianId: string; name: string; utilization: number; }[];
  revenueInvoiced: number;
  revenuePaid: number;
  revenueOutstanding: number;
  jobsByPriority: { priority: string; count: number; }[];
  jobsByStatus: { status: string; count: number; }[];
}
```

---

### 2.8 GPS

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| GET | `/api/gps/technician/:technicianId/position` | Get latest position | JWT | ADMIN, DISPATCHER |
| GET | `/api/gps/technician/:technicianId/history` | Get position history | JWT | ADMIN, DISPATCHER |

GPS position streaming is handled via WebSocket (see Section 3).

---

### 2.9 Invoices

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| GET | `/api/invoices` | List company invoices | JWT | ADMIN |
| GET | `/api/invoices/:id` | Get invoice details | JWT | ADMIN, CUSTOMER |
| PATCH | `/api/invoices/:id` | Update invoice (amount, line items) | JWT | ADMIN |
| POST | `/api/invoices/:id/send` | Mark invoice as sent | JWT | ADMIN |
| POST | `/api/invoices/:id/pay` | Create Stripe payment intent | JWT | ADMIN, CUSTOMER |
| POST | `/api/invoices/webhook` | Stripe webhook handler | Stripe signature | — |

#### POST `/api/invoices/:id/pay`
```typescript
// Response 200
{
  clientSecret: string;     // Stripe PaymentIntent client secret
  invoiceId: string;
  amount: number;
}
```

---

### 2.10 Photos

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| POST | `/api/photos/upload` | Upload job photo | JWT | TECHNICIAN |
| GET | `/api/photos/work-order/:workOrderId` | Get photos for work order | JWT | ADMIN, DISPATCHER, TECHNICIAN |
| DELETE | `/api/photos/:id` | Delete photo | JWT | ADMIN |

#### POST `/api/photos/upload`
```typescript
// Request: multipart/form-data
{
  file: File;               // required, image file
  workOrderId: string;      // required
  caption?: string;
}

// Response 201
{
  id: string;
  url: string;
  workOrderId: string;
  caption: string;
}
```

---

## 3. WebSocket API

### 3.1 Namespace: `/gps`

#### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `position:update` | `{ technicianId, lat, lng, heading?, speed?, timestamp }` | Technician sends position |
| `tracking:subscribe` | `{ workOrderId }` | Customer subscribes to tracking |
| `tracking:unsubscribe` | `{ workOrderId }` | Customer unsubscribes |

#### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `position:broadcast` | `{ technicianId, lat, lng, heading, speed, timestamp }` | Position update broadcast |
| `eta:update` | `{ workOrderId, etaMinutes, distanceMeters }` | ETA update for customer |
| `wo:status:changed` | `{ workOrderId, fromStatus, toStatus, timestamp }` | Work order status change |

### 3.2 Connection Authentication

```typescript
// Client connects with JWT in auth
const socket = io('wss://api.example.com/gps', {
  auth: {
    token: 'Bearer eyJhbGciOiJIUzI1NiIs...'
  }
});

// Server validates on connection
socket.on('connect_error', (err) => {
  if (err.message === 'Unauthorized') {
    // Handle auth failure
  }
});
```

### 3.3 Room Management

```typescript
// On connection, server joins the user to their company room
handleConnection(client: Socket) {
  const { companyId, userId, role } = validateJwt(client.handshake.auth.token);
  client.data.companyId = companyId;
  client.data.userId = userId;
  client.data.role = role;
  client.join(`company:${companyId}`);
}

// Customer subscribes to specific work order tracking
handleTrackingSubscribe(client: Socket, { workOrderId }) {
  // Verify work order belongs to client's company
  // Join tracking room
  client.join(`tracking:${workOrderId}`);
}
```

---

## 4. Data Validation Rules

### 4.1 Common Validations

| Field | Validation |
|-------|-----------|
| email | Valid email format (class-validator `@IsEmail()`) |
| phone | Optional, string (no format enforcement for international) |
| lat | Number between -90 and 90 |
| lng | Number between -180 and 180 |
| UUID fields | Valid UUID v4 format |
| status enums | Must be valid enum value |
| priority | Must be LOW, NORMAL, HIGH, or URGENT |
| amount (currency) | Decimal, >= 0, max 2 decimal places |
| password | Min 8 characters |
| skills | Array of non-empty strings |

### 4.2 DTO Examples

```typescript
// CreateWorkOrderDto
export class CreateWorkOrderDto {
  @IsUUID()
  customerId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  serviceType: string;

  @IsOptional()
  @IsEnum(WorkOrderPriority)
  priority?: WorkOrderPriority;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedDuration?: number;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

// TransitionWorkOrderDto
export class TransitionWorkOrderDto {
  @IsEnum(WorkOrderStatus)
  toStatus: WorkOrderStatus;

  @IsOptional()
  @IsString()
  note?: string;
}

// PositionUpdateDto
export class PositionUpdateDto {
  @IsUUID()
  technicianId: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  @IsOptional()
  @IsNumber()
  heading?: number;

  @IsOptional()
  @IsNumber()
  speed?: number;

  @IsDateString()
  timestamp: string;
}
```

---

## 5. Database Indexes

### 5.1 Performance Indexes

```sql
-- Work orders: frequent queries by company + status
CREATE INDEX idx_work_orders_company_status ON work_orders("companyId", status);

-- Work orders: technician's assigned work orders
CREATE INDEX idx_work_orders_company_technician ON work_orders("companyId", "technicianId");

-- Work orders: tracking token lookup (customer portal)
CREATE INDEX idx_work_orders_tracking_token ON work_orders("trackingToken");

-- Technicians: available technicians per company
CREATE INDEX idx_technicians_company_status ON technicians("companyId", status);

-- Technicians: spatial index for nearest queries
CREATE INDEX idx_technician_location ON technicians USING GIST(location);

-- Customers: spatial index for geocoding
CREATE INDEX idx_customer_location ON customers USING GIST(location);

-- Status history: work order timeline
CREATE INDEX idx_status_history_work_order ON work_order_status_history("workOrderId");

-- Invoices: company + status for financial queries
CREATE INDEX idx_invoices_company_status ON invoices("companyId", status);

-- Routes: technician + date lookup
CREATE UNIQUE INDEX idx_routes_technician_date ON routes("technicianId", date);
```

---

## 6. Seed Data Structure

### 6.1 Companies

| Company | Slug | Service Area |
|---------|------|-------------|
| AcePro HVAC Services | acepro-hvac | Denver Metro, CO |
| BlueWater Plumbing | bluewater-plumbing | Austin, TX |
| SparkRight Electrical | sparkright-electrical | Portland, OR |

### 6.2 Technicians (per company)

Each company gets 5-8 technicians with:
- Varied skill sets matching company type
- Initial GPS positions within the service area
- Mix of AVAILABLE and BUSY statuses
- Realistic names and contact info

### 6.3 Customers (per company)

Each company gets 10-15 customers with:
- Geocoded addresses within the service area
- Realistic names, addresses, phone numbers
- Mix of residential and commercial

### 6.4 Work Orders (per company)

Each company gets 15-25 work orders with:
- Distribution across all statuses
- Assigned technicians for non-UNASSIGNED orders
- Status history entries for each transition
- Scheduled dates within the current week
- Mix of priorities

### 6.5 Routes

Pre-computed routes for active technicians showing:
- Optimized stop orders
- Cached polyline data for map rendering
- Realistic duration and distance estimates
