# Product Vision — Analytics Engine

## Overview
Analytics Engine is a multi-tenant analytics platform that enables organizations
to connect data sources, build ETL pipelines, create dashboards, and embed
analytics into external applications. See DATA_MODEL.md for entity definitions
and SYSTEM_ARCHITECTURE.md for technical implementation details.

## Problem Statement
Organizations need a unified platform to collect, process, and visualize data
from multiple sources. Current solutions lack multi-tenant isolation, making
them unsuitable for SaaS deployments. Analytics Engine solves this with
PostgreSQL Row Level Security and tenant-scoped data access.

## Target Users
- **Data Analysts** — build dashboards, explore data, run ad-hoc queries
- **Data Engineers** — configure pipelines, manage data sources and sync runs
- **Executives** — view embedded reports, executive summaries, KPI dashboards
- **Platform Admins** — manage tenants, user access, system configuration

## Core Capabilities
1. Multi-tenant data isolation with Row Level Security (see SECURITY_MODEL.md)
2. Flexible data source connectivity (databases, APIs, CSV files)
3. ETL pipeline management with lifecycle states and scheduling
4. Dashboard creation with configurable widget types
5. Secure embed tokens for external sharing with expiration
6. Real-time sync run monitoring with error tracking

## Entity Overview
<!-- VERIFY:AE-TENANT-ISOLATION — Tenant model with tenant_id foreign keys -->
All data is scoped to a Tenant. Users belong to exactly one tenant.
Cross-tenant data access is prevented at the database level.

<!-- VERIFY:AE-PIPELINE-FSM — Pipeline entity with PipelineStatus enum -->
Pipelines follow a state machine: DRAFT -> ACTIVE -> PAUSED -> ARCHIVED.
Only valid transitions are allowed (see API_CONTRACT.md for endpoint details).

<!-- VERIFY:AE-SYNCRUN-FSM — SyncRun entity with SyncRunStatus enum -->
Sync runs track execution: PENDING -> RUNNING -> COMPLETED or FAILED.
Failed runs include error messages for debugging and retry decisions.

<!-- VERIFY:AE-EMBED-TOKEN — Embed entity with token and expiresAt -->
Embeds use unique tokens with configurable expiration for secure external access.

<!-- VERIFY:AE-ROLES — UserRole enum with 4 roles -->
Users have roles: VIEWER, EDITOR, ANALYST, ADMIN. Self-registration excludes
the ADMIN role for security (see SECURITY_MODEL.md for enforcement details).

## Technical Stack
<!-- VERIFY:AE-TECH-STACK — NestJS + Next.js + PostgreSQL -->
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
- Sub-second dashboard load times for cached queries
- Zero cross-tenant data leakage verified by RLS policies
- 99.9% uptime for the analytics API with health checks
- WCAG 2.1 AA compliance for all UI components verified by jest-axe
- All ETL pipeline state transitions validated server-side
