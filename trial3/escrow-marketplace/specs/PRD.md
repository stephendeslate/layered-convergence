# Product Requirements Document (PRD) — Escrow Marketplace

**Version:** 1.0 | **Date:** 2026-03-20

---

## 1. Feature Requirements

### F1: Stripe Connect Provider Onboarding
- **F1.1:** Express account creation for providers
- **F1.2:** Onboarding redirect flow (Stripe-hosted)
- **F1.3:** Account status tracking (pending, active, restricted)
- **F1.4:** Webhook handling for account.updated events

### F2: Payment & Hold
- **F2.1:** Payment intent creation with amount, currency, description
- **F2.2:** Delayed transfer (funds held, not immediately transferred)
- **F2.3:** Platform fee calculation and deduction
- **F2.4:** Hold period configuration (default 14 days)

### F3: Transaction State Machine
- **F3.1:** States: CREATED, PAYMENT_PENDING, HELD, RELEASED, DISPUTED, EXPIRED, REFUNDED, TRANSFERRED, PAID
- **F3.2:** Valid transition enforcement (invalid transitions throw)
- **F3.3:** State history logging with timestamp, from/to, reason
- **F3.4:** Single source of truth definition in packages/shared

### F4: Release & Payout
- **F4.1:** Manual release (buyer confirms delivery)
- **F4.2:** Auto-release after hold period (BullMQ delayed job)
- **F4.3:** Transfer creation to connected account (minus platform fee)
- **F4.4:** Payout tracking

### F5: Dispute Resolution
- **F5.1:** Buyer raises dispute with reason
- **F5.2:** Evidence submission (text description)
- **F5.3:** Admin reviews and resolves (buyer favor, provider favor, escalate)
- **F5.4:** Resolution updates transaction state
- **F5.5:** Dispute freezes auto-release timer

### F6: Webhook Processing
- **F6.1:** payment_intent.succeeded handler
- **F6.2:** transfer.created handler
- **F6.3:** payout.paid handler
- **F6.4:** charge.dispute.created/closed handlers
- **F6.5:** WebhookLog with idempotency key dedup

### F7: Portals & UI
- **F7.1:** Buyer portal — create payment, view transactions, raise dispute
- **F7.2:** Provider portal — view payments, payout history, onboarding status
- **F7.3:** Admin dashboard — transaction analytics (volume, fees, dispute rate)
- **F7.4:** Transaction timeline visualization

## 2. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-1 | Webhook processing latency | < 5 seconds |
| NFR-2 | State transition reliability | Zero invalid transitions in production |
| NFR-3 | Idempotency | Duplicate webhooks safely ignored |
| NFR-4 | Data isolation | RLS + application-level tenant scoping |

## 3. Acceptance Criteria

- All valid state transitions work correctly
- Invalid transitions throw appropriate errors
- Stripe Connect Express onboarding flow completes
- Auto-release timer fires after configured hold period
- Dispute freezes auto-release
- Webhook idempotency prevents duplicate processing
- Cross-tenant data access returns 404
- `findFirstOrThrow` used for all tenant-scoped lookups
- E2E tests use real PostgreSQL
- `fileParallelism: false` in E2E vitest config
- State machine defined once in packages/shared
