# API Layer

**Project:** field-service-dispatch
**Layer:** 5 — Monorepo
**Version:** 1.0.0

---

## Overview

The NestJS 11 API provides RESTful endpoints for work order management,
technician tracking, and schedule coordination. All endpoints are
protected by JWT authentication except registration and login.

## Application Bootstrap

The main.ts file bootstraps the NestJS application with global validation
pipes and fail-fast environment checks for JWT_SECRET and CORS_ORIGIN.

- VERIFY: FD-API-001 — main.ts validates JWT_SECRET and CORS_ORIGIN at startup
- VERIFY: FD-API-002 — AppModule imports Auth, WorkOrders, and Technicians modules
- VERIFY: FD-API-003 — PrismaService implements OnModuleInit lifecycle

## Work Orders Module

The work orders module handles creation, listing, and status transitions
for field service work orders. GPS coordinates are stored as Decimal.

- VERIFY: FD-WO-001 — Work orders module registers controller and service
- VERIFY: FD-WO-002 — Work orders controller uses JWT auth guard
- VERIFY: FD-WO-003 — Work orders service enforces status transition rules

## Technicians Module

The technicians module manages technician profiles and their real-time
GPS locations for dispatch optimization.

- VERIFY: FD-TECH-001 — Technicians module registers controller and service
- VERIFY: FD-TECH-002 — Technicians controller uses JWT auth guard
- VERIFY: FD-TECH-003 — Technicians service generates prefixed IDs

## Server Actions

Next.js server actions provide a typed bridge between the frontend
and the API, using fetch with proper Authorization headers.

- VERIFY: FD-ACTION-001 — Work order server actions check response.ok
- VERIFY: FD-ACTION-002 — Technician server actions check response.ok

## Pagination

All list endpoints support page-based pagination with configurable
page size. Default page size is 20, maximum is 100. The paginate
utility from the shared package constructs the PaginatedResult
response with data array, total count, page number, and total pages.

## Error Handling

Services throw NestJS exceptions for domain-level errors:
- NotFoundException when a resource does not exist
- BadRequestException for invalid status transitions
- ConflictException for duplicate registrations
