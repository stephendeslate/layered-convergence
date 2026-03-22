# Database Specification

## Overview

The database layer uses PostgreSQL 16 with Prisma ORM. The schema defines
six models supporting multi-tenant analytics: Tenant, User, Dashboard,
Pipeline, PipelineRun, and Report.

## Models

### Tenant
Represents an organization. All other models reference a tenant.
Fields: id, name, slug, createdAt, updatedAt.

### User
Belongs to a tenant. Has email, password hash, name, and role.
Fields: id, email, passwordHash, name, role, tenantId, createdAt, updatedAt.

### Dashboard
A visualization container belonging to a tenant.
Fields: id, title, slug, description, config, tenantId, createdBy, createdAt, updatedAt.

### Pipeline
A data processing pipeline belonging to a tenant.
Fields: id, name, description, schedule, status, config, tenantId, createdBy, createdAt, updatedAt.

### PipelineRun
A record of a pipeline execution.
Fields: id, pipelineId, status, startedAt, completedAt, errorMessage, createdAt.

### Report
A generated report belonging to a tenant.
Fields: id, title, description, format, data, tenantId, dashboardId, createdAt, updatedAt.

## Schema Conventions

[VERIFY: AE-DB-01] All models use @@map() to define lowercase table names.

[VERIFY: AE-DB-02] Enum values use individual @map() annotations for
lowercase database representation.

[VERIFY: AE-DB-03] The schema defines a UserRole enum with ADMIN, EDITOR,
and VIEWER values.

[VERIFY: AE-DB-04] The schema defines a PipelineStatus enum with ACTIVE,
PAUSED, FAILED, and ARCHIVED values.

## Row-Level Security

[VERIFY: AE-DB-05] The initial migration enables RLS on all tables using
ALTER TABLE ... ENABLE ROW LEVEL SECURITY.

[VERIFY: AE-DB-06] The initial migration uses FORCE ROW LEVEL SECURITY
on all tables.

## Seeding

[VERIFY: AE-DB-07] The seed script creates at least one pipeline with
FAILED status and at least one pipeline run with FAILED status.

[VERIFY: AE-DB-08] The seed script error handler uses console.error and
process.exit(1), not a bare throw.
