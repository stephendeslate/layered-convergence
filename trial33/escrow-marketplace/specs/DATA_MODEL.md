# Escrow Marketplace — Data Model Specification

## Overview

This document defines the 5 entities in the Escrow Marketplace data model.
All tables use Row Level Security. See REQUIREMENTS.md for business context
and STATE_MACHINES.md for status field transitions.

## Entities

### Tenant
- VERIFY: EM-DM-TENANT-001 — Tenant entity with id, name, slug (unique), timestamps
- Maps to table: tenants (@@map)
- Has many: Users, EscrowTransactions

### User
- VERIFY: EM-DM-USER-001 — User entity with email (unique), passwordHash, role
- Maps to table: users (@@map)
- password_hash, tenant_id columns use @map for snake_case
- Belongs to: Tenant
- Has many: BuyerTransactions, SellerTransactions, FiledDisputes, AssignedDisputes

### EscrowTransaction
- VERIFY: EM-DM-ESC-001 — EscrowTransaction with amount (Decimal 12,2), status, buyer/seller
- Maps to table: escrow_transactions (@@map)
- buyer_id, seller_id, tenant_id, funded_at, released_at use @map
- Status field uses EscrowStatus enum
- Belongs to: Tenant, Buyer (User), Seller (User)
- Has many: Disputes

### Dispute
- VERIFY: EM-DM-DISP-001 — Dispute with reason, resolution, status, filedBy, assignedTo
- Maps to table: disputes (@@map)
- transaction_id, filed_by_id, assigned_to_id, filed_at, resolved_at use @map
- Status field uses DisputeStatus enum
- Belongs to: EscrowTransaction, FiledBy (User), AssignedTo (User, optional)

### AuditLog
- VERIFY: EM-DM-AUD-001 — AuditLog with action, entity, entityId, metadata (JSON)
- Maps to table: audit_logs (@@map)
- entity_id, tenant_id, user_id use @map
- Immutable — no update or delete operations

## Enums

- VERIFY: EM-DM-ENUM-001 — Role enum with @@map("role")
- VERIFY: EM-DM-ENUM-002 — EscrowStatus enum with @@map("escrow_status")
- VERIFY: EM-DM-ENUM-003 — DisputeStatus enum with @@map("dispute_status")

## Cross-References

- REQUIREMENTS.md: Entity definitions trace to functional requirements
- STATE_MACHINES.md: EscrowStatus and DisputeStatus transition rules
- API_SPEC.md: CRUD operations on these entities
- SECURITY.md: RLS policies reference tenant_id columns
