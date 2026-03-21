# Security Model — Field Service Dispatch

## Overview

Security is enforced at multiple layers: authentication (JWT), authorization
(role guards), input validation (class-validator), and data isolation (PostgreSQL RLS).

See: SYSTEM_ARCHITECTURE.md, API_CONTRACT.md

## Authentication

### JWT Configuration
- Tokens issued on successful login via `/auth/login`
- Payload includes: `sub` (userId), `email`, `role`, `companyId`
- JWT_SECRET loaded from environment — application fails fast if not set

## VERIFY:JWT_PAYLOAD — JWT payload contains sub, email, role, companyId

### Password Security
- Passwords hashed with bcrypt
- Salt rounds: 12 (constant `SALT_ROUNDS = 12`)
- Raw passwords never stored or logged

## VERIFY:NO_CONSOLE_LOG — Zero console.log statements in production code

## Authorization

### Role-Based Access Control
Two roles only:
- **DISPATCHER**: full CRUD on all entities within their company
- **TECHNICIAN**: read-only on most entities, can update own work order status

### Registration Guard
- `@IsIn(['DISPATCHER', 'TECHNICIAN'])` on the role field in RegisterDTO
- Any attempt to register with ADMIN or other roles returns 400

## VERIFY:REGISTER_DTO_ISIN — RegisterDTO uses @IsIn(['DISPATCHER', 'TECHNICIAN'])

## Row-Level Security (RLS)

### Policy Design
Every company-scoped table has RLS enabled with FORCE:

```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_name FORCE ROW LEVEL SECURITY;
```

## VERIFY:RLS_FORCE — All company-scoped tables use FORCE ROW LEVEL SECURITY

### Company Context
Before each request, the `company-context` service executes:
```sql
SET app.company_id = '<company-uuid>';
```
This is done via `$executeRaw` with `Prisma.sql` tagged template — never `$executeRawUnsafe`.

## VERIFY:PRISMA_SQL_TAG — $executeRaw uses Prisma.sql tagged template

### RLS Policies
Policies filter on `company_id = current_setting('app.company_id')::uuid`:
- SELECT: only rows matching company
- INSERT: company_id must match context
- UPDATE: only rows matching company
- DELETE: only rows matching company

Tables with RLS:
- users
- customers
- technicians
- work_orders
- routes
- gps_events
- invoices

## Input Validation

### Global ValidationPipe
Applied globally in `main.ts`:
```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));
```

## VERIFY:VALIDATION_WHITELIST — ValidationPipe uses whitelist: true and forbidNonWhitelisted: true

### DTO Validation
- All DTOs use class-validator decorators
- `@IsEmail()` for email fields
- `@IsString()` for text fields
- `@IsUUID()` for ID references
- `@IsIn()` for enum-like fields

## Type Safety

- Zero `as any` casts in all source code
- All Prisma queries are fully typed
- DTOs enforce runtime validation

## VERIFY:ZERO_AS_ANY — No `as any` type assertions in source code

## CORS

- CORS_ORIGIN loaded from environment
- Application fails fast if not set
- Only the configured origin is allowed

See: DATA_MODEL.md, TESTING_STRATEGY.md
