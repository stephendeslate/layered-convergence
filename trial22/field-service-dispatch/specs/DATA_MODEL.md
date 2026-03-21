# Data Model — Field Service Dispatch

## Overview

The data model supports a multi-tenant field service platform with eight core entities. All tables use `@@map` for snake_case table names and `@map` for snake_case column names.

## Entity Relationship Diagram

```
Company 1──* User
Company 1──* Customer
Company 1──* Technician
Company 1──* WorkOrder
Company 1──* Invoice
Company 1──* Route
Company 1──* GpsEvent

User 1──1 Technician (optional)
Customer 1──* WorkOrder
Technician 1──* WorkOrder
WorkOrder 1──0..1 Invoice
Route 1──* WorkOrder
Technician 1──* GpsEvent
Technician 1──* Route
```

## Entities

### Company
<!-- VERIFY:DM-001 Company is the root tenant entity with all other entities scoped to it -->
- `id` (UUID, PK)
- `name` (String)
- `createdAt`, `updatedAt` (DateTime)

### User
<!-- VERIFY:DM-002 User has role constrained to DISPATCHER or TECHNICIAN -->
- `id` (UUID, PK)
- `email` (String, unique)
- `passwordHash` (String)
- `role` (Enum: DISPATCHER, TECHNICIAN)
- `companyId` (FK → Company)
- `createdAt`, `updatedAt` (DateTime)

### Customer
- `id` (UUID, PK)
- `name` (String)
- `email` (String, optional)
- `phone` (String, optional)
- `address` (String)
- `companyId` (FK → Company)
- `createdAt`, `updatedAt` (DateTime)

### Technician
- `id` (UUID, PK)
- `name` (String)
- `phone` (String, optional)
- `specialties` (String, optional)
- `userId` (FK → User, optional)
- `companyId` (FK → Company)
- `createdAt`, `updatedAt` (DateTime)

### WorkOrder
<!-- VERIFY:DM-003 WorkOrder status follows defined state machine with valid transitions -->
- `id` (UUID, PK)
- `title` (String)
- `description` (String, optional)
- `status` (Enum: OPEN, ASSIGNED, IN_PROGRESS, COMPLETED, INVOICED, CLOSED, CANCELLED)
- `priority` (Enum: LOW, MEDIUM, HIGH, URGENT)
- `scheduledDate` (DateTime, optional)
- `completedDate` (DateTime, optional)
- `customerId` (FK → Customer)
- `technicianId` (FK → Technician, optional)
- `routeId` (FK → Route, optional)
- `companyId` (FK → Company)
- `createdAt`, `updatedAt` (DateTime)

### Invoice
<!-- VERIFY:DM-004 Invoice amounts use Decimal(12,2) precision -->
- `id` (UUID, PK)
- `invoiceNumber` (String, unique)
- `amount` (Decimal(12,2))
- `taxAmount` (Decimal(12,2))
- `totalAmount` (Decimal(12,2))
- `status` (Enum: DRAFT, SENT, PAID)
- `workOrderId` (FK → WorkOrder, unique)
- `companyId` (FK → Company)
- `issuedAt` (DateTime, optional)
- `createdAt`, `updatedAt` (DateTime)

### Route
- `id` (UUID, PK)
- `name` (String)
- `date` (DateTime)
- `technicianId` (FK → Technician)
- `estimatedDistance` (Float) — kilometers
- `companyId` (FK → Company)
- `createdAt`, `updatedAt` (DateTime)

### GpsEvent
<!-- VERIFY:DM-005 GPS coordinates use Float type (sufficient for dispatch precision) -->
- `id` (UUID, PK)
- `latitude` (Float)
- `longitude` (Float)
- `timestamp` (DateTime)
- `technicianId` (FK → Technician)
- `companyId` (FK → Company)
- `createdAt` (DateTime)

## Naming Conventions

All Prisma models use PascalCase in the schema with `@@map('snake_case_plural')` for table names and `@map('snake_case')` for column names. This ensures clean TypeScript types while maintaining PostgreSQL naming conventions.

## Indexes

- `User.email` — unique index
- `WorkOrder.companyId` + `WorkOrder.status` — composite index for filtered queries
- `GpsEvent.technicianId` + `GpsEvent.timestamp` — composite index for time-series queries
- `Invoice.invoiceNumber` — unique index
- `Invoice.workOrderId` — unique index

## Row-Level Security

All tables except `Company` itself have RLS policies that filter rows by `company_id` matching the session variable `app.current_company_id`. This provides defense-in-depth tenant isolation.
