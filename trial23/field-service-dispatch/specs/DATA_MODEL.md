# Data Model — Field Service Dispatch

## Overview

All entities are company-scoped for multi-tenant isolation. Row-level security
policies enforce data boundaries at the database level.

See: SECURITY_MODEL.md, PRODUCT_VISION.md

## Entities

### Company
- `id`: UUID, primary key
- `name`: String, required
- `createdAt`: DateTime, default now
- `updatedAt`: DateTime, auto-updated

### User
- `id`: UUID, primary key
- `email`: String, unique
- `passwordHash`: String (bcrypt, salt 12)
- `role`: Enum (DISPATCHER, TECHNICIAN)
- `companyId`: UUID, foreign key → Company
- `createdAt`: DateTime
- `updatedAt`: DateTime

## VERIFY:USER_ROLE_ENUM — User role is enum with only DISPATCHER and TECHNICIAN values

### Customer
- `id`: UUID, primary key
- `name`: String, required
- `email`: String, optional
- `phone`: String, optional
- `address`: String, optional
- `companyId`: UUID, foreign key → Company
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Technician
- `id`: UUID, primary key
- `name`: String, required
- `email`: String, required
- `phone`: String, optional
- `specialization`: String, optional
- `companyId`: UUID, foreign key → Company
- `userId`: UUID, optional foreign key → User
- `createdAt`: DateTime
- `updatedAt`: DateTime

### WorkOrder
- `id`: UUID, primary key
- `title`: String, required
- `description`: String, optional
- `status`: Enum (OPEN, ASSIGNED, IN_PROGRESS, COMPLETED, INVOICED, CLOSED, CANCELLED)
- `priority`: String, optional
- `scheduledDate`: DateTime, optional
- `completedDate`: DateTime, optional
- `customerId`: UUID, foreign key → Customer
- `technicianId`: UUID, optional foreign key → Technician
- `companyId`: UUID, foreign key → Company
- `createdAt`: DateTime
- `updatedAt`: DateTime

## VERIFY:WO_STATUS_ENUM — WorkOrder status enum includes all 7 states

### Route
- `id`: UUID, primary key
- `name`: String, required
- `date`: DateTime, required
- `estimatedDistance`: Decimal(10,2) — NOT Float
- `technicianId`: UUID, foreign key → Technician
- `companyId`: UUID, foreign key → Company
- `createdAt`: DateTime
- `updatedAt`: DateTime

## VERIFY:ROUTE_DECIMAL — estimatedDistance is Decimal(10,2), not Float

### GpsEvent
- `id`: UUID, primary key
- `latitude`: Float — GPS coordinate, Float is appropriate
- `longitude`: Float — GPS coordinate, Float is appropriate
- `timestamp`: DateTime, required
- `technicianId`: UUID, foreign key → Technician
- `companyId`: UUID, foreign key → Company

## VERIFY:GPS_FLOAT — latitude and longitude use Float type (appropriate for GPS coordinates)

### Invoice
- `id`: UUID, primary key
- `invoiceNumber`: String, unique per company
- `status`: Enum (DRAFT, SENT, PAID, VOID)
- `amount`: Decimal(12,2)
- `taxAmount`: Decimal(12,2)
- `totalAmount`: Decimal(12,2)
- `dueDate`: DateTime, optional
- `workOrderId`: UUID, foreign key → WorkOrder
- `customerId`: UUID, foreign key → Customer
- `companyId`: UUID, foreign key → Company
- `createdAt`: DateTime
- `updatedAt`: DateTime

## VERIFY:INVOICE_DECIMAL — Invoice amount, taxAmount, totalAmount use Decimal(12,2)

## Prisma Conventions

- All models use `@@map("table_name")` to map to snake_case table names
- Multi-word columns use `@map("column_name")` for snake_case mapping
- UUIDs generated with `@default(uuid())`
- Timestamps use `@default(now())` and `@updatedAt`

## VERIFY:PRISMA_MAP — All models use @@map, multi-word columns use @map

## Relationships

```
Company 1──* User
Company 1──* Customer
Company 1──* Technician
Company 1──* WorkOrder
Company 1──* Route
Company 1──* GpsEvent
Company 1──* Invoice

Customer 1──* WorkOrder
Technician 1──* WorkOrder
Technician 1──* Route
Technician 1──* GpsEvent
WorkOrder 1──* Invoice
User 1──? Technician
```

See: API_CONTRACT.md, SYSTEM_ARCHITECTURE.md
