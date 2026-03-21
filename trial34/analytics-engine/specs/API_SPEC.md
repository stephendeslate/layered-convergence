# API Specification — Analytics Engine

## Overview

The REST API is built with NestJS 11 and provides endpoints for authentication,
dashboard management, and pipeline orchestration. All domain endpoints require
JWT authentication. See AUTH_SPEC.md for auth details and REQUIREMENTS.md for context.

## Environment Fail-Fast

The application validates required environment variables at startup and throws
immediately if they are missing. This prevents silent misconfiguration.

### JWT_SECRET
Required for JWT token signing and verification. Missing value causes startup failure.
- VERIFY: AE-SEC-FAILFAST-001 — Fail-fast on missing JWT_SECRET in main.ts

### CORS_ORIGIN
Required for CORS configuration. Missing value causes startup failure.
- VERIFY: AE-SEC-FAILFAST-002 — Fail-fast on missing CORS_ORIGIN in main.ts
- VERIFY: AE-SEC-CORS-001 — CORS enabled from CORS_ORIGIN environment variable

## Dashboard Endpoints

### GET /dashboards
Returns paginated list of dashboards for the authenticated user's tenant.
Sets tenant context via RLS before querying.

### GET /dashboards/:id
Returns a single dashboard with its widgets. Uses findFirst with tenant scope
for RLS compliance (justification comment in source).

### POST /dashboards
Creates a new dashboard. Name is slugified using the shared slugify() utility
for URL-safe identifier generation.
- VERIFY: AE-CQ-SLUG-002 — slugify used for dashboard slug generation

## Pipeline Endpoints

### GET /pipelines
Returns all pipelines for the tenant with their 5 most recent runs.

### POST /pipelines
Creates a new pipeline with slugified name.
- VERIFY: AE-CQ-SLUG-003 — slugify used for pipeline slug generation

### PATCH /pipelines/:id/status
Updates pipeline status with state machine validation. Invalid transitions
return 400 Bad Request. See STATE_MACHINES.md for transition rules.

## Frontend Display

### Text Truncation
Long text values are truncated in frontend display using the shared truncate() utility.
This is used in the navigation bar and dashboard listing pages.
- VERIFY: AE-CQ-TRUNC-002 — truncate used in frontend nav component
- VERIFY: AE-CQ-TRUNC-003 — truncate used in dashboard page

## Cross-References
- See AUTH_SPEC.md for authentication endpoint details
- See STATE_MACHINES.md for pipeline status transition rules
- See SECURITY.md for environment variable validation
- See DATA_MODEL.md for entity schemas
