# API Specification — Field Service Dispatch

## Overview

The REST API is built with NestJS 11 and provides endpoints for authentication,
work order management, and technician dispatch. All domain endpoints require
JWT authentication. See AUTH_SPEC.md for auth details and REQUIREMENTS.md for context.

## Environment Fail-Fast

The application validates required environment variables at startup and throws
immediately if they are missing. This prevents silent misconfiguration in production.

### JWT_SECRET
Required for JWT token signing and verification. Missing value causes startup failure
with a descriptive error message indicating which variable is missing.
- VERIFY: FD-SEC-FAILFAST-001 — Fail-fast on missing JWT_SECRET in main.ts

### CORS_ORIGIN
Required for CORS configuration. Missing value causes startup failure. The CORS
middleware is configured to accept requests only from the specified origin.
- VERIFY: FD-SEC-FAILFAST-002 — Fail-fast on missing CORS_ORIGIN in main.ts
- VERIFY: FD-SEC-CORS-001 — CORS enabled from CORS_ORIGIN environment variable

## Work Order Endpoints

### GET /workorders
Returns paginated list of work orders for the authenticated user's tenant.
Sets tenant context via RLS before querying. Supports filtering by status and priority.

### GET /workorders/:id
Returns a single work order with its transitions. Uses findFirst with tenant scope
for RLS compliance (justification comment in source).

### POST /workorders
Creates a new work order. Title is slugified using the shared slugify() utility
for URL-safe identifier generation. Default status is CREATED.
- VERIFY: FD-CQ-SLUG-002 — slugify used for work order slug generation

### PATCH /workorders/:id/status
Updates work order status with state machine validation. Invalid transitions
return 400 Bad Request. See STATE_MACHINES.md for transition rules.

## Technician Endpoints

### GET /technicians
Returns all technicians for the tenant with their availability status and location.

### POST /technicians
Creates a new technician profile. Name is slugified for URL-safe identification.
- VERIFY: FD-CQ-SLUG-003 — slugify used for technician slug generation

## Frontend Display

### Text Truncation
Long text values are truncated in frontend display using the shared truncate() utility.
This is used in the navigation bar for tenant name display and work order listings
for description preview.
- VERIFY: FD-CQ-TRUNC-002 — truncate used in frontend nav component
- VERIFY: FD-CQ-TRUNC-003 — truncate used in work order page

## Cross-References
- See AUTH_SPEC.md for authentication endpoint details
- See STATE_MACHINES.md for work order status transition rules
- See SECURITY.md for environment variable validation
- See DATA_MODEL.md for entity schemas
