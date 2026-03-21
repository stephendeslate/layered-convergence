# Analytics Engine — Requirements Specification

## Overview

Analytics Engine is a multi-tenant analytics platform supporting dashboard creation,
data pipeline management, widget configuration, report scheduling, and audit logging.
See DATA_MODEL.md for entity definitions and API_SPEC.md for endpoint details.

## Functional Requirements

### FR-1: Multi-Tenancy
- VERIFY: AE-REQ-MT-001 — Each tenant has isolated data via Row Level Security
- VERIFY: AE-REQ-MT-002 — Users belong to exactly one tenant
- Tenant context is set per-request using Prisma.sql parameterized queries
- Cross-references: DATA_MODEL.md (Tenant entity), SECURITY.md (RLS policies)

### FR-2: Dashboard Management
- VERIFY: AE-REQ-DASH-001 — Users can create, view, and list dashboards
- VERIFY: AE-REQ-DASH-002 — Dashboards contain configurable widgets
- Dashboards are scoped to the user's tenant
- Pagination uses the shared paginate<T>() utility from @analytics-engine/shared
- Cross-references: API_SPEC.md (dashboard endpoints), STATE_MACHINES.md (widget status)

### FR-3: Data Pipeline Orchestration
- VERIFY: AE-REQ-PIPE-001 — Pipelines connect data sources to analytics
- VERIFY: AE-REQ-PIPE-002 — Pipeline runs track status with state machine
- VERIFY: AE-REQ-PIPE-003 — Failed runs record error messages
- Pipelines support cron-based scheduling
- Cross-references: STATE_MACHINES.md (PipelineStatus), DATA_MODEL.md (Pipeline, PipelineRun)

### FR-4: Widget System
- VERIFY: AE-REQ-WIDG-001 — Widgets support CHART, TABLE, METRIC, MAP types
- Widgets have position coordinates for dashboard layout
- Widget configuration stored as JSON
- Cross-references: DATA_MODEL.md (Widget entity)

### FR-5: Reporting
- VERIFY: AE-REQ-RPT-001 — Reports store named queries with optional scheduling
- Reports track last run timestamp
- Cross-references: DATA_MODEL.md (Report entity)

### FR-6: Audit Logging
- VERIFY: AE-REQ-AUD-001 — All entity mutations are logged with action, entity, metadata
- Audit logs are immutable (no update/delete operations)
- Cross-references: DATA_MODEL.md (AuditLog entity), SECURITY.md (audit controls)

## Non-Functional Requirements

### NFR-1: Security
- JWT-based authentication with 24-hour token expiry
- bcrypt password hashing with salt rounds of 12
- No hardcoded secrets — environment variables required
- Cross-references: AUTH_SPEC.md, SECURITY.md

### NFR-2: Performance
- Paginated list endpoints with configurable page size (max 100)
- Database indexes on foreign keys and unique constraints

### NFR-3: Accessibility
- All UI components pass jest-axe accessibility checks
- Keyboard navigation supported for all interactive elements
- Loading states use role="status" with aria-busy
- Error states use role="alert" with focus management
- Cross-references: TESTING_STRATEGY.md (accessibility tests)

### NFR-4: Deployment
- Multi-stage Docker build with node:20-alpine
- CI/CD via GitHub Actions with PostgreSQL service container
- Turborepo for coordinated builds across workspace packages
- Cross-references: SECURITY.md (container security)
