# Product Vision Document (PVD) — Marketplace Escrow & Payment Platform

**Version:** 1.0
**Date:** 2026-03-20
**Project:** Escrow Marketplace (Trial 3)

---

## 1. Vision Statement

Build a two-sided marketplace payment platform with conditional payment release (escrow-style). Buyers pay into a hold, funds are retained until service delivery is confirmed, then released to providers minus platform fees. The platform demonstrates enterprise payment infrastructure with Stripe Connect, dispute resolution, and transaction analytics.

## 2. Problem Statement

Two-sided marketplaces need a trust layer between buyers and service providers. Direct payments leave buyers unprotected; traditional escrow is legally complex. This platform uses Stripe Connect's separate charges and transfers model to implement conditional payment release — funds held until delivery confirmation, with dispute resolution and automatic timeout release.

## 3. Target Users

| User Type | Description | Key Needs |
|-----------|-------------|-----------|
| **Buyer** | Pays for services through the marketplace | Create payments, track hold status, raise disputes, view transaction history |
| **Provider** | Delivers services and receives payouts | Onboard via Stripe Connect, view incoming payments, track payouts |
| **Platform Admin** | Manages marketplace operations | Monitor transactions, resolve disputes, view analytics (volume, fees, dispute rate) |

## 4. Core Value Propositions

1. **Conditional Payment Release** — Funds held until delivery confirmation or timeout
2. **Stripe Connect Integration** — Provider onboarding, separate charges and transfers, managed payouts
3. **Dispute Resolution** — Evidence submission, admin review, buyer/provider resolution
4. **Transaction State Machine** — Complete lifecycle tracking (hold → released / disputed / refunded / expired)
5. **Transaction Analytics** — Volume, fees collected, dispute rate, payout tracking

## 5. Success Metrics

| Metric | Target |
|--------|--------|
| Transaction state transitions | All valid transitions tested |
| Stripe Connect onboarding | Express account flow functional |
| Dispute resolution flow | Evidence → admin review → resolution |
| Webhook idempotency | Duplicate webhooks handled correctly |
| Tenant isolation | Cross-tenant data access returns 404 |
| E2E tests with real DB | No mocked Prisma in E2E tests |

## 6. Scope Boundaries

### In Scope
- Stripe Connect provider onboarding (Express accounts)
- Payment intent creation with delayed transfer
- Transaction state machine with history logging
- Auto-release timer (BullMQ delayed jobs)
- Manual release endpoint (buyer confirms delivery)
- Dispute creation, evidence upload, admin resolution
- Webhook handling with idempotency
- Buyer portal (create payment, view transactions, raise dispute)
- Provider portal (view payments, payout history, onboarding)
- Admin dashboard (transaction analytics)
- Transaction timeline visualization
- Multi-tenant RLS isolation

### Out of Scope
- Live Stripe payments (test mode only)
- File storage for evidence (use Stripe File Upload API)
- Chat/messaging between buyer and provider
- Multi-currency support
- Subscription/recurring payments
- Mobile native apps

## 7. Technical Constraints

- **Payments:** Stripe Connect test mode only — "Demo application" banner required
- **Terminology:** "Payment hold" / "conditional release" — NOT "escrow"
- **Database:** PostgreSQL 16 with RLS policies
- **ORM:** Prisma 6 — `findFirstOrThrow` as default
- **State Machine:** Single source of truth in packages/shared
- **Queue:** BullMQ + Redis for webhook processing and payout scheduling

## 8. Key Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Stripe Connect complexity | HIGH | Express accounts (Stripe-hosted onboarding) |
| Webhook reliability | HIGH | Idempotency keys + WebhookLog dedup |
| State machine bugs | HIGH | Exhaustive test coverage of all transitions |
| Legal terminology | MEDIUM | Use "payment hold" not "escrow" |
| Timeline pressure | MEDIUM | Functional MVP first, polish later |
