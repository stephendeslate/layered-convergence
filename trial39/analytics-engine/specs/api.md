# API Specification

**Project:** Analytics Engine
**Prefix:** AE-API
**Cross-references:** [Authentication](auth.md), [Performance](performance.md)

---

## Overview

The API layer provides RESTful CRUD endpoints for Dashboards and Pipelines.
All domain endpoints require JWT authentication and enforce pagination limits.

---

## Requirements

### AE-API-01: Auth Endpoints
- VERIFY:AE-API-01 — AuthController provides register, login, health endpoints with Throttle 5/60s
- Health endpoint is public; register and login are rate-limited
- See [Authentication](auth.md) for registration role restrictions

### AE-API-02: Dashboard CRUD
- VERIFY:AE-API-02 — DashboardsController provides Create, Read, ReadAll, Update, Delete
- All endpoints protected by JwtAuthGuard
- List endpoint uses normalizePageParams for pagination safety
- List endpoint sets Cache-Control header

### AE-API-03: Dashboard Query Optimization
- VERIFY:AE-API-03 — DashboardsService uses select for list, include for detail
- List queries only return fields needed for list views
- Detail queries eager-load createdBy and reports relations
- See [Performance](performance.md) for N+1 prevention strategy

### AE-API-04: Dashboard DTO Validation
- VERIFY:AE-API-04 — CreateDashboardDto has @IsString, @MaxLength on all string fields, @MaxLength(36) on UUID fields
- UpdateDashboardDto fields are optional with same validation rules

### AE-API-05: Pipeline CRUD
- VERIFY:AE-API-05 — PipelinesController provides Create, Read, ReadAll, Update, Delete
- All endpoints protected by JwtAuthGuard
- List endpoint uses normalizePageParams and Cache-Control

### AE-API-06: Pipeline Query Optimization
- VERIFY:AE-API-06 — PipelinesService uses select for list, include for detail
- Detail queries eager-load runs and tenant relations to prevent N+1

### AE-API-07: Pipeline DTO Validation
- VERIFY:AE-API-07 — CreatePipelineDto has @IsString, @MaxLength, @MaxLength(36) on UUID tenantId
- All string fields are validated

### AE-API-08: Pagination Response Format
- VERIFY:AE-API-08 — All list endpoints return { data, meta: { page, pageSize, total, totalPages } }
- Consistent pagination envelope across all domain controllers

---

**SJD Labs, LLC** — Analytics Engine T39
