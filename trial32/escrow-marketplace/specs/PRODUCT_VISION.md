# Product Vision — Escrow Marketplace

## Overview

Escrow Marketplace is a multi-tenant platform for managing secure escrow-based transactions
between buyers and sellers. It provides automated escrow flow management, dispute resolution,
and payout processing with webhook notifications.

See also: [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md), [DATA_MODEL.md](DATA_MODEL.md)

## Business Goals

1. Provide a secure platform where buyers and sellers can transact with confidence
2. Automate the escrow lifecycle from funding through release or refund
3. Enable fair dispute resolution through an arbiter workflow
4. Deliver real-time event notifications via webhooks
5. Ensure complete tenant isolation for multi-tenant deployments

## Core Capabilities

### Escrow Transactions
- Buyers create transactions with a specified amount and currency
- Transactions follow a strict state machine from PENDING through FUNDED to RELEASED or REFUNDED
- [VERIFY:EM-PV-001] Transaction belongs to one Tenant for data isolation -> Implementation: apps/api/prisma/schema.prisma:62
- [VERIFY:EM-PV-002] Dispute state machine enforces valid transitions -> Implementation: apps/api/src/dispute/dispute.service.ts:3
- [VERIFY:EM-PV-003] Transaction state machine enforces valid transitions only -> Implementation: apps/api/src/transaction/transaction.service.ts:3

### Dispute Resolution
- Buyers can file disputes against funded transactions
- Disputes progress through OPEN -> UNDER_REVIEW -> RESOLVED | ESCALATED
- Arbiters review and resolve disputes with written resolutions

### Payouts
- Released transactions trigger payout creation for the seller
- Payouts track processing status with timestamps

### Webhooks
- Tenants configure webhook URLs to receive event notifications
- Events include transaction state changes and dispute actions
- [VERIFY:EM-PV-004] Webhook configuration scoped to Tenant -> Implementation: apps/api/prisma/schema.prisma:110

## User Types

### Buyer
- Creates escrow transactions
- Funds transactions and files disputes
- [VERIFY:EM-PV-005] BUYER role assigned at registration -> Implementation: apps/api/src/auth/auth.service.ts:8

### Seller
- Receives payments from released transactions
- Delivers goods/services during escrow period

### Arbiter
- Reviews and resolves disputes
- Makes binding decisions on disputed transactions
- [VERIFY:EM-PV-006] ARBITER role available at registration -> Implementation: apps/api/src/auth/auth.service.ts:8

## Non-Functional Requirements

- All user passwords hashed with bcrypt (salt rounds: 12)
- JWT-based authentication with no hardcoded secret fallbacks
- Row-Level Security enforced at database level for tenant isolation
- [VERIFY:EM-PV-007] ADMIN role rejected at registration -> Implementation: apps/api/src/auth/auth.service.ts:8
