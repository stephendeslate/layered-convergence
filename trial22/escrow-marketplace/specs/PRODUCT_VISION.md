# Product Vision — Escrow Marketplace

## Purpose

The Escrow Marketplace is a platform that enables secure peer-to-peer transactions
between buyers and sellers by holding funds in escrow until both parties confirm
satisfactory completion of a trade. The platform eliminates the trust gap inherent
in online transactions between strangers.

<!-- VERIFY:PV-001 — Platform supports BUYER and SELLER roles -->
<!-- VERIFY:PV-002 — Transaction state machine enforces escrow lifecycle -->
<!-- VERIFY:PV-003 — Dispute resolution flow exists for contested transactions -->

## Problem Statement

Online marketplaces suffer from a fundamental trust problem: buyers fear paying
for goods they may never receive, while sellers fear shipping goods without
guaranteed payment. Traditional solutions rely on platform reputation systems
that are easily gamed, or payment reversals (chargebacks) that penalize sellers.

The Escrow Marketplace solves this by implementing a trustless escrow mechanism
where funds are held by the platform until delivery is confirmed, with a
structured dispute resolution process for contested transactions.

## Target Users

- **Buyers**: Individuals purchasing goods or services who want payment protection.
  They fund transactions and confirm delivery before funds are released.
- **Sellers**: Individuals or small businesses offering goods or services who want
  guaranteed payment. They ship goods knowing funds are secured in escrow.

There is no administrative role in the system. Platform operations are handled
through backend processes and database-level security policies.

## Core Value Propositions

1. **Payment Security**: Funds are held in escrow (Decimal(12,2) precision) until
   delivery confirmation, protecting both parties from fraud.
   See: [DATA_MODEL.md](DATA_MODEL.md) for monetary field specifications.
2. **Structured Dispute Resolution**: When disagreements arise, a formal dispute
   process ensures fair outcomes with evidence submission from both parties.
   See: [API_CONTRACT.md](API_CONTRACT.md) for dispute endpoint specifications.
3. **Transparent State Tracking**: Every transaction moves through a clearly
   defined state machine (PENDING -> FUNDED -> SHIPPED -> DELIVERED -> COMPLETED),
   giving both parties visibility into the transaction lifecycle.
   See: [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) for state machine details.
4. **Webhook Notifications**: Real-time event notifications keep external systems
   and integrations informed of transaction state changes.
   See: [SECURITY_MODEL.md](SECURITY_MODEL.md) for webhook signature verification.

## Transaction Lifecycle

The core escrow flow follows this state machine:

```
PENDING --> FUNDED --> SHIPPED --> DELIVERED --> COMPLETED
              |                      |
              v                      v
           DISPUTE <-----------  DISPUTE
              |
              v
           REFUNDED
```

- **PENDING**: Transaction created by buyer, awaiting funding.
- **FUNDED**: Buyer has deposited funds into escrow.
- **SHIPPED**: Seller has marked the item as shipped.
- **DELIVERED**: Buyer confirms receipt of goods.
- **COMPLETED**: Funds released to seller. Terminal state.
- **DISPUTE**: Either party contests the transaction. See [TESTING_STRATEGY.md](TESTING_STRATEGY.md) for dispute flow test coverage.
- **REFUNDED**: Dispute resolved in buyer's favor. Terminal state.

## Success Metrics

- Transaction completion rate > 95%
- Dispute rate < 5% of total transactions
- Average dispute resolution time < 48 hours
- Zero unauthorized fund releases (enforced by RLS policies,
  see [SECURITY_MODEL.md](SECURITY_MODEL.md))

## Technical Guardrails

- All monetary values use Decimal(12,2) to prevent floating-point errors
- Row-Level Security on all user-scoped tables prevents cross-user data access
- JWT-based authentication with fail-fast secret validation
- See [UI_SPECIFICATION.md](UI_SPECIFICATION.md) for accessibility requirements
- See [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) for infrastructure details

## Non-Goals

- Payment gateway integration (funds are simulated in this version)
- Real-time chat between buyers and sellers
- Multi-currency support (single currency only)
- Mobile native applications (web-only, responsive design)
