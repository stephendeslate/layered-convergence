# Business Requirements Document (BRD) — Escrow Marketplace

**Version:** 1.0 | **Date:** 2026-03-20

---

## 1. Business Objectives

| ID | Objective | Success Criteria |
|----|-----------|-----------------|
| BO-1 | Demonstrate enterprise payment infrastructure | Stripe Connect integration with conditional release |
| BO-2 | Demonstrate financial state machine rigor | All transaction state transitions tested and logged |
| BO-3 | Demonstrate dispute resolution workflow | Evidence submission → admin review → resolution |
| BO-4 | Demonstrate multi-tenant data isolation | RLS policies + application-level WHERE clauses |

## 2. Stakeholder Requirements

### 2.1 Buyer
- **BR-001:** Create payment with amount and description
- **BR-002:** View transaction history with status and timeline
- **BR-003:** Confirm delivery to release funds
- **BR-004:** Raise dispute with evidence
- **BR-005:** View dispute resolution status

### 2.2 Provider
- **BR-006:** Onboard via Stripe Connect (Express accounts)
- **BR-007:** View incoming payments and hold status
- **BR-008:** View payout history and amounts
- **BR-009:** Submit evidence for disputes
- **BR-010:** View onboarding status and account details

### 2.3 Platform Admin
- **BR-011:** View transaction volume and platform fee revenue
- **BR-012:** Resolve disputes (buyer favor, provider favor, escalate)
- **BR-013:** View dispute rate and resolution metrics
- **BR-014:** Monitor webhook processing health

## 3. Business Rules

| ID | Rule |
|----|------|
| BRU-1 | Funds are held until buyer confirms delivery OR hold period expires |
| BRU-2 | Auto-release occurs after configurable hold period (default 14 days) |
| BRU-3 | Platform fee is deducted before transfer to provider |
| BRU-4 | Disputes freeze the auto-release timer |
| BRU-5 | Only valid state transitions are permitted (state machine enforced) |
| BRU-6 | Webhook events are idempotent (WebhookLog with dedup) |
| BRU-7 | All state transitions are logged in TransactionStateHistory |
| BRU-8 | Use "payment hold" / "conditional release" terminology — NOT "escrow" |
| BRU-9 | Demo banner: "Demo application — no real funds are processed" |

## 4. Data Requirements

### 4.1 Core Entities
- User (buyer/provider role), Transaction, TransactionStateHistory
- Dispute, StripeConnectedAccount, Payout, WebhookLog

### 4.2 Transaction States
- CREATED → PAYMENT_PENDING → HELD → RELEASED / DISPUTED / EXPIRED
- DISPUTED → RESOLVED_BUYER / RESOLVED_PROVIDER / ESCALATED
- RELEASED → TRANSFER_PENDING → TRANSFERRED → PAYOUT_PENDING → PAID
- RESOLVED_BUYER → REFUND_PENDING → REFUNDED

## 5. Integration Requirements

| System | Integration Type | Purpose |
|--------|-----------------|---------|
| Stripe Connect | API + Webhooks | Payment processing, transfers, payouts |
| Redis | Cache + Queue | BullMQ for webhook processing and payout scheduling |
| BullMQ | Background processing | Auto-release timer, payout scheduling |

## 6. Compliance & Security

- **[VERIFY:RLS]** — All data tables have RLS policies
- **[VERIFY:WEBHOOK_IDEMPOTENCY]** — Duplicate webhooks are safely ignored
- **[VERIFY:STATE_MACHINE]** — Only valid transitions execute; invalid transitions throw
- **[VERIFY:STRIPE_TEST_MODE]** — No live mode keys in codebase
- **[VERIFY:TENANT_ISOLATION]** — Cross-tenant data access returns 404
