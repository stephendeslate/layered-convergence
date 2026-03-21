# Software Requirements Specification — Part 2: Database Schema
# Field Service Dispatch

**Version:** 1.0 | **Date:** 2026-03-20

---

## 1. Prisma Schema

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

enum TechnicianStatus {
  AVAILABLE
  BUSY
  OFF_DUTY
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum InvoiceStatus {
  DRAFT
  SENT
  PAID
}

model Company {
  id            String   @id @default(uuid())
  name          String
  primaryColor  String   @default("#3B82F6")
  logoUrl       String?
  serviceArea   Json?    // GeoJSON polygon
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  technicians   Technician[]
  customers     Customer[]
  workOrders    WorkOrder[]

  @@map("companies")
}

model Technician {
  id            String           @id @default(uuid())
  companyId     String
  name          String
  email         String           @unique
  phone         String?
  skills        String[]         @default([])
  status        TechnicianStatus @default(AVAILABLE)
  currentLat    Float?
  currentLng    Float?
  lastLocationAt DateTime?
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  company       Company          @relation(fields: [companyId], references: [id])
  workOrders    WorkOrder[]
  routes        Route[]

  @@map("technicians")
}

model Customer {
  id            String   @id @default(uuid())
  companyId     String
  name          String
  email         String?
  phone         String?
  address       String
  lat           Float
  lng           Float
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  company       Company    @relation(fields: [companyId], references: [id])
  workOrders    WorkOrder[]

  @@map("customers")
}

model WorkOrder {
  id              String          @id @default(uuid())
  companyId       String
  customerId      String
  technicianId    String?
  priority        Priority        @default(MEDIUM)
  status          WorkOrderStatus @default(UNASSIGNED)
  description     String
  serviceType     String
  scheduledAt     DateTime?
  estimatedDuration Int?          // minutes
  completedAt     DateTime?
  trackingToken   String          @unique @default(uuid())
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  company         Company         @relation(fields: [companyId], references: [id])
  customer        Customer        @relation(fields: [customerId], references: [id])
  technician      Technician?     @relation(fields: [technicianId], references: [id])
  statusHistory   WorkOrderStatusHistory[]
  photos          JobPhoto[]
  invoice         Invoice?

  @@index([companyId, status])
  @@index([technicianId, scheduledAt])
  @@map("work_orders")
}

model WorkOrderStatusHistory {
  id          String   @id @default(uuid())
  workOrderId String
  fromStatus  String
  toStatus    String
  note        String?
  timestamp   DateTime @default(now())

  workOrder   WorkOrder @relation(fields: [workOrderId], references: [id], onDelete: Cascade)

  @@index([workOrderId, timestamp])
  @@map("work_order_status_history")
}

model Route {
  id                String   @id @default(uuid())
  technicianId      String
  date              DateTime @db.Date
  waypoints         Json     @default("[]")
  optimizedOrder    Int[]    @default([])
  estimatedDuration Int?     // minutes
  distance          Float?   // meters
  geometry          Json?    // GeoJSON LineString
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  technician        Technician @relation(fields: [technicianId], references: [id])

  @@unique([technicianId, date])
  @@map("routes")
}

model JobPhoto {
  id          String   @id @default(uuid())
  workOrderId String
  url         String
  caption     String?
  uploadedAt  DateTime @default(now())

  workOrder   WorkOrder @relation(fields: [workOrderId], references: [id], onDelete: Cascade)

  @@map("job_photos")
}

model Invoice {
  id                    String        @id @default(uuid())
  workOrderId           String        @unique
  companyId             String
  amount                Int           // cents
  lineItems             Json          @default("[]")
  status                InvoiceStatus @default(DRAFT)
  stripePaymentIntentId String?
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt

  workOrder             WorkOrder     @relation(fields: [workOrderId], references: [id])

  @@map("invoices")
}
```

## 2. RLS Policies [VERIFY:RLS]

```sql
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Company isolation
CREATE POLICY company_isolation_technicians ON technicians
  USING (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY company_isolation_customers ON customers
  USING (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY company_isolation_work_orders ON work_orders
  USING (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY company_isolation_status_history ON work_order_status_history
  USING (work_order_id IN (
    SELECT id FROM work_orders WHERE company_id = current_setting('app.current_company_id')::uuid
  ));

CREATE POLICY company_isolation_routes ON routes
  USING (technician_id IN (
    SELECT id FROM technicians WHERE company_id = current_setting('app.current_company_id')::uuid
  ));

CREATE POLICY company_isolation_photos ON job_photos
  USING (work_order_id IN (
    SELECT id FROM work_orders WHERE company_id = current_setting('app.current_company_id')::uuid
  ));

CREATE POLICY company_isolation_invoices ON invoices
  USING (company_id = current_setting('app.current_company_id')::uuid);
```

**Note:** Prisma connects as DB owner, bypassing RLS. RLS is defense-in-depth. Primary isolation is application-level `WHERE companyId`.

## 3. State Machine Definition (packages/shared) [VERIFY:STATE_MACHINE]

```typescript
// packages/shared/src/work-order-states.ts
export const WORK_ORDER_STATUSES = {
  UNASSIGNED: 'UNASSIGNED',
  ASSIGNED: 'ASSIGNED',
  EN_ROUTE: 'EN_ROUTE',
  ON_SITE: 'ON_SITE',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  INVOICED: 'INVOICED',
  PAID: 'PAID',
} as const;

export const VALID_TRANSITIONS: Record<string, string[]> = {
  UNASSIGNED: ['ASSIGNED'],
  ASSIGNED: ['EN_ROUTE', 'UNASSIGNED'],
  EN_ROUTE: ['ON_SITE', 'ASSIGNED'],
  ON_SITE: ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: ['INVOICED'],
  INVOICED: ['PAID'],
};

export function isValidTransition(from: string, to: string): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}
```

## 4. Prisma Query Convention [VERIFY:QUERY_CONVENTION]

| Method | Usage |
|--------|-------|
| `findFirstOrThrow` | Default for company-scoped lookups by ID |
| `findUniqueOrThrow` | When querying by unique constraint (email, trackingToken) |
| `findFirst` | Only when null is valid (e.g., find existing route for today) — requires `// findFirst justified:` comment |
| `findMany` | List operations — always filter by companyId |
