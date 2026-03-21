# Product Vision — Analytics Engine

## Overview

The Analytics Engine is a multi-tenant analytics platform that enables organizations to connect
data sources, build processing pipelines, create dashboards with widgets, and share insights
through embeddable views. The platform supports three user roles (VIEWER, EDITOR, ANALYST)
with tenant-level isolation enforced at the database level.

## Target Users

- **Data Analysts** who need to explore and visualize data across multiple sources
- **Business Users** who consume dashboards and embedded analytics
- **Platform Operators** who manage tenants and data source configurations

## Core Capabilities

### Data Ingestion
The platform supports multiple data source types. Each DataSource belongs to a single Tenant,
ensuring strict data isolation. Data synchronization is tracked through SyncRun records with
a well-defined state machine (PENDING -> RUNNING -> SUCCESS/FAILED).

[VERIFY:PV-001] DataSource entity belongs to exactly one Tenant -> Implementation: backend/prisma/schema.prisma:62
[VERIFY:PV-002] SyncRun state machine: PENDING -> RUNNING -> SUCCESS/FAILED -> Implementation: backend/src/sync-run/sync-run.service.ts:12

### Data Processing
Pipelines enable data transformation workflows. Each pipeline follows a strict state machine:
DRAFT -> ACTIVE -> PAUSED -> ARCHIVED. Only valid transitions are permitted, enforced at the
service level.

[VERIFY:PV-003] Pipeline state machine enforces valid transitions only -> Implementation: backend/src/pipeline/pipeline.service.ts:10
[VERIFY:PV-004] Pipeline starts in DRAFT status by default -> Implementation: backend/prisma/schema.prisma:90

### Visualization
Dashboards contain Widgets that visualize data. Each Dashboard belongs to a Tenant.
Embeds enable external sharing of dashboards through unique tokens.

[VERIFY:PV-005] Dashboard contains Widgets relation -> Implementation: backend/prisma/schema.prisma:101
[VERIFY:PV-006] Embed uses unique token for external access -> Implementation: backend/prisma/schema.prisma:113

### Authentication and Authorization
Users authenticate via JWT tokens. Registration is limited to VIEWER, EDITOR, and ANALYST
roles — the ADMIN role is explicitly excluded from the registration flow.

[VERIFY:PV-007] ADMIN role rejected at registration -> Implementation: backend/src/auth/auth.service.ts:20

## Non-Functional Requirements

- All tenant-scoped data must be isolated via Row-Level Security
- Password hashing uses bcrypt with salt rounds of 12
- The API validates all input with whitelist + forbidNonWhitelisted
- Frontend meets WCAG 2.1 AA accessibility standards

## Cross-References

- See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for technical stack details
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for authentication and authorization details
- See [DATA_MODEL.md](./DATA_MODEL.md) for entity relationships
- See [UI_SPECIFICATION.md](./UI_SPECIFICATION.md) for frontend requirements
