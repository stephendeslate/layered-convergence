# Software Requirements Specification — Communications & Security (SRS-4)

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

This document specifies all security measures, authentication mechanisms,
communication templates, audit logging, and compliance requirements for the
Escrow Marketplace platform. Security is layered: Stripe handles PCI compliance
and fund custody, PostgreSQL RLS enforces data isolation, and the application
layer manages authentication and authorization.

---

## 2. Authentication

### 2.1 JWT Authentication

| Parameter           | Value                                       |
|---------------------|---------------------------------------------|
| Algorithm           | HS256 (HMAC-SHA256)                         |
| Secret              | `JWT_SECRET` environment variable (min 32 chars) |
| Access token expiry | 24 hours                                    |
| Refresh token expiry| 7 days                                      |
| Token location      | `Authorization: Bearer <token>` header      |
| Payload claims      | `sub` (userId), `role` (UserRole), `email`, `iat`, `exp` |

### 2.2 Token Payload Structure

```typescript
interface JwtPayload {
  sub: string;       // User ID
  role: UserRole;    // BUYER | PROVIDER | ADMIN
  email: string;     // User email
  emailVerified: boolean;
  iat: number;       // Issued at (Unix timestamp)
  exp: number;       // Expiry (Unix timestamp)
}
```

### 2.3 Token Refresh Flow

```
1. Client sends refresh token to POST /api/v1/auth/refresh
2. Server validates refresh token:
   a. Not expired
   b. User still exists and is active
3. Server issues new access token + new refresh token
4. Old refresh token is invalidated (single-use)
```

### 2.4 Password Security

| Requirement                    | Implementation                          |
|--------------------------------|-----------------------------------------|
| Hashing algorithm              | bcrypt with cost factor 12              |
| Minimum length                 | 8 characters                            |
| Complexity                     | At least 1 uppercase, 1 number          |
| Password reset                 | Time-limited token (1 hour) via email   |
| Brute force protection         | Rate limiting on login endpoint          |

### 2.5 Stripe Webhook Signature Verification

All incoming webhook requests from Stripe are verified using the webhook
signing secret before any processing occurs (§SRS-3 Section 7.1).

```typescript
// Verification happens BEFORE any business logic
const event = stripe.webhooks.constructEvent(
  rawBody,       // Raw request body (Buffer, not parsed JSON)
  signature,     // stripe-signature header value
  STRIPE_WEBHOOK_SECRET
);
```

| Requirement                    | Implementation                          |
|--------------------------------|-----------------------------------------|
| Signing secret                 | `STRIPE_WEBHOOK_SECRET` env var         |
| Body parsing                   | Raw body preserved (not JSON parsed)    |
| Timestamp tolerance            | Default Stripe tolerance (300 seconds)  |
| Failure behavior               | Return 400, do NOT process event        |

---

## 3. Email Notifications

### 3.1 Email Configuration

| Parameter           | Value                                       |
|---------------------|---------------------------------------------|
| Provider            | Resend (or nodemailer for dev)              |
| From address        | `noreply@escrow-marketplace.demo`           |
| Reply-to            | `support@escrow-marketplace.demo`           |
| Queue               | BullMQ `notifications` queue                |
| Retry               | 2 attempts with exponential backoff         |

### 3.2 Email Templates

#### 3.2.1 Email Verification

| Field       | Value                                               |
|-------------|-----------------------------------------------------|
| Trigger     | User registration (§FR-101)                         |
| Recipient   | New user                                            |
| Subject     | "Verify your email — Escrow Marketplace"            |

**Template:**
```
Hello {{ displayName }},

Welcome to Escrow Marketplace! Please verify your email address by clicking
the link below:

{{ verificationUrl }}

This link expires in 24 hours.

If you didn't create an account, please ignore this email.

— Escrow Marketplace (Demo Application)
```

#### 3.2.2 Payment Hold Created (to Provider)

| Field       | Value                                               |
|-------------|-----------------------------------------------------|
| Trigger     | Transaction → PAYMENT_HELD (§FR-402)                |
| Recipient   | Provider                                            |
| Subject     | "New payment hold: ${{ amount }} from {{ buyer }}"  |

**Template:**
```
Hello {{ providerName }},

A new payment hold has been created for your services:

  Amount:      ${{ amount }}
  From:        {{ buyerName }}
  Description: {{ description }}
  Created:     {{ createdAt }}

The buyer has placed funds on hold. Once you deliver the service, mark the
transaction as delivered in your dashboard.

View transaction: {{ transactionUrl }}

— Escrow Marketplace (Demo Application — No Real Funds)
```

#### 3.2.3 Delivery Marked (to Buyer)

| Field       | Value                                               |
|-------------|-----------------------------------------------------|
| Trigger     | Transaction → DELIVERED (§FR-503)                   |
| Recipient   | Buyer                                               |
| Subject     | "Delivery notification: {{ description }}"          |

**Template:**
```
Hello {{ buyerName }},

{{ providerName }} has marked the following transaction as delivered:

  Amount:      ${{ amount }}
  Description: {{ description }}
  Delivered:   {{ deliveredAt }}

Please review the delivery and confirm if satisfactory. If you do not take
action within 72 hours, funds will be automatically released to the provider.

  Auto-release: {{ autoReleaseAt }}

Confirm delivery: {{ confirmUrl }}
Raise a dispute:  {{ disputeUrl }}

— Escrow Marketplace (Demo Application — No Real Funds)
```

#### 3.2.4 Funds Released (to Both Parties)

| Field       | Value                                               |
|-------------|-----------------------------------------------------|
| Trigger     | Transaction → RELEASED (§FR-604)                    |
| Recipient   | Buyer and Provider                                  |
| Subject     | "Funds released: ${{ amount }}"                     |

**Template (Buyer):**
```
Hello {{ buyerName }},

Funds have been released for the following transaction:

  Amount:          ${{ amount }}
  Provider:        {{ providerName }}
  Description:     {{ description }}
  Released:        {{ releasedAt }}
  Release method:  {{ releaseMethod }} (manual confirmation / auto-release)

Thank you for using Escrow Marketplace.

— Escrow Marketplace (Demo Application — No Real Funds)
```

**Template (Provider):**
```
Hello {{ providerName }},

Great news! Funds have been released for your transaction:

  Total amount:    ${{ amount }}
  Platform fee:    ${{ platformFee }}
  Your payout:     ${{ providerAmount }}
  Buyer:           {{ buyerName }}
  Description:     {{ description }}
  Released:        {{ releasedAt }}

Your payout will be processed according to Stripe's payout schedule.

View payout status: {{ payoutUrl }}

— Escrow Marketplace (Demo Application — No Real Funds)
```

#### 3.2.5 Dispute Opened (to Provider and Admin)

| Field       | Value                                               |
|-------------|-----------------------------------------------------|
| Trigger     | Transaction → DISPUTED (§FR-704)                    |
| Recipient   | Provider and Admin                                  |
| Subject     | "Dispute filed: {{ description }}"                  |

**Template (Provider):**
```
Hello {{ providerName }},

A dispute has been filed on the following transaction:

  Amount:      ${{ amount }}
  Buyer:       {{ buyerName }}
  Reason:      {{ disputeReason }}
  Description: {{ disputeDescription }}
  Filed at:    {{ disputeCreatedAt }}

The auto-release timer has been paused. You may submit evidence to support
your position.

Submit evidence: {{ evidenceUrl }}

— Escrow Marketplace (Demo Application — No Real Funds)
```

**Template (Admin):**
```
[ADMIN] New Dispute Requires Review

  Transaction ID: {{ transactionId }}
  Amount:         ${{ amount }}
  Buyer:          {{ buyerName }} ({{ buyerEmail }})
  Provider:       {{ providerName }} ({{ providerEmail }})
  Reason:         {{ disputeReason }}
  Description:    {{ disputeDescription }}
  Filed at:       {{ disputeCreatedAt }}

Review dispute: {{ adminDisputeUrl }}
```

#### 3.2.6 Dispute Resolved (to Both Parties)

| Field       | Value                                               |
|-------------|-----------------------------------------------------|
| Trigger     | Dispute resolved (§FR-710)                          |
| Recipient   | Buyer and Provider                                  |
| Subject     | "Dispute resolved: {{ resolution }}"                |

**Template:**
```
Hello {{ recipientName }},

The dispute on the following transaction has been resolved:

  Amount:      ${{ amount }}
  Resolution:  {{ resolution }} (Released to provider / Refunded to buyer / Escalated)
  Admin note:  {{ resolutionNote }}
  Resolved at: {{ resolvedAt }}

{{ if resolution == "RELEASED" }}
Funds have been released to the provider.
{{ else if resolution == "REFUNDED" }}
Funds have been refunded to the buyer's payment method.
{{ else }}
This dispute has been escalated for further review. We will contact you
with additional information.
{{ end }}

— Escrow Marketplace (Demo Application — No Real Funds)
```

#### 3.2.7 Payout Sent (to Provider)

| Field       | Value                                               |
|-------------|-----------------------------------------------------|
| Trigger     | Payout status → PAID (§FR-804)                      |
| Recipient   | Provider                                            |
| Subject     | "Payout received: ${{ amount }}"                    |

**Template:**
```
Hello {{ providerName }},

Your payout has been deposited to your bank account:

  Amount:     ${{ amount }}
  Paid at:    {{ paidAt }}
  Transaction: {{ description }}

View payout history: {{ payoutHistoryUrl }}

— Escrow Marketplace (Demo Application — No Real Funds)
```

#### 3.2.8 Payout Failed (to Provider)

| Field       | Value                                               |
|-------------|-----------------------------------------------------|
| Trigger     | Payout status → FAILED (§FR-805)                    |
| Recipient   | Provider                                            |
| Subject     | "Payout failed: ${{ amount }}"                      |

**Template:**
```
Hello {{ providerName }},

Your payout could not be processed:

  Amount:        ${{ amount }}
  Reason:        {{ failureReason }}
  Transaction:   {{ description }}

Please verify your bank account details in your Stripe dashboard, or
contact support for assistance.

Update bank details: {{ stripeDashboardUrl }}

— Escrow Marketplace (Demo Application — No Real Funds)
```

#### 3.2.9 Password Reset

| Field       | Value                                               |
|-------------|-----------------------------------------------------|
| Trigger     | Password reset request (§FR-104)                    |
| Recipient   | Requesting user                                     |
| Subject     | "Reset your password — Escrow Marketplace"          |

**Template:**
```
Hello {{ displayName }},

A password reset was requested for your account. Click the link below to
set a new password:

{{ resetUrl }}

This link expires in 1 hour. If you didn't request this, please ignore
this email.

— Escrow Marketplace (Demo Application)
```

---

## 4. Audit Trail

### 4.1 Audit Scope

Every financial state transition MUST be logged in the TransactionStateHistory
table (§SRS-2 Section 3.4, §BR-35). The audit trail is append-only —
records are never updated or deleted.

### 4.2 Audited Actions

| Action                    | Trigger                           | Actor      | Metadata                        |
|---------------------------|-----------------------------------|------------|---------------------------------|
| TRANSACTION_CREATED       | Payment hold initiated            | Buyer      | { amount, providerId }          |
| PAYMENT_HELD              | payment_intent.succeeded webhook  | System     | { stripeEventId, chargeId }     |
| DELIVERY_MARKED           | Provider marks delivery           | Provider   | { }                             |
| DELIVERY_CONFIRMED        | Buyer confirms delivery           | Buyer      | { }                             |
| FUNDS_RELEASED            | Transfer created (manual)         | Buyer/Admin| { transferId, providerAmount }  |
| AUTO_RELEASE_TRIGGERED    | Auto-release timer fires          | System     | { jobId, delay }                |
| FUNDS_REFUNDED            | Refund issued                     | Admin      | { refundId, reason }            |
| PAYOUT_INITIATED          | Payout created                    | System     | { payoutId, amount }            |
| PAYOUT_COMPLETED          | payout.paid webhook               | System     | { stripeEventId }               |
| PAYOUT_FAILED             | payout.failed webhook             | System     | { stripeEventId, failureReason }|
| DISPUTE_OPENED            | Buyer files dispute               | Buyer      | { reason, description }         |
| DISPUTE_EVIDENCE_ADDED    | Evidence submitted                | Buyer/Provider | { evidenceId }              |
| DISPUTE_RESOLVED          | Admin resolves dispute            | Admin      | { resolution, note }            |
| DISPUTE_ESCALATED         | Admin escalates dispute           | Admin      | { note }                        |
| HOLD_EXPIRED              | PI canceled / cleanup job         | System     | { stripeEventId }               |
| TRANSACTION_CANCELLED     | Buyer cancels before payment      | Buyer      | { }                             |
| PROVIDER_ONBOARDED        | account.updated → COMPLETE        | System     | { stripeAccountId }             |
| PROVIDER_RESTRICTED       | account.updated → RESTRICTED      | System     | { stripeAccountId, reason }     |

### 4.3 Audit Record Requirements

Per §BR-37, every audit record MUST include:

1. **Actor**: User ID of the person/system that triggered the action
   - For system actions (webhooks, timers): actorId = null, metadata includes trigger source
   - For user actions: actorId = authenticated user's ID
2. **Timestamp**: Server-side UTC timestamp (never client-provided)
3. **Metadata**: JSON object with context-specific data (Stripe IDs, amounts, reasons)

### 4.4 Audit Retention

- Audit records are retained for 7 years (§BRD 5.3)
- Records are never modified or deleted (append-only)
- Archived to cold storage after 1 year (future consideration)

---

## 5. Rate Limiting

### 5.1 Rate Limit Configuration

| Endpoint Category           | Limit              | Window    | Key               |
|-----------------------------|--------------------|-----------|--------------------|
| Authentication (login)      | 5 requests         | 15 minutes| IP address         |
| Authentication (register)   | 3 requests         | 1 hour    | IP address         |
| Password reset              | 3 requests         | 1 hour    | Email address      |
| Payment creation            | 10 requests        | 1 hour    | User ID            |
| Dispute creation            | 5 requests         | 1 hour    | User ID            |
| Evidence submission         | 20 requests        | 1 hour    | User ID            |
| General API (authenticated) | 100 requests       | 1 minute  | User ID            |
| General API (unauthenticated)| 30 requests       | 1 minute  | IP address         |
| Webhook endpoint            | 1000 requests      | 1 minute  | IP address         |
| Admin endpoints             | 200 requests       | 1 minute  | User ID            |

### 5.2 Rate Limit Response

When a rate limit is exceeded, the API returns:

```
HTTP 429 Too Many Requests
Retry-After: <seconds until window resets>

{
  "statusCode": 429,
  "message": "Rate limit exceeded. Try again in {{ seconds }} seconds.",
  "error": "Too Many Requests"
}
```

### 5.3 Implementation

Rate limiting is implemented using `@nestjs/throttler` with Redis backing
store for distributed rate counting across multiple API instances.

```typescript
@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'short', ttl: 60000, limit: 100 },
        { name: 'long', ttl: 3600000, limit: 1000 },
      ],
      storage: new ThrottlerStorageRedisService(redisClient),
    }),
  ],
})
```

---

## 6. Authorization

### 6.1 Role-Based Access Control (RBAC)

| Resource / Action              | BUYER | PROVIDER | ADMIN |
|--------------------------------|-------|----------|-------|
| Create transaction             | Yes   | No       | No    |
| View own transactions          | Yes   | Yes      | Yes   |
| View all transactions          | No    | No       | Yes   |
| Mark delivery                  | No    | Yes      | No    |
| Confirm delivery               | Yes   | No       | No    |
| Create dispute                 | Yes   | No       | No    |
| Submit evidence                | Yes   | Yes      | No    |
| Resolve dispute                | No    | No       | Yes   |
| View dispute queue             | No    | No       | Yes   |
| Start onboarding               | No    | Yes      | No    |
| View provider list             | Yes   | No       | Yes   |
| View analytics                 | No    | No       | Yes   |
| View own payouts               | No    | Yes      | Yes   |
| Trigger manual payout          | No    | No       | Yes   |
| View webhook logs              | No    | No       | Yes   |

### 6.2 NestJS Guard Implementation

```typescript
// Role guard decorator
@SetMetadata('roles', [UserRole.BUYER])
@UseGuards(JwtAuthGuard, RolesGuard)
@Post('transactions')
async createTransaction(@Body() dto: CreateTransactionDto) { ... }

// Transaction ownership guard
@UseGuards(JwtAuthGuard, TransactionPartyGuard)
@Get('transactions/:id')
async getTransaction(@Param('id') id: string) { ... }
```

### 6.3 Guards

| Guard                  | Purpose                                           |
|------------------------|---------------------------------------------------|
| `JwtAuthGuard`         | Validates JWT token, extracts user                |
| `RolesGuard`           | Checks user role against required roles           |
| `TransactionPartyGuard`| Ensures user is buyer or provider on transaction  |
| `DisputePartyGuard`    | Ensures user is party to the disputed transaction |
| `AdminGuard`           | Shorthand for RolesGuard([ADMIN])                 |
| `EmailVerifiedGuard`   | Ensures user email is verified                    |
| `ProviderOnboardedGuard`| Ensures provider has completed Stripe onboarding |

---

## 7. PCI Compliance

### 7.1 PCI DSS Delegation

The platform achieves PCI SAQ-A compliance by fully delegating cardholder
data handling to Stripe (§BRD 5.1).

| Requirement                    | Approach                                |
|--------------------------------|-----------------------------------------|
| Card number collection         | Stripe Elements iframe                  |
| Card data transmission         | Direct to Stripe (never touches server) |
| Card data storage              | Never stored on platform                |
| Tokenization                   | Stripe manages; platform uses PI IDs    |
| Payment page security          | HTTPS enforced; CSP headers             |

### 7.2 Stripe Elements Integration

```typescript
// Frontend: Stripe Elements setup (Next.js)
import { Elements, PaymentElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function PaymentForm({ clientSecret }: { clientSecret: string }) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentElement />
      {/* Submit button handled by Stripe */}
    </Elements>
  );
}
```

### 7.3 Data Flow (PCI Perspective)

```
Browser [Card Input in Stripe iframe]
    |
    | (Card data goes directly to Stripe)
    v
Stripe API --> Returns PaymentIntent client_secret
    |
    | (Only PI ID and client_secret touch platform)
    v
Platform API (no card data ever received)
```

---

## 8. OWASP Compliance Checklist

### 8.1 OWASP Top 10 (2021) Mitigations

| # | Vulnerability                      | Mitigation                                      | Status    |
|---|------------------------------------|-------------------------------------------------|-----------|
| 1 | Broken Access Control              | JWT auth + RBAC guards + RLS policies            | Addressed |
| 2 | Cryptographic Failures             | bcrypt passwords, TLS 1.2+, no card data stored  | Addressed |
| 3 | Injection                          | Prisma parameterized queries, class-validator     | Addressed |
| 4 | Insecure Design                    | State machine validation, audit trail             | Addressed |
| 5 | Security Misconfiguration          | Environment variables, no default secrets, CSP    | Addressed |
| 6 | Vulnerable Components              | Dependabot, npm audit in CI, lock file            | Addressed |
| 7 | Auth Failures                      | Rate limiting, JWT expiry, password complexity    | Addressed |
| 8 | Data Integrity Failures            | Webhook signature verification, idempotency       | Addressed |
| 9 | Logging & Monitoring               | Pino structured logging, Sentry, audit trail      | Addressed |
| 10| SSRF                               | No user-controlled URLs in server requests        | Addressed |

### 8.2 HTTP Security Headers

| Header                          | Value                                           |
|---------------------------------|-------------------------------------------------|
| `Strict-Transport-Security`     | `max-age=31536000; includeSubDomains`           |
| `Content-Security-Policy`       | `default-src 'self'; frame-src js.stripe.com; script-src 'self' js.stripe.com` |
| `X-Content-Type-Options`        | `nosniff`                                       |
| `X-Frame-Options`               | `DENY`                                          |
| `X-XSS-Protection`              | `0` (CSP preferred)                             |
| `Referrer-Policy`               | `strict-origin-when-cross-origin`               |
| `Permissions-Policy`            | `camera=(), microphone=(), geolocation=()`      |

### 8.3 CORS Configuration

```typescript
app.enableCors({
  origin: [process.env.FRONTEND_URL],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type', 'Idempotency-Key'],
  credentials: true,
  maxAge: 86400,
});
```

---

## 9. Input Validation

### 9.1 Validation Framework

All incoming request data is validated using `class-validator` decorators on
DTO classes before reaching any business logic.

### 9.2 Validation Rules by Endpoint

#### Create Transaction DTO

```typescript
class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  providerId: string;

  @IsInt()
  @Min(500)        // $5.00 minimum (§BR-02)
  @Max(1000000)    // $10,000.00 maximum (§BR-03)
  amount: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;
}
```

#### Create Dispute DTO

```typescript
class CreateDisputeDto {
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @IsEnum(DisputeReason)
  reason: DisputeReason;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;
}
```

#### Resolve Dispute DTO

```typescript
class ResolveDisputeDto {
  @IsEnum(['RELEASE', 'REFUND', 'ESCALATE'])
  action: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  note: string;
}
```

#### Submit Evidence DTO

```typescript
class SubmitEvidenceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string;

  @IsOptional()
  @IsUrl()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fileName?: string;

  @IsOptional()
  @IsInt()
  @Max(10485760)   // 10MB (§SRS-2 Section 6.1)
  fileSize?: number;
}
```

---

## 10. Data Protection

### 10.1 Encryption

| Layer              | Method                                          |
|--------------------|-------------------------------------------------|
| In transit         | TLS 1.2+ on all connections (enforced by infra) |
| At rest (DB)       | Railway managed PostgreSQL encryption            |
| At rest (Redis)    | Railway managed Redis encryption                 |
| Passwords          | bcrypt hash with cost factor 12                  |
| JWT tokens         | HMAC-SHA256 signed                               |
| Webhook payloads   | Stripe signature verification (HMAC-SHA256)      |

### 10.2 Sensitive Data Handling

| Data Type          | Storage Location    | Access Control                     |
|--------------------|--------------------|------------------------------------|
| Card numbers       | Stripe only         | Never touches platform             |
| Bank details       | Stripe only         | Never touches platform             |
| Password hashes    | PostgreSQL          | Not exposed via any API            |
| Email addresses    | PostgreSQL          | RLS + role-based visibility        |
| Stripe account IDs | PostgreSQL          | Internal use only, not in API responses |
| JWT secrets        | Environment var     | Not in code, not in logs           |
| Webhook secrets    | Environment var     | Not in code, not in logs           |

### 10.3 Logging Safety

Sensitive data MUST be excluded from all logs:

```typescript
// Pino serializer to redact sensitive fields
const redactPaths = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.body.password',
  'req.body.passwordHash',
  'stripe-signature',
];
```

---

## 11. Demo Mode Requirements

### 11.1 Banner Requirements

Every page that handles or displays payment information MUST show the
following banner (§BRD 5.4):

```
+------------------------------------------------------------------+
|  DEMO APPLICATION — No real funds are processed.                  |
|  This platform uses Stripe test mode. Use test card 4242...4242.  |
+------------------------------------------------------------------+
```

### 11.2 Banner Implementation

```typescript
// React component — displayed in root layout
function DemoBanner() {
  return (
    <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-2 text-center text-sm text-yellow-800">
      <strong>Demo Application</strong> — No real funds are processed.
      This platform uses Stripe test mode.
      Use test card <code>4242 4242 4242 4242</code>.
    </div>
  );
}
```

### 11.3 Demo Mode Guards

| Guard                          | Implementation                          |
|--------------------------------|-----------------------------------------|
| Stripe key validation          | Reject if key doesn't start with `sk_test_` or `pk_test_` |
| Footer disclaimer              | "Test data only — Demo application" on every page |
| Test card documentation        | Stripe test card numbers listed on payment form |
| No production keys             | CI check: fail if `sk_live_` detected in env |

---

## 12. Error Handling

### 12.1 Error Response Format

All API errors follow a consistent format:

```json
{
  "statusCode": 400,
  "message": "Human-readable error message",
  "error": "Bad Request",
  "code": "AMOUNT_TOO_LOW",
  "details": {}
}
```

### 12.2 Error Codes

| Code                    | HTTP | Description                              |
|-------------------------|------|------------------------------------------|
| UNAUTHORIZED            | 401  | Missing or invalid JWT token             |
| FORBIDDEN               | 403  | Insufficient role or permissions         |
| NOT_FOUND               | 404  | Resource does not exist                  |
| INVALID_TRANSITION      | 400  | State machine transition not allowed     |
| AMOUNT_TOO_LOW          | 400  | Below minimum ($5.00)                    |
| AMOUNT_TOO_HIGH         | 400  | Above maximum ($10,000.00)              |
| INVALID_CURRENCY        | 400  | Non-USD currency                         |
| PROVIDER_NOT_ONBOARDED  | 400  | Provider Stripe onboarding incomplete    |
| PROVIDER_NOT_FOUND      | 404  | Provider does not exist                  |
| EMAIL_NOT_VERIFIED      | 403  | Email verification required              |
| NOT_A_BUYER             | 403  | Action requires BUYER role               |
| NOT_PROVIDER            | 403  | Action requires PROVIDER role            |
| NOT_ADMIN               | 403  | Action requires ADMIN role               |
| DISPUTE_EXISTS          | 409  | Transaction already has a dispute        |
| DISPUTE_WINDOW_CLOSED   | 400  | Past 72h dispute window                  |
| DISPUTE_ALREADY_RESOLVED| 400  | Dispute in terminal state                |
| REASON_REQUIRED         | 400  | Missing dispute reason                   |
| NOTE_REQUIRED           | 400  | Missing resolution note                  |
| INVALID_ACTION          | 400  | Invalid dispute resolution action        |
| DUPLICATE_REQUEST       | 409  | Idempotency key reused                   |
| RATE_LIMITED            | 429  | Too many requests                        |
| STRIPE_ERROR            | 502  | Stripe API returned an error             |
| INTERNAL_ERROR          | 500  | Unexpected server error                  |

### 12.3 NestJS Exception Filter

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // Never expose stack traces or internal details to clients
    // Log full error server-side via Pino
    // Return sanitized error response
  }
}
```

---

## 13. Session and Cookie Security

### 13.1 Cookie Policy

The platform uses bearer tokens (not cookies) for API authentication.
However, the Next.js frontend may use cookies for session management:

| Cookie         | Settings                                          |
|----------------|---------------------------------------------------|
| `session`      | HttpOnly, Secure, SameSite=Lax, Path=/           |
| `csrf-token`   | Secure, SameSite=Strict, Path=/                  |

### 13.2 CSRF Protection

- API: Not needed (bearer token auth, no cookies)
- Frontend: Next.js built-in CSRF protection for form submissions

---

## 14. Infrastructure Security

### 14.1 Network Security

| Layer            | Protection                                      |
|------------------|-------------------------------------------------|
| CDN (Vercel)     | DDoS protection, WAF, automatic HTTPS           |
| API (Railway)    | Private networking, automatic HTTPS              |
| Database         | Private network only (not internet-accessible)   |
| Redis            | Private network only (not internet-accessible)   |

### 14.2 Secret Management

| Secret                  | Storage                | Rotation Policy          |
|-------------------------|------------------------|--------------------------|
| JWT_SECRET              | Railway env vars       | On suspected compromise  |
| STRIPE_SECRET_KEY       | Railway env vars       | Via Stripe dashboard     |
| STRIPE_WEBHOOK_SECRET   | Railway env vars       | On webhook endpoint change|
| DATABASE_URL            | Railway env vars       | On credential rotation   |
| REDIS_URL               | Railway env vars       | On credential rotation   |

### 14.3 Dependency Security

| Measure                 | Implementation                              |
|-------------------------|---------------------------------------------|
| Dependency scanning     | GitHub Dependabot enabled                   |
| Audit in CI             | `pnpm audit` runs in CI pipeline            |
| Lock file               | `pnpm-lock.yaml` committed                  |
| Minimal dependencies    | Audit for unnecessary packages quarterly    |

---

## 15. Document References

| Document   | Section  | Relationship                                     |
|------------|----------|--------------------------------------------------|
| §BRD       | 5        | Compliance requirements implemented here         |
| §PRD       | 2        | FR security requirements                         |
| §SRS-1     | 4, 6     | Infrastructure security aligns with architecture |
| §SRS-2     | 5        | RLS policies defined in data model               |
| §SRS-3     | 7, 8     | Webhook verification and idempotency             |

---

*End of SRS-4 — Escrow Marketplace v1.0*
