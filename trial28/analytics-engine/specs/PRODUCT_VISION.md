# Product Vision — Analytics Engine

## Overview
Analytics Engine is a multi-tenant analytics platform enabling organizations to connect data sources,
build ETL pipelines, create dashboards, and embed analytics into their own products.

## Target Users
- **Data Analysts** who build and maintain analytics pipelines
- **Business Users** who consume dashboards and reports
- **Developers** who embed analytics widgets into external applications
- **Platform Administrators** who manage tenants and user access

## Core Value Proposition
Analytics Engine provides a unified platform for ingesting, transforming, and visualizing data
across multiple tenants with strict data isolation and role-based access control.

## Key Capabilities

### Multi-Tenant Data Isolation
Each tenant operates in a fully isolated environment. Data sources, pipelines, dashboards,
and user accounts are scoped to their respective tenant.
<!-- VERIFY:AE-TENANT-ISOLATION — Tenant model with tenant_id foreign keys on all entities -->

### Pipeline State Machine
Pipelines follow a strict DRAFT -> ACTIVE -> PAUSED -> ARCHIVED lifecycle.
State transitions are validated server-side to prevent invalid state changes.
<!-- VERIFY:AE-PIPELINE-FSM — Pipeline entity with PipelineStatus enum -->

### Sync Run Tracking
Data synchronization runs are tracked from PENDING through RUNNING to COMPLETED or FAILED.
Each run records start time, completion time, record count, and error messages.
<!-- VERIFY:AE-SYNCRUN-FSM — SyncRun entity with SyncRunStatus enum -->

### Embeddable Analytics
Dashboards can be embedded in external applications via secure, expirable embed tokens.
<!-- VERIFY:AE-EMBED-TOKEN — Embed entity with token and expiresAt fields -->

## User Roles
- **VIEWER**: Read-only access to assigned dashboards
- **EDITOR**: Can create and modify dashboards and widgets
- **ANALYST**: Full pipeline and data source management
- **ADMIN**: Tenant-level administration (registration restricted)
<!-- VERIFY:AE-ROLES — UserRole enum with VIEWER, EDITOR, ANALYST, ADMIN -->

## Success Metrics
- Sub-second dashboard load times for standard widget configurations
- 99.9% uptime for data pipeline execution
- Zero cross-tenant data leakage incidents

## Technical Foundation
- NestJS backend with Prisma ORM for type-safe database access
- PostgreSQL with Row Level Security for data isolation
- Next.js frontend with server-side rendering for performance
- JWT-based authentication with bcrypt password hashing
<!-- VERIFY:AE-TECH-STACK — NestJS backend, Next.js frontend, PostgreSQL -->

## Roadmap
- Phase 1: Core platform (tenants, users, data sources, basic dashboards)
- Phase 2: Advanced pipelines with scheduling and monitoring
- Phase 3: Embedded analytics with customizable themes
- Phase 4: ML-powered anomaly detection and forecasting
