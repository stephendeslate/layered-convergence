# Product Vision Document (PVD)
# Marketplace Payment Hold & Conditional Release Platform

**Version:** 1.0
**Date:** 2026-03-20
**Status:** Approved

---

## 1. Problem Statement

### 1.1 The Trust Gap in Marketplace Payments

Two-sided marketplaces face a fundamental trust challenge: buyers want assurance
that they will receive the service they paid for, while providers want certainty
that they will be compensated for their work. Without a trusted intermediary
mechanism, both parties bear significant risk:

- **Buyers** risk paying upfront for services that may never be delivered or may
  not meet expectations. Chargebacks are costly and adversarial.
- **Providers** risk performing work without guaranteed compensation. Late
  payments and payment disputes erode provider trust.
- **Platform operators** lose transaction volume when either side perceives too
  much risk to transact.

### 1.2 Current Solutions and Their Limitations

| Solution | Limitation |
|----------|-----------|
| Direct payment (Venmo, Zelle) | No buyer protection; no recourse |
| Invoice-based (Bill.com) | Delayed payment; provider bears all risk |
| Full prepayment | Buyer bears all risk; high chargeback rate |
| Custom escrow | Requires money transmission licenses; legal complexity |
| PayPal Buyer Protection | Limited to goods; poor service marketplace fit |

### 1.3 Market Opportunity

The global online marketplace market exceeds $3.5 trillion in GMV. Service
marketplaces (freelancing, home services, tutoring, consulting) represent a
$500B+ segment where payment trust remains the primary barrier to transaction
completion.

---

## 2. Target Users

### 2.1 Primary Personas

#### Marketplace Operator (Platform Admin)
- **Role:** Owns and operates a two-sided marketplace
- **Goal:** Maximize transaction volume by reducing payment friction
- **Pain points:** High chargeback rates, provider churn due to payment
  uncertainty, regulatory complexity around handling funds
- **Needs:** Turnkey payment hold system, dispute resolution tools, analytics
  on transaction health

#### Buyer (Service Consumer)
- **Role:** Purchases services through the marketplace
- **Goal:** Pay with confidence that funds are protected until delivery
- **Pain points:** Fear of paying for undelivered services, opaque refund
  processes, lack of visibility into payment status
- **Needs:** Clear payment timeline, easy dispute process, transparent hold
  status

#### Provider (Service Seller)
- **Role:** Offers services through the marketplace
- **Goal:** Receive reliable, timely payment for completed work
- **Pain points:** Late payments, unjustified disputes, complex onboarding to
  receive payments, unclear payout schedules
- **Needs:** Quick onboarding, predictable payout timing, evidence submission
  for disputes, earnings dashboard

### 2.2 Secondary Personas

#### Compliance Officer
- Reviews platform operations for regulatory compliance
- Needs audit trails, transaction history, policy documentation

#### Customer Support Agent
- Handles escalated disputes and payment issues
- Needs dispute management interface, transaction timeline view

---

## 3. Value Proposition

### 3.1 Core Value

**Conditional payment release** — funds are charged to the buyer and held by the
platform (via Stripe) until predefined conditions are met (service delivery
confirmation, time-based auto-release, or dispute resolution). This eliminates
the trust gap without requiring money transmission licenses.

### 3.2 Key Differentiators

1. **No money transmission licensing required** — Stripe Connect handles all
   regulated payment operations. The platform never touches funds directly.

2. **Configurable hold periods** — Auto-release timers prevent indefinite fund
   holds while giving buyers time to verify delivery.

3. **Built-in dispute resolution** — Evidence-based workflow with admin review
   replaces adversarial chargeback processes.

4. **Transparent transaction timeline** — Both parties see real-time status of
   every payment through its lifecycle.

5. **Provider-friendly onboarding** — Stripe Express accounts minimize
   onboarding friction for providers.

### 3.3 Value by Stakeholder

| Stakeholder | Value Delivered |
|-------------|----------------|
| Buyer | Payment protection, transparent status, easy disputes |
| Provider | Guaranteed payment for completed work, fast onboarding |
| Platform | Higher GMV, lower chargebacks, regulatory compliance |

---

## 4. Competitive Analysis

### 4.1 Direct Competitors

| Platform | Approach | Strengths | Weaknesses |
|----------|----------|-----------|------------|
| Stripe Connect (raw) | Payment infrastructure | Flexible, well-documented | No hold/release logic; build from scratch |
| Payoneer Escrow | Licensed escrow | Full escrow service | Expensive, slow integration, US-focused |
| Trustap | P2P payment protection | Consumer-focused | Limited API, not for platform integration |
| Mangopay | Marketplace payments | EU-focused, good compliance | Complex pricing, limited US presence |

### 4.2 Indirect Competitors

| Platform | Approach | Why We Differ |
|----------|----------|---------------|
| Upwork | Built-in escrow | Closed ecosystem; can't embed in other marketplaces |
| Fiverr | Order-based payment | Proprietary; tied to Fiverr marketplace |
| Deel | Contractor payments | Focus on employment, not marketplace transactions |

### 4.3 Our Position

We occupy the space between "raw Stripe Connect" (too low-level) and "full
escrow service" (too expensive/complex). Our platform provides the payment hold
and conditional release logic that marketplace operators need, built on Stripe
Connect for regulatory compliance, with dispute resolution and analytics
included.

---

## 5. Product Principles

1. **Transparency over opacity** — Both parties should always know exactly
   where their money is and what happens next.

2. **Compliance by architecture** — Regulatory compliance is achieved through
   architectural choices (Stripe Connect), not through licensing.

3. **Provider experience matters** — Provider onboarding and payout experience
   directly impacts marketplace supply. Optimize for providers.

4. **Disputes are features, not bugs** — A well-designed dispute process builds
   trust. Make it easy, fair, and transparent.

5. **Demo-first development** — This is a demonstration platform. Every feature
   should be visually demonstrable with test data.

---

## 6. Success Metrics

| Metric | Target | Rationale |
|--------|--------|-----------|
| Transaction completion rate | >95% | Measures trust effectiveness |
| Dispute rate | <3% | Low disputes = good buyer/provider matching |
| Dispute resolution time | <48h | Fast resolution builds platform trust |
| Provider onboarding completion | >80% | Measures onboarding friction |
| Auto-release trigger rate | <10% | Most transactions should resolve before timer |
| Platform fee revenue | Tracked | Core business metric |

---

## 7. Scope Boundaries

### In Scope
- Payment hold and conditional release via Stripe Connect
- Transaction state machine (created → held → released/disputed/refunded/expired)
- Provider onboarding via Stripe Express accounts
- Dispute resolution with evidence submission
- Auto-release timer (BullMQ delayed jobs)
- Transaction analytics dashboard
- Buyer and provider portals
- Admin dispute management

### Out of Scope (v1)
- Multi-currency support (USD only for demo)
- Partial releases / milestone payments
- Real-time chat between buyer and provider
- Mobile applications
- Live mode Stripe integration (test mode only)
- Subscription/recurring payments
- Tax reporting (1099-K)

---

## 8. Technical Vision

The platform is built as a **Turborepo monorepo** with clear separation:

- **Backend (NestJS 11):** Handles all payment logic, state management, and
  Stripe integration. PostgreSQL with Row-Level Security for data isolation.
- **Frontend (Next.js 15):** Buyer, provider, and admin portals with real-time
  transaction status updates.
- **Shared packages:** Transaction state machine definition (single source of
  truth), shared types, and configuration.
- **Infrastructure:** BullMQ + Redis for async job processing (webhooks,
  auto-release timers, notifications).

### Key Architectural Decisions
- Stripe Connect with separate charges and transfers (not destination charges)
  for maximum control over hold timing
- PostgreSQL RLS for tenant data isolation (no application-level filtering bugs)
- State machine defined once in shared package, consumed by both API and frontend
- Webhook idempotency via WebhookLog deduplication
- All financial amounts stored as integers (cents) to avoid floating-point errors

---

## 9. Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| Stripe API changes | High | Low | Pin Stripe SDK version; abstract behind service layer |
| Dispute abuse | Medium | Medium | Rate limit disputes; require evidence; admin review |
| Auto-release timer failure | High | Low | BullMQ retry logic; manual release fallback |
| Data isolation breach | Critical | Low | PostgreSQL RLS + integration tests for isolation |
| Demo mistaken for production | High | Medium | Prominent demo banner on all pages |

---

## 10. Demo Strategy

- **Hero flow:** Provider onboarding → Buyer creates payment → Funds held →
  Delivery confirmed → Funds released → Provider payout
- **Dispute demo:** Buyer raises dispute → Evidence submitted → Admin resolves
- **Analytics demo:** Transaction volume chart, fee revenue, dispute rate gauge
- **Test cards:** Stripe test cards for success and dispute scenarios

**Demo banner on all pages:** "Demo application — no real funds are processed."
