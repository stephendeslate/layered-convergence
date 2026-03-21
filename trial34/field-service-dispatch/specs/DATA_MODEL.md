# Data Model Specification — Field Service Dispatch

## Overview

The data model consists of 8 entities with 4 enums, all using @@map for snake_case
database naming. Multi-tenancy is enforced via Row Level Security (RLS) on all tables.
See REQUIREMENTS.md for functional context and STATE_MACHINES.md for status transitions.

## Entities

### Tenant
Root entity for multi-tenancy. Has slug for URL-safe identification.
Related: User (1:N), WorkOrder (1:N), Technician (1:N), ServiceArea (1:N),
Equipment (1:N), AuditLog (1:N).

### User
Authenticated user belonging to a tenant. Roles: OWNER, ADMIN, DISPATCHER, TECHNICIAN.
passwordHash stored with bcrypt salt 12. See AUTH_SPEC.md for auth details.

### WorkOrder
Core domain entity representing a field service request. Has title, description,
priority (LOW/MEDIUM/HIGH/URGENT), and status (7-state machine). Optionally assigned
to a Technician. Tracks transitions via WorkOrderTransition.

### Technician
Field service worker with specialization, availability status, and GPS coordinates.
Availability: AVAILABLE, ON_JOB, OFF_DUTY, ON_LEAVE.

### ServiceArea, Equipment, AuditLog
Supporting entities for geographic service zones, tracked equipment with serial numbers,
and system audit trail. See STATE_MACHINES.md for work order states.

### WorkOrderTransition
Audit trail for status changes on work orders. Records fromStatus, toStatus,
and changedBy (user or technician ID) with timestamp.

## Schema Conventions

### @@map Directive
All 8 models and all 4 enums use @@map for snake_case table/type names in PostgreSQL.
This ensures consistent naming between Prisma schema and database.
- VERIFY: FD-DA-MAP-001 — @@map on ALL models AND enums in schema.prisma

### Tenant Context Type
The TenantContext interface in shared package defines the shape of tenant-scoped requests.
- VERIFY: FD-DA-TENANT-001 — TenantContext type exported from shared package

### WorkOrder Status Enum
Work order statuses are defined as a TypeScript union type in shared and as a Prisma enum.
- VERIFY: FD-DA-STATE-001 — WorkOrderStatus type in shared package

## Prisma Service

The PrismaService extends PrismaClient and provides tenant context setting via RLS.
It uses $executeRaw with Prisma.sql template literals (never $executeRawUnsafe).
- VERIFY: FD-DA-PRISMA-001 — PrismaService with RLS context in prisma.service.ts
- VERIFY: FD-DA-RLS-001 — $executeRaw with Prisma.sql for tenant context

## Row Level Security

The migration enables and forces RLS on all 8 tables. This ensures tenant isolation
at the database level, preventing cross-tenant data access even if application code
has bugs. Every table referenced in the schema has both ENABLE and FORCE directives.
- VERIFY: FD-DA-RLS-002 — RLS ENABLE + FORCE on all tables in migration

## Seed Data

Seed script creates realistic data including escalated and error states for testing.
Includes tenant, users (OWNER + DISPATCHER), technicians (AVAILABLE + ON_JOB),
work orders (COMPLETED with transitions + ESCALATED + CREATED), service area,
equipment, and audit log entries.
- VERIFY: FD-SV-SEED-001 — Seed with tenant, users, work orders, technicians
- VERIFY: FD-SV-SEED-002 — Escalated/cancelled work order seed data

## Cross-References
- See AUTH_SPEC.md for user authentication and role validation
- See STATE_MACHINES.md for work order status transitions
- See SECURITY.md for RLS and data isolation details
