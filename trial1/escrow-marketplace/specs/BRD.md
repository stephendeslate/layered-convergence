# Business Requirements Document (BRD)

## Escrow Marketplace — Conditional Payment Platform

| Field            | Value                          |
|------------------|--------------------------------|
| Version          | 1.0                            |
| Date             | 2026-03-20                     |
| Status           | Draft                          |
| Owner            | Platform Engineering           |
| Classification   | Internal                       |

> **Legal Notice:** This document uses "payment hold" and "conditional release"
> terminology exclusively. The platform does NOT operate as an escrow service.
> Stripe Connect handles all money transmission and fund custody. This is a
> demo application — no real funds are processed.

---

## 1. Business Objectives

### 1.1 Primary Objectives

| ID     | Objective                                                          |
|--------|--------------------------------------------------------------------|
| BO-01  | Provide payment protection for buyers through conditional holds    |
| BO-02  | Guarantee provider payment upon confirmed service delivery         |
| BO-03  | Generate platform revenue through transaction fees                 |
| BO-04  | Minimize dispute volume through auto-release and clear processes   |
| BO-05  | Maintain regulatory compliance via Stripe Connect delegation       |

### 1.2 Key Business Outcomes

- Transaction completion rate exceeding 95%
- Dispute rate below 5% of total transactions
- Platform fee collection on every successful transfer
- Provider onboarding completion rate above 80%
- Full audit trail for every financial state transition

---

## 2. Business Rules

### 2.1 Payment Hold Rules

| ID     | Rule                                                               | Testable Criteria                              |
|--------|--------------------------------------------------------------------|------------------------------------------------|
| BR-01  | A payment hold SHALL be created by capturing a Stripe PaymentIntent with `capture_method: manual` | PaymentIntent status = `requires_capture` after creation |
| BR-02  | The minimum payment hold amount SHALL be $5.00 USD                 | System rejects holds below $5.00               |
| BR-03  | The maximum payment hold amount SHALL be $10,000.00 USD            | System rejects holds above $10,000.00          |
| BR-04  | A payment hold SHALL expire if not captured within 7 calendar days | PaymentIntent auto-cancels after 7 days via Stripe |
| BR-05  | Only authenticated buyers SHALL create payment holds               | Unauthenticated requests return 401            |
| BR-06  | A payment hold SHALL reference exactly one provider                | System rejects holds without a valid provider ID |
| BR-07  | Payment holds SHALL be denominated in USD only (MVP)               | System rejects non-USD currency codes          |

### 2.2 Platform Fee Rules

| ID     | Rule                                                               | Testable Criteria                              |
|--------|--------------------------------------------------------------------|------------------------------------------------|
| BR-08  | The platform fee SHALL be 10% of the transaction amount            | Fee = `floor(amount * 0.10)` in cents          |
| BR-09  | The platform fee SHALL be deducted from the provider's transfer    | Transfer amount = hold amount - platform fee   |
| BR-10  | The minimum platform fee SHALL be $0.50 USD                        | Transactions below $5.00 are blocked (§BR-02)  |
| BR-11  | Platform fees SHALL be calculated in cents to avoid floating-point errors | All monetary math uses integer cents       |
| BR-12  | The platform fee percentage SHALL be configurable per environment  | Environment variable overrides default 10%     |

### 2.3 Delivery and Release Rules

| ID     | Rule                                                               | Testable Criteria                              |
|--------|--------------------------------------------------------------------|------------------------------------------------|
| BR-13  | Delivery confirmation SHALL be initiated by the buyer              | Provider cannot mark delivery as confirmed     |
| BR-14  | The provider MAY mark a transaction as "delivered" to notify buyer | Status changes to DELIVERED; buyer is notified |
| BR-15  | Auto-release SHALL trigger 72 hours after delivery marking if buyer takes no action | BullMQ delayed job fires at T+72h   |
| BR-16  | The auto-release timer SHALL be cancellable by a dispute filing    | Dispute creation removes the delayed job       |
| BR-17  | Fund release SHALL create a Stripe Transfer to the provider's connected account | Transfer object created with correct destination |
| BR-18  | Released funds SHALL be available for payout per Stripe's payout schedule | Payout timing follows Stripe Connect rules |

### 2.4 Dispute Rules

| ID     | Rule                                                               | Testable Criteria                              |
|--------|--------------------------------------------------------------------|------------------------------------------------|
| BR-19  | Only buyers SHALL initiate disputes                                | Provider dispute attempts return 403           |
| BR-20  | Disputes SHALL only be raised on transactions in PAYMENT_HELD or DELIVERED status | Other statuses return 400            |
| BR-21  | A dispute SHALL include a reason category and description          | System rejects disputes without required fields|
| BR-22  | The dispute window SHALL be 72 hours after delivery marking        | Disputes after 72h are rejected                |
| BR-23  | Both parties MAY submit evidence during an open dispute            | Evidence upload accepted from buyer and provider|
| BR-24  | Admin SHALL have three resolution options: release to provider, refund to buyer, or escalate | All three actions available in admin UI |
| BR-25  | Dispute resolution SHALL be final (no re-opening)                  | Resolved disputes cannot change status         |
| BR-26  | Escalated disputes SHALL be flagged for manual external review     | Escalation creates a high-priority admin task  |

### 2.5 Provider Onboarding Rules

| ID     | Rule                                                               | Testable Criteria                              |
|--------|--------------------------------------------------------------------|------------------------------------------------|
| BR-27  | Providers SHALL complete Stripe Connect Express onboarding before receiving payments | Transfers blocked for non-onboarded providers |
| BR-28  | Onboarding status SHALL be synced via Stripe webhooks              | account.updated webhook updates local status   |
| BR-29  | Providers with incomplete onboarding SHALL see a banner prompting completion | UI shows onboarding CTA when status != complete |
| BR-30  | Providers SHALL not be listed as available until onboarding is complete | Provider search excludes non-onboarded accounts |

### 2.6 Payout Rules

| ID     | Rule                                                               | Testable Criteria                              |
|--------|--------------------------------------------------------------------|------------------------------------------------|
| BR-31  | Payouts SHALL follow Stripe Connect's standard payout schedule     | Platform does not override Stripe payout timing|
| BR-32  | Manual payout requests SHALL be supported for admin-initiated payouts | Admin can trigger immediate payout via API    |
| BR-33  | Payout status SHALL be tracked via Stripe webhooks                 | payout.paid and payout.failed update local status |
| BR-34  | Payout failures SHALL be surfaced to the provider and admin        | Failed payouts trigger notifications           |

### 2.7 Transaction State Rules

| ID     | Rule                                                               | Testable Criteria                              |
|--------|--------------------------------------------------------------------|------------------------------------------------|
| BR-35  | Every transaction state change SHALL be recorded in TransactionStateHistory | History table has row for each transition  |
| BR-36  | State transitions SHALL be validated against the state machine     | Invalid transitions return 400                 |
| BR-37  | State history SHALL include actor, timestamp, and optional metadata | All three fields populated on every record     |
| BR-38  | No state transition SHALL be reversible except via dispute resolution | Direct backward transitions are blocked      |

---

## 3. Stripe Connect Requirements

### 3.1 Integration Model

| Requirement                                | Detail                                      |
|--------------------------------------------|---------------------------------------------|
| Account type                               | Express (Stripe-hosted onboarding)          |
| Charge model                               | Separate charges and transfers              |
| Fee collection                             | Platform fee deducted from transfer amount  |
| Payout control                             | Manual payouts disabled; Stripe automatic   |
| Webhook events required                    | See §3.2                                    |

### 3.2 Required Webhook Events

| Event                          | Purpose                                     |
|--------------------------------|---------------------------------------------|
| `payment_intent.succeeded`     | Confirm payment hold capture                |
| `payment_intent.payment_failed`| Handle failed payment attempts              |
| `payment_intent.canceled`      | Handle expired holds                        |
| `transfer.created`             | Confirm fund transfer to provider           |
| `transfer.failed`              | Handle transfer failures                    |
| `payout.paid`                  | Confirm provider payout                     |
| `payout.failed`                | Handle payout failures                      |
| `charge.dispute.created`       | Handle Stripe-level disputes                |
| `charge.dispute.closed`        | Handle Stripe dispute resolution            |
| `account.updated`              | Sync provider onboarding status             |

### 3.3 Stripe Connect Limitations

| Limitation                     | Impact                                      | Mitigation                                  |
|--------------------------------|---------------------------------------------|---------------------------------------------|
| 7-day uncaptured hold expiry   | Holds auto-cancel after 7 days              | Auto-release timer set to 72h (within limit)|
| Express account limited data   | Less control over provider accounts         | Sufficient for MVP; upgrade to Custom later |
| Transfer timing                | Transfers not instant                       | Track via webhooks; show pending status      |
| Test mode restrictions         | Some features behave differently in test    | Document test mode differences               |

---

## 4. External Dependencies

### 4.1 Stripe API

| Attribute        | Detail                                                     |
|------------------|------------------------------------------------------------|
| Dependency       | Stripe Connect API (v2024-12-18.acacia or later)           |
| Purpose          | Payment processing, fund custody, provider accounts        |
| Risk Level       | High — core payment functionality                          |
| Availability SLA | 99.99% (Stripe published)                                  |
| Failure Mode     | Graceful degradation; queue retries; manual reconciliation |
| Data Exchanged   | Payment intents, transfers, payouts, account data          |

### 4.2 PostgreSQL

| Attribute        | Detail                                                     |
|------------------|------------------------------------------------------------|
| Dependency       | PostgreSQL 16 (Railway hosted)                             |
| Purpose          | Primary data store for all entities                        |
| Risk Level       | High — all application state                               |
| Availability SLA | 99.95% (Railway published)                                 |
| Failure Mode     | Application unavailable; no degraded mode                  |
| Data Exchanged   | All entity CRUD operations                                 |

### 4.3 Redis

| Attribute        | Detail                                                     |
|------------------|------------------------------------------------------------|
| Dependency       | Redis 7+ (Railway hosted)                                  |
| Purpose          | BullMQ job queue for async processing                      |
| Risk Level       | Medium — async operations delayed but not lost             |
| Availability SLA | 99.95% (Railway published)                                 |
| Failure Mode     | Queue processing paused; webhooks buffered                 |
| Data Exchanged   | Job payloads for webhooks, timers, notifications           |

---

## 5. Compliance Requirements

### 5.1 PCI DSS Compliance

| Requirement                    | Approach                                    |
|--------------------------------|---------------------------------------------|
| Cardholder data handling       | Delegated entirely to Stripe                |
| Card number storage            | Never touches platform servers              |
| Payment form                   | Stripe Elements (iframe-based)              |
| SAQ level                      | SAQ-A (fully outsourced)                    |
| Tokenization                   | Stripe handles; platform uses PaymentIntent IDs only |

### 5.2 Money Transmission

| Requirement                    | Approach                                    |
|--------------------------------|---------------------------------------------|
| Fund custody                   | Stripe holds all funds                      |
| Money transmission license     | Not required — Stripe Connect is the transmitter |
| Terminology                    | "Payment hold" / "conditional release" only |
| Prohibited terms               | "Escrow" SHALL NOT appear in user-facing text |
| Legal disclaimer               | Required on all pages handling payments     |

### 5.3 Data Protection

| Requirement                    | Approach                                    |
|--------------------------------|---------------------------------------------|
| PII storage                    | Minimal; Stripe stores sensitive provider data |
| Encryption at rest             | PostgreSQL encryption via Railway           |
| Encryption in transit          | TLS 1.2+ on all connections                |
| Row-level security             | PostgreSQL RLS on transaction data          |
| Data retention                 | Transaction records retained 7 years        |
| Right to deletion              | Soft delete with anonymization              |

### 5.4 Demo Mode Requirements

| Requirement                    | Detail                                      |
|--------------------------------|---------------------------------------------|
| Banner                         | "Demo application — no real funds" on every page |
| Stripe mode                    | Test mode API keys only                     |
| Test cards                     | Stripe test card numbers documented in UI   |
| Data disclaimer                | "Test data only" in footer                  |

---

## 6. Business Constraints

### 6.1 Timeline

| Milestone                      | Target                                      |
|--------------------------------|---------------------------------------------|
| Specification complete         | Week 1                                      |
| Core API (payment hold + release) | Week 3                                   |
| Dispute resolution flow        | Week 4                                      |
| Frontend dashboards            | Week 5                                      |
| Integration testing            | Week 6                                      |
| Demo-ready                     | Week 7                                      |

### 6.2 Budget Constraints

| Constraint                     | Detail                                      |
|--------------------------------|---------------------------------------------|
| Stripe fees                    | 2.9% + $0.30 per charge (test mode: free)  |
| Railway hosting                | Starter plan (~$5/month per service)        |
| Vercel hosting                 | Pro plan for preview deployments            |
| No paid third-party services   | Beyond Stripe, Railway, Vercel              |

### 6.3 Technical Constraints

| Constraint                     | Detail                                      |
|--------------------------------|---------------------------------------------|
| USD only                       | Multi-currency deferred to future release   |
| Test mode only                 | No production Stripe keys in MVP            |
| Single region                  | US-East deployment only                     |
| No mobile apps                 | Web responsive only                         |

---

## 7. Glossary

| Term                   | Definition                                           |
|------------------------|------------------------------------------------------|
| Payment Hold           | A captured or uncaptured PaymentIntent holding buyer funds |
| Conditional Release    | Transfer of held funds to provider upon delivery confirmation |
| Platform Fee           | Percentage deducted from transfer amount as revenue  |
| Auto-Release           | Automatic fund release after timer expiry with no dispute |
| Connected Account      | Stripe Connect Express account belonging to a provider |
| Dispute Window         | Time period after delivery during which buyer may dispute |

---

## 8. Document References

| Document   | Section  | Relationship                                    |
|------------|----------|-------------------------------------------------|
| §PVD       | 3        | Personas that drive business rules              |
| §PRD       | All      | Functional requirements implementing these rules|
| §SRS-1     | 3        | Architecture supporting Stripe integration      |
| §SRS-2     | 2-4      | Data model enforcing business rules             |
| §SRS-3     | All      | Domain logic implementing business rules        |
| §SRS-4     | 2, 3     | Security and compliance implementation          |

---

*End of BRD — Escrow Marketplace v1.0*
