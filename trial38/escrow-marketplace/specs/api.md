# API Specification

## Base URL

`http://localhost:3001`

## Authentication

All endpoints except `/auth/register`, `/auth/login`, and `/auth/health` require a valid JWT Bearer token in the Authorization header.

## Endpoints

### Auth

| Method | Path            | Description                     | Auth Required |
|--------|----------------|---------------------------------|---------------|
| POST   | /auth/register | Register a new user             | No            |
| POST   | /auth/login    | Login and receive JWT           | No            |
| GET    | /auth/profile  | Get current user profile        | Yes           |
| GET    | /auth/health   | Health check                    | No            |

### Listings

| Method | Path           | Description                     | Auth Required         |
|--------|----------------|---------------------------------|-----------------------|
| GET    | /listings      | List paginated listings         | Yes                   |
| GET    | /listings/:id  | Get listing by ID               | Yes                   |
| POST   | /listings      | Create a new listing            | Yes (SELLER/MANAGER)  |
| PATCH  | /listings/:id  | Update a listing                | Yes (owner/MANAGER)   |
| DELETE | /listings/:id  | Delete a listing                | Yes (owner/MANAGER)   |

### Transactions

| Method | Path                       | Description                     | Auth Required |
|--------|----------------------------|---------------------------------|---------------|
| GET    | /transactions              | List user's transactions        | Yes           |
| GET    | /transactions/:id          | Get transaction by ID           | Yes           |
| POST   | /transactions              | Create a transaction (buy)      | Yes           |
| PATCH  | /transactions/:id/status   | Update transaction status       | Yes           |
| DELETE | /transactions/:id          | Cancel pending transaction      | Yes           |

## Pagination

All list endpoints support `?page=N&pageSize=N` query parameters.

- Default page size: 20 (DEFAULT_PAGE_SIZE)
- Maximum page size: 100 (MAX_PAGE_SIZE, enforced by clampPageSize)
- Response format: `{ data, total, page, pageSize, totalPages }`

## DTO Validation

All DTOs use class-validator decorators: @IsString, @IsEmail, @MaxLength, @Min, @IsUUID.
The global ValidationPipe uses `whitelist: true` and `forbidNonWhitelisted: true` to strip/reject unknown fields.

## Slug Generation

Listing titles are converted to URL-safe slugs via the slugify() utility from the shared package.
Slugs are regenerated on title update.

## Verification Tags

<!-- VERIFY: EM-API-001 — JWT Bearer authentication on protected routes -->
<!-- VERIFY: EM-API-002 — Pagination with DEFAULT_PAGE_SIZE and MAX_PAGE_SIZE -->
<!-- VERIFY: EM-API-003 — Role-based access control on listing creation -->
<!-- VERIFY: EM-API-004 — Transaction state machine transitions -->
<!-- VERIFY: EM-API-005 — Health check endpoint -->
<!-- VERIFY: EM-API-006 — DTO validation on all input -->
<!-- VERIFY: EM-API-007 — Whitelist validation pipe (strip unknown fields) -->
<!-- VERIFY: EM-API-008 — Listing owner or manager authorization -->
<!-- VERIFY: EM-API-009 — URL-safe slug generation for listings -->
<!-- VERIFY: EM-API-010 — Delete listing with tenant/owner validation -->
<!-- VERIFY: EM-API-011 — Transaction lookup with tenant/participant validation -->
<!-- VERIFY: EM-API-012 — Transaction cancellation with tenant/participant validation -->

## Error Responses

All errors follow the standard NestJS exception format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

## Response Headers

- `X-Response-Time` -- Added by ResponseTimeInterceptor on all responses
- `Cache-Control` -- Set on list endpoints (public for listings, private for transactions)

## Cross-References

- See [security.md](security.md) for Helmet, CORS, rate limiting, and DTO validation details
- See [auth.md](auth.md) for JWT configuration and role definitions
