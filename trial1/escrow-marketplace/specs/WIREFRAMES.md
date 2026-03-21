# Wireframes

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

## 1. Global Layout

### 1.1 Desktop Layout (>= 1024px)

```
+------------------------------------------------------------------+
| [!] DEMO APPLICATION — No real funds. Stripe test mode.          |
|     Use test card 4242 4242 4242 4242                            |
+------------------------------------------------------------------+
| [Logo] Escrow Marketplace    [Dashboard] [Txns] [User ▾] [Logout]|
+------------------------------------------------------------------+
|                                                                    |
|                      Page Content Area                             |
|                      (max-width: 1280px, centered)                 |
|                                                                    |
+------------------------------------------------------------------+
| Footer: Demo Application — Test data only | Support | Terms      |
+------------------------------------------------------------------+
```

### 1.2 Mobile Layout (< 768px)

```
+----------------------------------+
| [!] DEMO — No real funds         |
+----------------------------------+
| [Logo]            [Hamburger ≡]  |
+----------------------------------+
|                                  |
|    Page Content Area             |
|    (full width, px-4)            |
|                                  |
+----------------------------------+
| Footer: Demo | Terms | Support  |
+----------------------------------+
```

### 1.3 Mobile Navigation (Expanded)

```
+----------------------------------+
| [Logo]                    [X]    |
+----------------------------------+
| Dashboard                        |
| Transactions                     |
| Disputes                         |
| Payouts (Provider)               |
| Settings                         |
|----------------------------------|
| Logged in as: user@test.com      |
| Role: BUYER                      |
| [Logout]                         |
+----------------------------------+
```

### 1.4 Responsive Breakpoints

| Breakpoint | Width     | Layout                              |
|------------|-----------|-------------------------------------|
| Mobile     | < 768px   | Single column, hamburger nav        |
| Tablet     | 768-1023px| Two column where applicable         |
| Desktop    | >= 1024px | Full layout, sidebar on admin pages |

---

## 2. Authentication Pages

### 2.1 Registration Page

```
+------------------------------------------------------------------+
| [!] DEMO APPLICATION — No real funds. Stripe test mode.          |
+------------------------------------------------------------------+
| [Logo] Escrow Marketplace                                        |
+------------------------------------------------------------------+
|                                                                    |
|              +------------------------------------+                |
|              |       Create Your Account          |                |
|              |                                    |                |
|              |  Display Name                      |                |
|              |  [________________________]        |                |
|              |                                    |                |
|              |  Email                             |                |
|              |  [________________________]        |                |
|              |                                    |                |
|              |  Password                          |                |
|              |  [________________________]        |                |
|              |  Min 8 chars, 1 upper, 1 number    |                |
|              |                                    |                |
|              |  I am a:                           |                |
|              |  ( ) Buyer — I purchase services   |                |
|              |  ( ) Provider — I deliver services |                |
|              |                                    |                |
|              |  [     Create Account     ]        |                |
|              |                                    |                |
|              |  Already have an account? Login    |                |
|              +------------------------------------+                |
|                                                                    |
+------------------------------------------------------------------+
```

### 2.2 Login Page

```
+------------------------------------------------------------------+
| [!] DEMO APPLICATION — No real funds. Stripe test mode.          |
+------------------------------------------------------------------+
| [Logo] Escrow Marketplace                                        |
+------------------------------------------------------------------+
|                                                                    |
|              +------------------------------------+                |
|              |         Sign In                    |                |
|              |                                    |                |
|              |  Email                             |                |
|              |  [________________________]        |                |
|              |                                    |                |
|              |  Password                          |                |
|              |  [________________________]        |                |
|              |                                    |                |
|              |  [        Sign In         ]        |                |
|              |                                    |                |
|              |  Forgot password?                  |                |
|              |  Don't have an account? Register   |                |
|              +------------------------------------+                |
|                                                                    |
|              Test Accounts:                                        |
|              buyer@test.com / TestBuyer123                         |
|              provider@test.com / TestProvider123                    |
|              admin@test.com / TestAdmin123                          |
|                                                                    |
+------------------------------------------------------------------+
```

---

## 3. Buyer Dashboard

### 3.1 Buyer Dashboard — Overview

```
+------------------------------------------------------------------+
| [!] DEMO APPLICATION — No real funds. Stripe test mode.          |
+------------------------------------------------------------------+
| [Logo] Escrow Marketplace    [Dashboard] [Txns] [User ▾] [Logout]|
+------------------------------------------------------------------+
|                                                                    |
|  Welcome, Test Buyer                                    Role: BUYER|
|                                                                    |
|  +------------------+ +------------------+ +------------------+   |
|  | Active Holds     | | Completed        | | In Dispute       |   |
|  |       3          | |       12         | |       1          |   |
|  | $450.00 held     | | $2,340.00 total  | | $200.00          |   |
|  +------------------+ +------------------+ +------------------+   |
|                                                                    |
|  [+ Create New Payment Hold]                                       |
|                                                                    |
|  Recent Transactions                                    [View All] |
|  +--------------------------------------------------------------+ |
|  | ID       | Provider     | Amount  | Status      | Date       | |
|  |----------|-------------|---------|-------------|------------| |
|  | txn_a1   | Jane Smith  | $150.00 | PAYMENT_HELD| Mar 19     | |
|  | txn_a2   | Bob Jones   | $200.00 | DELIVERED   | Mar 18     | |
|  | txn_a3   | Alice Lee   | $100.00 | DISPUTED    | Mar 17     | |
|  | txn_a4   | Jane Smith  | $500.00 | RELEASED    | Mar 15     | |
|  | txn_a5   | Bob Jones   | $340.00 | PAID_OUT    | Mar 12     | |
|  +--------------------------------------------------------------+ |
|                                                                    |
+------------------------------------------------------------------+
```

### 3.2 Buyer — Create Payment Hold

```
+------------------------------------------------------------------+
| [!] DEMO APPLICATION — No real funds. Stripe test mode.          |
+------------------------------------------------------------------+
| [Logo] Escrow Marketplace    [Dashboard] [Txns] [User ▾] [Logout]|
+------------------------------------------------------------------+
|                                                                    |
|  < Back to Dashboard                                               |
|                                                                    |
|  Create Payment Hold                                               |
|  ================================================================  |
|                                                                    |
|  Select Provider                                                   |
|  [  Search providers...               ▾]                           |
|                                                                    |
|  +--------------------------------------+                          |
|  | Jane Smith — Web Development          |                          |
|  | Bob Jones — Graphic Design            |                          |
|  | Alice Lee — Content Writing            |                          |
|  +--------------------------------------+                          |
|                                                                    |
|  Amount (USD)                                                      |
|  $ [________]                                                      |
|  Min: $5.00 — Max: $10,000.00                                      |
|                                                                    |
|  Description                                                       |
|  +--------------------------------------+                          |
|  | Describe the service being           |                          |
|  | purchased...                         |                          |
|  +--------------------------------------+                          |
|                                                                    |
|  Fee Breakdown:                                                    |
|  +--------------------------------------+                          |
|  | Service amount:     $100.00          |                          |
|  | Platform fee (10%): $10.00           |                          |
|  | Provider receives:  $90.00           |                          |
|  | You pay:            $100.00          |                          |
|  +--------------------------------------+                          |
|                                                                    |
|  Payment Details                                                   |
|  +--------------------------------------+                          |
|  |  [Stripe Elements Payment Form]      |                          |
|  |  Card number: 4242 4242 4242 4242    |                          |
|  |  Expiry: 12/28    CVC: 123          |                          |
|  +--------------------------------------+                          |
|  Test cards: 4242...4242 (success)                                 |
|              4000...0002 (decline)                                  |
|                                                                    |
|  [    Create Payment Hold    ]                                     |
|                                                                    |
+------------------------------------------------------------------+
```

### 3.3 Buyer — Raise Dispute

```
+------------------------------------------------------------------+
| [!] DEMO APPLICATION — No real funds. Stripe test mode.          |
+------------------------------------------------------------------+
| [Logo] Escrow Marketplace    [Dashboard] [Txns] [User ▾] [Logout]|
+------------------------------------------------------------------+
|                                                                    |
|  < Back to Transaction                                             |
|                                                                    |
|  Raise a Dispute — Transaction txn_a2                              |
|  ================================================================  |
|                                                                    |
|  Transaction Details                                               |
|  +--------------------------------------+                          |
|  | Provider:    Bob Jones               |                          |
|  | Amount:      $200.00                 |                          |
|  | Description: Logo design project     |                          |
|  | Delivered:   Mar 18, 2026 3:00 PM    |                          |
|  | Dispute deadline: Mar 21, 3:00 PM    |                          |
|  +--------------------------------------+                          |
|                                                                    |
|  Reason *                                                          |
|  [ Select a reason...                  ▾]                          |
|  +--------------------------------------+                          |
|  | Not Delivered                         |                          |
|  | Not As Described                      |                          |
|  | Quality Issue                         |                          |
|  | Late Delivery                         |                          |
|  | Communication Issue                   |                          |
|  | Other                                 |                          |
|  +--------------------------------------+                          |
|                                                                    |
|  Description *                                                     |
|  +--------------------------------------+                          |
|  | Explain the issue in detail...       |                          |
|  |                                      |                          |
|  |                                      |                          |
|  +--------------------------------------+                          |
|  Max 2,000 characters                                              |
|                                                                    |
|  [!] Filing a dispute will pause the auto-release timer.           |
|  [!] Both parties may submit evidence. An admin will review.       |
|                                                                    |
|  [    Submit Dispute    ]     [Cancel]                              |
|                                                                    |
+------------------------------------------------------------------+
```

---

## 4. Provider Dashboard

### 4.1 Provider Dashboard — Overview

```
+------------------------------------------------------------------+
| [!] DEMO APPLICATION — No real funds. Stripe test mode.          |
+------------------------------------------------------------------+
| [Logo] Escrow Marketplace  [Dashboard] [Payouts] [User ▾] [Logout]|
+------------------------------------------------------------------+
|                                                                    |
|  +--------------------------------------------------------------+ |
|  | [!] Complete your Stripe onboarding to receive payments.      | |
|  |     [Complete Onboarding]                                     | |
|  +--------------------------------------------------------------+ |
|  (shown only if onboarding != COMPLETE)                            |
|                                                                    |
|  Welcome, Test Provider                              Role: PROVIDER|
|                                                                    |
|  +------------------+ +------------------+ +------------------+   |
|  | Incoming Holds   | | Available        | | Total Earned     |   |
|  |       2          | |    $450.00       | |    $3,240.00     |   |
|  | $350.00 pending  | | ready for payout | | all time         |   |
|  +------------------+ +------------------+ +------------------+   |
|                                                                    |
|  Incoming Transactions                                  [View All] |
|  +--------------------------------------------------------------+ |
|  | ID       | Buyer        | Amount  | Status      | Date       | |
|  |----------|-------------|---------|-------------|------------| |
|  | txn_b1   | John Doe    | $200.00 | PAYMENT_HELD| Mar 19     | |
|  |          |             |         | [Mark Delivered]          | |
|  | txn_b2   | Mary Poe    | $150.00 | DELIVERED   | Mar 18     | |
|  |          |             |         | Auto-release: Mar 21     | |
|  | txn_b3   | John Doe    | $500.00 | RELEASED    | Mar 15     | |
|  | txn_b4   | Mary Poe    | $340.00 | PAID_OUT    | Mar 12     | |
|  +--------------------------------------------------------------+ |
|                                                                    |
+------------------------------------------------------------------+
```

### 4.2 Provider — Payout History

```
+------------------------------------------------------------------+
| [!] DEMO APPLICATION — No real funds. Stripe test mode.          |
+------------------------------------------------------------------+
| [Logo] Escrow Marketplace  [Dashboard] [Payouts] [User ▾] [Logout]|
+------------------------------------------------------------------+
|                                                                    |
|  Payout History                                                    |
|  ================================================================  |
|                                                                    |
|  Onboarding Status: COMPLETE [checkmark]                           |
|  Stripe Account: acct_xxxxx                                        |
|                                                                    |
|  +--------------------------------------------------------------+ |
|  | Payout ID  | Amount  | Status     | Transaction | Date       | |
|  |------------|---------|------------|-------------|------------| |
|  | pay_001    | $450.00 | PAID       | txn_b4      | Mar 12     | |
|  | pay_002    | $270.00 | PAID       | txn_b5      | Mar 10     | |
|  | pay_003    | $180.00 | IN_TRANSIT | txn_b3      | Mar 15     | |
|  | pay_004    | $90.00  | FAILED     | txn_b6      | Mar 8      | |
|  |            |         | Reason: Bank account not found          | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  Total Paid Out: $720.00                                           |
|  Pending: $180.00                                                  |
|                                                                    |
|  [1] [2] [3] ... [Next >]                                         |
|                                                                    |
+------------------------------------------------------------------+
```

### 4.3 Provider — Stripe Connect Onboarding

```
+------------------------------------------------------------------+
| [!] DEMO APPLICATION — No real funds. Stripe test mode.          |
+------------------------------------------------------------------+
| [Logo] Escrow Marketplace  [Dashboard] [Payouts] [User ▾] [Logout]|
+------------------------------------------------------------------+
|                                                                    |
|  Provider Onboarding                                               |
|  ================================================================  |
|                                                                    |
|  Step 1: Account Setup                                             |
|  +--------------------------------------+                          |
|  |  To receive payments, you need to    |                          |
|  |  set up a Stripe Express account.    |                          |
|  |                                      |                          |
|  |  This process is hosted by Stripe    |                          |
|  |  and typically takes 2-3 minutes.    |                          |
|  |                                      |                          |
|  |  You will need:                      |                          |
|  |  - Personal identification           |                          |
|  |  - Bank account details              |                          |
|  |  - Business information (if any)     |                          |
|  |                                      |                          |
|  |  [  Start Stripe Onboarding  ]       |                          |
|  +--------------------------------------+                          |
|                                                                    |
|  Onboarding Status                                                 |
|  +--------------------------------------+                          |
|  |  Status: NOT_STARTED                 |                          |
|  |  Charges Enabled: No                 |                          |
|  |  Payouts Enabled: No                 |                          |
|  |  Details Submitted: No               |                          |
|  +--------------------------------------+                          |
|                                                                    |
|  [!] You cannot receive payments until onboarding is complete.     |
|                                                                    |
+------------------------------------------------------------------+
```

---

## 5. Transaction Detail Page

### 5.1 Transaction Detail with Timeline

```
+------------------------------------------------------------------+
| [!] DEMO APPLICATION — No real funds. Stripe test mode.          |
+------------------------------------------------------------------+
| [Logo] Escrow Marketplace    [Dashboard] [Txns] [User ▾] [Logout]|
+------------------------------------------------------------------+
|                                                                    |
|  < Back to Transactions                                            |
|                                                                    |
|  Transaction txn_a2                               Status: DELIVERED|
|  ================================================================  |
|                                                                    |
|  +----------------------------+  +-------------------------------+ |
|  | Details                    |  | Timeline                      | |
|  |                            |  |                               | |
|  | Buyer:     Test Buyer      |  |  [*] CREATED                  | |
|  | Provider:  Bob Jones       |  |  |   Mar 18, 10:00 AM         | |
|  | Amount:    $200.00         |  |  |   by Test Buyer             | |
|  | Fee:       $20.00          |  |  |                             | |
|  | Provider:  $180.00         |  |  [*] PAYMENT_HELD             | |
|  | Currency:  USD             |  |  |   Mar 18, 10:01 AM         | |
|  |                            |  |  |   via Stripe webhook        | |
|  | Description:               |  |  |                             | |
|  | Logo design project for    |  |  [*] DELIVERED                | |
|  | company rebrand.           |  |  |   Mar 18, 3:00 PM          | |
|  |                            |  |  |   by Bob Jones              | |
|  | Created:  Mar 18, 10:00 AM |  |  |                             | |
|  | Held:     Mar 18, 10:01 AM |  |  [ ] RELEASED (pending)       | |
|  | Delivered: Mar 18, 3:00 PM |  |  |   Auto-release:             | |
|  |                            |  |  |   Mar 21, 3:00 PM           | |
|  | Auto-release:              |  |  |   (71h 23m remaining)       | |
|  | Mar 21, 3:00 PM            |  |  |                             | |
|  | (71h 23m remaining)        |  |  [ ] PAID_OUT (pending)       | |
|  +----------------------------+  +-------------------------------+ |
|                                                                    |
|  Actions                                                           |
|  +--------------------------------------------------------------+ |
|  | [  Confirm Delivery  ]     [  Raise Dispute  ]                | |
|  +--------------------------------------------------------------+ |
|  (Buyer sees Confirm + Dispute; Provider sees no actions here)     |
|                                                                    |
|  Stripe References                                                 |
|  +--------------------------------------------------------------+ |
|  | PaymentIntent: pi_xxxxxxxxxxxxx                                | |
|  | Charge:        ch_xxxxxxxxxxxxx                                | |
|  | Transfer:      (pending)                                       | |
|  +--------------------------------------------------------------+ |
|                                                                    |
+------------------------------------------------------------------+
```

---

## 6. Admin Dashboard

### 6.1 Admin Dashboard — Overview

```
+------------------------------------------------------------------+
| [!] DEMO APPLICATION — No real funds. Stripe test mode.          |
+------------------------------------------------------------------+
| [Logo] Escrow Marketplace                               [Logout] |
+--------+---------------------------------------------------------+
| ADMIN  |                                                          |
| NAV    |  Admin Dashboard                                         |
|        |  ========================================================|
| [Dash] |                                                          |
| [Txns] |  +-------------+ +-------------+ +-------------+        |
| [Disp] |  | Total Txns  | | Revenue     | | Disputes    |        |
| [Provs]|  |    156      | |  $4,230.00  | |    7 open   |        |
| [Hooks]|  | this month  | | fees earned | |  12 total   |        |
| [Stats]|  +-------------+ +-------------+ +-------------+        |
|        |                                                          |
|        |  +-------------+ +-------------+ +-------------+        |
|        |  | Providers   | | Webhook Err | | Txn Volume  |        |
|        |  |   23 active | |   0.1%      | |  $45,230    |        |
|        |  |   5 pending | | fail rate   | | this month  |        |
|        |  +-------------+ +-------------+ +-------------+        |
|        |                                                          |
|        |  Open Disputes (requires action)              [View All] |
|        |  +------------------------------------------------------+|
|        |  | ID    | Amount  | Buyer   | Provider | Age  | Action ||
|        |  |-------|---------|---------|----------|------|--------||
|        |  | dsp_1 | $200.00 | J. Doe  | B. Jones | 2d   |[Review]||
|        |  | dsp_2 | $500.00 | M. Poe  | A. Lee   | 1d   |[Review]||
|        |  | dsp_3 | $75.00  | S. Kim  | J. Smith | 4h   |[Review]||
|        |  +------------------------------------------------------+|
|        |                                                          |
+--------+---------------------------------------------------------+
```

### 6.2 Admin — Transaction Search

```
+--------+---------------------------------------------------------+
| ADMIN  |                                                          |
| NAV    |  All Transactions                                        |
|        |  ========================================================|
| [Dash] |                                                          |
| [Txns] |  Search: [_________________________] [Search]            |
| [Disp] |                                                          |
| [Provs]|  Filters:                                                |
| [Hooks]|  Status: [All ▾]  Date: [From] - [To]  Amount: [Min]-[Max]|
| [Stats]|                                                          |
|        |  Results: 156 transactions                                |
|        |  +------------------------------------------------------+|
|        |  | ID     | Buyer    | Provider | Amount  | Status  | Date||
|        |  |--------|----------|----------|---------|---------|----||
|        |  | txn_01 | J. Doe   | B. Jones | $200.00 | HELD    | 3/19||
|        |  | txn_02 | M. Poe   | A. Lee   | $500.00 | DISPUTED| 3/18||
|        |  | txn_03 | S. Kim   | J. Smith | $75.00  | RELEASED| 3/17||
|        |  | txn_04 | J. Doe   | A. Lee   | $1,200  | PAID_OUT| 3/15||
|        |  | txn_05 | M. Poe   | B. Jones | $340.00 | REFUNDED| 3/14||
|        |  +------------------------------------------------------+|
|        |                                                          |
|        |  [< Prev] [1] [2] [3] ... [8] [Next >]                  |
|        |                                                          |
+--------+---------------------------------------------------------+
```

### 6.3 Admin — Platform Analytics

```
+--------+---------------------------------------------------------+
| ADMIN  |                                                          |
| NAV    |  Platform Analytics                                      |
|        |  ========================================================|
| [Dash] |                                                          |
| [Txns] |  Date Range: [Last 30 days ▾]  [Custom: From - To]      |
| [Disp] |                                                          |
| [Provs]|  Transaction Volume                                      |
| [Hooks]|  +------------------------------------------------------+|
| [Stats]|  |  $                                                    ||
|        |  |  5k  .    *                                           ||
|        |  |     . .  * *     *                                    ||
|        |  |  3k *   *   *  * *   *                                ||
|        |  |    *       *  *   * * *  *                            ||
|        |  |  1k                    *  * *                         ||
|        |  |  ---|---|---|---|---|---|---|---|---|---|---|---        ||
|        |  |   Feb 20    Mar 1     Mar 10    Mar 20               ||
|        |  +------------------------------------------------------+|
|        |                                                          |
|        |  Platform Fee Revenue                                    |
|        |  +------------------------------------------------------+|
|        |  |  $                                                    ||
|        |  |  500                                                  ||
|        |  |  400  [====]                                          ||
|        |  |  300  [====] [====]                                   ||
|        |  |  200  [====] [====] [====]                            ||
|        |  |  100  [====] [====] [====] [====]                     ||
|        |  |  ---  Week1  Week2  Week3  Week4                     ||
|        |  +------------------------------------------------------+|
|        |                                                          |
|        |  Key Metrics                                             |
|        |  +------------------+ +------------------+               |
|        |  | Dispute Rate     | | Avg Resolution   |               |
|        |  |     4.2%         | |    36 hours      |               |
|        |  | (target: <5%)    | | (target: <48h)   |               |
|        |  +------------------+ +------------------+               |
|        |  +------------------+ +------------------+               |
|        |  | Auto-Release %   | | Completion Rate  |               |
|        |  |     73%          | |    96.1%         |               |
|        |  | (target: >70%)   | | (target: >95%)   |               |
|        |  +------------------+ +------------------+               |
|        |                                                          |
+--------+---------------------------------------------------------+
```

---

## 7. Dispute Resolution Page (Admin)

### 7.1 Dispute Review Page

```
+--------+---------------------------------------------------------+
| ADMIN  |                                                          |
| NAV    |  Dispute Review — dsp_1                                  |
|        |  ========================================================|
| [Dash] |                                                          |
| [Txns] |  Status: OPEN              Filed: Mar 17, 2:00 PM       |
| [Disp] |  Age: 2 days               Priority: NORMAL             |
| [Provs]|                                                          |
| [Hooks]|  Transaction Details                                     |
| [Stats]|  +------------------------------------------------------+|
|        |  | ID:          txn_a3                                   ||
|        |  | Amount:      $200.00                                  ||
|        |  | Buyer:       John Doe (buyer@test.com)                ||
|        |  | Provider:    Bob Jones (provider@test.com)            ||
|        |  | Description: Logo design project                     ||
|        |  | Created:     Mar 15, 10:00 AM                        ||
|        |  | Delivered:   Mar 17, 11:00 AM                        ||
|        |  | Disputed:    Mar 17, 2:00 PM                         ||
|        |  +------------------------------------------------------+|
|        |                                                          |
|        |  Dispute Details                                         |
|        |  +------------------------------------------------------+|
|        |  | Reason:      NOT_AS_DESCRIBED                         ||
|        |  | Description: The logo does not match the agreed      ||
|        |  |              specifications. Colors are wrong and    ||
|        |  |              the font is different from mockups.     ||
|        |  +------------------------------------------------------+|
|        |                                                          |
|        |  Evidence                                                |
|        |  +------------------------------------------------------+|
|        |  | [Buyer] Mar 17, 2:05 PM                              ||
|        |  | Attached: original_mockup.png (2.1 MB)               ||
|        |  | "Here is the original agreed mockup. Compare with    ||
|        |  |  the delivered file."                                ||
|        |  |------------------------------------------------------||
|        |  | [Provider] Mar 17, 4:30 PM                           ||
|        |  | Attached: delivered_logo.png (1.8 MB)                ||
|        |  | "The logo matches the spec. Colors were adjusted     ||
|        |  |  per the buyer's email on Mar 16."                   ||
|        |  |------------------------------------------------------||
|        |  | [Buyer] Mar 18, 9:00 AM                              ||
|        |  | "I never agreed to color changes. See attached       ||
|        |  |  email thread."                                      ||
|        |  | Attached: email_thread.pdf (540 KB)                  ||
|        |  +------------------------------------------------------+|
|        |                                                          |
|        |  Resolution                                              |
|        |  +------------------------------------------------------+|
|        |  | Action:                                               ||
|        |  | ( ) Release funds to provider ($180.00)              ||
|        |  | ( ) Refund to buyer ($200.00)                        ||
|        |  | ( ) Escalate for further review                      ||
|        |  |                                                      ||
|        |  | Resolution Note: *                                   ||
|        |  | +--------------------------------------------------+||
|        |  | | Explain your decision...                          |||
|        |  | |                                                  |||
|        |  | +--------------------------------------------------+||
|        |  |                                                      ||
|        |  | [  Submit Resolution  ]     [Cancel]                 ||
|        |  +------------------------------------------------------+|
|        |                                                          |
+--------+---------------------------------------------------------+
```

---

## 8. Dispute Queue (Admin)

```
+--------+---------------------------------------------------------+
| ADMIN  |                                                          |
| NAV    |  Dispute Queue                                           |
|        |  ========================================================|
| [Dash] |                                                          |
| [Txns] |  Filter: [All ▾]  Sort by: [Age (oldest first) ▾]       |
| [Disp] |                                                          |
| [Provs]|  7 open disputes                                         |
| [Hooks]|  +------------------------------------------------------+|
| [Stats]|  | Status | ID    | Amount  | Reason           | Age    ||
|        |  |--------|-------|---------|------------------|--------||
|        |  | OPEN   | dsp_1 | $200.00 | NOT_AS_DESCRIBED | 2d 4h  ||
|        |  |        |       | Buyer: J. Doe | Prov: B. Jones        ||
|        |  |        |       |         | [Review]                  ||
|        |  |--------|-------|---------|------------------|--------||
|        |  | REVIEW | dsp_2 | $500.00 | NOT_DELIVERED    | 1d 12h ||
|        |  |        |       | Buyer: M. Poe | Prov: A. Lee          ||
|        |  |        |       | Evidence: 4 items | [Review]          ||
|        |  |--------|-------|---------|------------------|--------||
|        |  | OPEN   | dsp_3 | $75.00  | QUALITY_ISSUE    | 4h     ||
|        |  |        |       | Buyer: S. Kim | Prov: J. Smith        ||
|        |  |        |       |         | [Review]                  ||
|        |  |--------|-------|---------|------------------|--------||
|        |  | ESCLTD | dsp_4 | $2,000  | NOT_DELIVERED    | 5d     ||
|        |  |        |       | Buyer: T. Lee | Prov: R. Park         ||
|        |  |        |       | [!] HIGH PRIORITY | [Review]         ||
|        |  +------------------------------------------------------+|
|        |                                                          |
|        |  Resolved (last 30 days)                      [View All] |
|        |  +------------------------------------------------------+|
|        |  | RELEASED | dsp_5 | $150.00 | Resolved Mar 15 | 18h   ||
|        |  | REFUNDED | dsp_6 | $300.00 | Resolved Mar 14 | 24h   ||
|        |  +------------------------------------------------------+|
|        |                                                          |
+--------+---------------------------------------------------------+
```

---

## 9. Provider List (Admin)

```
+--------+---------------------------------------------------------+
| ADMIN  |                                                          |
| NAV    |  Provider Management                                     |
|        |  ========================================================|
| [Dash] |                                                          |
| [Txns] |  Filter: [All Statuses ▾]   Search: [___________]       |
| [Disp] |                                                          |
| [Provs]|  28 providers total                                      |
| [Hooks]|  +------------------------------------------------------+|
| [Stats]|  | Provider      | Email           | Status   | Txns   ||
|        |  |---------------|-----------------|----------|--------||
|        |  | Jane Smith    | jane@test.com   | COMPLETE |  15    ||
|        |  |               | Charges: Yes | Payouts: Yes          ||
|        |  |---------------|-----------------|----------|--------||
|        |  | Bob Jones     | bob@test.com    | COMPLETE |  12    ||
|        |  |               | Charges: Yes | Payouts: Yes          ||
|        |  |---------------|-----------------|----------|--------||
|        |  | Alice Lee     | alice@test.com  | PENDING  |   0    ||
|        |  |               | Charges: No  | Payouts: No           ||
|        |  |---------------|-----------------|----------|--------||
|        |  | Tom Wilson    | tom@test.com    | RESTRICTED|  3    ||
|        |  |               | Charges: No  | Payouts: No           ||
|        |  |               | [!] Additional verification needed   ||
|        |  +------------------------------------------------------+|
|        |                                                          |
+--------+---------------------------------------------------------+
```

---

## 10. Webhook Logs (Admin)

```
+--------+---------------------------------------------------------+
| ADMIN  |                                                          |
| NAV    |  Webhook Processing Logs                                 |
|        |  ========================================================|
| [Dash] |                                                          |
| [Txns] |  Filter: [All Types ▾] [All Statuses ▾] [Last 24h ▾]   |
| [Disp] |                                                          |
| [Provs]|  Processing Stats (last 24h)                             |
| [Hooks]|  +-------------+ +-------------+ +-------------+        |
| [Stats]|  | Received    | | Processed   | | Failed      |        |
|        |  |    142      | |    141      | |     1       |        |
|        |  |             | |  99.3%      | |  0.7%       |        |
|        |  +-------------+ +-------------+ +-------------+        |
|        |                                                          |
|        |  +------------------------------------------------------+|
|        |  | Event ID       | Type              | Status  | Time  ||
|        |  |----------------|-------------------|---------|-------||
|        |  | evt_xxx001     | payment_intent.   | DONE    | 10:01 ||
|        |  |                | succeeded         |         |       ||
|        |  |----------------|-------------------|---------|-------||
|        |  | evt_xxx002     | transfer.created  | DONE    | 10:02 ||
|        |  |----------------|-------------------|---------|-------||
|        |  | evt_xxx003     | account.updated   | DONE    | 10:05 ||
|        |  |----------------|-------------------|---------|-------||
|        |  | evt_xxx004     | payout.failed     | FAIL    | 10:10 ||
|        |  |                | Error: Account not found    |       ||
|        |  |                | [Retry] [View Payload]      |       ||
|        |  +------------------------------------------------------+|
|        |                                                          |
+--------+---------------------------------------------------------+
```

---

## 11. Transaction List Page (Shared)

### 11.1 Desktop View

```
+------------------------------------------------------------------+
| [!] DEMO APPLICATION — No real funds. Stripe test mode.          |
+------------------------------------------------------------------+
| [Logo] Escrow Marketplace    [Dashboard] [Txns] [User ▾] [Logout]|
+------------------------------------------------------------------+
|                                                                    |
|  My Transactions                                                   |
|  ================================================================  |
|                                                                    |
|  Filter: [All Statuses ▾]   Sort: [Newest first ▾]               |
|  Search: [_________________________]                               |
|                                                                    |
|  +--------------------------------------------------------------+ |
|  | Status       | ID       | Counterparty | Amount  | Date       | |
|  |--------------|----------|-------------|---------|------------| |
|  | [*] HELD     | txn_01   | Bob Jones   | $200.00 | Mar 19     | |
|  |              |          |             |         | [View]     | |
|  | [>] DELIVERED| txn_02   | Alice Lee   | $150.00 | Mar 18     | |
|  |              |          |             | Auto: 71h| [View]    | |
|  | [!] DISPUTED | txn_03   | Jane Smith  | $100.00 | Mar 17     | |
|  |              |          |             |         | [View]     | |
|  | [v] RELEASED | txn_04   | Bob Jones   | $500.00 | Mar 15     | |
|  |              |          |             |         | [View]     | |
|  | [v] PAID_OUT | txn_05   | Alice Lee   | $340.00 | Mar 12     | |
|  |              |          |             |         | [View]     | |
|  | [x] REFUNDED | txn_06   | Jane Smith  | $200.00 | Mar 10     | |
|  |              |          |             |         | [View]     | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  Showing 1-6 of 24      [< Prev] [1] [2] [3] [4] [Next >]       |
|                                                                    |
+------------------------------------------------------------------+
```

### 11.2 Mobile View (< 768px)

```
+----------------------------------+
| [!] DEMO — No real funds         |
+----------------------------------+
| [Logo]            [Hamburger ≡]  |
+----------------------------------+
|                                  |
|  My Transactions                 |
|  Filter: [All ▾] [Sort ▾]       |
|                                  |
|  +------------------------------+|
|  | [*] PAYMENT_HELD             ||
|  | txn_01 — Bob Jones           ||
|  | $200.00        Mar 19        ||
|  | [View Details]               ||
|  +------------------------------+|
|  | [>] DELIVERED                ||
|  | txn_02 — Alice Lee           ||
|  | $150.00        Mar 18        ||
|  | Auto-release: 71h            ||
|  | [View Details]               ||
|  +------------------------------+|
|  | [!] DISPUTED                 ||
|  | txn_03 — Jane Smith          ||
|  | $100.00        Mar 17        ||
|  | [View Details]               ||
|  +------------------------------+|
|                                  |
|  [Load More]                     |
|                                  |
+----------------------------------+
```

---

## 12. Status Badge Legend

| Status       | Color   | Icon | Badge Text       |
|--------------|---------|------|------------------|
| CREATED      | Gray    | [ ]  | Created          |
| PAYMENT_HELD | Blue    | [*]  | Payment Held     |
| DELIVERED    | Yellow  | [>]  | Delivered        |
| RELEASED     | Green   | [v]  | Released         |
| PAID_OUT     | Green   | [v]  | Paid Out         |
| DISPUTED     | Red     | [!]  | Disputed         |
| REFUNDED     | Orange  | [x]  | Refunded         |
| EXPIRED      | Gray    | [x]  | Expired          |
| CANCELLED    | Gray    | [-]  | Cancelled        |

---

## 13. Component Library Notes

All UI components use shadcn/ui (Radix + Tailwind CSS 4):

| Component       | shadcn/ui Component | Usage                          |
|-----------------|---------------------|--------------------------------|
| Buttons         | `Button`            | Primary/secondary/destructive  |
| Forms           | `Form` + `Input`    | All form fields                |
| Select          | `Select`            | Dropdowns (status, sort)       |
| Tables          | `Table`             | Transaction lists, admin grids |
| Cards           | `Card`              | Metric cards, detail sections  |
| Badge           | `Badge`             | Status indicators              |
| Dialog          | `Dialog`            | Confirmations, evidence viewer |
| Toast           | `Sonner`            | Success/error notifications    |
| Tabs            | `Tabs`              | Dashboard sections             |
| Pagination      | Custom              | List pagination                |
| Charts          | Recharts            | Admin analytics                |
| Timeline        | Custom              | Transaction state history      |

---

## 14. Document References

| Document   | Section  | Relationship                                     |
|------------|----------|--------------------------------------------------|
| §PVD       | 3        | Persona journeys informing page designs          |
| §PRD       | 2        | Functional requirements each wireframe addresses |
| §SRS-2     | 3        | Entity data displayed in wireframes              |
| §SRS-3     | 1        | State machine visualized in timeline             |
| §SRS-4     | 11       | Demo banner requirements                         |

---

*End of WIREFRAMES — Escrow Marketplace v1.0*
