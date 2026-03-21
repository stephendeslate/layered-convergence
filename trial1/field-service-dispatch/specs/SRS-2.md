# Software Requirements Specification — Data Model (SRS-2)

**Project:** Field Service Dispatch
**Version:** 1.0
**Date:** 2026-03-20
**Status:** Draft

---

## 1. Purpose

This document defines the complete data model for the Field Service Dispatch platform, including the Prisma schema, enumerations, relationships, Row Level Security policies, spatial indexes, and API endpoint summary. It implements the entities and rules defined in §BRD and §PRD.

## 2. Enumerations

### 2.1 Work Order Status

```prisma
enum WorkOrderStatus {
  UNASSIGNED
  ASSIGNED
  EN_ROUTE
  ON_SITE
  IN_PROGRESS
  COMPLETED
  INVOICED
  PAID
  CANCELLED
}
```

State transitions are defined in §SRS-3. The CANCELLED state can be reached from any state except PAID.

### 2.2 Technician Status

```prisma
enum TechnicianStatus {
  AVAILABLE
  EN_ROUTE
  ON_JOB
  ON_BREAK
  OFF_DUTY
}
```

Derived from work order state transitions and explicit technician actions.

### 2.3 Priority

```prisma
enum Priority {
  LOW
  NORMAL
  HIGH
  URGENT
}
```

### 2.4 Invoice Status

```prisma
enum InvoiceStatus {
  DRAFT
  SENT
  PAID
  VOID
  OVERDUE
}
```

### 2.5 Service Type

```prisma
enum ServiceType {
  HVAC_INSTALL
  HVAC_REPAIR
  HVAC_MAINTENANCE
  PLUMBING_REPAIR
  PLUMBING_INSTALL
  ELECTRICAL_REPAIR
  ELECTRICAL_INSTALL
  GENERAL_MAINTENANCE
  CLEANING
  PEST_CONTROL
  LANDSCAPING
  APPLIANCE_REPAIR
  OTHER
}
```

### 2.6 User Role

```prisma
enum UserRole {
  ADMIN
  DISPATCHER
  TECHNICIAN
  CUSTOMER
}
```

### 2.7 Notification Channel

```prisma
enum NotificationChannel {
  SMS
  EMAIL
  PUSH
}
```

### 2.8 Notification Type

```prisma
enum NotificationType {
  WORK_ORDER_CREATED
  TECHNICIAN_DISPATCHED
  TECHNICIAN_EN_ROUTE
  ARRIVING_SOON_15
  ARRIVING_SOON_5
  TECHNICIAN_ARRIVED
  JOB_COMPLETED
  INVOICE_SENT
  PAYMENT_RECEIVED
  JOB_CANCELLED
  SCHEDULE_CHANGE
  NEW_ASSIGNMENT
}
```

### 2.9 Line Item Type

```prisma
enum LineItemType {
  LABOR
  MATERIAL
  FLAT_RATE
  DISCOUNT
  TAX
}
```

## 3. Complete Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions", "multiSchema"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [postgis]
}

// ============================================================
// TENANT
// ============================================================

model Company {
  id                String   @id @default(cuid())
  name              String
  slug              String   @unique
  email             String
  phone             String?
  logoUrl           String?
  website           String?
  taxRate           Decimal  @default(0) @db.Decimal(5, 4)
  serviceAreaPolygon String? // GeoJSON polygon stored as text
  timezone          String   @default("America/New_York")
  settings          Json     @default("{}")
  stripeCustomerId  String?  @unique
  stripeAccountId   String?  @unique

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users        User[]
  technicians  Technician[]
  customers    Customer[]
  workOrders   WorkOrder[]
  invoices     Invoice[]

  @@map("companies")
}

// ============================================================
// USERS & AUTH
// ============================================================

model User {
  id           String   @id @default(cuid())
  companyId    String
  email        String
  passwordHash String
  firstName    String
  lastName     String
  role         UserRole
  phone        String?
  avatarUrl    String?
  isActive     Boolean  @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  company              Company               @relation(fields: [companyId], references: [id], onDelete: Cascade)
  technicianProfile    Technician?
  workOrderHistory     WorkOrderStatusHistory[]
  refreshTokens        RefreshToken[]

  @@unique([companyId, email])
  @@index([companyId])
  @@map("users")
}

model RefreshToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  revokedAt DateTime?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@map("refresh_tokens")
}

// ============================================================
// TECHNICIAN
// ============================================================

model Technician {
  id              String           @id @default(cuid())
  companyId       String
  userId          String           @unique
  status          TechnicianStatus @default(OFF_DUTY)
  skills          ServiceType[]
  maxJobsPerDay   Int              @default(8)
  currentLatitude Decimal?         @db.Decimal(10, 7)
  currentLongitude Decimal?        @db.Decimal(10, 7)
  lastPositionAt  DateTime?
  vehicleInfo     String?
  color           String           @default("#3B82F6") // Marker color on map
  simulationMode  Boolean          @default(false)

  // Schedule: simple daily start/end times (JSON with day-of-week keys)
  schedule Json @default("{}")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  company       Company          @relation(fields: [companyId], references: [id], onDelete: Cascade)
  user          User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  workOrders    WorkOrder[]
  positions     TechnicianPosition[]
  routes        Route[]

  @@index([companyId])
  @@index([companyId, status])
  @@index([currentLatitude, currentLongitude])
  @@map("technicians")
}

model TechnicianPosition {
  id           String   @id @default(cuid())
  companyId    String
  technicianId String
  latitude     Decimal  @db.Decimal(10, 7)
  longitude    Decimal  @db.Decimal(10, 7)
  accuracy     Decimal? @db.Decimal(8, 2) // meters
  heading      Decimal? @db.Decimal(6, 2) // degrees
  speed        Decimal? @db.Decimal(8, 2) // m/s
  recordedAt   DateTime

  createdAt DateTime @default(now())

  technician Technician @relation(fields: [technicianId], references: [id], onDelete: Cascade)

  @@index([companyId])
  @@index([technicianId, recordedAt])
  @@index([recordedAt]) // For retention purge
  @@index([latitude, longitude])
  @@map("technician_positions")
}

// ============================================================
// CUSTOMER
// ============================================================

model Customer {
  id        String  @id @default(cuid())
  companyId String
  firstName String
  lastName  String
  email     String
  phone     String?
  address   String?
  city      String?
  state     String?
  zipCode   String?
  latitude  Decimal? @db.Decimal(10, 7)
  longitude Decimal? @db.Decimal(10, 7)
  notes     String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  company    Company     @relation(fields: [companyId], references: [id], onDelete: Cascade)
  workOrders WorkOrder[]
  invoices   Invoice[]
  magicLinks MagicLink[]

  @@unique([companyId, email])
  @@index([companyId])
  @@map("customers")
}

model MagicLink {
  id         String   @id @default(cuid())
  customerId String
  token      String   @unique
  expiresAt  DateTime
  usedAt     DateTime?
  createdAt  DateTime @default(now())

  customer Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)

  @@index([token])
  @@map("magic_links")
}

// ============================================================
// WORK ORDER
// ============================================================

model WorkOrder {
  id               String          @id @default(cuid())
  companyId        String
  customerId       String
  technicianId     String?
  referenceNumber  String          // Company-scoped sequential number (e.g., WO-00042)
  status           WorkOrderStatus @default(UNASSIGNED)
  priority         Priority        @default(NORMAL)
  serviceType      ServiceType
  description      String?
  notes            String?

  // Location
  address          String
  city             String
  state            String
  zipCode          String
  latitude         Decimal         @db.Decimal(10, 7)
  longitude        Decimal         @db.Decimal(10, 7)

  // Scheduling
  scheduledStart   DateTime
  scheduledEnd     DateTime
  estimatedMinutes Int             @default(60)
  actualStart      DateTime?
  actualEnd        DateTime?

  // Customer tracking
  trackingToken    String?         @unique // UUID for customer tracking portal
  trackingExpiresAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  company        Company                @relation(fields: [companyId], references: [id], onDelete: Cascade)
  customer       Customer               @relation(fields: [customerId], references: [id])
  technician     Technician?            @relation(fields: [technicianId], references: [id])
  statusHistory  WorkOrderStatusHistory[]
  lineItems      LineItem[]
  photos         JobPhoto[]
  invoice        Invoice?
  routeStops     RouteStop[]
  notifications  Notification[]

  @@unique([companyId, referenceNumber])
  @@index([companyId])
  @@index([companyId, status])
  @@index([companyId, scheduledStart])
  @@index([companyId, technicianId])
  @@index([customerId])
  @@index([trackingToken])
  @@index([latitude, longitude])
  @@map("work_orders")
}

model WorkOrderStatusHistory {
  id           String          @id @default(cuid())
  companyId    String
  workOrderId  String
  fromStatus   WorkOrderStatus?
  toStatus     WorkOrderStatus
  changedById  String?
  notes        String?
  latitude     Decimal?        @db.Decimal(10, 7) // GPS at time of change
  longitude    Decimal?        @db.Decimal(10, 7)

  createdAt DateTime @default(now())

  workOrder WorkOrder @relation(fields: [workOrderId], references: [id], onDelete: Cascade)
  changedBy User?     @relation(fields: [changedById], references: [id])

  @@index([companyId])
  @@index([workOrderId, createdAt])
  @@map("work_order_status_history")
}

model LineItem {
  id          String       @id @default(cuid())
  companyId   String
  workOrderId String
  invoiceId   String?
  type        LineItemType
  description String
  quantity    Decimal      @db.Decimal(10, 2)
  unitPrice   Decimal      @db.Decimal(10, 2)
  totalPrice  Decimal      @db.Decimal(10, 2)
  sortOrder   Int          @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  workOrder WorkOrder @relation(fields: [workOrderId], references: [id], onDelete: Cascade)
  invoice   Invoice?  @relation(fields: [invoiceId], references: [id])

  @@index([companyId])
  @@index([workOrderId])
  @@index([invoiceId])
  @@map("line_items")
}

model JobPhoto {
  id          String  @id @default(cuid())
  companyId   String
  workOrderId String
  technicianId String?
  url         String
  thumbnailUrl String?
  caption     String?
  mimeType    String  @default("image/jpeg")
  sizeBytes   Int?
  latitude    Decimal? @db.Decimal(10, 7)
  longitude   Decimal? @db.Decimal(10, 7)

  createdAt DateTime @default(now())

  workOrder WorkOrder @relation(fields: [workOrderId], references: [id], onDelete: Cascade)

  @@index([companyId])
  @@index([workOrderId])
  @@map("job_photos")
}

// ============================================================
// ROUTE & OPTIMIZATION
// ============================================================

model Route {
  id           String   @id @default(cuid())
  companyId    String
  technicianId String
  date         DateTime @db.Date
  optimized    Boolean  @default(false)
  totalDistanceMeters Int?
  totalDurationSeconds Int?
  geometryJson String?  // Full route GeoJSON for map rendering

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  technician Technician @relation(fields: [technicianId], references: [id], onDelete: Cascade)
  stops      RouteStop[]

  @@unique([technicianId, date])
  @@index([companyId])
  @@index([companyId, date])
  @@map("routes")
}

model RouteStop {
  id          String  @id @default(cuid())
  companyId   String
  routeId     String
  workOrderId String
  sortOrder   Int
  estimatedArrival DateTime?
  estimatedDeparture DateTime?
  distanceFromPrevMeters Int?
  durationFromPrevSeconds Int?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  route     Route     @relation(fields: [routeId], references: [id], onDelete: Cascade)
  workOrder WorkOrder @relation(fields: [workOrderId], references: [id])

  @@index([companyId])
  @@index([routeId, sortOrder])
  @@map("route_stops")
}

// ============================================================
// INVOICE & PAYMENT
// ============================================================

model Invoice {
  id              String        @id @default(cuid())
  companyId       String
  customerId      String
  workOrderId     String        @unique
  invoiceNumber   String        // Company-scoped sequential (e.g., INV-00042)
  status          InvoiceStatus @default(DRAFT)
  subtotal        Decimal       @db.Decimal(10, 2)
  taxAmount       Decimal       @db.Decimal(10, 2)
  totalAmount     Decimal       @db.Decimal(10, 2)
  stripeInvoiceId String?       @unique
  stripePaymentUrl String?
  paidAt          DateTime?
  sentAt          DateTime?
  dueDate         DateTime?
  notes           String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  company   Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
  customer  Customer  @relation(fields: [customerId], references: [id])
  workOrder WorkOrder @relation(fields: [workOrderId], references: [id])
  lineItems LineItem[]

  @@unique([companyId, invoiceNumber])
  @@index([companyId])
  @@index([companyId, status])
  @@index([customerId])
  @@index([stripeInvoiceId])
  @@map("invoices")
}

// ============================================================
// NOTIFICATIONS
// ============================================================

model Notification {
  id           String             @id @default(cuid())
  companyId    String
  workOrderId  String?
  recipientType UserRole
  recipientId  String            // userId or customerId
  channel      NotificationChannel
  type         NotificationType
  subject      String?
  body         String
  sentAt       DateTime?
  failedAt     DateTime?
  failureReason String?
  externalId   String?           // Twilio SID, Resend ID, etc.

  createdAt DateTime @default(now())

  workOrder WorkOrder? @relation(fields: [workOrderId], references: [id])

  @@index([companyId])
  @@index([workOrderId])
  @@index([recipientId])
  @@index([createdAt])
  @@map("notifications")
}

// ============================================================
// AUDIT LOG
// ============================================================

model AuditLog {
  id         String @id @default(cuid())
  companyId  String
  userId     String?
  action     String // e.g., "work_order.status_change", "technician.assigned"
  entityType String // e.g., "WorkOrder", "Technician", "Invoice"
  entityId   String
  metadata   Json?  // Previous/new values, context
  ipAddress  String?
  userAgent  String?

  createdAt DateTime @default(now())

  @@index([companyId])
  @@index([companyId, entityType, entityId])
  @@index([createdAt])
  @@map("audit_logs")
}
```

## 4. Relationships and Cardinality

| Relationship | Cardinality | Description |
|-------------|-------------|-------------|
| Company -> User | 1:N | A company has many users |
| Company -> Technician | 1:N | A company has many technicians |
| Company -> Customer | 1:N | A company has many customers |
| Company -> WorkOrder | 1:N | A company has many work orders |
| Company -> Invoice | 1:N | A company has many invoices |
| User -> Technician | 1:1 (optional) | A user may have a technician profile |
| User -> RefreshToken | 1:N | A user has many refresh tokens |
| Technician -> WorkOrder | 1:N | A technician is assigned many work orders |
| Technician -> TechnicianPosition | 1:N | A technician has many GPS positions |
| Technician -> Route | 1:N | A technician has many routes (one per date) |
| Customer -> WorkOrder | 1:N | A customer has many work orders |
| Customer -> Invoice | 1:N | A customer has many invoices |
| Customer -> MagicLink | 1:N | A customer has many magic links |
| WorkOrder -> WorkOrderStatusHistory | 1:N | A work order has many status transitions |
| WorkOrder -> LineItem | 1:N | A work order has many line items |
| WorkOrder -> JobPhoto | 1:N | A work order has many photos |
| WorkOrder -> Invoice | 1:1 (optional) | A work order has at most one invoice |
| WorkOrder -> RouteStop | 1:N | A work order may appear in route stops |
| WorkOrder -> Notification | 1:N | A work order has many notifications |
| Route -> RouteStop | 1:N | A route has many stops (ordered) |
| Invoice -> LineItem | 1:N | An invoice has many line items |

## 5. Row Level Security (RLS) Policies

All tables include a `companyId` column. RLS is enforced at the database level to guarantee tenant isolation (§BRD BR-100).

### 5.1 RLS Setup

```sql
-- Enable RLS on all tenant-scoped tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE technician_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE magic_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create application role for RLS context
CREATE ROLE app_user;

-- Set the tenant context per transaction
-- Application middleware calls: SET LOCAL app.current_company_id = '<companyId>';
```

### 5.2 RLS Policies

```sql
-- Companies: users can only see their own company
CREATE POLICY company_isolation ON companies
  FOR ALL
  USING (id = current_setting('app.current_company_id'));

-- Users: scoped to company
CREATE POLICY user_isolation ON users
  FOR ALL
  USING (company_id = current_setting('app.current_company_id'));

-- Technicians: scoped to company
CREATE POLICY technician_isolation ON technicians
  FOR ALL
  USING (company_id = current_setting('app.current_company_id'));

-- Technician Positions: scoped to company
CREATE POLICY position_isolation ON technician_positions
  FOR ALL
  USING (company_id = current_setting('app.current_company_id'));

-- Customers: scoped to company
CREATE POLICY customer_isolation ON customers
  FOR ALL
  USING (company_id = current_setting('app.current_company_id'));

-- Work Orders: scoped to company
CREATE POLICY work_order_isolation ON work_orders
  FOR ALL
  USING (company_id = current_setting('app.current_company_id'));

-- Work Order Status History: scoped to company
CREATE POLICY wo_history_isolation ON work_order_status_history
  FOR ALL
  USING (company_id = current_setting('app.current_company_id'));

-- Line Items: scoped to company
CREATE POLICY line_item_isolation ON line_items
  FOR ALL
  USING (company_id = current_setting('app.current_company_id'));

-- Job Photos: scoped to company
CREATE POLICY photo_isolation ON job_photos
  FOR ALL
  USING (company_id = current_setting('app.current_company_id'));

-- Routes: scoped to company
CREATE POLICY route_isolation ON routes
  FOR ALL
  USING (company_id = current_setting('app.current_company_id'));

-- Route Stops: scoped to company
CREATE POLICY route_stop_isolation ON route_stops
  FOR ALL
  USING (company_id = current_setting('app.current_company_id'));

-- Invoices: scoped to company
CREATE POLICY invoice_isolation ON invoices
  FOR ALL
  USING (company_id = current_setting('app.current_company_id'));

-- Notifications: scoped to company
CREATE POLICY notification_isolation ON notifications
  FOR ALL
  USING (company_id = current_setting('app.current_company_id'));

-- Audit Logs: scoped to company
CREATE POLICY audit_isolation ON audit_logs
  FOR ALL
  USING (company_id = current_setting('app.current_company_id'));
```

### 5.3 Customer Tracking Portal Exception

The customer tracking portal accesses work order data without full authentication (via tracking token). A separate database function bypasses RLS for this specific read path:

```sql
-- Bypasses RLS for tracking portal (read-only, token-validated)
CREATE FUNCTION get_work_order_by_tracking_token(p_token TEXT)
RETURNS TABLE (
  id TEXT,
  status work_order_status,
  service_type service_type,
  address TEXT,
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  technician_name TEXT,
  technician_latitude DECIMAL,
  technician_longitude DECIMAL,
  company_name TEXT,
  company_logo_url TEXT,
  company_phone TEXT
)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    wo.id, wo.status, wo.service_type, wo.address,
    wo.scheduled_start, wo.scheduled_end,
    u.first_name || ' ' || u.last_name,
    t.current_latitude, t.current_longitude,
    c.name, c.logo_url, c.phone
  FROM work_orders wo
  JOIN companies c ON c.id = wo.company_id
  LEFT JOIN technicians t ON t.id = wo.technician_id
  LEFT JOIN users u ON u.id = t.user_id
  WHERE wo.tracking_token = p_token
    AND wo.tracking_expires_at > NOW();
END;
$$ LANGUAGE plpgsql;
```

## 6. Spatial Indexes

PostGIS spatial indexes for efficient proximity queries:

```sql
-- Technician current position (for nearest-available queries)
CREATE INDEX idx_technicians_location
  ON technicians USING GIST (
    ST_MakePoint(current_longitude::float8, current_latitude::float8)
  )
  WHERE current_latitude IS NOT NULL AND current_longitude IS NOT NULL;

-- Technician position history (for trail rendering)
CREATE INDEX idx_positions_location
  ON technician_positions USING GIST (
    ST_MakePoint(longitude::float8, latitude::float8)
  );

-- Work order locations (for map clustering and spatial queries)
CREATE INDEX idx_work_orders_location
  ON work_orders USING GIST (
    ST_MakePoint(longitude::float8, latitude::float8)
  );

-- Customer locations
CREATE INDEX idx_customers_location
  ON customers USING GIST (
    ST_MakePoint(longitude::float8, latitude::float8)
  )
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
```

### 6.1 Nearest Technician Query

Used by the auto-assignment algorithm (§SRS-3):

```sql
SELECT
  t.id,
  t.user_id,
  u.first_name || ' ' || u.last_name AS name,
  t.skills,
  ST_Distance(
    ST_MakePoint(t.current_longitude::float8, t.current_latitude::float8)::geography,
    ST_MakePoint($1::float8, $2::float8)::geography
  ) AS distance_meters,
  (SELECT COUNT(*) FROM work_orders wo
   WHERE wo.technician_id = t.id
     AND wo.scheduled_start::date = $3::date
     AND wo.status NOT IN ('COMPLETED', 'CANCELLED', 'INVOICED', 'PAID')
  ) AS active_job_count
FROM technicians t
JOIN users u ON u.id = t.user_id
WHERE t.company_id = current_setting('app.current_company_id')
  AND t.status = 'AVAILABLE'
  AND t.current_latitude IS NOT NULL
  AND $4 = ANY(t.skills)  -- Required service type
ORDER BY distance_meters ASC
LIMIT 10;
```

## 7. Database Migrations Strategy

### 7.1 Migration Naming Convention

```
YYYYMMDDHHMMSS_descriptive_name.sql
e.g., 20260320120000_initial_schema.sql
      20260320120100_add_rls_policies.sql
      20260320120200_add_spatial_indexes.sql
      20260320120300_add_tracking_function.sql
```

### 7.2 PostGIS Extension Migration

The first migration enables PostGIS:

```sql
-- 20260320120000_initial_schema.sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- For text search
```

### 7.3 Seed Data

The seed script (`prisma/seed.ts`) creates:
1. A demo company ("Acme HVAC Services")
2. An admin user (admin@acme-hvac.com / password123)
3. A dispatcher user
4. 5 technicians with varied skills and positions in a metro area
5. 3 customers with addresses
6. 10 work orders in various states
7. Sample routes with stops
8. Sample GPS position history

## 8. API Endpoint Summary

### 8.1 Authentication

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/register` | Register new company + admin user | Public |
| POST | `/api/auth/login` | Login, returns JWT + refresh token | Public |
| POST | `/api/auth/refresh` | Refresh JWT using refresh token | Public |
| POST | `/api/auth/logout` | Revoke refresh token | JWT |
| POST | `/api/auth/magic-link` | Send magic link to customer email | Public |
| POST | `/api/auth/magic-link/verify` | Verify magic link token | Public |

### 8.2 Companies

| Method | Path | Description | Auth | Role |
|--------|------|-------------|------|------|
| GET | `/api/companies/me` | Get current company profile | JWT | Any |
| PATCH | `/api/companies/me` | Update company settings | JWT | Admin |
| PATCH | `/api/companies/me/service-area` | Update service area polygon | JWT | Admin |

### 8.3 Users

| Method | Path | Description | Auth | Role |
|--------|------|-------------|------|------|
| GET | `/api/users` | List company users | JWT | Admin |
| POST | `/api/users` | Create user | JWT | Admin |
| GET | `/api/users/:id` | Get user detail | JWT | Admin |
| PATCH | `/api/users/:id` | Update user | JWT | Admin |
| DELETE | `/api/users/:id` | Deactivate user | JWT | Admin |

### 8.4 Technicians

| Method | Path | Description | Auth | Role |
|--------|------|-------------|------|------|
| GET | `/api/technicians` | List technicians (with filters) | JWT | Dispatcher+ |
| POST | `/api/technicians` | Create technician profile | JWT | Admin |
| GET | `/api/technicians/:id` | Get technician detail + current position | JWT | Dispatcher+ |
| PATCH | `/api/technicians/:id` | Update technician | JWT | Admin |
| PATCH | `/api/technicians/:id/status` | Update technician status | JWT | Technician (self) |
| GET | `/api/technicians/:id/positions` | Get position history (date range) | JWT | Dispatcher+ |
| GET | `/api/technicians/available` | List available technicians for assignment | JWT | Dispatcher+ |

### 8.5 Customers

| Method | Path | Description | Auth | Role |
|--------|------|-------------|------|------|
| GET | `/api/customers` | List customers | JWT | Dispatcher+ |
| POST | `/api/customers` | Create customer | JWT | Dispatcher+ |
| GET | `/api/customers/:id` | Get customer detail | JWT | Dispatcher+ |
| PATCH | `/api/customers/:id` | Update customer | JWT | Dispatcher+ |
| GET | `/api/customers/:id/work-orders` | Get customer's work orders | JWT | Dispatcher+ |

### 8.6 Work Orders

| Method | Path | Description | Auth | Role |
|--------|------|-------------|------|------|
| GET | `/api/work-orders` | List work orders (with filters) | JWT | Dispatcher+ |
| POST | `/api/work-orders` | Create work order | JWT | Dispatcher+ |
| GET | `/api/work-orders/:id` | Get work order detail | JWT | Any |
| PATCH | `/api/work-orders/:id` | Update work order fields | JWT | Dispatcher+ |
| POST | `/api/work-orders/:id/assign` | Assign to technician | JWT | Dispatcher+ |
| POST | `/api/work-orders/:id/unassign` | Unassign technician | JWT | Dispatcher+ |
| POST | `/api/work-orders/:id/transition` | Transition status | JWT | Dispatcher+ / Tech |
| GET | `/api/work-orders/:id/history` | Get status history | JWT | Any |
| POST | `/api/work-orders/:id/photos` | Upload photo | JWT | Technician |
| POST | `/api/work-orders/:id/notes` | Add note | JWT | Any |
| POST | `/api/work-orders/auto-assign` | Auto-assign unassigned orders | JWT | Dispatcher+ |

### 8.7 Dispatch

| Method | Path | Description | Auth | Role |
|--------|------|-------------|------|------|
| GET | `/api/dispatch/board` | Get dispatch board data for date | JWT | Dispatcher+ |
| GET | `/api/dispatch/map-data` | Get all markers for map | JWT | Dispatcher+ |

### 8.8 Routes

| Method | Path | Description | Auth | Role |
|--------|------|-------------|------|------|
| GET | `/api/routes/technician/:id/date/:date` | Get technician's route for date | JWT | Dispatcher+ |
| POST | `/api/routes/optimize` | Optimize a technician's route | JWT | Dispatcher+ |
| POST | `/api/routes/directions` | Get directions between two points | JWT | Any |
| GET | `/api/routes/eta` | Calculate ETA from current position | JWT | Any |

### 8.9 Invoices

| Method | Path | Description | Auth | Role |
|--------|------|-------------|------|------|
| GET | `/api/invoices` | List invoices | JWT | Dispatcher+ |
| GET | `/api/invoices/:id` | Get invoice detail | JWT | Dispatcher+ |
| PATCH | `/api/invoices/:id` | Update draft invoice | JWT | Dispatcher+ |
| POST | `/api/invoices/:id/send` | Send invoice via Stripe | JWT | Dispatcher+ |
| POST | `/api/invoices/:id/void` | Void an invoice | JWT | Admin |
| POST | `/api/invoices/:id/mark-paid` | Manually mark as paid | JWT | Admin |
| POST | `/api/webhooks/stripe` | Stripe webhook handler | Stripe sig | N/A |

### 8.10 Analytics

| Method | Path | Description | Auth | Role |
|--------|------|-------------|------|------|
| GET | `/api/analytics/overview` | Dashboard overview metrics | JWT | Admin |
| GET | `/api/analytics/jobs` | Job completion statistics | JWT | Admin |
| GET | `/api/analytics/technicians` | Technician utilization | JWT | Admin |
| GET | `/api/analytics/revenue` | Revenue metrics | JWT | Admin |
| GET | `/api/analytics/export` | CSV export | JWT | Admin |

### 8.11 Customer Portal (Public)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/tracking/:token` | Get tracking data for work order | Token (URL) |
| GET | `/api/portal/work-orders` | Customer's work orders | Magic link JWT |
| GET | `/api/portal/invoices` | Customer's invoices | Magic link JWT |

### 8.12 Notifications

| Method | Path | Description | Auth | Role |
|--------|------|-------------|------|------|
| GET | `/api/notifications` | List notifications for current user | JWT | Any |
| PATCH | `/api/notifications/:id/read` | Mark notification as read | JWT | Any |

## 9. Data Volume Estimates

| Entity | Rows per tenant/month | Retention | Storage estimate |
|--------|----------------------|-----------|-----------------|
| Company | 1 | Permanent | Negligible |
| User | 50 (total) | Permanent | Negligible |
| Technician | 20 (total) | Permanent | Negligible |
| Customer | 200 | Permanent | ~50 KB/mo |
| WorkOrder | 10,000 | Permanent | ~5 MB/mo |
| StatusHistory | 60,000 (6 per WO avg) | Permanent | ~10 MB/mo |
| TechnicianPosition | 600,000 (20 techs * 1000/day * 30 days) | 90 days | ~100 MB/mo (purged) |
| LineItem | 20,000 (2 per WO avg) | Permanent | ~4 MB/mo |
| JobPhoto | 10,000 (1 per WO avg) | Permanent | Metadata only (~2 MB/mo); images in object storage |
| Route | 600 (20 techs * 30 days) | Permanent | ~2 MB/mo |
| RouteStop | 3,000 (5 stops per route) | Permanent | ~1 MB/mo |
| Invoice | 10,000 | Permanent | ~3 MB/mo |
| Notification | 40,000 (4 per WO avg) | 180 days | ~8 MB/mo |
| AuditLog | 100,000 | 1 year | ~20 MB/mo |

**Total estimated storage per tenant:** ~155 MB/month, with GPS positions being the dominant contributor and automatically purged after 90 days.

## 10. Cross-References

- Business rules for data isolation: §BRD BR-100, BR-101
- Work order state machine: §SRS-3 Section 3
- GPS streaming protocol: §SRS-3 Section 6
- RLS enforcement in application layer: §SRS-4 Section 3
- API authentication: §SRS-4 Section 2
- Architecture overview: §SRS-1

---

*End of Software Requirements Specification — Data Model*
