# Product Vision: Escrow Marketplace

## Overview

The Escrow Marketplace is a secure transaction platform that holds funds in escrow
between buyers and sellers, with dispute resolution and automated payout processing.

## Target Users

The platform serves three primary user segments:

1. **Buyers** — Purchase goods or services with payment protection
2. **Sellers** — Receive guaranteed payment upon delivery confirmation
3. **Arbiters** — Resolve disputes between buyers and sellers

## Core Value Propositions

### Secure Escrow
[VERIFY:EM-001] All user data is protected by PostgreSQL Row Level Security
with FORCE RLS enabled on all tables. Users can only access their own
transactions and related data.

### Self-Service Registration
[VERIFY:EM-002] Users self-register with role selection. ADMIN role is excluded
from registration via @IsIn validation, preventing privilege escalation.

### Authentication
[VERIFY:EM-003] The platform provides RESTful authentication endpoints for
registration and login, returning JWT tokens for API access.

### Transaction Lifecycle
[VERIFY:EM-004] Transactions follow a state machine: PENDING -> FUNDED ->
DELIVERED -> RELEASED (or DISPUTED -> REFUNDED). Invalid transitions are
rejected at the service layer with descriptive error messages.

### Dispute Resolution
[VERIFY:EM-005] Disputes can be filed against funded or delivered transactions.
Arbiters review disputes and resolve them in favor of either buyer or seller,
triggering appropriate fund movements.

### Automated Payouts
[VERIFY:EM-006] When transactions are released, payouts are automatically
created for the seller. Payout records track processing timestamps and
amounts with Decimal precision.

## Product Roadmap

Phase 1: User registration, transaction creation, and basic escrow flow
Phase 2: Dispute filing and resolution workflow
Phase 3: Webhook notifications for transaction events
Phase 4: Multi-currency support and international transactions

## Success Metrics

- Transaction completion rate above 95%
- Dispute resolution within 48 hours
- Zero unauthorized fund releases
- Webhook delivery success rate above 99%

## Cross-References

- See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for technical stack
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for escrow security model
- See [DATA_MODEL.md](./DATA_MODEL.md) for entity relationships
