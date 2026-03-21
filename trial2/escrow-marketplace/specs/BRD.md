# Business Requirements Document (BRD)
# Marketplace Payment Hold & Conditional Release Platform

**Version:** 1.0
**Date:** 2026-03-20
**Status:** Approved

---

## 1. Executive Summary

This document defines the business requirements for a two-sided marketplace
payment platform that implements conditional payment release. The platform
enables buyers to pay into a hold managed by Stripe, with funds released to
service providers only after delivery confirmation. The system includes dispute
resolution, auto-release timers, and transaction analytics.

**Key constraint:** This is a demonstration platform. No real funds are
processed. All Stripe integration uses test mode exclusively.

---

## 2. Business Context

### 2.1 Business Problem

Marketplace operators need a payment system that:
1. Protects buyers from paying for undelivered services
2. Guarantees providers receive payment for completed work
3. Handles disputes without costly chargeback processes
4. Complies with financial regulations without money transmission licenses
5. Provides visibility into transaction health and revenue

### 2.2 Business Objectives

| ID | Objective | Measure |
|----|-----------|---------|
| BO-1 | Reduce payment-related churn | Transaction completion rate >95% |
| BO-2 | Minimize chargeback costs | Dispute rate <3%, internal resolution >90% |
| BO-3 | Accelerate provider onboarding | Onboarding completion >80% in <10 minutes |
| BO-4 | Enable platform revenue | Platform fee collection on every transaction |
| BO-5 | Demonstrate compliance posture | Audit trail for every state transition |

---

## 3. Payment Flow Requirements

### 3.1 Core Payment Lifecycle

#### BR-PAY-001: Payment Creation
- Buyer initiates a payment for a specific service amount
- System creates a Stripe PaymentIntent with `capture_method: automatic`
- Payment amount, currency (USD), and provider are specified at creation
- Platform fee is calculated at creation time and stored with the transaction
- Transaction enters CREATED state

#### BR-PAY-002: Payment Hold
- Upon successful charge (Stripe confirms payment), funds are held
- "Hold" is implemented via Stripe's separate charges and transfers model:
  the charge occurs immediately, but the transfer to the provider's connected
  account is delayed
- Transaction enters HELD state
- Hold period begins (configurable, default 14 days)
- Both buyer and provider are notified

#### BR-PAY-003: Payment Release
- Release is triggered by one of:
  - Buyer confirms delivery (manual release)
  - Auto-release timer expires (automatic release)
  - Admin forces release (administrative action)
- System creates a Stripe Transfer to the provider's connected account
- Transfer amount = payment amount - platform fee
- Transaction enters RELEASED state
- Provider is notified of incoming funds

#### BR-PAY-004: Payment Refund
- Refund is triggered by:
  - Dispute resolved in buyer's favor
  - Admin-initiated refund
  - Buyer cancellation (only in CREATED state)
- System creates a Stripe Refund on the original charge
- Transaction enters REFUNDED state
- Buyer is notified of refund

#### BR-PAY-005: Payment Expiration
- If a payment remains in CREATED state beyond a configurable timeout
  (default 1 hour), it expires
- System cancels the Stripe PaymentIntent
- Transaction enters EXPIRED state

### 3.2 Transaction State Machine

```
CREATED ──────→ HELD ──────→ RELEASED
   │              │
   │              ├──────→ DISPUTED ──→ RELEASED (provider wins)
   │              │              └──→ REFUNDED (buyer wins)
   │              │
   │              └──────→ REFUNDED
   │
   └──────────→ EXPIRED
```

**Valid transitions:**
| From | To | Trigger |
|------|----|---------|
| CREATED | HELD | Stripe payment_intent.succeeded webhook |
| CREATED | EXPIRED | Timeout (1 hour default) |
| HELD | RELEASED | Buyer confirms, auto-release timer, admin action |
| HELD | DISPUTED | Buyer raises dispute |
| HELD | REFUNDED | Admin refund |
| DISPUTED | RELEASED | Dispute resolved in provider's favor |
| DISPUTED | REFUNDED | Dispute resolved in buyer's favor |

**Invalid transitions** (must be rejected):
- RELEASED → any state
- REFUNDED → any state
- EXPIRED → any state
- CREATED → RELEASED (must go through HELD)
- CREATED → DISPUTED (must go through HELD)

---

## 4. Compliance Considerations

### 4.1 Money Transmission

The platform does NOT hold or transmit funds directly. Stripe Connect handles
all regulated activities:

- **Stripe is the merchant of record** for payment processing
- **Separate charges and transfers** model means Stripe holds funds between
  charge and transfer
- **Platform never touches buyer funds** — Stripe manages the float
- **Connected accounts** (Express type) are Stripe's responsibility for KYC/AML

Reference: FinCEN ruling FIN-2014-R004 — platforms using licensed payment
processors as intermediaries are generally not money transmitters.

### 4.2 PCI Compliance

- **PCI DSS scope is minimized** by using Stripe Elements for card collection
- The platform backend never sees raw card numbers
- Stripe.js tokenizes card data client-side
- Server-side operations use PaymentIntent IDs and tokens only

### 4.3 Data Protection

- User data stored in PostgreSQL with Row-Level Security
- Stripe customer/account IDs stored, not raw financial data
- Transaction amounts stored as integers (cents) to avoid precision issues
- Audit trail for all state transitions (TransactionStateHistory)

### 4.4 Dispute Handling Compliance

- Internal dispute resolution does not replace Stripe's dispute process
- If a buyer files a chargeback through their bank, Stripe's dispute process
  takes precedence
- Internal disputes aim to resolve issues before they escalate to chargebacks
- Evidence submission follows Stripe's evidence format for potential escalation

---

## 5. Fee Structure

### 5.1 Platform Fee

| Parameter | Value | Configurable |
|-----------|-------|-------------|
| Default platform fee | 10% | Yes, per transaction type |
| Minimum fee | $0.50 | Yes |
| Maximum fee | None | — |
| Fee calculation | `ceil(amount * feePercent / 100)` | — |
| Fee timing | Calculated at transaction creation | — |
| Fee deduction | Deducted from transfer to provider | — |

### 5.2 Fee Examples

| Payment Amount | Fee Rate | Platform Fee | Provider Receives |
|---------------|----------|-------------|-------------------|
| $100.00 | 10% | $10.00 | $90.00 |
| $5.00 | 10% | $0.50 | $4.50 |
| $3.00 | 10% | $0.50 (minimum) | $2.50 |
| $1,000.00 | 10% | $100.00 | $900.00 |

### 5.3 Fee on Refund

- When a transaction is refunded, the platform fee is NOT retained
- Full refund goes to the buyer (original charge amount)
- Stripe processing fees may still apply (Stripe's policy)

---

## 6. Dispute Service Level Agreements

### 6.1 Dispute Lifecycle

| Stage | SLA | Action |
|-------|-----|--------|
| Dispute filed | Immediate | Transaction status changes to DISPUTED |
| Evidence window | 48 hours | Both parties may submit evidence |
| Admin review | 24 hours after evidence window | Admin reviews and resolves |
| Resolution | 72 hours total | Dispute resolved, funds released or refunded |
| Escalation | If unresolved in 72h | Auto-escalate to senior review |

### 6.2 Dispute Reasons

| Reason Code | Description | Default Resolution |
|-------------|-------------|-------------------|
| SERVICE_NOT_DELIVERED | Service was never performed | Buyer favor |
| SERVICE_NOT_AS_DESCRIBED | Service quality did not match description | Admin review |
| UNAUTHORIZED_CHARGE | Buyer did not authorize the payment | Buyer favor |
| DUPLICATE_CHARGE | Buyer was charged multiple times | Buyer favor |
| OTHER | Other reason (requires description) | Admin review |

### 6.3 Evidence Types

- Text description of the issue
- Screenshots/images (via Stripe File Upload API)
- Communication records (text/links)
- Delivery confirmation (tracking, completion proof)

---

## 7. Provider Onboarding Requirements

### 7.1 Onboarding Flow

1. Provider registers on the platform (email + password)
2. Provider initiates Stripe Connect onboarding
3. System creates a Stripe Express connected account
4. Provider is redirected to Stripe's hosted onboarding flow
5. Stripe collects KYC/AML information (identity, banking)
6. Stripe redirects back to the platform with onboarding status
7. Platform polls Stripe for account status updates

### 7.2 Onboarding States

| State | Description | Can Receive Payouts |
|-------|-------------|-------------------|
| NOT_STARTED | Provider has not initiated onboarding | No |
| PENDING | Onboarding started, not completed | No |
| ACTIVE | Onboarding complete, account verified | Yes |
| RESTRICTED | Account has restrictions (needs more info) | Limited |
| DISABLED | Account disabled by Stripe or admin | No |

### 7.3 Onboarding Requirements

- Provider must complete Stripe's Express onboarding (Stripe handles all KYC)
- Platform stores the connected account ID, NOT banking details
- Onboarding status is checked via Stripe API, not cached indefinitely
- Providers cannot receive payouts until account status is ACTIVE

---

## 8. Analytics Requirements

### 8.1 Transaction Analytics

| Metric | Aggregation | Visualization |
|--------|------------|---------------|
| Transaction volume | Daily, weekly, monthly | Line chart |
| Transaction value (GMV) | Daily, weekly, monthly | Line chart |
| Platform fee revenue | Daily, weekly, monthly | Bar chart |
| Dispute rate | Rolling 30-day | Gauge/percentage |
| Average hold duration | Rolling 30-day | Single metric |
| Transaction by status | Current snapshot | Pie/donut chart |

### 8.2 Provider Analytics

| Metric | Scope |
|--------|-------|
| Payout history | Per provider |
| Average transaction value | Per provider |
| Dispute rate | Per provider |
| Onboarding completion time | Aggregate |

### 8.3 Reporting Period

- Default dashboard view: Last 30 days
- Configurable date range: 7d, 30d, 90d, 1y
- All timestamps in UTC

---

## 9. Notification Requirements

### 9.1 Email Notifications

| Event | Recipient | Template |
|-------|-----------|----------|
| Payment created | Buyer, Provider | Payment confirmation |
| Payment held | Buyer, Provider | Funds held notification |
| Payment released | Provider | Funds released notification |
| Payment refunded | Buyer | Refund confirmation |
| Dispute filed | Buyer, Provider, Admin | Dispute notification |
| Dispute resolved | Buyer, Provider | Resolution notification |
| Payout sent | Provider | Payout notification |
| Onboarding complete | Provider | Welcome/active notification |

### 9.2 In-App Notifications

- Transaction status changes displayed in user dashboard
- Dispute updates shown in notification center
- Payout confirmations in provider dashboard

---

## 10. User Roles and Permissions

### 10.1 Role Matrix

| Action | Buyer | Provider | Admin |
|--------|-------|----------|-------|
| Create payment | Yes | No | No |
| View own transactions | Yes | Yes | All |
| Confirm delivery | Yes | No | Yes |
| Raise dispute | Yes | No | No |
| Submit dispute evidence | Yes | Yes | Yes |
| Resolve dispute | No | No | Yes |
| View analytics | Own only | Own only | All |
| Manage providers | No | No | Yes |
| Force release/refund | No | No | Yes |
| Onboard to Stripe | No | Yes | No |

### 10.2 Authentication

- JWT-based authentication
- Access tokens: 15-minute expiry
- Refresh tokens: 7-day expiry
- Role embedded in JWT payload
- Password hashing: bcrypt with salt rounds = 12

---

## 11. Business Rules Summary

| ID | Rule | Enforcement |
|----|------|------------|
| BR-001 | All amounts in cents (integers) | Schema + validation |
| BR-002 | Platform fee minimum $0.50 (50 cents) | Fee calculation service |
| BR-003 | Auto-release default 14 days | Configurable per transaction |
| BR-004 | Disputes only from HELD state | State machine validation |
| BR-005 | Provider must be ACTIVE to receive payouts | Transfer service check |
| BR-006 | Webhook idempotency via event ID | WebhookLog dedup |
| BR-007 | No real funds — test mode only | Stripe key validation |
| BR-008 | Demo banner on all pages | Frontend layout component |
| BR-009 | Refunds return full amount to buyer | Refund service |
| BR-010 | State transitions are audited | TransactionStateHistory |

---

## 12. Acceptance Criteria (High Level)

### 12.1 Payment Flow
- [ ] Buyer can create a payment that charges their card via Stripe
- [ ] Funds are held until delivery confirmation or auto-release
- [ ] Provider receives payout minus platform fee
- [ ] Full lifecycle is visible in transaction timeline

### 12.2 Dispute Flow
- [ ] Buyer can raise a dispute on a held transaction
- [ ] Both parties can submit evidence
- [ ] Admin can resolve in favor of either party
- [ ] Resolution triggers appropriate fund movement

### 12.3 Provider Onboarding
- [ ] Provider can initiate Stripe Connect onboarding
- [ ] Onboarding status is tracked and displayed
- [ ] Only active providers can receive payouts

### 12.4 Analytics
- [ ] Admin dashboard shows transaction volume and trends
- [ ] Platform fee revenue is tracked
- [ ] Dispute rate is calculated and displayed

### 12.5 Security
- [ ] Row-Level Security on all tenant-scoped tables
- [ ] Webhook signature verification using Stripe constructEvent
- [ ] Rate limiting on authentication and payment endpoints
- [ ] JWT with role-based access control
