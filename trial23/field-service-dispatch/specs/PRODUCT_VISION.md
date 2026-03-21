# Product Vision — Field Service Dispatch

## Purpose

Field Service Dispatch is a multi-tenant SaaS platform enabling service companies to manage
work orders, dispatch technicians, track routes and GPS locations, and generate invoices.
Each company operates in complete data isolation via row-level security.

See: SYSTEM_ARCHITECTURE.md, SECURITY_MODEL.md

## Target Users

### Dispatcher (DISPATCHER role)
- Creates and assigns work orders to technicians
- Views all technicians, customers, routes, and GPS events for their company
- Manages invoicing lifecycle from draft through payment
- Monitors technician locations in real-time via GPS events

### Technician (TECHNICIAN role)
- Views assigned work orders
- Updates work order status as work progresses
- Reports GPS location for route tracking
- Views own route assignments

## VERIFY:ROLE_NO_ADMIN — Only DISPATCHER and TECHNICIAN roles exist; ADMIN is excluded from registration

## Key Business Rules

### Work Order Lifecycle
Work orders follow a strict state machine:
- OPEN: newly created, unassigned
- ASSIGNED: technician has been assigned
- IN_PROGRESS: technician has started work
- COMPLETED: work is finished, pending invoicing
- INVOICED: invoice has been generated
- CLOSED: fully resolved and archived
- CANCELLED: can transition from any non-terminal state (OPEN, ASSIGNED, IN_PROGRESS)

## VERIFY:WO_STATE_MACHINE — WorkOrder transitions enforce OPEN→ASSIGNED→IN_PROGRESS→COMPLETED→INVOICED→CLOSED plus CANCELLED

### Invoice Lifecycle
Invoices follow their own state machine:
- DRAFT: initial state, editable
- SENT: delivered to customer, no longer editable
- PAID: payment received
- VOID: cancelled/voided

## VERIFY:INV_STATE_MACHINE — Invoice transitions enforce DRAFT→SENT→PAID→VOID

## Success Metrics

1. **Data Isolation**: Zero cross-company data leakage (enforced by RLS)
2. **State Integrity**: No invalid state transitions in work orders or invoices
3. **Accessibility**: WCAG 2.1 AA compliance across all routes
4. **Test Coverage**: Unit tests for all 8 services, integration tests against real DB
5. **Type Safety**: Zero `as any` casts, zero `console.log` in production code

## VERIFY:DECIMAL_MONEY — All monetary fields use Decimal(12,2), not Float
## VERIFY:DECIMAL_DISTANCE — estimatedDistance uses Decimal(10,2), not Float
## VERIFY:FLOAT_GPS_ONLY — Float is used ONLY for GPS coordinates (latitude, longitude)

## Multi-Tenancy Model

Every data entity is scoped to a Company. Users belong to exactly one company.
Row-level security policies in PostgreSQL enforce that queries only return data
belonging to the authenticated user's company. This is enforced at the database
level, not just the application level.

See: DATA_MODEL.md, API_CONTRACT.md

## Non-Functional Requirements

- JWT-based authentication with fail-fast on missing JWT_SECRET
- CORS origin configurable via environment with fail-fast on missing CORS_ORIGIN
- Password hashing via bcrypt with salt rounds = 12
- Input validation via class-validator with whitelist mode
- Dark mode support via prefers-color-scheme media query

## VERIFY:BCRYPT_SALT_12 — bcrypt uses exactly 12 salt rounds
## VERIFY:JWT_FAILFAST — Application fails to start if JWT_SECRET is not set
## VERIFY:CORS_FAILFAST — Application fails to start if CORS_ORIGIN is not set

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend Runtime | NestJS | 11 |
| ORM | Prisma | 6 |
| Database | PostgreSQL | 16 |
| Frontend | Next.js | 15 |
| UI Components | shadcn/ui | latest |
| CSS | Tailwind CSS | 4 |
| Backend Tests | Jest | latest |
| Frontend Tests | Vitest | latest |

See: TESTING_STRATEGY.md, UI_SPECIFICATION.md
