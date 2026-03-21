# Product Vision — Analytics Engine

## Overview

The Analytics Engine is a multi-tenant analytics platform designed for organizations that need
centralized data aggregation, visualization, and sharing capabilities. Each tenant operates in
complete isolation with row-level security enforced at the database layer.

## Target Users

- **Data Analysts** who need to connect multiple data sources and build custom dashboards
- **Business Stakeholders** who consume dashboards and embedded analytics views
- **Platform Administrators** who manage tenants and data source configurations

## Value Proposition

The platform provides a unified analytics layer that connects to multiple data sources, processes
data through configurable pipelines, and renders interactive dashboards with embeddable widgets.
Tenant isolation ensures data security across organizational boundaries.

## Core Capabilities

### Data Ingestion
Data enters the system through DataSource configurations. Each DataSource belongs to exactly one
Tenant and defines connection parameters for external systems.

[VERIFY:PV-001] DataSource belongs to exactly one Tenant via foreign key constraint.
> Implementation: `backend/prisma/schema.prisma:77`

### Data Processing
SyncRun entities track the execution of data synchronization jobs. Each SyncRun follows a strict
state machine to ensure reliable processing.

[VERIFY:PV-002] SyncRun state machine: PENDING -> RUNNING -> SUCCESS | FAILED.
> Implementation: `backend/src/sync-run/sync-run.service.ts:14`

### Pipeline Management
Pipelines define data transformation workflows. They follow a lifecycle from draft through active
use to eventual archival, with validated state transitions at each step.

[VERIFY:PV-003] Pipeline state machine enforces valid transitions only.
> Implementation: `backend/src/pipeline/pipeline.service.ts:10`

[VERIFY:PV-004] Pipeline starts in DRAFT status by default (Prisma schema default).
> Implementation: `backend/prisma/schema.prisma:102`

### Visualization
Dashboards aggregate multiple Widgets into cohesive analytical views. Each Dashboard belongs to a
Tenant and contains zero or more Widgets.

[VERIFY:PV-005] Dashboard contains Widgets via one-to-many relation.
> Implementation: `backend/prisma/schema.prisma:121`

### External Sharing
Embeds enable external access to dashboards via unique tokens. This allows embedding analytics
views in third-party applications without requiring authentication.

[VERIFY:PV-006] Embed uses unique token for external access (UUID, unique constraint).
> Implementation: `backend/prisma/schema.prisma:143`

### Access Control
The system enforces role-based access with three roles: VIEWER, EDITOR, and ANALYST. The ADMIN
role is explicitly excluded from user registration to prevent privilege escalation.

[VERIFY:PV-007] ADMIN role rejected at registration — enforced at both service and DTO levels.
> Implementation: `backend/src/auth/auth.service.ts:22`

## Success Metrics

- Tenant isolation verified via RLS policies (see [SECURITY_MODEL.md](SECURITY_MODEL.md))
- Pipeline state machine correctness (see [API_CONTRACT.md](API_CONTRACT.md))
- Sub-second dashboard load times for standard widget configurations
- Zero cross-tenant data leakage in integration tests

## Cross-References

- **SYSTEM_ARCHITECTURE.md**: Defines the NestJS module structure supporting these capabilities
- **DATA_MODEL.md**: Specifies the entity schema backing the product features
- **SECURITY_MODEL.md**: Details the RLS and authentication mechanisms ensuring tenant isolation
