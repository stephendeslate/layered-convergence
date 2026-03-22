# Analytics Engine — Specification Index

## Project Overview
Multi-tenant analytics platform built with NestJS, Next.js, and Prisma.
Domain: Event tracking, Dashboard management, Data Sources, and Pipelines.

## Specification Documents

### 1. API Specification (api.md)
REST API design, endpoint contracts, request/response schemas.
Covers authentication, domain CRUD, pagination, and error handling.
Cross-references: data-model.md, auth.md, monitoring.md

### 2. Data Model Specification (data-model.md)
Prisma schema design, entity relationships, database indexes.
Covers tenants, users, events, dashboards, data sources, pipelines.
Cross-references: api.md, security.md

### 3. Authentication Specification (auth.md)
JWT-based auth flow, bcrypt password hashing, role-based access.
Covers registration, login, profile, and role restrictions.
Cross-references: api.md, security.md

### 4. Frontend Specification (frontend.md)
Next.js 15 app router pages, shadcn/ui components, accessibility.
Covers loading states, error boundaries, keyboard navigation.
Cross-references: api.md, monitoring.md

### 5. Security Specification (security.md)
Helmet CSP, CORS, rate limiting, input validation, RLS.
Covers DTO validation, environment security, audit requirements.
Cross-references: auth.md, infrastructure.md

### 6. Infrastructure Specification (infrastructure.md)
Docker multi-stage builds, CI/CD pipeline, database migrations.
Covers Turborepo monorepo, pnpm workspaces, deployment.
Cross-references: security.md, monitoring.md

### 7. Monitoring Specification (monitoring.md)
Structured logging, correlation IDs, health endpoints, metrics.
Covers Pino integration, error tracking, and alerting.
Cross-references: api.md, infrastructure.md

## VERIFY Tag Registry

All VERIFY tags use the AE- prefix. Tags are distributed across specs
and must have matching TRACED tags in .ts/.tsx source files only.

### Tag Ranges
- AE-ARCH-01 through AE-ARCH-05: Architecture tags
- AE-API-01 through AE-API-08: API endpoint tags
- AE-AUTH-01 through AE-AUTH-05: Authentication tags
- AE-DATA-01 through AE-DATA-03: Data model tags
- AE-SEC-01 through AE-SEC-08: Security tags
- AE-FE-01 through AE-FE-08: Frontend tags
- AE-PERF-01 through AE-PERF-09: Performance tags
- AE-INFRA-01 through AE-INFRA-04: Infrastructure tags
- AE-MON-01 through AE-MON-12: Monitoring tags
- AE-TEST-01 through AE-TEST-07: Testing tags

Total VERIFY tags: 40 (minimum 35 required)
