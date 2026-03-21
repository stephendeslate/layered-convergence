# Product Vision — Field Service Dispatch

## Purpose
Field Service Dispatch is a comprehensive platform for managing field service
operations including work order management, technician dispatching, route
optimization, and invoicing.

## Core Entities

### Company
Multi-tenant isolation unit. Each company has its own users, customers,
technicians, work orders, routes, and invoices.

### User
Platform users with role-based access control.
UserRole enum: DISPATCHER, TECHNICIAN, MANAGER, ADMIN.
<!-- VERIFY:FD-ROLES — UserRole enum with 4 roles -->

### Customer
Service recipients with contact information and address.
Customers belong to a company and can have multiple work orders.

### Technician
Field service professionals with specialties.
Technicians are assigned to work orders and routes.

### Work Order
Service requests that follow a state machine:
PENDING -> ASSIGNED -> IN_PROGRESS -> COMPLETED -> CANCELLED.
Work orders track estimated and actual costs using Decimal precision.
<!-- VERIFY:FD-WORKORDER-FSM — WorkOrder with WorkOrderStatus enum -->

### Route
Planned service routes for technicians:
PLANNED -> ACTIVE -> COMPLETED.
Routes group work orders for efficient dispatching.
<!-- VERIFY:FD-ROUTE-FSM — Route with RouteStatus enum -->

### GPS Event
Real-time location tracking for technicians in the field.
Records latitude, longitude, altitude, speed, and timestamp.
<!-- VERIFY:FD-GPS-MODEL — GpsEvent entity for location tracking -->

### Invoice
Billing records generated from completed work orders:
DRAFT -> SENT -> PAID -> OVERDUE -> VOID.
Invoices use Decimal precision for all monetary amounts.
<!-- VERIFY:FD-INVOICE-FSM — Invoice with InvoiceStatus enum -->

## Technology Stack
NestJS ^11.0.0 backend with Prisma ^6.0.0 ORM.
Next.js ^15.0.0 frontend with App Router.
PostgreSQL 16 database with Row Level Security.
<!-- VERIFY:FD-TECH-STACK — NestJS + Next.js + PostgreSQL -->

## Business Value
- Reduce dispatch time with optimized route planning
- Real-time technician tracking via GPS events
- Automated invoicing from completed work orders
- Multi-tenant architecture for SaaS deployment
