# Product Vision Document (PVD)

## Escrow Marketplace — Conditional Payment Platform

| Field            | Value                          |
|------------------|--------------------------------|
| Version          | 1.0                            |
| Date             | 2026-03-20                     |
| Status           | Draft                          |
| Owner            | Platform Engineering           |
| Classification   | Internal                       |

> **Legal Notice:** This platform uses "payment hold" and "conditional release"
> terminology. Stripe Connect handles all money transmission. This is a demo
> application — no real funds are processed.

---

## 1. Problem Statement

### 1.1 Market Context

The freelance and gig economy has grown to over $1.5 trillion globally, yet
payment disputes remain the single largest source of friction between service
buyers and providers. Existing solutions force participants to choose between
trust and protection:

- **Buyers** risk paying for services never delivered or delivered below
  specification. Chargebacks are slow, adversarial, and damage relationships.
- **Providers** risk completing work only to face non-payment, delayed payment,
  or bad-faith disputes that freeze their earnings for weeks.
- **Platforms** struggle to build trust without becoming regulated money
  transmitters, limiting their ability to intermediate payments.

### 1.2 Core Problem

There is no lightweight, embeddable payment protection layer that:

1. Holds buyer funds in a verifiable state until delivery conditions are met
2. Guarantees providers receive payment upon confirmed delivery
3. Provides structured dispute resolution without requiring platform-level
   money transmission licenses
4. Offers full transparency into payment state for all parties

### 1.3 Opportunity

By leveraging Stripe Connect's infrastructure, a platform can offer conditional
payment release without taking on money transmission liability. The platform
acts as a facilitator — Stripe handles fund custody, compliance, and payout
mechanics. This dramatically reduces regulatory burden while delivering the
trust layer both sides need.

---

## 2. Vision Statement

**Build a two-sided marketplace payment platform that eliminates payment risk
for both buyers and providers through conditional payment holds, automated
release triggers, and structured dispute resolution — all powered by Stripe
Connect to avoid money transmission liability.**

### 2.1 Design Principles

| Principle                  | Description                                                |
|----------------------------|------------------------------------------------------------|
| **Transparency First**     | Every payment state change is visible to all parties       |
| **Automated by Default**   | Funds release automatically unless disputed                |
| **Fair Dispute Resolution** | Structured evidence collection, time-bound admin review   |
| **Regulatory Compliance**  | Stripe Connect handles all fund custody and transmission   |
| **Audit Everything**       | Full state history for every transaction, no silent changes|

---

## 3. Target Personas

### 3.1 Buyer (Service Purchaser)

| Attribute        | Detail                                                       |
|------------------|--------------------------------------------------------------|
| **Who**          | Individual or business purchasing services on the platform   |
| **Goal**         | Pay for services with confidence that funds are protected    |
| **Pain Points**  | Fear of non-delivery, slow chargeback processes, no visibility into payment state |
| **Key Need**     | Funds held until delivery is confirmed; easy dispute process |
| **Behavior**     | Creates payment holds, confirms delivery, raises disputes    |

**Buyer Journey:**
1. Browse providers and select a service
2. Create a payment hold for the agreed amount
3. Monitor transaction status in real time
4. Confirm delivery when satisfied OR raise a dispute
5. View transaction history and analytics

### 3.2 Provider (Service Deliverer)

| Attribute        | Detail                                                       |
|------------------|--------------------------------------------------------------|
| **Who**          | Freelancer, contractor, or business delivering services      |
| **Goal**         | Guaranteed payment for completed work, fast payouts          |
| **Pain Points**  | Non-payment after delivery, payment delays, onboarding friction |
| **Key Need**     | Visible payment hold guaranteeing funds exist; timely payout |
| **Behavior**     | Completes Stripe onboarding, marks delivery, receives payouts|

**Provider Journey:**
1. Sign up and complete Stripe Connect Express onboarding
2. Receive notification of incoming payment hold
3. Deliver the service
4. Mark delivery as complete
5. Funds released automatically after confirmation period
6. Receive payout to connected bank account

### 3.3 Platform Admin

| Attribute        | Detail                                                       |
|------------------|--------------------------------------------------------------|
| **Who**          | Internal operations team managing the marketplace            |
| **Goal**         | Maintain platform trust, resolve disputes, monitor revenue   |
| **Pain Points**  | Lack of visibility into disputes, manual fee tracking, no analytics |
| **Key Need**     | Dashboard for disputes, transaction monitoring, fee analytics|
| **Behavior**     | Reviews disputes, takes resolution actions, monitors metrics |

**Admin Journey:**
1. Monitor transaction volume and platform fee revenue
2. Review dispute queue and prioritize by age and amount
3. Examine evidence from both parties
4. Take resolution action (release funds, refund buyer, or escalate)
5. Track platform health metrics and identify anomalies

---

## 4. Competitive Landscape

### 4.1 Existing Solutions

| Solution                  | Strengths                        | Weaknesses                              |
|---------------------------|----------------------------------|-----------------------------------------|
| **PayPal Buyer Protection** | Wide adoption, brand trust     | Adversarial dispute process, slow resolution, high fees |
| **Fiverr Payment Hold**  | Integrated with marketplace      | Proprietary, not embeddable, high take rate |
| **Upwork Payment Protection** | Hourly + milestone support  | Complex fee structure, locked to Upwork ecosystem |
| **Stripe Direct**         | Excellent API, low fees          | No built-in hold/release mechanism      |
| **Payoneer Escrow**       | Multi-currency support           | Enterprise-focused, high minimums       |

### 4.2 Differentiation

Our platform differentiates through:

1. **Open architecture** — Built on Stripe Connect, not a proprietary payment rail
2. **Full transparency** — Real-time state machine visibility for all parties
3. **Structured disputes** — Evidence-based resolution with time bounds
4. **Auto-release timers** — Reduce admin burden; funds release if no dispute raised
5. **Platform fee flexibility** — Configurable fee percentages per transaction type
6. **Embeddable** — Architecture supports white-label integration into existing marketplaces

---

## 5. Success Metrics

### 5.1 Primary KPIs

| Metric                          | Target (6 months)  | Measurement Method              |
|---------------------------------|--------------------|---------------------------------|
| Transaction success rate        | > 95%              | Completed / Total transactions  |
| Dispute rate                    | < 5%               | Disputed / Total transactions   |
| Dispute resolution time         | < 48 hours median  | Time from dispute open to close |
| Provider payout time            | < 3 business days  | Time from release to bank credit|
| Platform fee revenue            | Tracked monthly    | Sum of platform fees collected  |

### 5.2 Secondary KPIs

| Metric                          | Target             | Measurement Method              |
|---------------------------------|--------------------|---------------------------------|
| Provider onboarding completion  | > 80%              | Completed / Started onboarding  |
| Auto-release rate               | > 70%              | Auto-released / Total releases  |
| Webhook processing reliability  | > 99.9%            | Processed / Received webhooks   |
| API response time (p95)         | < 500ms            | Payment endpoints latency       |

---

## 6. Scope

### 6.1 In Scope (MVP)

- User registration and authentication (buyer + provider roles)
- Stripe Connect Express onboarding for providers
- Payment hold creation with configurable amounts
- Delivery confirmation flow (buyer-initiated)
- Automated fund release with configurable timer
- Dispute creation with evidence submission
- Admin dispute resolution (refund, release, escalate)
- Platform fee calculation and collection on transfer
- Transaction state machine with full audit trail
- Webhook processing for Stripe events
- BullMQ job queue for async operations
- Buyer, provider, and admin dashboards
- Transaction analytics and reporting

### 6.2 Out of Scope (MVP)

- Multi-currency support (USD only for MVP)
- Milestone-based partial payments
- Recurring payment holds
- Mobile native applications
- Real-time chat between buyer and provider
- Automated fraud detection / ML scoring
- White-label / embeddable SDK
- Production fund processing (test mode only)

### 6.3 Future Considerations

- Milestone payments with partial release
- Multi-currency with automatic conversion
- Provider rating and reputation system
- Automated dispute resolution via rules engine
- API SDK for third-party marketplace integration
- Advanced analytics with cohort analysis

---

## 7. Risks and Mitigations

### 7.1 Business Risks

| Risk                                    | Likelihood | Impact | Mitigation                                    |
|-----------------------------------------|------------|--------|-----------------------------------------------|
| Regulatory scrutiny on payment holds    | Medium     | High   | Stripe Connect handles money transmission; legal review of terminology |
| High dispute rate erodes trust          | Medium     | High   | Auto-release timer reduces disputes; clear delivery criteria |
| Provider onboarding abandonment         | High       | Medium | Stripe Connect Express minimizes friction; progress tracking |
| Platform fee resistance                 | Medium     | Medium | Transparent fee display; competitive rates    |

### 7.2 Technical Risks

| Risk                                    | Likelihood | Impact | Mitigation                                    |
|-----------------------------------------|------------|--------|-----------------------------------------------|
| Stripe API downtime                     | Low        | High   | Retry logic, webhook replay, graceful degradation |
| Webhook delivery failure                | Low        | High   | Idempotent processing, dedup via WebhookLog   |
| State machine inconsistency             | Low        | Critical | Audit trail, pessimistic transitions, DB constraints |
| Redis failure (queue loss)              | Low        | Medium | BullMQ persistence, Redis persistence config  |
| Data breach                             | Low        | Critical | PCI delegated to Stripe, RLS, encryption at rest |

### 7.3 Operational Risks

| Risk                                    | Likelihood | Impact | Mitigation                                    |
|-----------------------------------------|------------|--------|-----------------------------------------------|
| Admin dispute backlog                   | Medium     | Medium | Auto-release reduces volume; escalation paths |
| Fraudulent delivery confirmations       | Medium     | High   | Dispute window after confirmation; evidence requirements |
| Clock skew on auto-release timers       | Low        | Medium | Server-side timestamps; BullMQ delayed jobs   |

---

## 8. Document References

| Document   | Section | Description                              |
|------------|---------|------------------------------------------|
| §BRD       | All     | Business rules derived from this vision  |
| §PRD       | All     | Functional requirements from personas    |
| §SRS-1     | All     | Architecture supporting this vision      |
| §SRS-2     | All     | Data model for entities described here   |
| §SRS-3     | All     | Domain logic for payment flows           |
| §SRS-4     | All     | Security and communications              |
| §WIREFRAMES| All     | UI designs for persona journeys          |

---

*End of PVD — Escrow Marketplace v1.0*
