# Product Vision — Escrow Marketplace

## Overview

Escrow Marketplace is a secure transaction platform enabling buyers and sellers to conduct commerce with escrow protection. Funds are held securely until both parties confirm satisfaction, with dispute resolution and automated payout processing.

## Target Users

- **Buyers** — Purchase goods/services with escrow protection
- **Sellers** — Receive payments after successful delivery confirmation
- **Administrators** — Manage platform, resolve escalated disputes, oversee payouts

## Value Proposition

The platform eliminates transaction risk by holding funds in escrow until delivery is confirmed. Built-in dispute resolution handles disagreements, and webhook notifications keep all parties informed of status changes.

## Core Entities

The platform manages 5 core entities: User, Transaction, Dispute, Payout, and Webhook. Each entity follows strict state machine transitions for auditability.

See [DATA_MODEL.md](./DATA_MODEL.md) for entity definitions and [SECURITY_MODEL.md](./SECURITY_MODEL.md) for access control policies.

## Success Metrics

[VERIFY:PV-001] The platform supports 3 user roles: ADMIN, BUYER, SELLER with role-based access control.
> Implementation: `backend/prisma/schema.prisma` (Role enum)

[VERIFY:PV-002] The landing page communicates the three core capabilities: escrow transactions, dispute resolution, and payouts.
> Implementation: `frontend/app/page.tsx`

[VERIFY:PV-003] Secure escrow platform with webhook notifications.
> Implementation: `frontend/app/page.tsx`

## Feature Priorities

1. **Escrow Transactions** — Full lifecycle from creation to completion/refund
2. **Dispute Resolution** — Structured workflow for handling disagreements (see [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md))
3. **Payout Processing** — Automated payout creation and status tracking
4. **Webhook Integration** — Real-time notifications for all status changes
5. **Transaction History** — Complete audit trail of all escrow activities

## Cross-References

- See [API_CONTRACT.md](./API_CONTRACT.md) for endpoint definitions
- See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for quality assurance approach
- See [UI_SPECIFICATION.md](./UI_SPECIFICATION.md) for page inventory
