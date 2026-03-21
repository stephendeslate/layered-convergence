# Product Requirements Document (PRD)

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

## 1. Overview

This document defines the functional requirements for the Escrow Marketplace
conditional payment platform. Every requirement traces to a business rule
(§BRD) or persona (§PVD Section 3). Requirements are organized by functional
domain and include user stories with acceptance criteria.

---

## 2. Functional Requirements

### 2.1 User Management (FR-100 Series)

| ID      | Requirement                                                    | Traces To    |
|---------|----------------------------------------------------------------|--------------|
| FR-101  | System SHALL support user registration with email and password | §PVD 3.1-3.2|
| FR-102  | System SHALL assign a role (BUYER, PROVIDER, ADMIN) at registration | §PVD 3.1-3.3 |
| FR-103  | System SHALL authenticate users via JWT tokens                 | §SRS-4 2     |
| FR-104  | System SHALL support password reset via email                  | §PVD 3.1-3.2|
| FR-105  | System SHALL display user profile with role-specific information | §PVD 3.1-3.3 |
| FR-106  | System SHALL enforce email verification before payment actions | §BR-05       |
| FR-107  | Users SHALL be able to update their display name and email     | §PVD 3.1-3.2|

**User Story US-101:** As a new user, I want to register with my email so that
I can access the marketplace.

*Acceptance Criteria:*
- Given a valid email and password (min 8 chars, 1 uppercase, 1 number)
- When I submit the registration form
- Then my account is created, a verification email is sent, and I am redirected to the dashboard
- And I cannot create payment holds until email is verified

**User Story US-102:** As a user, I want to choose my role during registration
so that I see the correct dashboard.

*Acceptance Criteria:*
- Given I am on the registration page
- When I select BUYER or PROVIDER role
- Then my dashboard shows role-appropriate features after login

---

### 2.2 Provider Onboarding (FR-200 Series)

| ID      | Requirement                                                    | Traces To    |
|---------|----------------------------------------------------------------|--------------|
| FR-201  | System SHALL redirect providers to Stripe Connect Express onboarding | §BR-27 |
| FR-202  | System SHALL track onboarding status (NOT_STARTED, PENDING, COMPLETE, RESTRICTED) | §BR-28 |
| FR-203  | System SHALL update onboarding status from Stripe webhooks     | §BR-28       |
| FR-204  | System SHALL show onboarding progress banner for incomplete providers | §BR-29 |
| FR-205  | System SHALL block provider from receiving transfers until onboarding is complete | §BR-27 |
| FR-206  | System SHALL provide a "Complete Onboarding" button generating a fresh Stripe account link | §BR-27 |

**User Story US-201:** As a provider, I want to complete Stripe onboarding so
that I can receive payments.

*Acceptance Criteria:*
- Given I am a registered provider with status NOT_STARTED
- When I click "Start Onboarding"
- Then I am redirected to Stripe's hosted onboarding flow
- And upon completion, my status updates to COMPLETE via webhook
- And I can now appear in provider listings

**User Story US-202:** As a provider with incomplete onboarding, I want to see
a clear prompt so that I know what action to take.

*Acceptance Criteria:*
- Given my onboarding status is PENDING or RESTRICTED
- When I view my dashboard
- Then a prominent banner shows my onboarding status and a "Complete Onboarding" button

---

### 2.3 Payment Creation (FR-300 Series)

| ID      | Requirement                                                    | Traces To    |
|---------|----------------------------------------------------------------|--------------|
| FR-301  | Buyer SHALL create a payment hold by specifying amount, provider, and description | §BR-01, §BR-06 |
| FR-302  | System SHALL validate amount within $5.00 - $10,000.00 range  | §BR-02, §BR-03 |
| FR-303  | System SHALL create a Stripe PaymentIntent with `capture_method: manual` | §BR-01 |
| FR-304  | System SHALL present Stripe Elements payment form for card input | §BRD 5.1 |
| FR-305  | System SHALL create a Transaction record in CREATED state      | §BR-35       |
| FR-306  | System SHALL display real-time payment status to buyer         | §PVD 2.1     |
| FR-307  | System SHALL enforce USD currency only                         | §BR-07       |

**User Story US-301:** As a buyer, I want to create a payment hold for a
provider so that my funds are protected until delivery.

*Acceptance Criteria:*
- Given I am an authenticated buyer with a verified email
- When I fill in provider, amount ($50.00), and description, then submit payment
- Then a PaymentIntent is created with capture_method: manual
- And a Transaction record is created in CREATED state
- And I see the transaction in my dashboard with status "Payment Held"

**User Story US-302:** As a buyer, I want to see my payment form use Stripe
Elements so that my card details never touch the platform.

*Acceptance Criteria:*
- Given I am on the payment creation page
- When the form loads
- Then card input fields are rendered inside a Stripe Elements iframe
- And no card data is submitted to the platform server

---

### 2.4 Payment Hold (FR-400 Series)

| ID      | Requirement                                                    | Traces To    |
|---------|----------------------------------------------------------------|--------------|
| FR-401  | System SHALL transition transaction to PAYMENT_HELD when PaymentIntent is confirmed | §BR-01 |
| FR-402  | System SHALL notify provider of incoming payment hold          | §SRS-4 3     |
| FR-403  | System SHALL display hold amount, buyer, and description to provider | §PVD 3.2 |
| FR-404  | System SHALL show hold expiry countdown (7 days from creation) | §BR-04       |
| FR-405  | System SHALL transition to EXPIRED if hold is not captured within 7 days | §BR-04 |

**User Story US-401:** As a provider, I want to be notified when a buyer
creates a payment hold so that I can begin service delivery.

*Acceptance Criteria:*
- Given a buyer has created a payment hold naming me as provider
- When the PaymentIntent is confirmed
- Then I receive an email notification with hold amount and description
- And the transaction appears in my dashboard

---

### 2.5 Delivery Confirmation (FR-500 Series)

| ID      | Requirement                                                    | Traces To    |
|---------|----------------------------------------------------------------|--------------|
| FR-501  | Provider SHALL mark a transaction as "delivered"               | §BR-14       |
| FR-502  | System SHALL transition transaction to DELIVERED state         | §BR-14       |
| FR-503  | System SHALL notify buyer of delivery claim                    | §SRS-4 3     |
| FR-504  | System SHALL start 72-hour auto-release timer on delivery      | §BR-15       |
| FR-505  | Buyer SHALL confirm delivery to trigger immediate fund release | §BR-13       |
| FR-506  | System SHALL display auto-release countdown to both parties    | §BR-15       |

**User Story US-501:** As a provider, I want to mark delivery complete so that
the auto-release timer starts.

*Acceptance Criteria:*
- Given my transaction is in PAYMENT_HELD state
- When I click "Mark as Delivered"
- Then the transaction moves to DELIVERED state
- And the buyer receives a notification
- And a 72-hour auto-release timer begins

**User Story US-502:** As a buyer, I want to confirm delivery so that the
provider receives payment immediately.

*Acceptance Criteria:*
- Given the transaction is in DELIVERED state
- When I click "Confirm Delivery"
- Then funds are released to the provider (minus platform fee)
- And the transaction moves to RELEASED state

---

### 2.6 Fund Release (FR-600 Series)

| ID      | Requirement                                                    | Traces To    |
|---------|----------------------------------------------------------------|--------------|
| FR-601  | System SHALL create a Stripe Transfer on fund release          | §BR-17       |
| FR-602  | System SHALL deduct platform fee from transfer amount          | §BR-08, §BR-09 |
| FR-603  | System SHALL transition transaction to RELEASED state          | §BR-35       |
| FR-604  | System SHALL notify both parties of fund release               | §SRS-4 3     |
| FR-605  | Auto-release SHALL trigger if no dispute within 72 hours of delivery | §BR-15 |
| FR-606  | System SHALL log transfer ID from Stripe on the transaction    | §BR-35       |

**User Story US-601:** As a provider, I want funds released automatically after
72 hours so that I do not depend on buyer action.

*Acceptance Criteria:*
- Given the transaction is in DELIVERED state for 72 hours
- And no dispute has been filed
- When the auto-release timer fires
- Then a Stripe Transfer is created for (amount - platform fee)
- And the transaction moves to RELEASED state
- And both parties are notified

---

### 2.7 Dispute Management (FR-700 Series)

| ID      | Requirement                                                    | Traces To    |
|---------|----------------------------------------------------------------|--------------|
| FR-701  | Buyer SHALL create a dispute on PAYMENT_HELD or DELIVERED transactions | §BR-19, §BR-20 |
| FR-702  | System SHALL require reason category and description for disputes | §BR-21 |
| FR-703  | System SHALL cancel auto-release timer on dispute creation     | §BR-16       |
| FR-704  | System SHALL transition transaction to DISPUTED state          | §BR-35       |
| FR-705  | Both parties SHALL submit evidence (text and file uploads)     | §BR-23       |
| FR-706  | Admin SHALL view dispute queue sorted by age and amount        | §PVD 3.3     |
| FR-707  | Admin SHALL resolve disputes with: release, refund, or escalate | §BR-24      |
| FR-708  | System SHALL execute resolution action (transfer or refund)    | §BR-24       |
| FR-709  | Resolved disputes SHALL be final and immutable                 | §BR-25       |
| FR-710  | System SHALL notify both parties of dispute resolution         | §SRS-4 3     |

**User Story US-701:** As a buyer, I want to raise a dispute when service is
unsatisfactory so that I can get my money back.

*Acceptance Criteria:*
- Given the transaction is in DELIVERED state
- When I select a reason category and describe the issue
- Then a Dispute record is created
- And the auto-release timer is cancelled
- And the transaction moves to DISPUTED state
- And the admin is notified of the new dispute

**User Story US-702:** As an admin, I want to review dispute evidence and take
action so that disputes are resolved fairly.

*Acceptance Criteria:*
- Given a dispute is in OPEN status
- When I review evidence from both parties
- Then I can choose: Release (transfer to provider), Refund (refund to buyer), or Escalate
- And the chosen action is executed immediately
- And both parties are notified of the outcome

---

### 2.8 Payout Management (FR-800 Series)

| ID      | Requirement                                                    | Traces To    |
|---------|----------------------------------------------------------------|--------------|
| FR-801  | System SHALL track payout status via Stripe webhooks           | §BR-33       |
| FR-802  | Provider SHALL view payout history in their dashboard          | §PVD 3.2     |
| FR-803  | System SHALL transition transaction to PAID_OUT on successful payout | §BR-33  |
| FR-804  | System SHALL notify provider of successful payout              | §SRS-4 3     |
| FR-805  | System SHALL surface payout failures to provider and admin     | §BR-34       |
| FR-806  | Admin SHALL trigger manual payouts when needed                 | §BR-32       |

**User Story US-801:** As a provider, I want to see my payout history so that
I can track my earnings.

*Acceptance Criteria:*
- Given I have transactions in RELEASED or PAID_OUT state
- When I view my payout history page
- Then I see a list of payouts with amount, status, and date
- And each payout links to the associated transaction

---

### 2.9 Transaction Analytics (FR-900 Series)

| ID      | Requirement                                                    | Traces To    |
|---------|----------------------------------------------------------------|--------------|
| FR-901  | Buyer SHALL view transaction history with status filters       | §PVD 3.1     |
| FR-902  | Provider SHALL view earnings summary and transaction history   | §PVD 3.2     |
| FR-903  | Admin SHALL view platform-wide transaction analytics           | §PVD 3.3     |
| FR-904  | System SHALL display transaction volume and value over time    | §PVD 5.1     |
| FR-905  | System SHALL display dispute rate and resolution statistics    | §PVD 5.1     |
| FR-906  | System SHALL display platform fee revenue over time            | §PVD 5.1     |

**User Story US-901:** As an admin, I want to see platform analytics so that
I can monitor business health.

*Acceptance Criteria:*
- Given I am on the admin analytics dashboard
- When the page loads
- Then I see: total transaction volume, total value, dispute rate, average resolution time, and fee revenue
- And I can filter by date range

---

### 2.10 Admin Dashboard (FR-1000 Series)

| ID      | Requirement                                                    | Traces To    |
|---------|----------------------------------------------------------------|--------------|
| FR-1001 | Admin SHALL access a dedicated admin dashboard                 | §PVD 3.3     |
| FR-1002 | Admin dashboard SHALL show pending dispute count and queue     | §PVD 3.3     |
| FR-1003 | Admin SHALL view any transaction's full state history timeline | §BR-35       |
| FR-1004 | Admin SHALL search transactions by ID, buyer, provider, or status | §PVD 3.3  |
| FR-1005 | Admin SHALL view provider onboarding status list               | §BR-28       |
| FR-1006 | Admin dashboard SHALL show platform health metrics             | §PVD 5.2     |
| FR-1007 | Admin SHALL view webhook processing logs and error rates       | §BRD 3.2     |

**User Story US-1001:** As an admin, I want to search transactions so that I
can investigate issues quickly.

*Acceptance Criteria:*
- Given I am on the admin dashboard
- When I enter a transaction ID, buyer email, provider email, or status filter
- Then matching transactions are displayed with key details
- And I can click any transaction to view its full state history timeline

---

## 3. Requirement Traceability Matrix

| Functional Domain        | FR Range    | Business Rules              | Personas      |
|--------------------------|-------------|-----------------------------|---------------|
| User Management          | FR-101–107  | BR-05                       | Buyer, Provider |
| Provider Onboarding      | FR-201–206  | BR-27, BR-28, BR-29, BR-30 | Provider      |
| Payment Creation         | FR-301–307  | BR-01–07                    | Buyer         |
| Payment Hold             | FR-401–405  | BR-01, BR-04                | Buyer, Provider |
| Delivery Confirmation    | FR-501–506  | BR-13, BR-14, BR-15        | Buyer, Provider |
| Fund Release             | FR-601–606  | BR-08, BR-09, BR-15, BR-17 | Provider      |
| Dispute Management       | FR-701–710  | BR-19–26                    | Buyer, Provider, Admin |
| Payout Management        | FR-801–806  | BR-31–34                    | Provider, Admin |
| Transaction Analytics    | FR-901–906  | —                           | Buyer, Provider, Admin |
| Admin Dashboard          | FR-1001–1007| BR-35                       | Admin         |

---

## 4. Non-Functional Requirements Summary

Detailed NFRs are specified in §SRS-1 Section 6 and §SRS-4. Key constraints:

| Category       | Requirement                                           |
|----------------|-------------------------------------------------------|
| Performance    | Payment API endpoints < 500ms p95 latency             |
| Availability   | 99.9% uptime target                                   |
| Security       | PCI SAQ-A compliance; JWT auth; RLS on all queries    |
| Scalability    | Support 1,000 concurrent transactions                 |
| Auditability   | Full state history for every transaction              |

---

## 5. Out of Scope

The following are explicitly excluded from this release:

- Multi-currency support
- Milestone / partial payment releases
- Recurring payment holds
- Mobile native applications
- Real-time messaging between parties
- Automated fraud detection
- White-label SDK
- Production fund processing

---

## 6. Document References

| Document    | Section  | Relationship                                     |
|-------------|----------|--------------------------------------------------|
| §PVD        | 3        | Personas driving user stories                    |
| §BRD        | 2        | Business rules traced by FRs                     |
| §SRS-1      | All      | Architecture implementing FRs                    |
| §SRS-2      | All      | Data model supporting FRs                        |
| §SRS-3      | All      | Domain logic for FR behavior                     |
| §SRS-4      | All      | Security and communication for FRs               |
| §WIREFRAMES | All      | UI designs for user stories                      |

---

*End of PRD — Escrow Marketplace v1.0*
