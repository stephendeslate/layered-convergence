# Database Specification

## Overview

PostgreSQL 16 database accessed via Prisma ^6.0.0 ORM.
All tables use snake_case naming convention via Prisma @@map/@map decorators.

## Models

### Tenant
- `id` (UUID, PK)
- `name` (string)
- `slug` (string, unique)
- `created_at`, `updated_at` (timestamps)
- Relations: has many Users, Dashboards, Pipelines, Reports

### User
- `id` (UUID, PK)
- `tenant_id` (FK -> tenants)
- `email` (string, unique)
- `name` (string)
- `password_hash` (string)
- `role` (user_role enum, default: viewer)
- `created_at`, `updated_at` (timestamps)
- Index: tenant_id

### Dashboard
- `id` (UUID, PK)
- `tenant_id` (FK -> tenants)
- `name`, `description` (strings)
- `config` (JSONB, default: {})
- `created_by_id` (FK -> users)
- `created_at`, `updated_at` (timestamps)
- Index: tenant_id

### Pipeline
- `id` (UUID, PK)
- `tenant_id` (FK -> tenants)
- `name`, `description` (strings)
- `status` (pipeline_status enum, default: active)
- `schedule` (string, nullable)
- `config` (JSONB, default: {})
- `created_by_id` (FK -> users)
- `created_at`, `updated_at` (timestamps)
- Index: tenant_id
- Relations: has many PipelineRuns

### PipelineRun
- `id` (UUID, PK)
- `pipeline_id` (FK -> pipelines)
- `status` (pipeline_status enum, default: active)
- `started_at`, `completed_at` (timestamps)
- `error_message` (string, nullable)
- `records_processed` (int, default: 0)
- `created_at` (timestamp)
- Index: pipeline_id

### Report
- `id` (UUID, PK)
- `tenant_id` (FK -> tenants)
- `name`, `description` (strings)
- `status` (report_status enum, default: draft)
- `config` (JSONB, default: {})
- `generated_at` (timestamp, nullable)
- `error_message` (string, nullable)
- `created_by_id` (FK -> users)
- `created_at`, `updated_at` (timestamps)
- Index: tenant_id

## Enums

- `user_role`: admin, manager, analyst, viewer
- `pipeline_status`: active, paused, failed, completed
- `report_status`: draft, published, failed, archived

## Security

- Row Level Security (RLS) is ENABLED and FORCED on all tables
- Application-level tenant isolation via tenantId filtering on all queries
- No `$executeRawUnsafe` or `$queryRawUnsafe` calls in codebase

## Seed Data

The seed script creates:
- 1 tenant (Acme Analytics)
- 2 users (admin, analyst)
- 2 dashboards
- 2 pipelines (1 ACTIVE, 1 FAILED)
- 3 pipeline runs (2 COMPLETED, 1 FAILED with error message)
- 3 reports (1 PUBLISHED, 1 FAILED with error message, 1 DRAFT)

## VERIFY Tags

- `AE-DB-001`: PrismaService with OnModuleInit and OnModuleDestroy <!-- VERIFY: AE-DB-001 -->
- `AE-DB-002`: Dashboard creation with sanitized input <!-- VERIFY: AE-DB-002 -->
- `AE-DB-003`: Pipeline creation with sanitized input <!-- VERIFY: AE-DB-003 -->
- `AE-DB-004`: RLS enabled and forced on all tables <!-- VERIFY: AE-DB-004 -->
- `AE-DB-005`: Snake_case mapping on all models and columns <!-- VERIFY: AE-DB-005 -->
- `AE-DB-006`: Seed includes FAILED pipeline and FAILED report states <!-- VERIFY: AE-DB-006 -->
