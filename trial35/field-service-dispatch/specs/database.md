# Database Schema

**Project:** field-service-dispatch
**Layer:** 5 — Monorepo
**Version:** 1.0.0

---

## Overview

The database uses PostgreSQL 16 with Prisma 6 as the ORM. All models
use @@map for snake_case table names, and all multi-word columns use @map.
GPS coordinate fields use Decimal @db.Decimal(10, 7) for precision.

## Schema Design

- VERIFY: FD-DB-001 — Prisma schema defines generator and datasource
- VERIFY: FD-DB-002 — Tenant model with @@map("tenants") and @map on columns
- VERIFY: FD-DB-003 — User model with role enum and tenant relation

## Domain Models

The system has five core models: Tenant, User, WorkOrder, Technician,
and Schedule. All are scoped by tenant for multi-tenant isolation.

### Work Orders

Work orders represent field service tasks with GPS location, priority,
and status tracking. Status transitions are enforced by the service layer.

### Technicians

Technicians have GPS coordinates stored as Decimal(10, 7) for sub-meter
accuracy. This provides 7 decimal places of latitude and longitude.

- VERIFY: FD-DB-005 — Technician model uses Decimal @db.Decimal(10, 7) for GPS
- VERIFY: FD-DB-006 — Schedule model links work orders to technicians

## Enum Mappings

All enums use @@map for snake_case type names in PostgreSQL:
- UserRole -> user_role
- WorkOrderStatus -> work_order_status
- WorkOrderPriority -> work_order_priority
- TechnicianStatus -> technician_status

- VERIFY: FD-DB-008 — All models use @@map and all multi-word columns use @map

## Migration

The initial migration creates all tables, indexes, and constraints.
Row Level Security is enabled and forced on every table.

- VERIFY: FD-MIG-001 — Initial migration creates all tables with constraints
- VERIFY: FD-MIG-002 — RLS ENABLE and FORCE on all tables

## Seed Data

The seed script creates a demo tenant with a dispatcher, viewer, three
technicians at US city coordinates, three work orders, and two schedules.

- VERIFY: FD-SEED-001 — Seed creates tenant, users, technicians, work orders, schedules

## GPS Coordinate Format

Latitude and longitude are stored as DECIMAL(10, 7) in the database,
matching the Prisma schema's @db.Decimal(10, 7). This provides
precision to approximately 1.1 centimeters at the equator, sufficient
for pinpointing technician locations in field service operations.

## findFirst Justification

All findFirst queries in the codebase include justification comments
explaining why findFirst is used instead of findUnique:
- Tenant-scoped lookups use findFirst with tenantId + id compound filter
- Email lookups use findFirst with tenantId + email compound filter
