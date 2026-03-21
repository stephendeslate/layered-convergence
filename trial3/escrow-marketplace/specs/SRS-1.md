# Software Requirements Specification — Part 1: API Contracts
# Escrow Marketplace

**Version:** 1.0 | **Date:** 2026-03-20

---

## 1. API Endpoints

### 1.1 Authentication

```
POST   /api/auth/register              — Register user (buyer or provider)
POST   /api/auth/login                 — Login, returns JWT
GET    /api/auth/me                    — Get current user profile
```

### 1.2 Provider Onboarding (Stripe Connect)

```
POST   /api/providers/onboarding/start         — Create Stripe Express account, return onboarding URL
GET    /api/providers/onboarding/status         — Get onboarding status
GET    /api/providers/onboarding/refresh        — Get new onboarding link if expired
GET    /api/providers/account                   — Get connected account details
```

### 1.3 Transactions

```
POST   /api/transactions                        — Create transaction (buyer)
GET    /api/transactions                        — List transactions (scoped by role)
GET    /api/transactions/stats                  — Transaction statistics (admin)
GET    /api/transactions/:id                    — Get transaction detail
GET    /api/transactions/:id/timeline           — Get state history timeline
POST   /api/transactions/:id/release            — Release held funds (buyer)
POST   /api/transactions/:id/cancel             — Cancel transaction (buyer, before payment)
```

### 1.4 Disputes

```
POST   /api/transactions/:id/disputes           — Raise dispute (buyer)
GET    /api/disputes                             — List disputes (admin)
GET    /api/disputes/:id                         — Get dispute detail
POST   /api/disputes/:id/evidence               — Submit evidence (buyer or provider)
POST   /api/disputes/:id/resolve                — Resolve dispute (admin)
```

### 1.5 Payouts

```
GET    /api/providers/payouts                   — List payouts (provider)
GET    /api/providers/payouts/:id               — Get payout detail
```

### 1.6 Webhooks

```
POST   /api/webhooks/stripe                     — Stripe webhook receiver
```

### 1.7 Admin

```
GET    /api/admin/transactions                  — All transactions (admin)
GET    /api/admin/analytics                     — Platform analytics
GET    /api/admin/disputes                      — All disputes with resolution status
```

## 2. Request/Response Schemas

### Create Transaction
```json
// POST /api/transactions
{
  "providerId": "uuid",
  "amount": 10000,
  "currency": "usd",
  "description": "Web development services",
  "holdDays": 14
}
// Response: 201
{
  "id": "uuid",
  "buyerId": "uuid",
  "providerId": "uuid",
  "amount": 10000,
  "currency": "usd",
  "status": "CREATED",
  "platformFee": 500,
  "holdUntil": "ISO8601",
  "createdAt": "ISO8601"
}
```

### Raise Dispute
```json
// POST /api/transactions/:id/disputes
{
  "reason": "Service not delivered as described",
  "description": "Detailed explanation..."
}
// Response: 201
{
  "id": "uuid",
  "transactionId": "uuid",
  "raisedBy": "uuid",
  "reason": "string",
  "status": "OPEN",
  "createdAt": "ISO8601"
}
```

### Resolve Dispute
```json
// POST /api/disputes/:id/resolve
{
  "resolution": "BUYER_FAVOR | PROVIDER_FAVOR | ESCALATED",
  "notes": "Resolution reasoning..."
}
```

## 3. Transaction State Transitions

```
CREATED → PAYMENT_PENDING (on payment intent creation)
PAYMENT_PENDING → HELD (on payment_intent.succeeded webhook)
HELD → RELEASED (buyer confirms delivery)
HELD → DISPUTED (buyer raises dispute)
HELD → EXPIRED (auto-release timer fires)
EXPIRED → RELEASED (auto-transition)
RELEASED → TRANSFER_PENDING (platform creates transfer)
TRANSFER_PENDING → TRANSFERRED (transfer.created webhook)
TRANSFERRED → PAYOUT_PENDING (payout initiated)
PAYOUT_PENDING → PAID (payout.paid webhook)
DISPUTED → RESOLVED_BUYER (admin resolves for buyer)
DISPUTED → RESOLVED_PROVIDER (admin resolves for provider)
RESOLVED_BUYER → REFUND_PENDING (refund initiated)
REFUND_PENDING → REFUNDED (refund completed)
RESOLVED_PROVIDER → RELEASED (funds released to provider)
```

## 4. Authentication & Authorization

| Role | Accessible Endpoints |
|------|---------------------|
| BUYER | Create transactions, view own transactions, release, dispute |
| PROVIDER | View incoming transactions, payouts, onboarding |
| ADMIN | All endpoints, dispute resolution, analytics |

## 5. Error Responses

All tenant-scoped lookups use `findFirstOrThrow` — cross-user access returns 404.
Invalid state transitions return 400 with descriptive error message.
