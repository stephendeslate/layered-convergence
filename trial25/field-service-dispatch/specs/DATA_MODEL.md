# Data Model -- Field Service Dispatch

## Overview

The data model consists of 8 entities organized around multi-tenant company isolation. All monetary values use Decimal type; GPS coordinates use Float.

## Entity Inventory

[VERIFY:DM-001] 8 entities: Company, User, Customer, Technician, WorkOrder, Route, GpsEvent, Invoice.
> Implementation: `backend/prisma/schema.prisma`

[VERIFY:DM-002] All models use @@map for PostgreSQL table names.
> Implementation: `backend/prisma/schema.prisma`

[VERIFY:DM-003] Multi-word columns use @map for snake_case mapping (e.g., company_id, scheduled_at, work_order_id).
> Implementation: `backend/prisma/schema.prisma`

## Roles

[VERIFY:DM-004] Role enum: ADMIN, DISPATCHER, TECHNICIAN.
> Implementation: `backend/prisma/schema.prisma`

## Entity Definitions

[VERIFY:DM-005] Company entity for multi-tenant isolation with users, customers, technicians, workOrders, routes, invoices relations.
> Implementation: `backend/prisma/schema.prisma` (Company model)

[VERIFY:DM-006] User entity with role-based access and company foreign key.
> Implementation: `backend/prisma/schema.prisma` (User model)

[VERIFY:DM-007] Customer entity linked to company with address field.
> Implementation: `backend/prisma/schema.prisma` (Customer model)

[VERIFY:DM-008] Technician entity with skills array (String[]) and company foreign key.
> Implementation: `backend/prisma/schema.prisma` (Technician model)

[VERIFY:DM-009] WorkOrder entity with WorkOrderStatus state machine and priority field.
> Implementation: `backend/prisma/schema.prisma` (WorkOrder model)

[VERIFY:DM-010] Route entity with RouteStatus state machine and scheduled_at field.
> Implementation: `backend/prisma/schema.prisma` (Route model)

[VERIFY:DM-011] GpsEvent entity with Float for latitude and longitude (not Decimal).
> Implementation: `backend/prisma/schema.prisma` (GpsEvent model)

[VERIFY:DM-012] Invoice entity with Decimal for amount, tax_amount, and total_amount fields.
> Implementation: `backend/prisma/schema.prisma` (Invoice model)

## State Machine Enums

- **WorkOrderStatus:** CREATED, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED
- **InvoiceStatus:** DRAFT, SENT, PAID, OVERDUE
- **RouteStatus:** PLANNED, IN_PROGRESS, COMPLETED

## Cross-References

- See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for state machine transition rules
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for RLS policies on tables
