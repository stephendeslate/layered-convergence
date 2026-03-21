# Data Model

## Overview

The Escrow Marketplace uses PostgreSQL 16 with Prisma 6 ORM. All models use UUID primary keys and include timestamp fields. Row Level Security (RLS) enforces multi-tenant data isolation at the database level.

## Entity Relationship Diagram

```
User 1──* Transaction (as buyer)
User 1──* Transaction (as seller)
Transaction 1──* Dispute
Transaction 1──* Payout
User 1──* Payout (as recipient)
```

## Models

### [VERIFY:DM-001] Database Connection and RLS Context
The Prisma service must set Row Level Security context on every request using `$executeRaw` with Prisma.sql tagged templates (never `$executeRawUnsafe`). RLS context must include the current user's ID for tenant isolation.

**Traced to**: `backend/src/prisma/prisma.service.ts`

### [VERIFY:DM-002] User Model and Role Validation
Users must have: id (UUID), email (unique), password (bcrypt hashed), role, createdAt, updatedAt. The role field must be restricted to BUYER or SELLER only using `@IsIn(['BUYER', 'SELLER'])` DTO validation. No ADMIN role exists in this system.

**Traced to**: `backend/src/auth/dto/register.dto.ts`

### [VERIFY:DM-003] Transaction Model and State Machine
Transactions must have: id (UUID), buyerId, sellerId, amount (Decimal 12,2), status, description, createdAt, updatedAt. The status field follows a strict state machine:

```
PENDING → FUNDED → SHIPPED → DELIVERED → RELEASED
                │
                └→ DISPUTED → RESOLVED → RELEASED
                                       └→ REFUNDED
```

Valid transitions must be enforced at the service layer with role-based access control:
- BUYER: PENDING→FUNDED, FUNDED→DISPUTED, SHIPPED→DELIVERED
- SELLER: FUNDED→SHIPPED

**Traced to**: `backend/src/transaction/transaction.service.ts`

### [VERIFY:DM-004] Transaction Status Transition Validation
Status transitions must validate that the requesting user has the correct role for the transition. Invalid transitions must be rejected with appropriate error messages.

**Traced to**: `backend/src/transaction/transaction.service.ts`

### [VERIFY:DM-005] Payout Model with Decimal Precision
Payouts must have: id (UUID), recipientId (FK to User), transactionId (FK to Transaction), amount (Decimal 12,2), status (PENDING/COMPLETED/FAILED), createdAt, updatedAt. Duplicate payouts for the same transaction must be rejected.

**Traced to**: `backend/src/payout/payout.service.ts`

## Database Constraints

- All monetary values use `Decimal(12,2)` for precision
- Foreign keys enforce referential integrity
- Unique constraints on User.email
- `@@map` annotations used for table name mapping in Prisma schema
- RLS policies enforce FORCE on: users, transactions, disputes, payouts

## Migration Strategy

- Single initial migration with full schema + RLS policies
- RLS policies created with `CREATE POLICY` statements in migration SQL
- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY` applied
