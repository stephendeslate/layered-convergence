# Product Vision

## Overview

Analytics Engine is a multi-tenant analytics platform that enables organizations to ingest,
process, and visualize data from multiple sources. Each tenant operates in complete isolation
with row-level security (RLS) enforced at the database layer. The platform supports three user
roles (VIEWER, EDITOR, ANALYST) and provides a pipeline-based data processing model with
strict state machine governance.

## Target Users

1. **Data Analysts** (ANALYST role) — configure data sources, build pipelines, create dashboards
2. **Report Editors** (EDITOR role) — customize dashboards, manage widgets, create embeddable views
3. **Stakeholders** (VIEWER role) — consume dashboards and embedded analytics views

## Value Proposition

- **Tenant isolation by default** — every query is scoped to the authenticated tenant via
  PostgreSQL RLS policies, eliminating cross-tenant data leaks
- **Pipeline governance** — data pipelines follow a strict state machine (DRAFT -> ACTIVE ->
  PAUSED -> ARCHIVED) preventing accidental data processing in incomplete configurations
- **Decimal precision** — financial and scientific data points use Decimal(20,6) storage,
  avoiding floating-point rounding errors common in analytics platforms
- **Embeddable dashboards** — token-based embed links with configurable expiration enable
  secure sharing of analytics views with external stakeholders

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Tenant isolation violations | 0 | Integration tests verify cross-tenant queries return empty results |
| Pipeline invalid transitions | 0 | State machine rejects all invalid state changes with 400 errors |
| Authentication bypass | 0 | All mutation endpoints protected by JwtAuthGuard |
| Data precision loss | 0 | Decimal(20,6) verified in schema and service layer |

## Core Domain Entities

The platform operates on six primary entities: Tenant, User, DataSource, DataPoint, Pipeline,
Dashboard, Widget, Embed, and SyncRun. Each entity except Tenant carries a `tenantId` foreign
key for RLS scoping.

## Mutation Architecture

[VERIFY:PV-001] All frontend mutations MUST use Server Actions with response.ok validation before redirect.
> Implementation: `frontend/app/actions.ts` — every action checks `response.ok` before calling `redirect()`

All user-facing write operations flow through Next.js Server Actions rather than client-side
fetch calls. Each Server Action validates the response status before triggering navigation,
ensuring users see error messages when operations fail rather than being silently redirected.

## Role Restriction

The platform intentionally excludes an ADMIN role from the application layer. Administrative
operations (tenant provisioning, user management across tenants) are handled through direct
database access or a separate admin tool, keeping the application attack surface minimal.

## Technology Foundation

The frontend is built with Next.js 15 and React 19, using shadcn/ui components for consistent
design patterns. The backend uses NestJS 11 with Prisma 6 as the ORM layer, connecting to
PostgreSQL 16 for data storage.

## Cross-References

- System architecture details: [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)
- Data model specification: [DATA_MODEL.md](./DATA_MODEL.md)
- Security model: [SECURITY_MODEL.md](./SECURITY_MODEL.md)
- UI specification: [UI_SPECIFICATION.md](./UI_SPECIFICATION.md)
