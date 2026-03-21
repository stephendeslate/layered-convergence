# Product Vision — Field Service Dispatch

## Overview

Field Service Dispatch is a multi-tenant platform for managing field service operations including
work order management, technician dispatch, route planning, GPS tracking, and invoicing.
Companies use it to coordinate service delivery from request through completion and payment.

See also: [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md), [DATA_MODEL.md](DATA_MODEL.md)

## Business Goals

1. Provide a centralized platform for managing field service work orders
2. Enable efficient technician dispatch and route planning
3. Track technician locations in real time via GPS events
4. Automate invoice generation for completed work
5. Ensure complete company isolation for multi-tenant deployments

## Core Capabilities

### Work Order Management
- Dispatchers create work orders with title, description, priority, and customer assignment
- Work orders follow a strict state machine: PENDING -> ASSIGNED -> IN_PROGRESS -> COMPLETED | CANCELLED
- [VERIFY:FD-PV-001] Company is the root multi-tenant entity -> Implementation: apps/api/prisma/schema.prisma:1
- [VERIFY:FD-PV-002] Work order state machine enforces valid transitions only -> Implementation: apps/api/src/work-order/work-order.service.ts:4
- [VERIFY:FD-PV-003] Work order sets completedAt on COMPLETED transition -> Implementation: apps/api/src/work-order/work-order.service.ts:5

### Technician Dispatch
- Technicians have specialties and availability status
- Dispatchers assign technicians to work orders during the PENDING -> ASSIGNED transition
- [VERIFY:FD-PV-004] Technician availability tracking -> Implementation: apps/api/src/technician/technician.service.ts:1

### Route Planning
- Routes group work orders for a technician on a given date
- Optimizes travel between customer locations

### GPS Tracking
- Technicians report GPS coordinates in real time
- GPS events include latitude, longitude (Decimal 10,6), and timestamp
- [VERIFY:FD-PV-005] GPS events use Decimal(10,6) precision -> Implementation: apps/api/prisma/schema.prisma:6

### Invoicing
- Invoices created for completed work orders
- Track payment status with paidAt timestamp
- [VERIFY:FD-PV-006] Invoice amount uses Decimal(20,2) precision -> Implementation: apps/api/prisma/schema.prisma:7

## User Types

### Dispatcher
- Creates and assigns work orders
- Plans routes for technicians
- [VERIFY:FD-PV-007] DISPATCHER role assigned at registration -> Implementation: apps/api/src/auth/auth.service.ts:1

### Technician
- Receives work order assignments
- Reports GPS location during service delivery
- Transitions work orders through IN_PROGRESS to COMPLETED

### Manager
- Oversees operations and reviews metrics
- Views all work orders, technicians, and invoices

## Non-Functional Requirements

- All user passwords hashed with bcrypt (salt rounds: 12)
- JWT-based authentication with no hardcoded secret fallbacks
- Row-Level Security enforced at database level for company isolation
- [VERIFY:FD-PV-008] ADMIN role rejected at registration -> Implementation: apps/api/src/auth/auth.service.ts:2
