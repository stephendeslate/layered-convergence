# System Requirements Specification — Part 4: Security & Compliance

## Field Service Dispatch & Management Platform

**Version:** 1.0
**Date:** 2026-03-20
**Status:** Approved

---

## 1. Authentication & Authorization

### 1.1 JWT Authentication

| Requirement | Implementation | Status |
|-------------|---------------|--------|
| JWT token generation on login | NestJS JwtService with HS256 | [VERIFY:AUTH-001] |
| Token payload includes userId, companyId, role | Structured JWT claims | [VERIFY:AUTH-002] |
| Token expiration (24h default) | `expiresIn` config | [VERIFY:AUTH-003] |
| AuthGuard on all protected routes | Global guard with public route exceptions | [VERIFY:AUTH-004] |
| Password hashing with bcrypt | bcrypt with salt rounds ≥ 10 | [VERIFY:AUTH-005] |
| Refresh token flow | Separate refresh endpoint | [VERIFY:AUTH-006] |

### 1.2 JWT Token Structure

```typescript
// JWT Payload
interface JwtPayload {
  sub: string;        // userId
  companyId: string;  // tenant identifier
  role: UserRole;     // ADMIN | DISPATCHER | TECHNICIAN | CUSTOMER
  email: string;
  iat: number;        // issued at
  exp: number;        // expiration
}
```

### 1.3 Role-Based Access Control

| Role | Permissions |
|------|------------|
| ADMIN | Full CRUD on all company-scoped data, company settings, analytics |
| DISPATCHER | Work order CRUD, technician assignment, route optimization, dispatch board |
| TECHNICIAN | View assigned work orders, update status, upload photos, GPS streaming |
| CUSTOMER | View own work orders, tracking portal, pay invoices |

#### Endpoint Protection Matrix

| Endpoint Group | ADMIN | DISPATCHER | TECHNICIAN | CUSTOMER | Public |
|---------------|-------|------------|------------|----------|--------|
| /auth/* | - | - | - | - | YES |
| /companies/* | YES | - | - | - | - |
| /work-orders CRUD | YES | YES | - | - | - |
| /work-orders/:id (own) | YES | YES | YES | YES | - |
| /work-orders/transition | YES | YES | YES | - | - |
| /work-orders/tracking/:token | - | - | - | - | YES |
| /technicians/* | YES | READ | OWN | - | - |
| /customers/* | YES | YES | - | OWN | - |
| /routes/* | YES | YES | OWN | - | - |
| /dispatch/* | YES | YES | - | - | - |
| /gps/* | YES | YES | OWN | - | - |
| /invoices/* | YES | - | - | OWN | - |
| /photos/* | YES | YES | OWN | - | - |

[VERIFY:RBAC-001] All endpoints have appropriate role guards applied.

---

## 2. Row-Level Security (RLS)

### 2.1 RLS Architecture

**Principle:** Every table that contains company-scoped data MUST have an RLS policy
that filters rows by `companyId`. This is enforced at the PostgreSQL level, making
data leaks structurally impossible even if application code has bugs.

[VERIFY:RLS-001] Every company-scoped table has `ENABLE ROW LEVEL SECURITY`.
[VERIFY:RLS-002] Every company-scoped table has a `CREATE POLICY` statement.
[VERIFY:RLS-003] Policies use `current_setting('app.company_id', true)::uuid`.

### 2.2 RLS Policy Definitions

```sql
-- ========================================================================
-- ENABLE RLS ON ALL COMPANY-SCOPED TABLES
-- ========================================================================

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "technicians" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "work_orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "work_order_status_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "routes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "job_photos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;

-- ========================================================================
-- CREATE POLICIES
-- ========================================================================

-- Users
CREATE POLICY users_tenant_isolation ON "users"
  FOR ALL
  USING ("companyId" = current_setting('app.company_id', true)::uuid)
  WITH CHECK ("companyId" = current_setting('app.company_id', true)::uuid);

-- Technicians
CREATE POLICY technicians_tenant_isolation ON "technicians"
  FOR ALL
  USING ("companyId" = current_setting('app.company_id', true)::uuid)
  WITH CHECK ("companyId" = current_setting('app.company_id', true)::uuid);

-- Customers
CREATE POLICY customers_tenant_isolation ON "customers"
  FOR ALL
  USING ("companyId" = current_setting('app.company_id', true)::uuid)
  WITH CHECK ("companyId" = current_setting('app.company_id', true)::uuid);

-- Work Orders
CREATE POLICY work_orders_tenant_isolation ON "work_orders"
  FOR ALL
  USING ("companyId" = current_setting('app.company_id', true)::uuid)
  WITH CHECK ("companyId" = current_setting('app.company_id', true)::uuid);

-- Work Order Status History
CREATE POLICY work_order_status_history_tenant_isolation ON "work_order_status_history"
  FOR ALL
  USING ("companyId" = current_setting('app.company_id', true)::uuid)
  WITH CHECK ("companyId" = current_setting('app.company_id', true)::uuid);

-- Routes
CREATE POLICY routes_tenant_isolation ON "routes"
  FOR ALL
  USING ("companyId" = current_setting('app.company_id', true)::uuid)
  WITH CHECK ("companyId" = current_setting('app.company_id', true)::uuid);

-- Job Photos
CREATE POLICY job_photos_tenant_isolation ON "job_photos"
  FOR ALL
  USING ("companyId" = current_setting('app.company_id', true)::uuid)
  WITH CHECK ("companyId" = current_setting('app.company_id', true)::uuid);

-- Invoices
CREATE POLICY invoices_tenant_isolation ON "invoices"
  FOR ALL
  USING ("companyId" = current_setting('app.company_id', true)::uuid)
  WITH CHECK ("companyId" = current_setting('app.company_id', true)::uuid);
```

[VERIFY:RLS-004] 8 tables have RLS enabled (users, technicians, customers, work_orders, work_order_status_history, routes, job_photos, invoices).
[VERIFY:RLS-005] 8 CREATE POLICY statements exist, one per table.
[VERIFY:RLS-006] All policies use `current_setting('app.company_id', true)::uuid`.

### 2.3 Tenant Context Middleware

```typescript
// apps/api/src/common/middleware/tenant-context.middleware.ts

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const user = req['user']; // Set by AuthGuard
    if (user?.companyId) {
      // Set PostgreSQL session variable for RLS
      await this.prisma.$executeRaw`
        SELECT set_config('app.company_id', ${user.companyId}, true)
      `;
    }
    next();
  }
}
```

[VERIFY:RLS-007] TenantContextMiddleware sets `app.company_id` from JWT claims.
[VERIFY:RLS-008] Middleware runs after AuthGuard and before any database query.

### 2.4 RLS Testing Strategy

```typescript
// Integration tests MUST verify tenant isolation
describe('Tenant Isolation', () => {
  it('Company A cannot access Company B work orders', async () => {
    // 1. Create work order in Company A
    // 2. Set RLS context to Company B
    // 3. Query for Company A's work order
    // 4. Assert: no results returned
  });

  it('Company A technicians are not visible to Company B', async () => {
    // Similar pattern for technician queries
  });
});
```

[VERIFY:RLS-009] Integration tests verify cross-tenant isolation for work orders, technicians, customers.

---

## 3. WebSocket Security

### 3.1 Authentication

| Requirement | Implementation | Tag |
|-------------|---------------|-----|
| JWT required on handshake | Validated in `handleConnection` | [VERIFY:WS-001] |
| Invalid JWT → disconnect | `client.disconnect()` on validation failure | [VERIFY:WS-002] |
| CompanyId extracted from JWT | Stored on `client.data.companyId` | [VERIFY:WS-003] |
| No unauthenticated connections | All events require authenticated socket | [VERIFY:WS-004] |

### 3.2 WebSocket Authentication Implementation

```typescript
@WebSocketGateway({ namespace: '/gps' })
export class GpsGateway implements OnGatewayConnection {

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = this.extractToken(client);
      if (!token) {
        client.emit('error', { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      client.data.userId = payload.sub;
      client.data.companyId = payload.companyId;
      client.data.role = payload.role;

      // Join company room
      client.join(`company:${payload.companyId}`);
    } catch (error) {
      client.emit('error', { message: 'Invalid token' });
      client.disconnect();
    }
  }

  private extractToken(client: Socket): string | null {
    const auth = client.handshake.auth?.token;
    if (auth && auth.startsWith('Bearer ')) {
      return auth.substring(7);
    }
    return auth || null;
  }
}
```

### 3.3 GPS Tenant Isolation

**CRITICAL SECURITY REQUIREMENT:**

A technician from Company A MUST NOT have their position broadcasted to Company B's
dashboard. This is enforced at multiple levels:

1. **Room-level:** Each company has its own WebSocket room (`company:{companyId}`)
2. **Verification:** On `position:update`, verify `technician.companyId === socket.companyId`
3. **Broadcast scope:** Only emit to the authenticated company's room

```typescript
@SubscribeMessage('position:update')
async handlePositionUpdate(
  @ConnectedSocket() client: Socket,
  @MessageBody() data: PositionUpdateDto,
) {
  const companyId = client.data.companyId;

  // CRITICAL: Verify technician belongs to the same company
  const technician = await this.technicianService.findById(data.technicianId);
  if (!technician || technician.companyId !== companyId) {
    client.emit('error', { message: 'Unauthorized: cross-tenant access denied' });
    return;
  }

  // Broadcast ONLY to the company's room
  this.server.to(`company:${companyId}`).emit('position:broadcast', data);
}
```

[VERIFY:WS-005] `position:update` handler verifies `technician.companyId === socket.companyId`.
[VERIFY:WS-006] Broadcasting uses `to(company:${companyId})`, never global broadcast.
[VERIFY:WS-007] `tracking:subscribe` verifies work order belongs to subscriber's company or is the assigned customer.

---

## 4. SQL Injection Prevention

### 4.1 Policy

**ZERO TOLERANCE for SQL injection vectors.**

| Banned | Allowed | Tag |
|--------|---------|-----|
| `$queryRawUnsafe()` | `$queryRaw` (tagged template) | [VERIFY:SQL-001] |
| `$executeRawUnsafe()` | `$executeRaw` (tagged template) | [VERIFY:SQL-002] |
| String interpolation in SQL (`${variable}`) | Prisma tagged template parameters | [VERIFY:SQL-003] |
| Manual string concatenation for queries | Prisma client methods | [VERIFY:SQL-004] |

### 4.2 ESLint Rule

```javascript
// packages/config/eslint/rules.js
{
  'no-restricted-syntax': [
    'error',
    {
      selector: "CallExpression[callee.property.name='$queryRawUnsafe']",
      message: 'Use $queryRaw tagged template instead of $queryRawUnsafe to prevent SQL injection.',
    },
    {
      selector: "CallExpression[callee.property.name='$executeRawUnsafe']",
      message: 'Use $executeRaw tagged template instead of $executeRawUnsafe to prevent SQL injection.',
    },
  ],
}
```

[VERIFY:SQL-005] ESLint rule bans `$queryRawUnsafe` and `$executeRawUnsafe`.
[VERIFY:SQL-006] No occurrences of `$queryRawUnsafe` or `$executeRawUnsafe` in codebase (verified by grep).
[VERIFY:SQL-007] All raw SQL queries use Prisma tagged templates (`$queryRaw\`...\``, `$executeRaw\`...\``).

### 4.3 Safe Query Examples

```typescript
// CORRECT: Tagged template — parameters are automatically escaped
const technicians = await prisma.$queryRaw`
  SELECT id, name
  FROM technicians
  WHERE "companyId" = ${companyId}::uuid
    AND ST_DWithin(location::geography, ST_MakePoint(${lng}, ${lat})::geography, ${radius})
`;

// WRONG: String interpolation — SQL injection vulnerability
// const technicians = await prisma.$queryRawUnsafe(
//   `SELECT * FROM technicians WHERE "companyId" = '${companyId}'`
// );
```

### 4.4 Verification Process

```bash
# Automated check — run in CI
grep -rn '\$queryRawUnsafe\|\$executeRawUnsafe' apps/api/src/
# Expected output: no results

# Check for string interpolation in raw queries
grep -rn '\$queryRaw.*\${' apps/api/src/
# Must use tagged template syntax, not string interpolation
```

---

## 5. Input Validation

### 5.1 Global Validation Pipe

```typescript
// main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,           // Strip unknown properties
  forbidNonWhitelisted: true, // Reject requests with unknown properties
  transform: true,            // Auto-transform payloads to DTO instances
  transformOptions: {
    enableImplicitConversion: true,
  },
}));
```

[VERIFY:VAL-001] Global ValidationPipe is registered with `whitelist: true`.
[VERIFY:VAL-002] All controller methods accept DTOs with class-validator decorators.

### 5.2 DTO Validation Coverage

Every endpoint that accepts input MUST have a DTO with validation decorators:

| Endpoint | DTO | Validations | Tag |
|----------|-----|-------------|-----|
| POST /auth/register | RegisterDto | @IsEmail, @IsString, @MinLength(8) | [VERIFY:VAL-003] |
| POST /auth/login | LoginDto | @IsEmail, @IsString | [VERIFY:VAL-004] |
| POST /work-orders | CreateWorkOrderDto | @IsUUID, @IsString, @IsNumber, @Min/@Max | [VERIFY:VAL-005] |
| POST /work-orders/:id/transition | TransitionDto | @IsEnum(WorkOrderStatus) | [VERIFY:VAL-006] |
| POST /work-orders/:id/assign | AssignDto | @IsUUID | [VERIFY:VAL-007] |
| POST /technicians | CreateTechnicianDto | @IsString, @IsEmail, @IsArray | [VERIFY:VAL-008] |
| POST /customers | CreateCustomerDto | @IsString, @IsOptional | [VERIFY:VAL-009] |
| POST /routes/optimize | OptimizeRouteDto | @IsUUID, @IsDateString | [VERIFY:VAL-010] |
| WS position:update | PositionUpdateDto | @IsUUID, @IsNumber, @Min/@Max | [VERIFY:VAL-011] |

### 5.3 Coordinate Validation

```typescript
// All lat/lng fields are validated to prevent invalid coordinates
@IsNumber()
@Min(-90)
@Max(90)
lat: number;

@IsNumber()
@Min(-180)
@Max(180)
lng: number;
```

[VERIFY:VAL-012] All coordinate fields have @Min/@Max validation.

---

## 6. Rate Limiting

### 6.1 Rate Limiter Registration

```typescript
// app.module.ts
@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
  ],
})
export class AppModule {}
```

[VERIFY:RL-001] ThrottlerModule is imported and configured in AppModule.

### 6.2 Rate Limiter Application

```typescript
// main.ts or app.module.ts
app.useGlobalGuards(new ThrottlerGuard());
```

[VERIFY:RL-002] ThrottlerGuard is applied globally.

### 6.3 Endpoint-Specific Rate Limits

```typescript
// Auth controller — strict rate limiting
@UseGuards(ThrottlerGuard)
@Throttle({ default: { ttl: 60000, limit: 10 } })
@Controller('auth')
export class AuthController {}

// Route optimization — protect ORS rate limits
@Throttle({ default: { ttl: 60000, limit: 10 } })
@Post('optimize')
async optimizeRoute() {}
```

[VERIFY:RL-003] Auth endpoints have reduced rate limits (10/minute).
[VERIFY:RL-004] Route optimization endpoint has reduced rate limits.

---

## 7. PII Handling

### 7.1 PII Fields Identified

| Table | PII Fields | Access Control |
|-------|-----------|----------------|
| users | email, firstName, lastName, passwordHash | RLS + role guard |
| technicians | name, email, phone | RLS + role guard |
| customers | name, email, phone, address | RLS + role guard |

### 7.2 PII Protection Measures

| Measure | Implementation | Tag |
|---------|---------------|-----|
| Tenant isolation | RLS policies on all PII-containing tables | [VERIFY:PII-001] |
| Password hashing | bcrypt with ≥ 10 salt rounds | [VERIFY:PII-002] |
| No PII in logs | Logger strips sensitive fields | [VERIFY:PII-003] |
| No PII in error messages | Exception filters sanitize responses | [VERIFY:PII-004] |
| HTTPS enforcement | Deployment platform handles TLS | [VERIFY:PII-005] |

### 7.3 Customer Tracking Portal Security

The customer tracking portal uses a unique, randomly generated token per work order.

```typescript
// Token generation
const trackingToken = crypto.randomUUID();

// Token-based access (no authentication required)
@Get('tracking/:token')
@Public() // Bypasses AuthGuard
async getTrackingData(@Param('token') token: string) {
  const workOrder = await this.workOrderService.findByTrackingToken(token);
  if (!workOrder) throw new NotFoundException();

  // Return limited data — no PII beyond what the customer already knows
  return {
    status: workOrder.status,
    technicianName: workOrder.technician?.name,
    scheduledAt: workOrder.scheduledAt,
    serviceType: workOrder.serviceType,
  };
}
```

[VERIFY:PII-006] Tracking portal returns minimal data (no full address, no phone, no email).
[VERIFY:PII-007] Tracking tokens are UUID v4 (unguessable).

---

## 8. CORS Configuration

### 8.1 CORS Settings

```typescript
// main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
```

[VERIFY:CORS-001] CORS is configured with specific origin, not wildcard `*`.
[VERIFY:CORS-002] Credentials are enabled for JWT cookie support.

### 8.2 WebSocket CORS

```typescript
@WebSocketGateway({
  namespace: '/gps',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
```

[VERIFY:CORS-003] WebSocket gateway has CORS configured matching the main app.

---

## 9. Error Handling Security

### 9.1 Exception Filters

```typescript
// Global exception filter — sanitize errors
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // Don't expose internal errors to clients
    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json(exception.getResponse());
    } else {
      // Log the full error internally
      this.logger.error('Unhandled exception', exception);

      // Return generic error to client
      response.status(500).json({
        statusCode: 500,
        message: 'Internal server error',
      });
    }
  }
}
```

[VERIFY:ERR-001] Unhandled exceptions return generic 500, not stack traces.
[VERIFY:ERR-002] HttpExceptions pass through with their defined messages.

---

## 10. Security Audit Checklist

### 10.1 Pre-Deployment Checklist

| # | Check | How to Verify | Tag |
|---|-------|---------------|-----|
| 1 | RLS enabled on all 8 company-scoped tables | `grep 'ENABLE ROW LEVEL SECURITY' migrations/` | [VERIFY:AUDIT-001] |
| 2 | CREATE POLICY for all 8 tables | `grep 'CREATE POLICY' migrations/` | [VERIFY:AUDIT-002] |
| 3 | No `$queryRawUnsafe` in codebase | `grep -rn '$queryRawUnsafe' apps/api/src/` | [VERIFY:AUDIT-003] |
| 4 | No `$executeRawUnsafe` in codebase | `grep -rn '$executeRawUnsafe' apps/api/src/` | [VERIFY:AUDIT-004] |
| 5 | WebSocket requires JWT on handshake | Code review of `handleConnection` | [VERIFY:AUDIT-005] |
| 6 | GPS position:update verifies company | Code review of `handlePositionUpdate` | [VERIFY:AUDIT-006] |
| 7 | No `as any` type casts | `grep -rn 'as any' apps/ packages/` | [VERIFY:AUDIT-007] |
| 8 | All DTOs have validation decorators | Code review of all DTO files | [VERIFY:AUDIT-008] |
| 9 | ThrottlerModule registered and applied | Check AppModule imports and guards | [VERIFY:AUDIT-009] |
| 10 | ESLint bans $queryRawUnsafe | Check ESLint config | [VERIFY:AUDIT-010] |
| 11 | Passwords hashed with bcrypt | Code review of auth service | [VERIFY:AUDIT-011] |
| 12 | CORS configured with specific origin | Check main.ts cors config | [VERIFY:AUDIT-012] |
| 13 | Customer tracking uses random UUID tokens | Check work order creation | [VERIFY:AUDIT-013] |
| 14 | No PII in error responses | Check exception filters | [VERIFY:AUDIT-014] |
| 15 | Mock fallbacks throw in production | Check route optimization, GPS simulator | [VERIFY:AUDIT-015] |

### 10.2 Automated Security Checks (CI)

```yaml
security-check:
  runs-on: ubuntu-latest
  steps:
    - name: Check for $queryRawUnsafe
      run: |
        if grep -rn '\$queryRawUnsafe\|\$executeRawUnsafe' apps/api/src/; then
          echo "FAIL: Found unsafe raw query usage"
          exit 1
        fi

    - name: Check for as any
      run: |
        if grep -rn 'as any' apps/api/src/ packages/; then
          echo "FAIL: Found 'as any' type cast"
          exit 1
        fi

    - name: Check for string interpolation in SQL
      run: |
        if grep -rn '\$queryRaw.*`.*\${' apps/api/src/ | grep -v 'tagged template'; then
          echo "WARNING: Possible string interpolation in raw SQL"
        fi
```

---

## 11. Compliance Notes

### 11.1 GPS Tracking

- GPS data is collected with user awareness (technicians are company employees/contractors)
- No covert tracking — GPS streaming requires explicit technician action ("Start Route")
- Demo uses synthetic GPS data — no real person tracking
- GPS data is tenant-isolated — Company A cannot see Company B's technicians

[VERIFY:COMP-001] GPS tracking requires explicit technician action to start.
[VERIFY:COMP-002] GPS data is tenant-isolated at database (RLS) and WebSocket (room) levels.

### 11.2 Payment Processing

- Stripe handles all payment card data — no PCI scope for the application
- Payment Intent API used — card data never touches our servers
- Webhook signature verification for payment confirmations

[VERIFY:COMP-003] No credit card data stored in application database.
[VERIFY:COMP-004] Stripe webhook signature is verified before processing.

### 11.3 Data Retention

- Work order history is retained indefinitely for audit trail
- GPS position data can be purged after configurable retention period
- Customer PII can be deleted on request (right to deletion)

---

## 12. Verification Status Summary

All claims tagged with `[VERIFY:*]` must be verified during Phase C5 (Hardening).
Each verification produces a PASS/FAIL result with evidence documented in C5_AUDIT.md.

| Category | Claim Count | Verified | Status |
|----------|-------------|----------|--------|
| Authentication | 6 | 0 | PLANNED |
| RBAC | 1 | 0 | PLANNED |
| RLS | 9 | 0 | PLANNED |
| WebSocket | 7 | 0 | PLANNED |
| SQL Injection | 7 | 0 | PLANNED |
| Input Validation | 12 | 0 | PLANNED |
| Rate Limiting | 4 | 0 | PLANNED |
| PII | 7 | 0 | PLANNED |
| CORS | 3 | 0 | PLANNED |
| Error Handling | 2 | 0 | PLANNED |
| Audit | 15 | 0 | PLANNED |
| Compliance | 4 | 0 | PLANNED |
| **Total** | **77** | **0** | **PLANNED** |
