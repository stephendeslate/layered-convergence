# Product Vision -- Field Service Dispatch

## Overview

Field Service Dispatch is a comprehensive platform for managing field operations including work order management, technician dispatch, route planning with GPS tracking, and automated invoicing.

## Target Users

- **Administrators** -- Full system access, company management
- **Dispatchers** -- Create and assign work orders, plan routes, manage technicians
- **Technicians** -- View assigned work orders, update status, record GPS locations

## Value Proposition

The platform streamlines field service operations by providing a unified system for work order lifecycle management, intelligent technician dispatch based on skills, optimized route planning with real-time GPS tracking, and automated invoice generation tied to completed work.

## Core Entities

The platform manages 8 core entities: Company, User, Customer, Technician, WorkOrder, Route, GpsEvent, and Invoice. Each entity with state follows strict state machine transitions for auditability.

See [DATA_MODEL.md](./DATA_MODEL.md) for entity definitions and [SECURITY_MODEL.md](./SECURITY_MODEL.md) for access control policies.

## Success Metrics

[VERIFY:PV-001] The platform supports 3 user roles: ADMIN, DISPATCHER, TECHNICIAN with role-based access control.
> Implementation: `backend/prisma/schema.prisma` (Role enum)

[VERIFY:PV-002] The landing page communicates the core capabilities: work orders, technician dispatch, and route planning.
> Implementation: `frontend/app/page.tsx`

[VERIFY:PV-003] Field service dispatch platform with GPS tracking and invoicing.
> Implementation: `frontend/app/page.tsx`

## Feature Priorities

1. **Work Order Management** -- Full lifecycle from creation through assignment, execution, and completion
2. **Technician Dispatch** -- Skill-based assignment and availability tracking
3. **Route Planning** -- Optimized route creation with GPS tracking
4. **GPS Tracking** -- Real-time location recording for field technicians
5. **Invoicing** -- Automated invoice generation from completed work orders

## Cross-References

- See [API_CONTRACT.md](./API_CONTRACT.md) for endpoint definitions
- See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for quality assurance approach
- See [UI_SPECIFICATION.md](./UI_SPECIFICATION.md) for page inventory
