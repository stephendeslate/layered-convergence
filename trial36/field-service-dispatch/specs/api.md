# API Layer

**Project:** field-service-dispatch
**Layer:** 6 — Security
**Version:** 1.0.0

---

## Overview

The NestJS 11 API provides RESTful endpoints for work order management,
technician tracking, and schedule coordination. All endpoints are
protected by JWT authentication except registration and login.
See also: security.md for Helmet, rate limiting, and CORS configuration.

## Application Bootstrap

The main.ts file bootstraps the NestJS application with Helmet for
security headers, CORS configuration, global validation pipes, and
fail-fast environment checks for JWT_SECRET and CORS_ORIGIN.

- VERIFY: FD-API-001 — main.ts configures Helmet with CSP and validates env vars at startup
- VERIFY: FD-API-002 — AppModule imports all domain modules and configures ThrottlerModule
- VERIFY: FD-API-003 — PrismaService implements OnModuleInit with tenant context support

## Work Orders Module

The work orders module handles creation, listing, and status transitions
for field service work orders. GPS coordinates are stored as Decimal.
Input sanitization is applied to title and description fields.

- VERIFY: FD-WO-001 — Work orders module registers controller and service
- VERIFY: FD-WO-002 — Work orders controller uses JWT auth guard
- VERIFY: FD-WO-003 — Work orders service enforces status transitions and sanitizes input

## Technicians Module

The technicians module manages technician profiles and their real-time
GPS locations for dispatch optimization. Names are sanitized on input.

- VERIFY: FD-TECH-001 — Technicians module registers controller and service
- VERIFY: FD-TECH-002 — Technicians controller uses JWT auth guard
- VERIFY: FD-TECH-003 — Technicians service generates prefixed IDs and sanitizes input

## Server Actions

Next.js server actions provide a typed bridge between the frontend
and the API, using fetch with proper Authorization headers.

- VERIFY: FD-ACTION-001 — Server actions check response.ok before returning data

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
