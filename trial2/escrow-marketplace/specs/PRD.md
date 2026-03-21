# Product Requirements Document (PRD)
# Marketplace Payment Hold & Conditional Release Platform

**Version:** 1.0
**Date:** 2026-03-20
**Status:** Approved

---

## 1. Overview

This document defines the product requirements, user stories, and acceptance
criteria for the marketplace payment hold platform. It translates the business
requirements from the BRD into actionable product specifications.

---

## 2. User Stories — Buyer

### US-B001: Create Payment
**As a** buyer,
**I want to** create a payment for a service,
**So that** funds are charged and held until I confirm delivery.

**Acceptance Criteria:**
- Given I am logged in as a buyer
- When I submit a payment with amount, description, and provider selection
- Then a Stripe PaymentIntent is created and my card is charged
- And a transaction record is created in CREATED state
- And I see a confirmation with the transaction ID and amount

### US-B002: View Transaction List
**As a** buyer,
**I want to** see all my transactions,
**So that** I can track payment status and history.

**Acceptance Criteria:**
- Given I am logged in as a buyer
- When I navigate to my transactions page
- Then I see a list of my transactions with status, amount, provider, and date
- And I do NOT see other buyers' transactions
- And transactions are sorted by date (newest first)

### US-B003: View Transaction Detail
**As a** buyer,
**I want to** view the details and timeline of a specific transaction,
**So that** I understand exactly what happened with my payment.

**Acceptance Criteria:**
- Given I have an existing transaction
- When I click on the transaction
- Then I see the full transaction details (amount, provider, status, dates)
- And I see a visual timeline of all state transitions
- And each transition shows the timestamp and reason

### US-B004: Confirm Delivery
**As a** buyer,
**I want to** confirm that a service was delivered,
**So that** funds are released to the provider.

**Acceptance Criteria:**
- Given I have a transaction in HELD state
- When I click "Confirm Delivery"
- Then the transaction transitions to RELEASED state
- And a Stripe Transfer is created to the provider's account
- And both I and the provider are notified

### US-B005: Raise Dispute
**As a** buyer,
**I want to** raise a dispute on a held transaction,
**So that** I can report issues before funds are released.

**Acceptance Criteria:**
- Given I have a transaction in HELD state
- When I click "Raise Dispute" and provide a reason and description
- Then a dispute record is created
- And the transaction transitions to DISPUTED state
- And the auto-release timer is paused/cancelled
- And the provider is notified of the dispute

### US-B006: Submit Dispute Evidence
**As a** buyer,
**I want to** submit evidence for my dispute,
**So that** the admin has information to make a fair decision.

**Acceptance Criteria:**
- Given I have an active dispute
- When I submit evidence (text description, screenshots)
- Then the evidence is recorded against the dispute
- And the evidence submission timestamp is logged

### US-B007: Cancel Payment
**As a** buyer,
**I want to** cancel a payment that hasn't been charged yet,
**So that** I can change my mind before funds are held.

**Acceptance Criteria:**
- Given I have a transaction in CREATED state
- When I click "Cancel Payment"
- Then the Stripe PaymentIntent is cancelled
- And the transaction enters EXPIRED state
- And no charge is made to my card

---

## 3. User Stories — Provider

### US-P001: Initiate Stripe Connect Onboarding
**As a** provider,
**I want to** set up my payment account through Stripe,
**So that** I can receive payouts for my services.

**Acceptance Criteria:**
- Given I am logged in as a provider
- When I click "Set Up Payments"
- Then a Stripe Express connected account is created for me
- And I am redirected to Stripe's hosted onboarding flow
- And my onboarding status is set to PENDING

### US-P002: Complete Onboarding
**As a** provider,
**I want to** return to the platform after Stripe onboarding,
**So that** my account is activated and I can receive payments.

**Acceptance Criteria:**
- Given I completed Stripe's onboarding flow
- When I am redirected back to the platform
- Then the platform checks my account status with Stripe
- And my onboarding status is updated (ACTIVE or RESTRICTED)
- And I see my account status on my dashboard

### US-P003: View Incoming Payments
**As a** provider,
**I want to** see all transactions where I am the provider,
**So that** I can track incoming payments and their status.

**Acceptance Criteria:**
- Given I am logged in as a provider
- When I navigate to my payments page
- Then I see all transactions where I am the provider
- And I see the status, amount, buyer info, and dates
- And I do NOT see transactions for other providers

### US-P004: View Payout History
**As a** provider,
**I want to** see my payout history,
**So that** I know how much I've been paid and when.

**Acceptance Criteria:**
- Given I am a provider with completed transactions
- When I navigate to my payouts page
- Then I see a list of all payouts with amount, date, and status
- And I see my total earnings and pending amounts

### US-P005: Submit Dispute Evidence (Provider)
**As a** provider,
**I want to** respond to a dispute with evidence,
**So that** I can defend my case and receive payment.

**Acceptance Criteria:**
- Given a buyer has raised a dispute on one of my transactions
- When I submit evidence (text, delivery proof, communication records)
- Then the evidence is recorded against the dispute
- And the admin can see both buyer and provider evidence

### US-P006: View Onboarding Status
**As a** provider,
**I want to** see my current onboarding status,
**So that** I know if I can receive payments or need to take action.

**Acceptance Criteria:**
- Given I am logged in as a provider
- When I view my dashboard
- Then I see my current Stripe account status
- And if my account is restricted, I see a link to update my information
- And if my account is active, I see a confirmation

---

## 4. User Stories — Admin

### US-A001: View All Transactions
**As an** admin,
**I want to** view all transactions across the platform,
**So that** I can monitor platform health and investigate issues.

**Acceptance Criteria:**
- Given I am logged in as an admin
- When I navigate to the admin dashboard
- Then I see all transactions across all buyers and providers
- And I can filter by status, date range, and amount
- And I can search by transaction ID or user

### US-A002: View Transaction Analytics
**As an** admin,
**I want to** see transaction analytics,
**So that** I can understand platform performance and revenue.

**Acceptance Criteria:**
- Given I am logged in as an admin
- When I view the analytics dashboard
- Then I see transaction volume over time (line chart)
- And I see platform fee revenue (bar chart)
- And I see dispute rate (percentage)
- And I see transaction status distribution
- And I can change the time period (7d, 30d, 90d)

### US-A003: Review Disputes
**As an** admin,
**I want to** review pending disputes,
**So that** I can resolve them fairly.

**Acceptance Criteria:**
- Given there are disputes in pending/evidence state
- When I navigate to the dispute queue
- Then I see all unresolved disputes
- And I can view evidence from both buyer and provider
- And I can see the transaction details and timeline

### US-A004: Resolve Dispute
**As an** admin,
**I want to** resolve a dispute in favor of buyer or provider,
**So that** funds are appropriately released or refunded.

**Acceptance Criteria:**
- Given I am reviewing a dispute
- When I resolve in the provider's favor
- Then the transaction transitions from DISPUTED to RELEASED
- And a transfer is created to the provider's account
- When I resolve in the buyer's favor
- Then the transaction transitions from DISPUTED to REFUNDED
- And a refund is created for the buyer

### US-A005: Force Release or Refund
**As an** admin,
**I want to** force a release or refund on a held transaction,
**So that** I can handle edge cases and customer support issues.

**Acceptance Criteria:**
- Given I have a transaction in HELD state
- When I force release
- Then the transaction transitions to RELEASED with admin reason
- When I force refund
- Then the transaction transitions to REFUNDED with admin reason
- And all actions are logged in TransactionStateHistory

### US-A006: View Provider Accounts
**As an** admin,
**I want to** view all provider accounts and their onboarding status,
**So that** I can manage the provider base.

**Acceptance Criteria:**
- Given I am logged in as an admin
- When I view the providers list
- Then I see all providers with their onboarding status
- And I can see each provider's transaction count and volume

---

## 5. System Stories

### US-S001: Webhook Processing
**As the** system,
**I want to** process Stripe webhooks reliably,
**So that** payment states stay synchronized with Stripe.

**Acceptance Criteria:**
- Given Stripe sends a webhook event
- When the webhook endpoint receives it
- Then the signature is verified using Stripe constructEvent
- And the event is logged in WebhookLog with idempotency key
- And duplicate events are detected and skipped
- And the appropriate handler processes the event
- And if processing fails, the webhook returns 200 (to prevent retries) but
  logs the error

### US-S002: Auto-Release Timer
**As the** system,
**I want to** automatically release held funds after a configurable period,
**So that** providers are not waiting indefinitely for payment.

**Acceptance Criteria:**
- Given a transaction enters HELD state
- When the hold period expires (default 14 days)
- Then a BullMQ delayed job fires
- And the transaction transitions from HELD to RELEASED
- And a transfer is created to the provider
- But if the transaction is no longer in HELD state (already released, disputed,
  or refunded), the job is a no-op

### US-S003: Fee Calculation
**As the** system,
**I want to** calculate platform fees accurately,
**So that** fee revenue is correct and provider payouts are accurate.

**Acceptance Criteria:**
- Given a transaction amount and fee percentage
- When the fee is calculated
- Then the fee is computed as `ceil(amount * feePercent / 100)`
- And the fee is at least the minimum fee (50 cents)
- And the fee is stored with the transaction at creation time
- And the provider payout = amount - fee

### US-S004: Transaction State History
**As the** system,
**I want to** log every state transition with timestamp and reason,
**So that** there is a complete audit trail for every transaction.

**Acceptance Criteria:**
- Given a transaction changes state
- When the transition occurs
- Then a TransactionStateHistory record is created
- And it includes: fromState, toState, reason, performedBy, timestamp
- And the transaction's updatedAt is updated

---

## 6. Non-Functional Requirements

### NFR-001: Performance
- API response time: <200ms for 95th percentile (excluding Stripe API calls)
- Dashboard load time: <2 seconds
- Webhook processing: <5 seconds end-to-end

### NFR-002: Security
- All API endpoints require authentication (except webhooks and health check)
- Row-Level Security on all tenant-scoped tables
- Webhook endpoints verify Stripe signatures
- Rate limiting: 100 requests/minute for auth, 30 requests/minute for payments
- CORS restricted to configured origins

### NFR-003: Reliability
- Webhook idempotency: duplicate events must not cause duplicate state changes
- Auto-release timer: must fire even if the API server restarts (BullMQ persistence)
- State machine: invalid transitions must be rejected with clear error messages

### NFR-004: Observability
- All state transitions logged with timestamps
- Webhook events logged with processing status
- Error responses include correlation IDs

### NFR-005: Data Integrity
- All financial amounts stored as integers (cents)
- Database transactions for state changes (atomic)
- Foreign key constraints on all relationships

### NFR-006: Demo Mode
- Demo banner visible on all pages
- Test mode Stripe keys only
- Seed data available for all demo scenarios

---

## 7. Feature Priority

| Priority | Feature | User Story |
|----------|---------|------------|
| P0 (Must) | Payment creation and hold | US-B001 |
| P0 (Must) | Payment release | US-B004, US-S002 |
| P0 (Must) | Transaction state machine | US-S004 |
| P0 (Must) | Provider onboarding | US-P001, US-P002 |
| P0 (Must) | Webhook processing | US-S001 |
| P1 (Should) | Dispute workflow | US-B005, US-A004 |
| P1 (Should) | Transaction analytics | US-A002 |
| P1 (Should) | Fee calculation | US-S003 |
| P1 (Should) | Auto-release timer | US-S002 |
| P2 (Could) | Provider analytics | US-P004 |
| P2 (Could) | Admin provider management | US-A006 |
| P2 (Could) | Email notifications | BRD Section 9 |

---

## 8. Constraints

1. **Stripe test mode only** — No live mode API keys shall be used
2. **USD currency only** — Multi-currency is out of scope for v1
3. **Express accounts only** — Standard and Custom Stripe accounts are out of scope
4. **Single marketplace** — Multi-tenant (multiple marketplace operators) is out of scope
5. **No file storage** — Evidence files use Stripe File Upload API
6. **Demo application** — Prominent banner required on all pages

---

## 9. Dependencies

| Dependency | Type | Risk |
|------------|------|------|
| Stripe API (test mode) | External service | Low — well-documented, reliable |
| Stripe Connect (Express) | External service | Low — managed onboarding flow |
| PostgreSQL 16 | Infrastructure | Low — mature, well-supported |
| Redis | Infrastructure | Low — mature, BullMQ requires it |
| Stripe Webhooks | External integration | Medium — requires public URL for testing |

---

## 10. Glossary

| Term | Definition |
|------|-----------|
| Payment hold | Funds charged to buyer and held (not transferred) until conditions met |
| Conditional release | Transfer of held funds to provider upon delivery confirmation |
| Connected account | Stripe Express account created for a provider to receive payouts |
| Platform fee | Percentage of transaction amount retained by the marketplace |
| Auto-release | Automatic fund release after configurable hold period expires |
| Dispute | Buyer-initiated challenge to a held payment |
| State transition | Change in transaction status (e.g., HELD → RELEASED) |
| Idempotency key | Unique identifier preventing duplicate processing of events |
| GMV | Gross Merchandise Value — total transaction volume |
| RLS | Row-Level Security — PostgreSQL feature for tenant data isolation |
