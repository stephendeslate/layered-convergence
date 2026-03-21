# Product Vision — Escrow Marketplace

## Overview
Escrow Marketplace is a secure payment platform that enables buyers and sellers
to transact with confidence using escrow-protected payments. See DATA_MODEL.md
for entity definitions and SYSTEM_ARCHITECTURE.md for technical implementation.

## Problem Statement
Online transactions between unknown parties carry inherent trust risks. Buyers
need assurance that goods/services will be delivered, while sellers need
confidence that payment is guaranteed.

## Target Users
- **Buyers** — purchase goods/services with payment protection
- **Sellers** — receive guaranteed payments upon delivery
- **Arbiters** — resolve disputes between buyers and sellers
- **Platform Admins** — manage users and oversee transactions

## Core Capabilities
1. Escrow-protected transactions with state machine lifecycle
2. Multi-currency support with Decimal precision
3. Dispute resolution with arbiter assignment
4. Automatic payout on transaction release
5. Webhook notifications for transaction events
6. Role-based access control

## Entity Overview
<!-- VERIFY:EM-TRANSACTION-FSM — Transaction entity with TransactionStatus enum -->
Transactions follow a state machine: PENDING -> FUNDED -> RELEASED (or DISPUTED -> REFUNDED).

<!-- VERIFY:EM-DISPUTE-FSM — Dispute entity with DisputeStatus enum -->
Disputes follow: OPEN -> UNDER_REVIEW -> RESOLVED (or ESCALATED).

<!-- VERIFY:EM-PAYOUT-MODEL — Payout entity with Decimal amount -->
Payouts record fund releases with precise Decimal amounts.

<!-- VERIFY:EM-WEBHOOK-MODEL — Webhook entity for event notifications -->
Webhooks deliver event notifications for transaction state changes.

<!-- VERIFY:EM-ROLES — UserRole enum with 4 roles -->
Users have roles: BUYER, SELLER, ARBITER, ADMIN.

## Technical Stack
<!-- VERIFY:EM-TECH-STACK — NestJS + Next.js + PostgreSQL -->
- Backend: NestJS ^11.0.0 with Prisma ^6.0.0
- Frontend: Next.js ^15.0.0 with Tailwind CSS
- Database: PostgreSQL 16 with RLS

## Security Requirements
Security controls are described in SECURITY_MODEL.md. API endpoints are
detailed in API_CONTRACT.md. All authentication uses JWT with bcrypt hashing.

## Success Metrics
- Zero unauthorized fund releases
- Sub-second transaction status updates
- 99.9% webhook delivery rate
- WCAG 2.1 AA compliance for all UI components
