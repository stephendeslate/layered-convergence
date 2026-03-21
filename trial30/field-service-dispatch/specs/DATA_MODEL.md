# Data Model — Field Service Dispatch

## Overview
This document describes all entities, their fields, relationships, and
database conventions. See PRODUCT_VISION.md for business context and
SYSTEM_ARCHITECTURE.md for how these models are used in the application.

## Entities

<!-- VERIFY:FSD-USER-MODEL — User model with bcrypt salt 12 -->
### User
| Field | Type | Notes |
|-------|------|-------|
| id | String (CUID) | Primary key |
| email | String | Unique index |
| passwordHash | String | bcrypt with salt 12, @map("password_hash") |
| role | UserRole | Default TECHNICIAN |
| createdAt | DateTime | @map("created_at") |
| updatedAt | DateTime | @map("updated_at") |

Relations: has many WorkOrder (as technician), has many Skill, has many Schedule.
Table: @@map("users")

<!-- VERIFY:FSD-CUSTOMER-MODEL — Customer model with address -->
### Customer
| Field | Type | Notes |
|-------|------|-------|
| id | String (CUID) | Primary key |
| name | String | Customer name |
| email | String | Unique index |
| phone | String | Contact phone |
| address | String | Service address |
| createdAt | DateTime | @map("created_at") |
| updatedAt | DateTime | @map("updated_at") |

Relations: has many WorkOrder.
Table: @@map("customers")

<!-- VERIFY:FSD-SERVICEAREA-MODEL — ServiceArea model with zip codes -->
### ServiceArea
| Field | Type | Notes |
|-------|------|-------|
| id | String (CUID) | Primary key |
| name | String | Unique index |
| zipCodes | String[] | @map("zip_codes") |
| createdAt | DateTime | @map("created_at") |

Relations: has many WorkOrder.
Table: @@map("service_areas")

<!-- VERIFY:FSD-WORKORDER-MODEL — WorkOrder model with Decimal cost fields -->
### WorkOrder
| Field | Type | Notes |
|-------|------|-------|
| id | String (CUID) | Primary key |
| title | String | Work order title |
| description | String | Detailed description |
| status | WorkOrderStatus | Default OPEN |
| priority | Priority | Default MEDIUM |
| estimatedCost | Decimal(20,2) | @map("estimated_cost") |
| actualCost | Decimal(20,2) | @map("actual_cost") |
| customerId | String | FK to Customer, @map("customer_id") |
| technicianId | String? | FK to User, @map("technician_id") |
| serviceAreaId | String? | FK to ServiceArea, @map("service_area_id") |
| scheduledAt | DateTime? | @map("scheduled_at") |
| completedAt | DateTime? | @map("completed_at") |
| createdAt | DateTime | @map("created_at") |
| updatedAt | DateTime | @map("updated_at") |

Relations: belongs to Customer, belongs to User (technician), belongs to ServiceArea, has many Equipment.
Table: @@map("work_orders")

<!-- VERIFY:FSD-ENUM-MAP — All enums have @@map -->
## Enums
- **UserRole**: TECHNICIAN, DISPATCHER, MANAGER, ADMIN — @@map("user_role")
- **WorkOrderStatus**: OPEN, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED — @@map("work_order_status")
- **Priority**: LOW, MEDIUM, HIGH, CRITICAL — @@map("priority")

<!-- VERIFY:FSD-COLUMN-MAP — @map on multi-word columns -->
All multi-word column names use @map for snake_case database columns.
Examples: passwordHash -> password_hash, estimatedCost -> estimated_cost,
serviceAreaId -> service_area_id, completedAt -> completed_at.

## Equipment, Skill, Schedule Models
Equipment tracks tools with unique serial numbers. Skills define technician
competencies with proficiency levels. Schedules define availability windows.
All models use @@map for snake_case table names and @map for multi-word columns.
See PRODUCT_VISION.md for business usage of these entities.

<!-- VERIFY:FSD-DECIMAL-FIELDS — Decimal type for cost fields -->
Monetary values (estimatedCost, actualCost) use Decimal(20,2) precision,
never Float, to prevent floating-point rounding errors in financial calculations.
