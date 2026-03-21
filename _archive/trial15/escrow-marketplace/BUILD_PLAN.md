# Marketplace Escrow & Payment Platform — Build Plan

## Verified Score: 9.35
| CD | DI | TS | VI | SY | BF |
|----|----|----|----|----|-----|
| 9  | 9  | 10 | 8  | 9  | 9   |

## Overview
A two-sided marketplace payment platform with conditional payment release (escrow-style). Buyers pay into a hold, funds are retained until service delivery is confirmed, then released to providers minus platform fees. Includes dispute resolution, multi-provider support, and transaction analytics.

## Legal Caveats
- Use "payment hold" / "conditional release" terminology — NOT "escrow" (precise legal definition)
- Stripe Connect handles all money transmission licensing (FinCEN ruling FIN-2014-R004)
- Test-mode only for demo — never enable live mode
- Add banner: "Demo application — no real funds are processed"
- Including a compliance architecture section INCREASES credibility with fintech clients

## Tech Stack
- **Backend:** NestJS 11 + Prisma 6 + PostgreSQL 16 (RLS)
- **Frontend:** Next.js 15 App Router + shadcn/ui + Tailwind CSS 4
- **Payments:** Stripe Connect (separate charges and transfers + manual payouts)
- **Queue:** BullMQ + Redis (webhook processing, payout scheduling)
- **Testing:** Vitest
- **Deployment:** Vercel (frontend) + Railway (API + PostgreSQL + Redis)

## Architecture

### Payment Flow (Core)
```
Buyer → Create Payment Intent → Charge via Stripe
  → Funds held (transfer delayed, up to 90 days)
  → Service delivered → Provider confirms OR Buyer confirms
  → Platform creates Transfer to Connected Account (minus fee)
  → Provider receives payout
```

### Dispute Flow
```
Buyer raises dispute → Platform reviews evidence
  → Resolve in buyer's favor → Refund initiated
  → Resolve in provider's favor → Transfer released
  → Escalate → Stripe dispute process
```

### Data Model (Key Entities)
- `User` (buyer or provider role)
- `Transaction` (amount, currency, status, holdUntil, platformFee)
- `TransactionStateHistory` (fromState, toState, reason, timestamp)
- `Dispute` (transactionId, raisedBy, evidence, resolution)
- `StripeConnectedAccount` (providerId, accountId, onboardingStatus)
- `Payout` (providerId, amount, stripeTransferId, status)
- `WebhookLog` (provider, eventType, payload, processedAt, idempotencyKey)

## SavSpot Module Reuse Map

| SavSpot Module | Reuse | Adaptation Needed |
|----------------|-------|-------------------|
| `payments/` | Direct | Refactor from booking context to marketplace context |
| `payments/stripe-connect.service.ts` | Direct | Connected account onboarding for providers |
| `payments/stripe-webhook.controller.ts` | Direct | Add transfer/payout webhook handlers |
| `invoices/` | Direct | Transaction receipts for buyers |
| `jobs/generate-invoice-pdf.processor.ts` | Direct | Receipt PDF generation |
| `common/guards/` | Direct | Auth, throttle, CSRF guards |
| `auth/` | Adapt | Simplify to buyer/provider roles (no tenant hierarchy) |
| `notifications/` | Direct | Email/push for payment events |
| `communications/` | Direct | Transactional emails (payment received, funds released) |
| `audit/` | Direct | Transaction audit trail |

### New Code Required
- **Transaction state machine** — hold → released / disputed / refunded / expired
- **Escrow timer service** — auto-release after configurable hold period
- **Dispute resolution workflow** — evidence submission, admin review, resolution
- **Provider onboarding flow** — Stripe Connect Express onboarding
- **Marketplace dashboard** — transaction volume, fees collected, dispute rate
- **Buyer/provider portals** — transaction history, payout tracking

## 2-Week Sprint Plan

### Week 1: Core Payment Infrastructure
| Day | Task | Hours |
|-----|------|-------|
| 1 | Project scaffold (Turborepo, NestJS, Next.js, Prisma schema) | 6 |
| 1 | Prisma models: User, Transaction, Dispute, ConnectedAccount, Payout | 2 |
| 2 | Stripe Connect provider onboarding (Express accounts) | 6 |
| 2 | Provider dashboard — onboarding status, account details | 2 |
| 3 | Payment intent creation with delayed transfer | 4 |
| 3 | Transaction state machine (hold → release/dispute/refund/expire) | 4 |
| 4 | Webhook controller — payment_intent.succeeded, transfer.created, payout.paid | 6 |
| 4 | WebhookLog with idempotency | 2 |
| 5 | Auto-release timer (BullMQ delayed job) | 4 |
| 5 | Manual release endpoint (buyer confirms delivery) | 2 |
| 5 | Transaction state history logging | 2 |

### Week 2: Disputes, UI, Analytics
| Day | Task | Hours |
|-----|------|-------|
| 6 | Dispute creation, evidence upload, admin resolution endpoints | 6 |
| 6 | Dispute webhook handlers (charge.dispute.created/closed) | 2 |
| 7 | Buyer portal — create payment, view transactions, raise dispute | 8 |
| 8 | Provider portal — view incoming payments, payout history, onboarding | 8 |
| 9 | Admin dashboard — transaction analytics (volume, fees, disputes) | 4 |
| 9 | Transaction timeline visualization | 4 |
| 10 | Seed data (10 providers, 50 transactions in various states) | 3 |
| 10 | Demo banner, disclaimer, README, deploy to Vercel + Railway | 5 |

## Demo Strategy
- **Hero screenshot:** Transaction timeline showing payment hold → delivery confirmed → funds released
- **Key flows to demo:** Provider onboarding → Buyer payment → Hold period → Release → Provider payout
- **Dispute demo:** Show evidence submission and admin resolution
- **Analytics:** Transaction volume chart, platform fee revenue, dispute rate gauge
- **Stripe test cards:** Use `4242...` for success, `4000000000000259` for disputes

## Key Dependencies
```json
{
  "stripe": "^20.x",
  "@nestjs/bullmq": "^11.x",
  "bullmq": "^5.x",
  "@prisma/client": "^6.x",
  "recharts": "^3.x",
  "@radix-ui/react-*": "latest",
  "date-fns": "^4.x"
}
```

## Risk Mitigation
| Risk | Mitigation |
|------|------------|
| Stripe Connect onboarding complexity | Use Express accounts (Stripe-hosted onboarding); target US test country |
| Webhook reliability | Idempotency keys + WebhookLog dedup |
| State machine bugs | Exhaustive Vitest coverage of all transitions (budget 4h+ across sprint) |
| Demo data realism | Seed with varied transaction states and amounts |
| Dispute evidence file storage | Use Stripe's File Upload API for evidence attachments (avoids separate S3/R2 setup) |
| CORS configuration | Vercel frontend → Railway API requires explicit CORS setup |
| Environment variable management | Document all required env vars (Stripe keys, webhook secrets, DB/Redis URLs) as Day 1 checklist |
| Railway cold starts | Add keep-alive endpoint or use paid tier to avoid webhook delivery delays |
| Timeline buffer | Days 7-8 (buyer/provider portals) are tight — aim for functional MVP, polish later; budget 11-12 days total |
| Zero testing budget | Allocate explicit test-writing time within sprint (state machine transitions are critical path) |
