# Data Model — Field Service Dispatch

## Entity Definitions

### Company
Primary tenant isolation entity. Uses `slug` with unique constraint for URL-friendly identifiers.
<!-- VERIFY:FD-COMPANY-MODEL -->

### User
Authentication entity with email (unique index), password_hash (bcrypt salt 12), and role (UserRole enum). Scoped to a company via `company_id` foreign key.
<!-- VERIFY:FD-USER-MODEL -->

### Work Order
Core operational entity with title, description, status (WorkOrderStatus enum), priority (integer 1-5), scheduled_at, completed_at. Links to company, customer, optional technician, and optional route.
<!-- VERIFY:FD-WORKORDER-MODEL -->

### Invoice
Financial entity with amount (Decimal 20,2 for currency precision), status (InvoiceStatus enum), due_date, paid_at. Links to company, customer, and work_order.
<!-- VERIFY:FD-DECIMAL-FIELDS -->

### GPS Event
Location tracking with latitude and longitude using Decimal(10,7) for sub-meter precision. Includes timestamp and technician reference.
<!-- VERIFY:FD-GPS-MODEL -->

## Enum Definitions

All enums use `@@map` for snake_case PostgreSQL type names:
- `UserRole` -> `user_role`: DISPATCHER, TECHNICIAN, MANAGER, ADMIN
- `WorkOrderStatus` -> `work_order_status`: PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED
- `RouteStatus` -> `route_status`: PLANNED, ACTIVE, COMPLETED
- `InvoiceStatus` -> `invoice_status`: DRAFT, SENT, PAID, OVERDUE, VOID
<!-- VERIFY:FD-ENUM-MAP -->

## Column Mapping

All multi-word columns use `@map` for snake_case:
- `passwordHash` -> `password_hash`
- `companyId` -> `company_id`
- `customerId` -> `customer_id`
- `technicianId` -> `technician_id`
- `routeId` -> `route_id`
- `workOrderId` -> `work_order_id`
- `scheduledAt` -> `scheduled_at`
- `completedAt` -> `completed_at`
- `createdAt` -> `created_at`
- `updatedAt` -> `updated_at`
- `dueDate` -> `due_date`
- `paidAt` -> `paid_at`
<!-- VERIFY:FD-COLUMN-MAP -->

## Cross-References
- See PRODUCT_VISION.md for entity business logic descriptions
- See API_CONTRACT.md for endpoint request/response shapes
