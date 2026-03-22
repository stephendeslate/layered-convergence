# API Specification

## Overview

RESTful API built with NestJS ^11.0.0 serving the analytics engine backend.
All endpoints are JSON-based and require authentication unless otherwise noted.

See [Auth Spec](auth.md) for authentication details.
See [Security Spec](security.md) for rate limiting and header configuration.

## Base URL

`http://localhost:3001`

## Authentication Endpoints

### POST /auth/register

Creates a new user account. Rate limited to 5 requests per minute.

**Request Body:**
- `email` (string, required, max 255 chars)
- `password` (string, required, 8-128 chars)
- `name` (string, required, max 100 chars)
- `role` (string, required, one of MANAGER|ANALYST|VIEWER)
- `tenantSlug` (string, required, max 100 chars)

**Response:** `{ user: User, token: string }`

### POST /auth/login

Authenticates a user. Rate limited to 5 requests per minute.

**Request Body:**
- `email` (string, required, max 255 chars)
- `password` (string, required, 8-128 chars)

**Response:** `{ user: User, token: string }`

### GET /auth/me

Returns the authenticated user profile. Requires Bearer token.

**Response:** `User`

## Dashboard Endpoints

All dashboard endpoints require Bearer token authentication.

### GET /dashboards

Lists dashboards for the authenticated user's tenant.

**Query Parameters:**
- `page` (number, optional, default 1)
- `pageSize` (number, optional, default 20, max 100)

**Response:** `PaginatedResult<Dashboard>`

### GET /dashboards/:id

Returns a single dashboard by ID, scoped to tenant.

### POST /dashboards

Creates a new dashboard.

**Request Body:**
- `name` (string, required)
- `description` (string, optional)
- `config` (object, optional)

### PUT /dashboards/:id

Updates an existing dashboard.

### DELETE /dashboards/:id

Deletes a dashboard by ID.

## Pipeline Endpoints

All pipeline endpoints require Bearer token authentication.

### GET /pipelines

Lists pipelines for the authenticated user's tenant.

### GET /pipelines/:id

Returns a single pipeline with its last 10 runs.

### POST /pipelines

Creates a new pipeline.

### PATCH /pipelines/:id/status

Updates pipeline status. Validates against allowed state transitions.

### DELETE /pipelines/:id

Deletes a pipeline by ID.

## Error Responses

All errors follow the NestJS standard format:
```json
{
  "statusCode": 400,
  "message": ["validation error details"],
  "error": "Bad Request"
}
```

## VERIFY Tags

- `AE-API-001`: Auth controller with Throttle decorator <!-- VERIFY: AE-API-001 -->
- `AE-API-002`: Dashboards module registered <!-- VERIFY: AE-API-002 -->
- `AE-API-003`: Dashboards service with pagination <!-- VERIFY: AE-API-003 -->
- `AE-API-004`: Dashboards controller with JWT guard <!-- VERIFY: AE-API-004 -->
- `AE-API-005`: Pipelines module registered <!-- VERIFY: AE-API-005 -->
- `AE-API-006`: Pipelines service with status transitions <!-- VERIFY: AE-API-006 -->
- `AE-API-007`: Pipeline status update with transition validation <!-- VERIFY: AE-API-007 -->
- `AE-API-008`: Pipelines controller with JWT guard <!-- VERIFY: AE-API-008 -->
