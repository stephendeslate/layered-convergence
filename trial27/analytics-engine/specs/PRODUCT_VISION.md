# Product Vision: Analytics Engine

## Overview

The Analytics Engine is a multi-tenant analytics platform enabling organizations
to collect, process, and visualize data from multiple sources through customizable
dashboards and embeddable views.

## Target Users

The platform serves three primary user segments:

1. **Data Engineers** — Build and manage data pipelines connecting external
   data sources to the analytics platform
2. **Analysts** — Create dashboards with widgets to visualize data trends
3. **Business Stakeholders** — Consume embedded analytics views in their
   existing applications

## Core Value Propositions

### Multi-Tenant Data Isolation
[VERIFY:AE-001] Every tenant's data is isolated at the database level using
PostgreSQL Row Level Security (RLS). All tables enforce RLS policies that
scope queries to the current tenant context, preventing cross-tenant data leakage.

### Self-Service Registration
[VERIFY:AE-002] Users can self-register with role selection. The ADMIN role
is excluded from self-registration to prevent privilege escalation, enforced
via @IsIn validation on the registration DTO.

### Authentication and API Access
[VERIFY:AE-003] The platform exposes RESTful API endpoints for authentication
including registration and login, returning JWT tokens for subsequent requests.

### Data Pipeline Management
[VERIFY:AE-004] Data pipelines follow a state machine pattern
(DRAFT -> ACTIVE -> PAUSED -> ARCHIVED) with enforced transition rules
that prevent invalid state changes at the service layer.

### Dashboard and Widget System
[VERIFY:AE-005] Users can create dashboards containing configurable widgets.
Dashboards are scoped to tenants and track their creator for audit purposes.

### Embeddable Views
[VERIFY:AE-006] Dashboards can be shared externally via time-limited embed
tokens. Each embed is scoped to a specific dashboard within a tenant boundary,
with configurable expiration for security.

## Product Roadmap

Phase 1: Core authentication, tenant management, and dashboard CRUD
Phase 2: Data pipeline execution and sync run monitoring
Phase 3: Embed sharing and public dashboard access
Phase 4: Advanced widget types and real-time data streaming

## Success Metrics

- Tenant onboarding time under 5 minutes
- Dashboard creation with widgets in under 3 clicks
- Embed token generation with configurable TTL
- Zero cross-tenant data leakage incidents

## Cross-References

- See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for technical stack decisions
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for detailed RLS and auth implementation
- See [DATA_MODEL.md](./DATA_MODEL.md) for entity relationships
