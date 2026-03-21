# Product Vision — Escrow Marketplace

## Overview

The Escrow Marketplace is a multi-tenant platform enabling secure buyer-seller transactions
through an escrow model. Funds are held in escrow until the buyer confirms delivery,
protecting both parties from fraud. The platform supports dispute resolution and automated
seller payouts.

**Cross-references:** [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md), [SECURITY_MODEL.md](SECURITY_MODEL.md), [UI_SPECIFICATION.md](UI_SPECIFICATION.md)

## Target Users

The platform serves two primary user personas:

1. **Buyers** — individuals or businesses purchasing goods/services who want payment protection
2. **Sellers** — merchants or freelancers offering goods/services who want guaranteed payment

There is no public ADMIN registration; administrative access is managed separately.

## Value Proposition

[VERIFY:PV-001] The landing page MUST communicate the core value proposition: secure escrow, dispute resolution, and fast payouts.
> Implementation: `frontend/app/page.tsx:1`

[VERIFY:PV-002] The platform MUST serve two distinct user personas (buyers and sellers) with role-appropriate interfaces.
> Implementation: `frontend/app/page.tsx:2`

## Core Transaction Flow

The fundamental user journey follows the escrow lifecycle:

1. Buyer creates a transaction specifying seller and amount
2. Buyer funds the transaction (money held in escrow)
3. Seller ships the goods/services
4. Buyer confirms delivery
5. Transaction completes and seller can request payout

[VERIFY:PV-003] The core escrow flow MUST follow the state machine: PENDING -> FUNDED -> SHIPPED -> DELIVERED -> COMPLETED.
> Implementation: `backend/src/transaction/transaction.service.ts:15`

## Payout Model

Sellers receive payouts only after successful transaction completion. The payout lifecycle
tracks processing status to ensure transparency.

[VERIFY:PV-004] The seller payout lifecycle MUST ensure funds are only released after transaction completion.
> Implementation: `backend/src/payout/payout.service.ts:10`

## Success Metrics

- Transaction completion rate > 95%
- Dispute resolution time < 48 hours
- Payout processing time < 24 hours
- Zero unauthorized fund releases

## Market Context

The escrow model addresses trust gaps in online marketplaces where buyers and sellers
do not know each other. By holding funds in escrow and providing dispute resolution,
the platform reduces fraud risk for both parties.

## Technical Constraints

- Multi-tenant architecture with row-level security
- All monetary values stored as Decimal(12,2) for precision
- JWT-based authentication with bcrypt password hashing
- Real-time webhook notifications for transaction events
