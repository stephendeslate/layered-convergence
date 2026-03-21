# Product Vision — Escrow Marketplace

## Overview
Escrow Marketplace is a secure payment platform that holds funds in escrow until
both buyer and seller confirm transaction completion. The platform includes
dispute resolution with assigned arbiters.

## Target Users
- **Buyers** who want protection when purchasing from unknown sellers
- **Sellers** who need guaranteed payment upon delivery
- **Arbiters** who mediate disputes between buyers and sellers
- **Administrators** who manage the platform and user accounts

## Core Value Proposition
Escrow Marketplace eliminates payment fraud by holding funds securely until
both parties confirm satisfaction, with professional dispute resolution.

## Key Capabilities

### Transaction Lifecycle
Transactions follow a strict state machine: PENDING -> FUNDED -> RELEASED or DISPUTED -> REFUNDED.
Funds are only released when the buyer confirms receipt.
<!-- VERIFY:EM-TRANSACTION-FSM — Transaction entity with TransactionStatus enum -->

### Dispute Resolution
Disputes follow: OPEN -> UNDER_REVIEW -> RESOLVED or ESCALATED.
Each dispute is assigned an arbiter who mediates between parties.
<!-- VERIFY:EM-DISPUTE-FSM — Dispute entity with DisputeStatus enum -->

### Payout System
Once a transaction is released, payouts are automatically created for the seller.
All monetary values use Decimal precision for accuracy.
<!-- VERIFY:EM-PAYOUT-MODEL — Payout entity with Decimal amounts -->

### Webhook Notifications
External systems can subscribe to transaction events via configurable webhooks.
<!-- VERIFY:EM-WEBHOOK-MODEL — Webhook entity for event notifications -->

## User Roles
- **BUYER**: Create transactions, fund escrow, confirm receipt
- **SELLER**: View transactions, receive payouts
- **ARBITER**: Review and resolve disputes
- **ADMIN**: Platform management (registration restricted)
<!-- VERIFY:EM-ROLES — UserRole enum with BUYER, SELLER, ARBITER, ADMIN -->

## Technical Foundation
- NestJS backend with Prisma ORM and PostgreSQL
- Next.js frontend with server-side rendering
- JWT authentication with bcrypt password hashing
- Row Level Security for data protection
<!-- VERIFY:EM-TECH-STACK — NestJS + Next.js + PostgreSQL -->

## Success Metrics
- Zero unauthorized fund releases
- Dispute resolution within 72 hours average
- 99.99% uptime for payment processing

## Roadmap
- Phase 1: Core escrow transactions (buy, fund, release)
- Phase 2: Dispute resolution with arbiter assignment
- Phase 3: Automated payouts and webhook integrations
- Phase 4: Multi-currency support and reporting
