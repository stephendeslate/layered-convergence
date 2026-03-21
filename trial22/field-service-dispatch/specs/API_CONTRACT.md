# API Contract — Field Service Dispatch

## Base URL

All API endpoints are prefixed with `/api`.

## Authentication

<!-- VERIFY:AC-001 All endpoints except login/register require JWT Bearer token -->
All endpoints except `POST /api/auth/register` and `POST /api/auth/login` require a valid JWT Bearer token in the `Authorization` header.

## Auth Endpoints

### POST /api/auth/register
<!-- VERIFY:AC-002 Register validates role is DISPATCHER or TECHNICIAN (no ADMIN) -->
**Request:**
```json
{
  "email": "string",
  "password": "string (min 8 chars)",
  "role": "DISPATCHER | TECHNICIAN",
  "companyName": "string (required for new company)"
}
```
**Response (201):**
```json
{
  "accessToken": "string",
  "user": { "id": "uuid", "email": "string", "role": "string", "companyId": "uuid" }
}
```

### POST /api/auth/login
**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```
**Response (200):**
```json
{
  "accessToken": "string",
  "user": { "id": "uuid", "email": "string", "role": "string", "companyId": "uuid" }
}
```

## Customer Endpoints

### GET /api/customers
<!-- VERIFY:AC-003 List endpoints return only company-scoped data -->
Returns all customers for the authenticated user's company.

**Response (200):**
```json
[{ "id": "uuid", "name": "string", "email": "string", "phone": "string", "address": "string" }]
```

### POST /api/customers
**Request:**
```json
{ "name": "string", "email": "string?", "phone": "string?", "address": "string" }
```
**Response (201):** Customer object

### GET /api/customers/:id
**Response (200):** Customer object

### PATCH /api/customers/:id
**Request:** Partial customer fields
**Response (200):** Updated customer object

## Technician Endpoints

### GET /api/technicians
**Response (200):** Array of technician objects

### POST /api/technicians
**Request:**
```json
{ "name": "string", "phone": "string?", "specialties": "string?" }
```
**Response (201):** Technician object

### GET /api/technicians/:id
**Response (200):** Technician object

### PATCH /api/technicians/:id
**Request:** Partial technician fields
**Response (200):** Updated technician object

## Work Order Endpoints

### GET /api/work-orders
<!-- VERIFY:AC-004 Work orders support filtering by status -->
**Query params:** `status` (optional filter)
**Response (200):** Array of work order objects with customer and technician relations

### POST /api/work-orders
<!-- VERIFY:AC-005 Work order creation sets initial status to OPEN -->
**Request:**
```json
{
  "title": "string",
  "description": "string?",
  "priority": "LOW | MEDIUM | HIGH | URGENT",
  "scheduledDate": "ISO date?",
  "customerId": "uuid"
}
```
**Response (201):** Work order object with status OPEN

### GET /api/work-orders/:id
**Response (200):** Work order with customer, technician, invoice relations

### PATCH /api/work-orders/:id
**Request:** Partial work order fields (not status)
**Response (200):** Updated work order

### PATCH /api/work-orders/:id/status
<!-- VERIFY:AC-006 Status transitions are validated against the state machine -->
**Request:**
```json
{ "status": "ASSIGNED | IN_PROGRESS | COMPLETED | INVOICED | CLOSED | CANCELLED" }
```
**Response (200):** Updated work order
**Response (409):** Invalid transition

### PATCH /api/work-orders/:id/assign
<!-- VERIFY:AC-007 Assignment requires technicianId and transitions to ASSIGNED -->
**Request:**
```json
{ "technicianId": "uuid" }
```
**Response (200):** Work order with status ASSIGNED

## Invoice Endpoints

### GET /api/invoices
**Response (200):** Array of invoice objects

### POST /api/invoices
<!-- VERIFY:AC-008 Invoice creation requires a COMPLETED work order -->
**Request:**
```json
{
  "workOrderId": "uuid",
  "amount": "number (Decimal)",
  "taxAmount": "number (Decimal)"
}
```
**Response (201):** Invoice object with totalAmount calculated

### GET /api/invoices/:id
**Response (200):** Invoice with work order relation

## Route Endpoints

### GET /api/routes
**Response (200):** Array of route objects with work orders

### POST /api/routes
**Request:**
```json
{
  "name": "string",
  "date": "ISO date",
  "technicianId": "uuid",
  "estimatedDistance": "number (Float)",
  "workOrderIds": ["uuid"]
}
```
**Response (201):** Route object

## GPS Event Endpoints

### POST /api/gps-events
**Request:**
```json
{
  "latitude": "number (Float)",
  "longitude": "number (Float)",
  "technicianId": "uuid"
}
```
**Response (201):** GPS event object

### GET /api/gps-events?technicianId=uuid
**Response (200):** Array of GPS events for the technician

## Error Responses

All errors follow this format:
```json
{
  "statusCode": 400,
  "message": "string or string[]",
  "error": "Bad Request"
}
```
