# Product Vision — Analytics Engine

## Overview
Analytics Engine is a multi-tenant analytics platform enabling organizations
to connect data sources, build ETL pipelines, and visualize insights through
customizable dashboards. Built on NestJS and Next.js with PostgreSQL.

See also: [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md), [DATA_MODEL.md](DATA_MODEL.md)

## Core Entities

### Tenant
<!-- VERIFY:AE-TENANT-ISOLATION -->
Multi-tenant isolation unit. Each tenant has a unique slug and owns all
subordinate entities (users, data sources, dashboards, pipelines, embeds).
All queries are scoped by tenant_id foreign keys.

### User
<!-- VERIFY:AE-ROLES -->
Users belong to a tenant and have one of four roles:
- VIEWER — read-only dashboard access
- EDITOR — can modify dashboards and widgets
- ANALYST — can create and manage pipelines
- ADMIN — full administrative access (excluded from self-registration)

### Pipeline
<!-- VERIFY:AE-PIPELINE-FSM -->
ETL workflow entity with state machine:
DRAFT -> ACTIVE -> PAUSED -> ARCHIVED
Transitions are validated server-side. Invalid transitions are rejected.

### SyncRun
<!-- VERIFY:AE-SYNCRUN-FSM -->
Data synchronization tracking entity with states:
PENDING -> RUNNING -> COMPLETED | FAILED
Failed sync runs include error messages for debugging.

### Embed
<!-- VERIFY:AE-EMBED-TOKEN -->
External embedding mechanism with token-based access and expiration.
Each embed references a tenant and contains configuration for public dashboards.

## Technology Stack
<!-- VERIFY:AE-TECH-STACK -->
- Backend: NestJS ^11.0.0 with Prisma ^6.0.0
- Frontend: Next.js ^15.0.0 with React ^19.0.0
- Database: PostgreSQL 16 with Row Level Security
- Auth: JWT with bcrypt password hashing

## Target Users
- Data engineers configuring pipelines and data sources
- Business analysts creating dashboards and widgets
- Executives viewing embedded analytics reports
- Platform administrators managing tenants and users

## Key Differentiators
- Full multi-tenant isolation with RLS enforcement
- Flexible widget system (bar, line, pie charts)
- Embeddable dashboards with token-based access control
- Real-time sync run monitoring with error state tracking
