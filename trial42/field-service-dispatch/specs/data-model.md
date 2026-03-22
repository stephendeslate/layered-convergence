# Data Model Specification — Field Service Dispatch

## Overview

PostgreSQL 16 database managed by Prisma 6 ORM. All models use @@map
for snake_case table names. All enums use @@map and @map for
snake_case PostgreSQL values.

## Entities

### Tenant
- id (UUID PK), name, createdAt, updatedAt
- Has many: users, workOrders, technicians, schedules, serviceAreas
- Table: tenants

### User
- id (UUID PK), email (unique), passwordHash, role (UserRole), tenantId
- Belongs to: tenant
- Table: users
- Indexes: tenantId, email

### WorkOrder
- id (UUID PK), title, description, status (WorkOrderStatus),
  priority (Priority), latitude/longitude (Decimal 10,7),
  address, tenantId, technicianId (optional), scheduledDate,
  completedDate, notes
- Belongs to: tenant, technician (optional)
- Has many: schedules
- Table: work_orders
- Indexes: tenantId, status, (tenantId+status), technicianId

### Technician
- id (UUID PK), name, email (unique), phone, status (TechnicianStatus),
  specialties (string[]), latitude/longitude (Decimal 10,7), tenantId
- Belongs to: tenant
- Has many: workOrders, schedules
- Table: technicians
- Indexes: tenantId, status, (tenantId+status)

### Schedule
- id (UUID PK), startTime, endTime, status (ScheduleStatus),
  tenantId, technicianId, workOrderId, notes
- Belongs to: tenant, technician, workOrder
- Table: schedules
- Indexes: tenantId, status, (tenantId+status), technicianId, workOrderId

### ServiceArea
- id (UUID PK), name, zipCodes (string[]), latitude/longitude (Decimal 10,7),
  radius (Decimal 10,2), active (boolean), tenantId
- Belongs to: tenant
- Table: service_areas
- Indexes: tenantId, active, (tenantId+active)

## Enums

| Prisma Enum | PostgreSQL Type | Values |
|-------------|----------------|--------|
| UserRole | user_role | admin, user, technician, dispatcher |
| WorkOrderStatus | work_order_status | pending, assigned, in_progress, completed, cancelled, failed |
| TechnicianStatus | technician_status | available, on_assignment, off_duty, suspended |
| ScheduleStatus | schedule_status | scheduled, in_progress, completed, cancelled |
| Priority | priority | low, medium, high, urgent, critical |

## Row Level Security

All tables have ENABLE ROW LEVEL SECURITY and FORCE ROW LEVEL SECURITY.

## GPS Coordinates

All latitude/longitude fields use Decimal(10,7) precision.

## Cross-References

- See [api-contracts.md](./api-contracts.md) for CRUD endpoints
- See [performance.md](./performance.md) for indexing strategy
