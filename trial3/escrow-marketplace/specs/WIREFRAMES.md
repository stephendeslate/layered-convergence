# Wireframes — Escrow Marketplace

**Version:** 1.0 | **Date:** 2026-03-20

---

## 1. Buyer Portal — Transaction List

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠ Demo Application — No real funds are processed            │
├─────────────────────────────────────────────────────────────┤
│ [Logo] Marketplace          [John Doe (Buyer)] [Logout]     │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                   │
│ My       │  My Transactions                                  │
│ Trans-   │                                                   │
│ actions  │  ┌────────────────────────────────────────────┐   │
│          │  │ #TX-001  Web Design Services    $2,500     │   │
│ Create   │  │ Provider: Jane Smith                       │   │
│ Payment  │  │ Status: 🟡 HELD  (releases Mar 25)        │   │
│          │  │ [View] [Release Funds] [Raise Dispute]     │   │
│ Disputes │  ├────────────────────────────────────────────┤   │
│          │  │ #TX-002  Logo Design             $800      │   │
│          │  │ Provider: Bob Wilson                        │   │
│          │  │ Status: ✅ PAID                             │   │
│          │  │ [View]                                      │   │
│          │  ├────────────────────────────────────────────┤   │
│          │  │ #TX-003  Content Writing          $450     │   │
│          │  │ Provider: Alice Brown                       │   │
│          │  │ Status: 🔴 DISPUTED                        │   │
│          │  │ [View] [View Dispute]                       │   │
│          │  └────────────────────────────────────────────┘   │
│          │                                                   │
│          │  [+ Create New Payment]                           │
└──────────┴──────────────────────────────────────────────────┘
```

## 2. Create Payment

```
┌──────────────────────────────────────┐
│  Create Payment                 [✕]  │
│                                      │
│  Provider:    [Jane Smith      ▾]    │
│  Amount:      [$] [2500.00]          │
│  Currency:    [USD             ▾]    │
│  Description: [Web design for...]    │
│                                      │
│  Hold Period: [14] days              │
│  Platform Fee: $125.00 (5%)          │
│  Provider Receives: $2,375.00        │
│                                      │
│  [Cancel]           [Create Payment] │
└──────────────────────────────────────┘
```

## 3. Transaction Timeline

```
┌─────────────────────────────────────────────────────────────┐
│ Transaction #TX-001                                          │
│ Web Design Services — $2,500.00                             │
│                                                              │
│ Timeline:                                                    │
│ ──●── Mar 10, 09:00  CREATED                                │
│   │   Payment initiated by John Doe                         │
│ ──●── Mar 10, 09:01  PAYMENT_PENDING                        │
│   │   Stripe PaymentIntent created                          │
│ ──●── Mar 10, 09:02  HELD                                   │
│   │   Payment confirmed. Funds held until Mar 25            │
│ ──○── Mar 25         Auto-release scheduled                  │
│                                                              │
│ Provider: Jane Smith          Platform Fee: $125.00          │
│ Hold Until: Mar 25, 2026      Provider Receives: $2,375.00  │
│                                                              │
│ [Release Funds Now]  [Raise Dispute]                         │
└─────────────────────────────────────────────────────────────┘
```

## 4. Dispute Resolution (Admin)

```
┌─────────────────────────────────────────────────────────────┐
│ Dispute #D-001                                               │
│ Transaction: #TX-003 — Content Writing — $450.00             │
│                                                              │
│ Raised By: John Doe (Buyer) on Mar 15                       │
│ Reason: Service not delivered as described                   │
│                                                              │
│ Evidence:                                                    │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ [Buyer] Mar 15: "Content was plagiarized. Attached    │   │
│ │ comparison showing 80% match with existing article."  │   │
│ ├───────────────────────────────────────────────────────┤   │
│ │ [Provider] Mar 16: "Content is original. The match    │   │
│ │ is due to common industry terminology."               │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                              │
│ Resolution:                                                  │
│ [Resolve: Buyer Favor] [Resolve: Provider Favor] [Escalate] │
│                                                              │
│ Notes: [Enter resolution reasoning...]                       │
└─────────────────────────────────────────────────────────────┘
```

## 5. Provider Portal — Payouts

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠ Demo Application — No real funds are processed            │
├─────────────────────────────────────────────────────────────┤
│ [Logo] Marketplace        [Jane Smith (Provider)] [Logout]  │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                   │
│ Incoming │  Payout History                                   │
│ Payments │                                                   │
│          │  Total Earned: $8,450.00                          │
│ Payouts  │  Pending: $2,375.00                               │
│          │                                                   │
│ Account  │  Date        Amount    Status     Transaction     │
│ Settings │  Mar 8       $3,800    ✅ Paid    #TX-005         │
│          │  Mar 1       $2,275    ✅ Paid    #TX-004         │
│          │  Feb 22      $2,375    🔄 Pending #TX-001        │
│          │                                                   │
│          │  Stripe Account: ✅ Active                        │
│          │  [View Account Details]                           │
└──────────┴──────────────────────────────────────────────────┘
```

## 6. Admin Analytics Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ Platform Analytics                                           │
│                                                              │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │ $45,200  │ │ $2,260   │ │ 3.2%     │ │ 142      │       │
│ │ Volume   │ │ Fees     │ │ Dispute  │ │ Trans-   │       │
│ │ ▲ +15%   │ │ ▲ +15%   │ │ Rate     │ │ actions  │       │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│ ┌─────────────────────────────────────────┐                 │
│ │  Transaction Volume (30 days)            │                 │
│ │  ████                                    │                 │
│ │  ████ ████                              │                 │
│ │  ████ ████ ████ ████                    │                 │
│ │  ████ ████ ████ ████ ████              │                 │
│ │  W1   W2   W3   W4   W5               │                 │
│ └─────────────────────────────────────────┘                 │
│                                                              │
│ Status Breakdown:                                            │
│ ████████████████░░░░ HELD (62%) PAID (25%) DISPUTED (8%)   │
└─────────────────────────────────────────────────────────────┘
```

## 7. Provider Onboarding

```
┌─────────────────────────────────────────────────────────────┐
│ Provider Onboarding                                          │
│                                                              │
│ Step 1: ✅ Account Created                                   │
│ Step 2: 🔄 Stripe Verification                               │
│ Step 3: ○  Ready to Receive Payments                        │
│                                                              │
│ Complete your Stripe account setup to start receiving        │
│ payments from buyers.                                        │
│                                                              │
│ [Continue Stripe Onboarding →]                               │
│                                                              │
│ Your Stripe Account ID: acct_test_abc123                    │
│ Charges Enabled: No                                          │
│ Payouts Enabled: No                                          │
└─────────────────────────────────────────────────────────────┘
```

## 8. Page Map

| Page | Route | Auth |
|------|-------|------|
| Login | /login | None |
| Register | /register | None |
| Buyer Transactions | /buyer/transactions | JWT (BUYER) |
| Create Payment | /buyer/transactions/new | JWT (BUYER) |
| Transaction Detail | /transactions/:id | JWT (BUYER/PROVIDER) |
| Provider Payments | /provider/payments | JWT (PROVIDER) |
| Provider Payouts | /provider/payouts | JWT (PROVIDER) |
| Provider Onboarding | /provider/onboarding | JWT (PROVIDER) |
| Admin Dashboard | /admin | JWT (ADMIN) |
| Admin Disputes | /admin/disputes | JWT (ADMIN) |
| Dispute Detail | /admin/disputes/:id | JWT (ADMIN) |
