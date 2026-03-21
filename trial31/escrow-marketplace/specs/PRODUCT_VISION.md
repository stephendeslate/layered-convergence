# Product Vision — Escrow Marketplace

## Overview
Escrow Marketplace is a secure escrow payment platform enabling buyers and sellers
to conduct transactions with built-in dispute resolution. Built on NestJS and
Next.js with PostgreSQL.

See also: [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md), [DATA_MODEL.md](DATA_MODEL.md)

## Core Entities

### User
<!-- VERIFY:EM-ROLES -->
Users have one of four roles:
- BUYER — initiates transactions and funds escrow
- SELLER — receives funds upon successful delivery
- ARBITER — mediates disputes between parties
- ADMIN — full administrative access (excluded from self-registration)

### Transaction
<!-- VERIFY:EM-TRANSACTION-FSM -->
Escrow transaction entity with state machine:
PENDING -> FUNDED -> RELEASED | DISPUTED | REFUNDED
Transitions are validated server-side. Invalid transitions are rejected.

### Dispute
<!-- VERIFY:EM-DISPUTE-FSM -->
Dispute resolution entity with states:
OPEN -> UNDER_REVIEW -> RESOLVED | ESCALATED
Escalated disputes receive priority arbiter attention.

### Payout
<!-- VERIFY:EM-PAYOUT-ENTITY -->
Tracks fund disbursement after transaction release, including platform fees.
Methods include bank_transfer and platform_fee.

### Webhook
<!-- VERIFY:EM-WEBHOOK-ENTITY -->
Event notification system for external integrations.
Supports transaction.status_changed and dispute.created events.

## Technology Stack
<!-- VERIFY:EM-TECH-STACK -->
- Backend: NestJS ^11.0.0 with Prisma ^6.0.0
- Frontend: Next.js ^15.0.0 with React ^19.0.0
- Database: PostgreSQL 16 with Row Level Security
- Auth: JWT with bcrypt password hashing

## Target Users
- Freelancers and clients conducting project-based work
- E-commerce platforms needing escrow payment integration
- Arbiters providing neutral dispute resolution services
- Platform administrators managing the marketplace

## Key Differentiators
- Full escrow lifecycle management with state machine enforcement
- Built-in dispute resolution with arbiter assignment
- Webhook integration for real-time event notifications
- Multi-currency support with Decimal precision
