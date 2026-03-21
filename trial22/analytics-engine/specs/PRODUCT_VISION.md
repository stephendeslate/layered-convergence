# Product Vision

## Overview

The Analytics Engine is a multi-tenant analytics platform that enables organizations
to connect diverse data sources, build automated data processing pipelines, and
create interactive dashboards for data visualization and decision-making.

## Target Users

The platform serves three distinct user roles within each tenant organization:

- **VIEWER**: Read-only access to dashboards and visualizations
- **EDITOR**: Can create and modify dashboards, widgets, and data source configurations
- **ANALYST**: Full access to pipelines, data points, and advanced analytics features

There is intentionally no ADMIN role. Tenant administration is handled at the
infrastructure level, not within the application.

## Core Value Propositions

1. **Multi-tenant isolation**: Complete data separation between tenants using
   PostgreSQL Row Level Security, ensuring one organization can never access
   another's data.

2. **Flexible data ingestion**: Support for multiple data source types with
   configurable connectors, tracked through SyncRun state machines.

3. **Pipeline orchestration**: Configurable data processing pipelines with a
   clear state machine (DRAFT -> ACTIVE -> PAUSED -> ARCHIVED) that prevents
   invalid transitions.

[VERIFY:PV-001] Pipeline state machine enforces DRAFT->ACTIVE->PAUSED->ARCHIVED transitions -> Implementation: src/pipeline/pipeline.service.ts:10

4. **Dashboard composition**: Dashboards composed of reusable widgets that can
   visualize data points from any connected data source.

5. **Embeddable analytics**: Shareable embed tokens allow dashboards to be
   embedded in third-party applications with time-limited access.

## Data Flow

Data enters the system through DataSources, which are periodically synced via
SyncRuns. The sync process follows a state machine:

[VERIFY:PV-002] SyncRun state machine enforces PENDING->RUNNING->SUCCESS/FAILED transitions -> Implementation: src/sync-run/sync-run.service.ts:10

Data points are stored with Decimal(20,6) precision to ensure financial accuracy.
This is a deliberate choice over Float types to avoid rounding errors in
monetary calculations.

[VERIFY:PV-003] DataPoint values use Decimal(20,6) for financial precision -> Implementation: prisma/schema.prisma:4

## Non-Goals

- Real-time streaming analytics (batch processing only)
- Custom visualization code execution (sandboxed widgets only)
- Cross-tenant data sharing or collaboration
- User self-registration (tenant provisioning is external)

## Success Metrics

- Sub-second dashboard load times for up to 100 widgets
- Complete tenant data isolation verified through integration tests
- Zero cross-tenant data leakage in security audits
- Support for 1000+ concurrent viewers per tenant
