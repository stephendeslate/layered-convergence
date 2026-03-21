# Product Vision — Analytics Engine

## Overview

Analytics Engine is a multi-tenant analytics platform that enables organizations to connect
data sources, process data through pipelines, and visualize insights through dashboards.
The platform supports multiple user roles with fine-grained access control.

See also: [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md), [DATA_MODEL.md](DATA_MODEL.md)

## Core Capabilities

### Multi-Tenant Data Management
- Each tenant operates in complete isolation with dedicated data
- [VERIFY:AE-PV-001] DataSource belongs to exactly one Tenant -> Implementation: apps/api/prisma/schema.prisma:62
- Tenants can have multiple users, data sources, pipelines, and dashboards

### Data Processing Pipelines
- [VERIFY:AE-PV-002] SyncRun state machine enforces PENDING->RUNNING->COMPLETED/FAILED transitions -> Implementation: apps/api/src/sync-run/sync-run.service.ts:3
- [VERIFY:AE-PV-003] Pipeline state machine enforces valid transitions only -> Implementation: apps/api/src/pipeline/pipeline.service.ts:3
- [VERIFY:AE-PV-004] Pipeline starts in DRAFT status by default -> Implementation: apps/api/prisma/schema.prisma:90
- Pipelines process data from connected sources through configurable workflows

### Dashboard and Visualization
- [VERIFY:AE-PV-005] Dashboard contains Widgets for data visualization -> Implementation: apps/api/prisma/schema.prisma:101
- [VERIFY:AE-PV-006] Embed uses unique token for secure external access -> Implementation: apps/api/prisma/schema.prisma:113
- Dashboards can be embedded in external applications via unique tokens

### User Management
- [VERIFY:AE-PV-007] ADMIN role rejected at registration to prevent privilege escalation -> Implementation: apps/api/src/auth/auth.service.ts:8
- Users are assigned to tenants with role-based access control
- Available roles: VIEWER, EDITOR, ANALYST

## Target Users

| Role | Capabilities |
|------|-------------|
| VIEWER | Read-only access to dashboards and data |
| EDITOR | Create and modify pipelines, data sources |
| ANALYST | Full analytical capabilities including custom queries |

## Data Flow

1. Administrator connects DataSources to the platform
2. SyncRuns execute data synchronization from sources
3. DataPoints are collected and stored with precision values
4. Pipelines process data through configurable workflows
5. Dashboards display processed data through Widgets
6. Embeds allow external sharing of dashboard views

## Success Metrics

- Sub-second dashboard rendering for datasets under 10K points
- 99.9% uptime for data synchronization pipelines
- Zero cross-tenant data leakage through RLS enforcement
- Full audit trail for all state transitions

## Non-Functional Requirements

- All state transitions must be validated against the state machine
- Decimal precision (20,6) for financial and analytical data
- Row-Level Security on all tenant-scoped database tables
- JWT-based authentication with configurable expiration
