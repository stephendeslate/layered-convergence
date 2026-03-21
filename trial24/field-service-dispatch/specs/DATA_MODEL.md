# Data Model — Field Service Dispatch

## Overview

The FSD data model consists of 8 domain entities mapped to PostgreSQL tables via Prisma 6.
All models use `@@map` for table names and `@map` for multi-word column names to maintain
snake_case naming in the database while using camelCase in application code.

## Entity Relationship Diagram

```
Company 1──* User
Company 1──* Customer
Company 1──* Technician
Company 1──* WorkOrder
Company 1──* Invoice
Company 1──* Route
Customer 1──* WorkOrder
Customer 1──* Invoice
Technician 1──* WorkOrder
Technician 1──* Route
Technician 1──* GpsEvent
WorkOrder 1──* Invoice
Route 1──* GpsEvent
```

## Enums

### Role
- `DISPATCHER` — office staff with full CRUD access
- `TECHNICIAN` — field worker with limited access

### WorkOrderStatus
OPEN, ASSIGNED, IN_PROGRESS, COMPLETED, INVOICED, CLOSED, CANCELLED

### InvoiceStatus
DRAFT, SENT, PAID, VOID

### RouteStatus
PLANNED, IN_PROGRESS, COMPLETED

### GpsEventType
LOCATION_UPDATE, ARRIVAL, DEPARTURE, BREAK_START, BREAK_END

## Entity Definitions

### Company
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| name | String | Company display name |
| createdAt | DateTime | Auto-set on creation |
| updatedAt | DateTime | Auto-updated |

### User
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| email | String | Unique |
| passwordHash | String | bcrypt hashed, `@map("password_hash")` |
| role | Role | DISPATCHER or TECHNICIAN |
| companyId | UUID | FK to Company |

### WorkOrder
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| title | String | Required |
| description | String? | Optional |
| status | WorkOrderStatus | Default: OPEN |
| priority | Int? | Optional priority level |
| scheduledDate | DateTime? | `@map("scheduled_date")` |
| completedDate | DateTime? | `@map("completed_date")` |
| customerId | UUID | FK to Customer |
| technicianId | UUID? | FK to Technician (nullable) |
| companyId | UUID | FK to Company |

### Technician
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| name | String | Display name |
| email | String | Contact email |
| phone | String? | Optional phone |
| companyId | UUID | FK to Company |

### Customer
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| name | String | Customer name |
| email | String? | Optional email |
| phone | String? | Optional phone |
| address | String? | Service address |
| companyId | UUID | FK to Company |

### Route
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| name | String | Route name |
| date | DateTime | Route date |
| status | RouteStatus | Default: PLANNED |
| estimatedDistance | Decimal(10,2) | NOT Float |
| technicianId | UUID | FK to Technician |
| companyId | UUID | FK to Company |

### GpsEvent
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| eventType | GpsEventType | `@map("event_type")` |
| latitude | Float | GPS coordinate |
| longitude | Float | GPS coordinate |
| timestamp | DateTime | Event timestamp |
| technicianId | UUID | FK to Technician |
| routeId | UUID? | Optional FK to Route |
| companyId | UUID | FK to Company |

### Invoice
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| invoiceNumber | String | `@map("invoice_number")` |
| status | InvoiceStatus | Default: DRAFT |
| amount | Decimal(12,2) | Base amount |
| taxAmount | Decimal(12,2) | `@map("tax_amount")` |
| totalAmount | Decimal(12,2) | `@map("total_amount")` |
| workOrderId | UUID | FK to WorkOrder |
| customerId | UUID | FK to Customer |
| companyId | UUID | FK to Company |

## Verified Data Model Requirements

[VERIFY:DM-001] All models MUST use `@@map` for table names and `@map` for multi-word columns.
> Implementation: `backend/prisma/schema.prisma`

[VERIFY:DM-002] WorkOrderStatus enum MUST include all 7 states: OPEN, ASSIGNED, IN_PROGRESS,
COMPLETED, INVOICED, CLOSED, CANCELLED.
> Implementation: `backend/prisma/schema.prisma`

[VERIFY:DM-003] InvoiceStatus enum MUST include: DRAFT, SENT, PAID, VOID.
> Implementation: `backend/prisma/schema.prisma`

[VERIFY:DM-004] RouteStatus enum MUST include: PLANNED, IN_PROGRESS, COMPLETED.
> Implementation: `backend/prisma/schema.prisma`

[VERIFY:DM-005] `estimatedDistance` MUST use `Decimal(10,2)`, NOT `Float`.
> Implementation: `backend/prisma/schema.prisma`

[VERIFY:DM-006] `Float` MUST be used ONLY for GPS coordinates (latitude, longitude).
> Implementation: `backend/prisma/schema.prisma`

[VERIFY:DM-007] All monetary fields (amount, taxAmount, totalAmount) MUST use `Decimal(12,2)`.
> Implementation: `backend/prisma/schema.prisma`

## Cross-References

- See [PRODUCT_VISION.md](./PRODUCT_VISION.md) for entity business descriptions.
- See [API_CONTRACT.md](./API_CONTRACT.md) for how entities are exposed via REST endpoints.
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for RLS policies on company-scoped tables.
