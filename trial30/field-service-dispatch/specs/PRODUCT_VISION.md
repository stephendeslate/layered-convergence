# Product Vision — Field Service Dispatch

## Overview
Field Service Dispatch is a field service management platform that enables
organizations to create work orders, assign technicians, manage schedules,
and track service completion. See DATA_MODEL.md for entity definitions
and SYSTEM_ARCHITECTURE.md for technical implementation details.

## Problem Statement
Field service organizations need a centralized platform to manage work orders,
technician assignments, and scheduling. Manual dispatch processes lead to
missed appointments, underutilized technicians, and poor customer experience.
Field Service Dispatch solves this with a structured work order lifecycle,
skill-based technician matching, and service area management.

## Target Users
- **Technicians** — view assigned work orders, update status, log completion
- **Dispatchers** — create work orders, assign technicians, manage schedules
- **Managers** — oversee operations, review metrics, manage teams
- **Administrators** — system configuration, user management, area setup

## Core Capabilities
1. Work order lifecycle management with state machine transitions
2. Technician scheduling with day-of-week availability windows
3. Customer management with address-based service area mapping
4. Equipment tracking with serial numbers and condition monitoring
5. Skill-based technician profiles for intelligent assignment
6. Service area management with zip code coverage zones

## Entity Overview
<!-- VERIFY:FSD-WORKORDER-FSM — WorkOrder entity with WorkOrderStatus enum -->
Work orders follow a state machine: OPEN -> ASSIGNED -> IN_PROGRESS -> COMPLETED.
Work orders can also be CANCELLED from OPEN, ASSIGNED, or IN_PROGRESS states.
See API_CONTRACT.md for endpoint details and SECURITY_MODEL.md for access control.

<!-- VERIFY:FSD-PRIORITY-ENUM — Priority enum with 4 levels -->
Work orders have priority levels: LOW, MEDIUM, HIGH, CRITICAL.
Priority determines dispatch ordering and technician assignment urgency.

<!-- VERIFY:FSD-ROLES — UserRole enum with 4 roles -->
Users have roles: TECHNICIAN, DISPATCHER, MANAGER, ADMIN. Self-registration
excludes the ADMIN role for security (see SECURITY_MODEL.md for enforcement).

<!-- VERIFY:FSD-SCHEDULE-MODEL — Schedule entity with day/time windows -->
Schedules define technician availability with day-of-week, start time,
and end time fields. Multiple schedules per technician allow flexible
weekly availability patterns.

<!-- VERIFY:FSD-EQUIPMENT-MODEL — Equipment entity with serial tracking -->
Equipment items are tracked with unique serial numbers and condition status.
Equipment can be associated with specific work orders for tool tracking.

<!-- VERIFY:FSD-TECH-STACK — NestJS + Next.js + PostgreSQL -->
- Backend: NestJS ^11.0.0 with Prisma ^6.0.0 ORM
- Frontend: Next.js ^15.0.0 with Tailwind CSS and shadcn/ui
- Database: PostgreSQL 16 with Row Level Security
- Testing: Jest, Supertest, jest-axe (see TESTING_STRATEGY.md)

## Security Requirements
Security controls are described in SECURITY_MODEL.md. API endpoints are
detailed in API_CONTRACT.md. All authentication uses JWT with bcrypt hashing.
No hardcoded secret fallbacks are permitted in any environment.

## Accessibility Requirements
The UI must comply with WCAG 2.1 AA standards. All interactive components
use proper ARIA attributes. See UI_SPECIFICATION.md for component details
and TESTING_STRATEGY.md for automated accessibility testing.

## Success Metrics
- Sub-second work order listing load times
- Zero unauthorized role escalation verified by @IsIn validators
- All work order state transitions validated server-side
- WCAG 2.1 AA compliance for all UI components verified by jest-axe
- Complete audit trail through work order status history
