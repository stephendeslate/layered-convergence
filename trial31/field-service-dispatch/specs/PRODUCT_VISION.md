# Product Vision — Field Service Dispatch

## Purpose
Field Service Dispatch (FSD) is a multi-company field service management platform for dispatching technicians, managing work orders, tracking routes, and handling invoicing.

## Core Domain Entities

### Company
Multi-tenant isolation unit. Every entity belongs to a company via `company_id` foreign key.
<!-- VERIFY:FD-COMPANY-ISOLATION -->

### Users and Roles
Users have four roles: DISPATCHER, TECHNICIAN, MANAGER, ADMIN. The ADMIN role is reserved for system-created accounts and excluded from self-registration.
<!-- VERIFY:FD-ROLES -->

### Work Order
Central entity for field service tasks. Follows a strict state machine:
- PENDING -> ASSIGNED -> IN_PROGRESS -> COMPLETED
- PENDING -> CANCELLED (at any pre-completion stage)
- Terminal states: COMPLETED, CANCELLED
<!-- VERIFY:FD-WORKORDER-FSM -->

### Route
Groups work orders into a daily technician dispatch schedule.
- PLANNED -> ACTIVE -> COMPLETED
<!-- VERIFY:FD-ROUTE-FSM -->

### Invoice
Billing entity linked to completed work orders. Follows a financial state machine:
- DRAFT -> SENT -> PAID
- SENT -> OVERDUE -> PAID (late payment recovery)
- Any pre-paid state -> VOID (cancellation)
<!-- VERIFY:FD-INVOICE-FSM -->

### Technician
Field service workers with specialties and GPS tracking capability.
<!-- VERIFY:FD-TECHNICIAN-ENTITY -->

### Customer
Service recipients with contact and address information.
<!-- VERIFY:FD-CUSTOMER-ENTITY -->

### GPS Event
Real-time location tracking for technicians in the field. Uses Decimal(10,7) for coordinate precision.
<!-- VERIFY:FD-GPS-ENTITY -->

## Technology Stack
- Backend: NestJS ^11.0.0 with Prisma ^6.0.0 ORM
- Frontend: Next.js ^15.0.0 with React ^19.0.0
- Database: PostgreSQL 16 with Row Level Security
- Auth: JWT tokens with bcrypt password hashing (salt 12)
<!-- VERIFY:FD-TECH-STACK -->

## Cross-References
- See SYSTEM_ARCHITECTURE.md for infrastructure and deployment details
- See DATA_MODEL.md for complete entity schemas and relationships
