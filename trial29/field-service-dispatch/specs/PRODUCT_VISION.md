# Product Vision — Field Service Dispatch

## Overview
Field Service Dispatch is a field service management platform that enables
companies to manage work orders, dispatch technicians, optimize routes, and
track GPS events in real time. See DATA_MODEL.md for entity definitions
and SYSTEM_ARCHITECTURE.md for technical implementation details.

## Problem Statement
Field service organizations struggle to coordinate technicians across
geographically dispersed job sites. Manual scheduling leads to wasted travel
time, missed appointments, and lack of real-time visibility into field
operations. A centralized dispatch system is required.

## Target Users
- **Dispatchers** — assign work orders and manage daily schedules
- **Technicians** — receive assignments and report job completion
- **Managers** — oversee operations and review invoicing
- **Customers** — receive service and view job status

## Core Capabilities
1. Multi-company tenant isolation with Row Level Security
2. Work order lifecycle management with state machine
3. Technician dispatch with skill-based assignment
4. Route planning and optimization with GPS tracking
5. Invoice generation tied to completed work orders
6. Real-time GPS event streaming from field devices

## Entity Overview
<!-- VERIFY:FD-COMPANY-ISOLATION — Company model with company_id foreign keys -->
All data is scoped to a Company. Users belong to exactly one company.

<!-- VERIFY:FD-WORKORDER-FSM — WorkOrder entity with WorkOrderStatus enum -->
Work orders follow a state machine: PENDING -> ASSIGNED -> IN_PROGRESS -> COMPLETED or CANCELLED.

<!-- VERIFY:FD-ROUTE-FSM — Route entity with RouteStatus enum -->
Routes track dispatch logistics: PLANNED -> ACTIVE -> COMPLETED.

<!-- VERIFY:FD-INVOICE-FSM — Invoice entity with InvoiceStatus enum -->
Invoices follow billing lifecycle: DRAFT -> SENT -> PAID or VOID.

<!-- VERIFY:FD-ROLES — UserRole enum with 4 roles -->
Users have roles: DISPATCHER, TECHNICIAN, MANAGER, ADMIN.

<!-- VERIFY:FD-GPS-EVENTS — GpsEvent entity with lat/lng coordinates -->
GPS events record technician location with latitude and longitude.

## Technical Stack
<!-- VERIFY:FD-TECH-STACK — NestJS + Next.js + PostgreSQL -->
- Backend: NestJS ^11.0.0 with Prisma ^6.0.0
- Frontend: Next.js ^15.0.0 with Tailwind CSS
- Database: PostgreSQL 16 with RLS

## Security Requirements
Security controls are described in SECURITY_MODEL.md. API endpoints are
detailed in API_CONTRACT.md. All authentication uses JWT with bcrypt hashing.

## Success Metrics
- Sub-second dispatch assignment response times
- Zero cross-company data leakage
- 99.9% uptime for the dispatch API
- WCAG 2.1 AA compliance for all UI components
- GPS event ingestion at 1000+ events per minute
