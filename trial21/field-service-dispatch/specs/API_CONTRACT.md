# API Contract

## Overview

The backend exposes a RESTful API on port 3001. All endpoints except auth
require a Bearer JWT token. Request/response bodies use JSON format. All
controllers use @UseGuards(JwtAuthGuard) at the class level to enforce
authentication. See [SECURITY_MODEL.md](SECURITY_MODEL.md) for auth details.

## Global Configuration

[VERIFY:AC-001] The API SHALL apply global ValidationPipe with whitelist,
forbidNonWhitelisted, and transform options. This strips unknown properties,
rejects non-whitelisted fields, and auto-transforms payloads to DTO instances.
CORS is enabled with credentials for frontend cookie-based authentication.
→ Implementation: backend/src/main.ts:27

## Authentication Endpoints

[VERIFY:AC-002] POST /auth/register SHALL accept: email (string, @IsEmail),
password (string, @MinLength(8)), role (string, @IsIn(['DISPATCHER','TECHNICIAN'])),
companySlug (string), companyName (string, optional). Returns JWT token and user object.
ADMIN role is rejected at both the DTO and service layers.
→ Implementation: backend/src/auth/dto/register.dto.ts:5

[VERIFY:AC-003] POST /auth/login SHALL accept: email (string, @IsEmail),
password (string, @MinLength(8)). Returns JWT token and user object with id,
email, role, and companyId fields.
→ Implementation: backend/src/auth/dto/login.dto.ts:4

[VERIFY:AC-004] The JWT payload SHALL include sub (userId), email, role, and
companyId claims. Passwords are hashed using bcrypt with salt rounds of 12.
Registration of ADMIN role is rejected with a defense-in-depth service check.
→ Implementation: backend/src/auth/auth.service.ts:62

[VERIFY:AC-005] The auth controller SHALL expose three endpoints: POST /auth/register,
POST /auth/login (both public), and GET /auth/me (protected by JwtAuthGuard).
The /auth/me endpoint returns the current user's profile.
→ Implementation: backend/src/auth/auth.controller.ts:8

## Customer Endpoints

[VERIFY:AC-006] POST /customers SHALL accept: name (string), email (string, @IsEmail),
phone (string), address (string). All fields are required and validated.
GET /customers returns all customers scoped to the authenticated user's company.
PUT /customers/:id updates, DELETE /customers/:id removes.
→ Implementation: backend/src/customer/dto/create-customer.dto.ts:4

## Work Order Endpoints

[VERIFY:AC-007] POST /work-orders SHALL accept: title (string), description (string),
customerId (string), priority (number, @IsInt, @Min(1), @Max(5), optional, default 3),
technicianId (string, optional), scheduledAt (string, optional). If technicianId is
provided at creation, status auto-sets to ASSIGNED; otherwise defaults to PENDING.
→ Implementation: backend/src/work-order/dto/create-work-order.dto.ts:4

[VERIFY:AC-008] PATCH /work-orders/:id/transition SHALL accept: status (string,
@IsIn valid WorkOrderStatus values), technicianId (string, optional). The service
validates against the state machine before applying. Invalid transitions return
400 BadRequestException.
→ Implementation: backend/src/work-order/dto/transition-work-order.dto.ts:5

## Route Endpoints

[VERIFY:AC-009] POST /routes SHALL accept: technicianId (string), workOrderId (string),
distance (number, @Min(0)), estimatedMinutes (number, @IsInt, @Min(1)). GET /routes
returns all routes with technician email and work order title included.
→ Implementation: backend/src/route/dto/create-route.dto.ts:4

## GPS Event Endpoints

[VERIFY:AC-010] POST /gps-events SHALL accept: technicianId (string), lat (number),
lng (number). Timestamps are server-generated via @default(now()). GET /gps-events
returns the latest 100 events. GET /gps-events/technician/:technicianId returns
the latest 50 events for a specific technician.
→ Implementation: backend/src/gps-event/dto/create-gps-event.dto.ts:4

## Invoice Endpoints

[VERIFY:AC-011] POST /invoices SHALL accept: workOrderId (string), amount (number, @Min(0)),
tax (number, @Min(0)). Total is computed server-side as amount + tax using Decimal
arithmetic. PUT /invoices/:id accepts optional status (@IsIn valid InvoiceStatus)
and amount/tax for recalculation.
→ Implementation: backend/src/invoice/dto/create-invoice.dto.ts:4

## Error Responses

All endpoints return standard NestJS error responses:
- 400: Validation errors (class-validator), invalid state transitions
- 401: Missing or invalid JWT token
- 404: Resource not found (scoped by companyId)
- 409: Conflict (duplicate email registration)
