# API Contract

## Overview

The Analytics Engine backend exposes a RESTful API via NestJS 11 controllers. All endpoints
except authentication require a valid JWT in the `Authorization: Bearer <token>` header.
Request validation uses class-validator decorators with a global ValidationPipe (whitelist +
transform enabled). Responses use standard HTTP status codes.

## Base URL

All API routes are prefixed with the configurable `API_URL` (default: `http://localhost:3001`).

## Authentication Endpoints

### POST /auth/register

Creates a new user and tenant (or joins existing tenant by slug).

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "Jane Doe",
  "password": "securepassword",
  "tenantSlug": "acme-corp",
  "role": "ANALYST"
}
```

[VERIFY:AC-001] The global ValidationPipe MUST be configured with whitelist and transform options.
> Implementation: `src/main.ts:25` — app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

[VERIFY:AC-002] The register DTO MUST restrict role to VIEWER, EDITOR, ANALYST using @IsIn.
> Implementation: `src/auth/dto/register.dto.ts:1` — @IsIn([Role.VIEWER, Role.EDITOR, Role.ANALYST])

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "uuid", "email": "...", "name": "...", "role": "ANALYST", "tenantId": "uuid" }
}
```

**Error (400):** Invalid role, missing fields
**Error (409):** Email already registered

### POST /auth/login

Authenticates a user and returns a JWT.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

[VERIFY:AC-003] The login DTO MUST validate email and password as required string fields.
> Implementation: `src/auth/dto/login.dto.ts:1` — @IsEmail() and @IsString() decorators

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "uuid", "email": "...", "name": "...", "role": "VIEWER", "tenantId": "uuid" }
}
```

**Error (401):** Invalid credentials

## Auth Service

[VERIFY:AC-004] The auth service MUST hash passwords with bcrypt and validate credentials on login.
> Implementation: `src/auth/auth.service.ts:2` — register() and login() methods

[VERIFY:AC-005] The auth controller MUST expose POST /auth/register and POST /auth/login endpoints.
> Implementation: `src/auth/auth.controller.ts:1` — @Controller('auth') with @Post('register') and @Post('login')

## Protected Endpoints

All endpoints below require `Authorization: Bearer <token>` header.

### Data Sources

#### GET /data-sources
Returns all data sources for the authenticated tenant.

[VERIFY:AC-006] The DataSource service MUST scope all queries to the authenticated tenant.
> Implementation: `src/data-source/data-source.service.ts:1` — findAll uses tenantId from JWT

#### POST /data-sources
Creates a new data source.

**Request Body:**
```json
{
  "name": "Production DB",
  "type": "POSTGRESQL"
}
```

#### DELETE /data-sources/:id
Deletes a data source. Returns 404 if not found or belongs to different tenant.

### Pipelines

#### GET /pipelines
Returns all pipelines for the authenticated tenant.

#### POST /pipelines
Creates a new pipeline in DRAFT state.

**Request Body:**
```json
{
  "name": "ETL Pipeline"
}
```

#### PATCH /pipelines/:id/transition

[VERIFY:AC-007] The pipeline transition endpoint MUST validate state changes against the state machine.
> Implementation: `src/pipeline/pipeline.service.ts:2` — transition() checks VALID_TRANSITIONS

**Request Body:**
```json
{
  "state": "ACTIVE"
}
```

**Error (400):** Invalid transition (e.g., DRAFT -> ARCHIVED)

### Dashboards

#### GET /dashboards
Returns all dashboards for the authenticated tenant.

#### GET /dashboards/:id
Returns a single dashboard with its widgets included.

[VERIFY:AC-008] The dashboard service MUST include widgets when fetching a single dashboard.
> Implementation: `src/dashboard/dashboard.service.ts:1` — findOne uses include: { widgets: true }

#### POST /dashboards
Creates a new dashboard.

#### DELETE /dashboards/:id
Deletes a dashboard.

### Widgets

#### GET /widgets/by-dashboard/:dashboardId
Returns all widgets for a specific dashboard.

#### POST /widgets
Creates a new widget.

**Request Body:**
```json
{
  "title": "Revenue Chart",
  "type": "BAR",
  "dashboardId": "uuid"
}
```

### Embeds

#### GET /embeds
Returns all embeds for the authenticated tenant.

#### GET /embeds/by-token/:token
Returns embed data by token (no auth required). Returns 404 if expired.

#### POST /embeds
Creates a new embed link.

#### DELETE /embeds/:id
Deletes an embed.

## Error Response Format

All errors follow NestJS default exception format:
```json
{
  "statusCode": 400,
  "message": "Descriptive error message",
  "error": "Bad Request"
}
```

## Cross-References

- Authentication flow: [SECURITY_MODEL.md](./SECURITY_MODEL.md)
- Data model definitions: [DATA_MODEL.md](./DATA_MODEL.md)
- Frontend integration: [UI_SPECIFICATION.md](./UI_SPECIFICATION.md)
