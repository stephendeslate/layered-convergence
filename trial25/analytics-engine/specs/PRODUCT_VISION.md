# Product Vision — Analytics Engine

## Overview

Analytics Engine is a multi-tenant analytics platform enabling organizations to connect diverse data sources, build transformation pipelines, and create interactive dashboards for data-driven decision making.

## Target Users

- **Data Analysts** — query and visualize data from connected sources
- **Data Engineers** — build and manage ETL pipelines across data sources
- **Business Stakeholders** — consume dashboards and embedded analytics
- **Platform Administrators** — manage tenants, users, and system configuration

## Value Proposition

Analytics Engine consolidates data from PostgreSQL, MySQL, REST APIs, CSV files, and S3 buckets into a unified analytics layer. Users build pipelines to transform and sync data, then create dashboards with configurable widgets for visualization.

## Core Entities

The platform manages 9 core entities: Tenant, User, DataSource, DataPoint, Pipeline, Dashboard, Widget, Embed, and SyncRun. Each entity is tenant-scoped with Row Level Security enforcement.

See [DATA_MODEL.md](./DATA_MODEL.md) for entity definitions and [SECURITY_MODEL.md](./SECURITY_MODEL.md) for RLS policies.

## Success Metrics

[VERIFY:PV-001] The platform supports 4 user roles: ADMIN, VIEWER, EDITOR, ANALYST with role-based access control.
> Implementation: `backend/prisma/schema.prisma` (Role enum)

[VERIFY:PV-002] The landing page communicates the three core capabilities: data sources, pipelines, and dashboards.
> Implementation: `frontend/app/page.tsx`

[VERIFY:PV-003] Multi-tenant isolation is enforced at the database level using PostgreSQL RLS.
> Implementation: `backend/prisma/rls.sql`

## Feature Priorities

1. **Data Source Management** — Connect and configure external data sources
2. **Pipeline Orchestration** — Build, activate, and monitor data pipelines (see [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md))
3. **Dashboard Builder** — Create dashboards with drag-and-drop widgets
4. **Embeddable Analytics** — Generate secure embed tokens for external consumption
5. **Sync Monitoring** — Track pipeline sync runs with status and error reporting

## Cross-References

- See [API_CONTRACT.md](./API_CONTRACT.md) for endpoint definitions
- See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for quality assurance approach
- See [UI_SPECIFICATION.md](./UI_SPECIFICATION.md) for page inventory and user flows
