# Product Vision — Analytics Engine

## Overview
Analytics Engine is a multi-tenant analytics platform that enables organizations
to connect data sources, build ETL pipelines, create dashboards, and embed
analytics into external applications. See DATA_MODEL.md for entity definitions
and SYSTEM_ARCHITECTURE.md for technical implementation details.

## Problem Statement
Organizations need a unified platform to collect, process, and visualize data
from multiple sources. Current solutions lack multi-tenant isolation, making
them unsuitable for SaaS deployments.

## Target Users
- **Data Analysts** — build dashboards and explore data
- **Data Engineers** — configure pipelines and data sources
- **Executives** — view embedded reports and summaries
- **Platform Admins** — manage tenants and user access

## Core Capabilities
1. Multi-tenant data isolation with Row Level Security
2. Flexible data source connectivity (databases, APIs, files)
3. ETL pipeline management with lifecycle states
4. Dashboard creation with configurable widgets
5. Secure embed tokens for external sharing
6. Real-time sync run monitoring

## Entity Overview
<!-- VERIFY:AE-TENANT-ISOLATION — Tenant model with tenant_id foreign keys -->
All data is scoped to a Tenant. Users belong to exactly one tenant.

<!-- VERIFY:AE-PIPELINE-FSM — Pipeline entity with PipelineStatus enum -->
Pipelines follow a state machine: DRAFT -> ACTIVE -> PAUSED -> ARCHIVED.

<!-- VERIFY:AE-SYNCRUN-FSM — SyncRun entity with SyncRunStatus enum -->
Sync runs track execution: PENDING -> RUNNING -> COMPLETED or FAILED.

<!-- VERIFY:AE-EMBED-TOKEN — Embed entity with token and expiresAt -->
Embeds use unique tokens with expiration for secure external access.

<!-- VERIFY:AE-ROLES — UserRole enum with 4 roles -->
Users have roles: VIEWER, EDITOR, ANALYST, ADMIN.

## Technical Stack
<!-- VERIFY:AE-TECH-STACK — NestJS + Next.js + PostgreSQL -->
- Backend: NestJS ^11.0.0 with Prisma ^6.0.0
- Frontend: Next.js ^15.0.0 with Tailwind CSS
- Database: PostgreSQL 16 with RLS

## Security Requirements
Security controls are described in SECURITY_MODEL.md. API endpoints are
detailed in API_CONTRACT.md. All authentication uses JWT with bcrypt hashing.

## Success Metrics
- Sub-second dashboard load times for cached queries
- Zero cross-tenant data leakage
- 99.9% uptime for the analytics API
- WCAG 2.1 AA compliance for all UI components
