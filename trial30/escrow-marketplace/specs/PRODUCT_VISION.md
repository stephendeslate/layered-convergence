# Product Vision — Escrow Marketplace

## Overview
Escrow Marketplace is a secure payment platform that holds funds in escrow during
buyer-seller transactions. See DATA_MODEL.md for entity definitions and
SYSTEM_ARCHITECTURE.md for technical implementation details.

## Problem Statement
Online transactions between strangers lack trust. Buyers worry about paying
for goods or services never delivered. Sellers worry about chargebacks after
delivering work. Escrow Marketplace solves this by holding funds securely
until both parties confirm satisfaction, with dispute resolution through
designated arbiters.

## Target Users
- **Buyers** — purchase goods or services with payment protection
- **Sellers** — deliver work with guaranteed payment upon completion
- **Arbiters** — mediate disputes and authorize fund releases or refunds
- **Platform Admins** — manage users, review escalated disputes, system config

## Core Capabilities
1. Secure fund escrow with transaction lifecycle management
2. Dispute filing and resolution with arbiter mediation (see SECURITY_MODEL.md)
3. Payout processing via bank transfer and PayPal
4. Webhook notifications for transaction state changes
5. Multi-currency support (USD, EUR, GBP)
6. Row Level Security for data isolation

## Entity Overview
<!-- VERIFY:EM-TRANSACTION-FSM — Transaction entity with TransactionStatus enum -->
Transactions follow a state machine: PENDING -> FUNDED -> RELEASED or DISPUTED.
Disputed transactions can be RELEASED or REFUNDED after resolution.

<!-- VERIFY:EM-DISPUTE-FSM — Dispute entity with DisputeStatus enum -->
Disputes follow: OPEN -> UNDER_REVIEW -> RESOLVED or ESCALATED -> RESOLVED.
Only valid transitions are allowed (see API_CONTRACT.md for endpoint details).

<!-- VERIFY:EM-ROLES — UserRole enum with 4 roles -->
Users have roles: BUYER, SELLER, ARBITER, ADMIN. Self-registration excludes
the ADMIN role for security (see SECURITY_MODEL.md for enforcement details).

<!-- VERIFY:EM-PAYOUT-MODEL — Payout entity with method and reference -->
Payouts track fund disbursements with method (bank_transfer, paypal) and
unique reference codes for audit trails.

<!-- VERIFY:EM-WEBHOOK-MODEL — Webhook entity with event and payload -->
Webhooks deliver real-time notifications for transaction events with
JSON payloads and delivery tracking.

## Technical Stack
<!-- VERIFY:EM-TECH-STACK — NestJS + Next.js + PostgreSQL -->
- Backend: NestJS ^11.0.0 with Prisma ^6.0.0 ORM
- Frontend: Next.js ^15.0.0 with Tailwind CSS and shadcn/ui
- Database: PostgreSQL 16 with Row Level Security
- Testing: Jest, Supertest, jest-axe (see TESTING_STRATEGY.md)

## Security Requirements
Security controls are described in SECURITY_MODEL.md. API endpoints are
detailed in API_CONTRACT.md. All authentication uses JWT with bcrypt hashing.
No hardcoded secret fallbacks are permitted in any environment.

## Accessibility Requirements
The UI must comply with WCAG 2.1 AA standards. All interactive components
use proper ARIA attributes. See UI_SPECIFICATION.md for component details
and TESTING_STRATEGY.md for automated accessibility testing.

## Success Metrics
- Sub-second transaction status updates
- Zero unauthorized fund releases verified by state machine validation
- 99.9% uptime for the escrow API with health checks
- WCAG 2.1 AA compliance for all UI components verified by jest-axe
- All transaction and dispute state transitions validated server-side
