# Data Model — Field Service Dispatch

## Overview
The data model supports multi-company field service dispatch with strict
isolation. All entities are company-scoped via foreign key relationships.
See SECURITY_MODEL.md for RLS enforcement details and API_CONTRACT.md
for how these entities are exposed via the API.

## Entities

### Company
Primary organizational unit. All data is scoped to a company.
Fields: id, name, slug (unique), createdAt, updatedAt.
<!-- VERIFY:FD-COMPANY-MODEL — Company model with slug unique constraint -->

### User
Authenticated user belonging to a company with a role assignment.
Fields: id, email (unique), passwordHash, role, companyId, createdAt, updatedAt.
Password stored as bcrypt hash with salt rounds of 12.
<!-- VERIFY:FD-USER-MODEL — User model with bcrypt salt 12 -->

### Customer
Service recipient within a company's service area.
Fields: id, name, email, phone, address, companyId, createdAt, updatedAt.
<!-- VERIFY:FD-CUSTOMER-MODEL — Customer model with company scope -->

### Technician
Field worker dispatched to complete work orders.
Fields: id, name, phone, specialty, companyId, userId, createdAt, updatedAt.
<!-- VERIFY:FD-TECHNICIAN-MODEL — Technician model with specialty field -->

### WorkOrder
Service request with lifecycle state management.
Fields: id, title, description, status, priority, customerId, technicianId,
companyId, scheduledDate, completedDate, createdAt, updatedAt.
Status enum: PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED.
<!-- VERIFY:FD-WORKORDER-MODEL — WorkOrder model with WorkOrderStatus enum -->

### Route
Planned driving route for a technician's daily assignments.
Fields: id, name, status, date, technicianId, companyId, createdAt, updatedAt.
Status enum: PLANNED, ACTIVE, COMPLETED.
<!-- VERIFY:FD-ROUTE-MODEL — Route model with RouteStatus enum -->

### GpsEvent
Location ping from a technician's mobile device.
Fields: id, latitude (Decimal 10,7), longitude (Decimal 10,7),
technicianId, routeId, timestamp, createdAt.
Coordinates use Decimal for precision, never Float.
<!-- VERIFY:FD-DECIMAL-FIELDS — Decimal type for GpsEvent coordinates -->

### Invoice
Billing record tied to a completed work order.
Fields: id, amount (Decimal 12,2), status, workOrderId, companyId,
issuedDate, paidDate, createdAt, updatedAt.
Status enum: DRAFT, SENT, PAID, VOID.
<!-- VERIFY:FD-INVOICE-MODEL — Invoice model with InvoiceStatus enum -->

## Enums
All enums use @@map for PostgreSQL naming conventions:
- UserRole -> user_role
- WorkOrderStatus -> work_order_status
- RouteStatus -> route_status
- InvoiceStatus -> invoice_status
- Priority -> priority
<!-- VERIFY:FD-ENUM-MAP — All enums have @@map -->

## Column Mapping
Multi-word columns use @map for snake_case:
- passwordHash -> password_hash
- companyId -> company_id
- customerId -> customer_id
- technicianId -> technician_id
- workOrderId -> work_order_id
- scheduledDate -> scheduled_date
- completedDate -> completed_date
- issuedDate -> issued_date
- paidDate -> paid_date
- createdAt -> created_at
- updatedAt -> updated_at
<!-- VERIFY:FD-COLUMN-MAP — @map on all multi-word columns -->

## Indexes
- companies.slug: unique index
- users.email: unique index
- work_orders: index on status + company_id for dispatch queries
- gps_events: index on technician_id + timestamp for tracking

## Row Level Security
All tables have both ENABLE and FORCE ROW LEVEL SECURITY applied
in the initial migration. See SYSTEM_ARCHITECTURE.md for infrastructure details.
