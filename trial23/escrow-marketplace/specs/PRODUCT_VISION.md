# Product Vision — Escrow Marketplace

## Overview
The Escrow Marketplace is a multi-tenant platform enabling secure peer-to-peer
transactions between buyers and sellers. Funds are held in escrow until delivery
is confirmed, protecting both parties from fraud.

## Problem Statement
Online peer-to-peer commerce suffers from trust deficits. Buyers risk paying for
goods never delivered; sellers risk chargebacks after shipping. Traditional payment
processors offer limited recourse, and existing escrow services charge prohibitive
fees or lack developer-friendly APIs.

## Solution
A programmable escrow platform with:
- Automated state machine-driven transaction lifecycle
- Built-in dispute resolution workflows
- Webhook-based event notifications for integrators
- Role-based access (BUYER, SELLER) with no administrative superuser role

<!-- VERIFY:PV-001: Platform supports exactly two roles: BUYER and SELLER -->
<!-- VERIFY:PV-002: Transaction lifecycle follows state machine pattern -->
<!-- VERIFY:PV-003: Webhook notifications are available for transaction events -->
<!-- VERIFY:PV-004: Dispute resolution workflow exists -->
<!-- VERIFY:PV-005: Monetary amounts use Decimal(12,2) precision -->

## User Personas

### Buyer (Alice)
Alice wants to purchase high-value items from unknown sellers online. She needs
assurance that her payment is protected until she confirms receipt of the item.
She expects a clear transaction timeline and the ability to raise disputes if
the item does not match the description.

### Seller (Bob)
Bob sells collectibles online and needs protection against fraudulent chargeback
claims. He wants guaranteed payment release once delivery is confirmed, and a
fair dispute process if buyers raise concerns.

## Success Metrics
- Transaction completion rate > 95%
- Dispute resolution time < 48 hours median
- Platform uptime > 99.9%
- Zero unauthorized fund releases

## Core Capabilities
1. **User Registration & Authentication** — JWT-based auth with bcrypt password
   hashing (salt factor 12). No ADMIN role registration permitted.
2. **Transaction Management** — Full lifecycle from creation through funding,
   shipping, delivery confirmation, and completion.
3. **Dispute Handling** — Buyers or sellers can open disputes on funded/shipped/
   delivered transactions. Disputes freeze the transaction until resolved.
4. **Payout Processing** — Automated payout lifecycle for completed transactions
   with state tracking (PENDING → PROCESSING → COMPLETED/FAILED).
5. **Webhook Integration** — Event-driven notifications for external system
   integration.

## Non-Goals
- Payment gateway integration (mock/simulated in this version)
- Multi-currency support (single currency assumed)
- Real-time chat between buyer and seller
- Administrative dashboard or ADMIN role

## Technical Constraints
- PostgreSQL 16 with row-level security
- All monetary fields stored as Decimal(12,2)
- JWT tokens for stateless authentication
- Fail-fast configuration (no fallback for required env vars)

## Related Specifications
- See [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) for component topology
- See [DATA_MODEL.md](DATA_MODEL.md) for entity definitions
- See [SECURITY_MODEL.md](SECURITY_MODEL.md) for auth and authorization details
- See [API_CONTRACT.md](API_CONTRACT.md) for endpoint definitions
