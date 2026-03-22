# API Contracts Specification — Field Service Dispatch

## Base URL

All endpoints are served at the root path (no /api prefix).

## Authentication Endpoints

### POST /auth/register
- Request: { email, password, role, tenantId }
- Role must be in ALLOWED_REGISTRATION_ROLES (USER, TECHNICIAN, DISPATCHER)
- ADMIN role is explicitly excluded via @IsIn validation
- Response: { user: { id, email, role, tenantId, createdAt }, token }

### POST /auth/login
- Request: { email, password }
- Response: { user: { id, email, role, tenantId }, token }
- Rate limited: 5 requests per 60 seconds

## Domain Endpoints (CRUD)

All domain endpoints follow the same pattern:

### Work Orders (/work-orders)
- POST / — Create work order
- GET / — List with pagination (?page, ?pageSize, ?tenantId)
- GET /:id — Get by ID
- PUT /:id — Update
- DELETE /:id — Delete (204 No Content)

### Technicians (/technicians)
- POST / — Create technician
- GET / — List with pagination
- GET /:id — Get by ID
- PUT /:id — Update
- DELETE /:id — Delete (204 No Content)

### Schedules (/schedules)
- POST / — Create schedule
- GET / — List with pagination
- GET /:id — Get by ID
- PUT /:id — Update
- DELETE /:id — Delete (204 No Content)

### Service Areas (/service-areas)
- POST / — Create service area
- GET / — List with pagination (Cache-Control: public, max-age=60)
- GET /:id — Get by ID
- PUT /:id — Update
- DELETE /:id — Delete (204 No Content)

## Monitoring Endpoints

### GET /health
- Public, skip throttle
- Response: { status: 'ok', timestamp, uptime, version }

### GET /health/ready
- Public, skip throttle
- Checks database connectivity via Prisma $queryRaw
- Response: { status: 'ok'|'error', database, timestamp }

### GET /metrics
- Public, skip throttle
- Response: { requestCount, errorCount, averageResponseTime, uptime }

### POST /errors
- Public, skip throttle
- Accepts frontend error reports
- Request: { message, stack?, componentStack? }

## Pagination

All list endpoints support pagination query parameters:
- page (default: 1, minimum: 1)
- pageSize (default: 20, maximum: 100, clamped not rejected)

Response format: { data: T[], total, page, pageSize, totalPages }

## Error Responses

All errors return: { statusCode, message, timestamp }
Stack traces are never exposed in responses.

## Cross-References

- See [authentication.md](./authentication.md) for JWT flow
- See [security.md](./security.md) for rate limiting details
