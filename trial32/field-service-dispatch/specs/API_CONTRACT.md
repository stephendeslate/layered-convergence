# API Contract — Field Service Dispatch

## Overview

The REST API is built with NestJS 11. All endpoints except auth require JWT authentication.
Company isolation is enforced by extracting companyId from the JWT token payload.

See also: [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md), [SECURITY_MODEL.md](SECURITY_MODEL.md)

## Authentication Endpoints

### POST /auth/register
- Body: { email, password, role, companyId }
- Role must be one of: DISPATCHER, TECHNICIAN, MANAGER
- Returns: { id, email, role }
- Status: 201 Created / 400 Bad Request

### POST /auth/login
- Body: { email, password }
- Returns: { accessToken }
- Status: 201 Created / 401 Unauthorized

## Work Order Endpoints

### GET /work-orders
- Returns all work orders for the authenticated user's company
- Status: 200 OK

### GET /work-orders/:id
- Returns a single work order by ID (company-scoped)
- Status: 200 OK / 404 Not Found

### POST /work-orders
- Body: { title, description, priority, customerId, technicianId?, scheduledAt? }
- Creates a work order with PENDING status
- Status: 201 Created

### PATCH /work-orders/:id/transition
- Body: { status }
- Validates transition against state machine
- Status: 200 OK / 400 Bad Request

### DELETE /work-orders/:id
- Removes a work order (company-scoped)
- Status: 200 OK / 404 Not Found

- [VERIFY:FD-AC-001] Work order CRUD with company isolation -> Implementation: apps/api/src/work-order/work-order.service.ts:1
- [VERIFY:FD-AC-002] Work order state machine validation -> Implementation: apps/api/src/work-order/work-order.service.ts:2

## Customer Endpoints

### GET /customers
- Returns all customers for the company
### GET /customers/:id
- Returns a single customer
### POST /customers
- Body: { name, email, phone, address }
### DELETE /customers/:id

- [VERIFY:FD-AC-003] Customer CRUD with company isolation -> Implementation: apps/api/src/customer/customer.service.ts:1

## Technician Endpoints

### GET /technicians
- Returns all technicians for the company
### GET /technicians/:id
- Returns a single technician
### POST /technicians
- Body: { name, specialty }
### PATCH /technicians/:id/availability
- Body: { isAvailable }

- [VERIFY:FD-AC-004] Technician CRUD with company isolation -> Implementation: apps/api/src/technician/technician.service.ts:1

## Route Endpoints

### GET /routes
- Returns all routes for the company
### POST /routes
- Body: { name, date, technicianId }
### DELETE /routes/:id

- [VERIFY:FD-AC-005] Route CRUD with company isolation -> Implementation: apps/api/src/route/route.service.ts:1

## GPS Event Endpoints

### GET /gps-events
- Returns GPS events for the company
### POST /gps-events
- Body: { latitude, longitude, timestamp, technicianId }

- [VERIFY:FD-AC-006] GPS event CRUD with company isolation -> Implementation: apps/api/src/gps-event/gps-event.service.ts:1

## Invoice Endpoints

### GET /invoices
- Returns all invoices for the company
### GET /invoices/:id
- Returns a single invoice
### POST /invoices
- Body: { amount, currency, workOrderId, customerId }
### PATCH /invoices/:id/paid
- Marks an invoice as paid
### DELETE /invoices/:id

- [VERIFY:FD-AC-007] Invoice CRUD with company isolation -> Implementation: apps/api/src/invoice/invoice.service.ts:1
