# Data Model — Field Service Dispatch

## Entity Definitions

### User Model
Users belong to a company and have role-based access.
Passwords stored as bcrypt hashes with salt rounds of 12.
The passwordHash column uses @map("password_hash") for snake_case.
<!-- VERIFY:FD-USER-MODEL — User model with bcrypt salt 12 -->

### Company Model
Root multi-tenant entity. All other entities reference a company.
Companies have a unique domain field for identification.

### Customer Model
Service recipients with name, email, phone, and address.
Customers link to work orders and invoices.

### Technician Model
Field workers with specialty and active status.
The isActive field uses @map("is_active") for snake_case.

### Work Order Model
Central dispatch entity with cost tracking.
estimatedCost and actualCost use Decimal(20,2) precision.
Never uses Float for financial calculations.
<!-- VERIFY:FD-WORKORDER-MODEL — WorkOrder with Decimal amounts -->

### Route Model
Groups work orders for a technician on a given day.
totalDistance uses Decimal(20,2) for accurate tracking.

### GPS Event Model
Location records with latitude Decimal(10,7) and longitude Decimal(10,7).
The recordedAt field uses @map("recorded_at") for snake_case.

### Invoice Model
Billing records with amount, taxAmount, and totalAmount.
All monetary fields use Decimal(20,2) to prevent floating-point errors.
<!-- VERIFY:FD-INVOICE-MODEL — Invoice with Decimal amounts -->

## Decimal Convention
All monetary values stored as Decimal(20,2).
GPS coordinates use Decimal(10,7) for precision.
Never uses Float for any financial or precision-critical field.
<!-- VERIFY:FD-DECIMAL-FIELDS — Decimal for monetary fields -->

## Enum Mapping
All enums use @@map for snake_case type names in PostgreSQL:
- UserRole -> user_role
- WorkOrderStatus -> work_order_status
- RouteStatus -> route_status
- InvoiceStatus -> invoice_status
<!-- VERIFY:FD-ENUM-MAP — All enums have @@map -->

## Column Mapping
All multi-word columns use @map for snake_case in PostgreSQL:
- passwordHash -> password_hash
- companyId -> company_id
- customerId -> customer_id
- technicianId -> technician_id
- scheduledAt -> scheduled_at
- completedAt -> completed_at
- estimatedCost -> estimated_cost
- actualCost -> actual_cost
- routeId -> route_id
- isActive -> is_active
- scheduledDate -> scheduled_date
- totalDistance -> total_distance
- recordedAt -> recorded_at
- invoiceNo -> invoice_no
- taxAmount -> tax_amount
- totalAmount -> total_amount
- dueDate -> due_date
- paidAt -> paid_at
- workOrderId -> work_order_id
- createdAt -> created_at
- updatedAt -> updated_at
<!-- VERIFY:FD-COLUMN-MAP — @map on multi-word columns -->
