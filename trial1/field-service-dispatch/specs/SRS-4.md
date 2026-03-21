# Software Requirements Specification — Communications & Security (SRS-4)

**Project:** Field Service Dispatch
**Version:** 1.0
**Date:** 2026-03-20
**Status:** Draft

---

## 1. Purpose

This document specifies the authentication, authorization, communication (SMS, email, push), audit, rate limiting, GPS privacy, and security compliance requirements for the Field Service Dispatch platform. It implements the security-related business requirements from §BRD (BR-800 through BR-802) and communication requirements from §PRD (FR-900 through FR-902).

## 2. Authentication

### 2.1 JWT Authentication

All API endpoints (except those marked Public in §SRS-2 Section 8) require a valid JSON Web Token (JWT).

**Token Structure:**

```json
{
  "sub": "user-cuid",          // User ID
  "companyId": "company-cuid", // Tenant ID (for RLS context)
  "role": "DISPATCHER",        // UserRole enum
  "technicianId": "tech-cuid", // Only present for TECHNICIAN role
  "iat": 1710928800,
  "exp": 1711015200            // 24 hours from issuance
}
```

**Configuration:**

| Parameter | Value | Notes |
|-----------|-------|-------|
| Algorithm | HS256 | HMAC SHA-256 |
| Access token TTL | 24 hours | Short enough for security, long enough for field use |
| Refresh token TTL | 30 days | Stored in database, revocable |
| Secret | JWT_SECRET env var | Minimum 256 bits, generated per deployment |

### 2.2 Token Lifecycle

```
Login:
  1. Client sends POST /api/auth/login { email, password }
  2. Server validates credentials (bcrypt hash comparison, 12 rounds)
  3. Server checks user.isActive = true
  4. Server generates access token + refresh token
  5. Refresh token stored in RefreshToken table (hashed)
  6. Response: { accessToken, refreshToken, expiresIn, user }

Refresh:
  1. Client sends POST /api/auth/refresh { refreshToken }
  2. Server validates refresh token exists in DB and is not revoked
  3. Server checks refresh token is not expired
  4. Server revokes old refresh token (rotation)
  5. Server generates new access token + new refresh token
  6. Response: { accessToken, refreshToken, expiresIn }

Logout:
  1. Client sends POST /api/auth/logout (with accessToken in header)
  2. Server revokes refresh token (sets revokedAt timestamp)
  3. Access token remains valid until expiry (stateless JWT)
  4. For immediate invalidation: client discards access token

Token Storage (Client):
  - Access token: in-memory (Zustand store), lost on page refresh
  - Refresh token: httpOnly secure cookie (SameSite=Strict)
  - On page load: attempt silent refresh using refresh token cookie
```

### 2.3 Customer Magic Link Authentication

Customers access the self-service portal via magic links (§PRD FR-501).

```
Flow:
  1. Customer requests access: POST /api/auth/magic-link { email }
  2. Server looks up customer by email + companyId (from portal URL context)
  3. Server generates a magic link token (32-byte random, URL-safe base64)
  4. Server stores token in MagicLink table (TTL: 15 minutes)
  5. Server sends email with link: https://app.example.com/portal/verify?token=xxx
  6. Customer clicks link: POST /api/auth/magic-link/verify { token }
  7. Server validates token (exists, not expired, not used)
  8. Server marks token as used (usedAt = now)
  9. Server generates a limited JWT:
     {
       "sub": "customer-cuid",
       "companyId": "company-cuid",
       "role": "CUSTOMER",
       "scope": "portal",           // Limited scope
       "exp": // 7 days
     }
  10. Response: { accessToken, customer }
```

### 2.4 Customer Tracking Portal Authentication

The tracking portal (§PRD FR-500) uses a unique, unguessable URL token. No login is required.

```
URL: https://app.example.com/track/{trackingToken}

Token: UUID v4 (122 bits of entropy)
Expiry: 24 hours after work order completion

Validation:
  1. Client loads /track/{token}
  2. Frontend calls GET /api/tracking/{token}
  3. Backend queries using SECURITY DEFINER function (bypasses RLS)
  4. Returns work order + technician position + company branding
  5. If token invalid or expired: 404

Security properties:
  - Token is unguessable (UUID v4)
  - Token has limited lifetime
  - No PII is exposed beyond what the customer already knows
  - Technician position is only shown when status is EN_ROUTE or ON_SITE
```

## 3. Authorization

### 3.1 Role-Based Access Control (RBAC)

| Resource | ADMIN | DISPATCHER | TECHNICIAN | CUSTOMER |
|----------|-------|-----------|------------|----------|
| Company settings | Read/Write | Read | — | — |
| User management | CRUD | Read | — | — |
| Technician management | CRUD | Read/Update | Self only | — |
| Customer management | CRUD | CRUD | Read (assigned) | Self only |
| Work orders | CRUD | CRUD | Read/Update (assigned) | Read (own) |
| Work order transitions | All | All except admin-only cancellations | Own assignments only | — |
| Dispatch board | Full | Full | — | — |
| Route optimization | Full | Full | — | — |
| Invoices | Full (+ void, manual pay) | Read/Send | — | Read (own) |
| Analytics | Full | Read | — | — |
| GPS positions | Read all | Read all | Write (own) | Read (tracking) |
| Audit logs | Read | — | — | — |
| Notifications | Read all | Read all | Read own | Read own |

### 3.2 NestJS Guards

```typescript
// Role-based guard
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.DISPATCHER)
@Get('work-orders')
async listWorkOrders() { ... }

// Technician self-guard (only own resources)
@UseGuards(JwtAuthGuard, TechnicianSelfGuard)
@Post('work-orders/:id/transition')
async transitionWorkOrder() { ... }

// Company-scoped guard (sets RLS context)
@UseGuards(JwtAuthGuard, TenantGuard)
@Get('technicians')
async listTechnicians() { ... }
```

### 3.3 RLS Enforcement in Application Layer

Every database query passes through the Prisma middleware that sets the RLS context:

```typescript
// prisma/prisma.middleware.ts
prisma.$use(async (params, next) => {
  // Set RLS context for the current transaction
  await prisma.$executeRawUnsafe(
    `SET LOCAL app.current_company_id = '${companyId}'`
  );
  return next(params);
});
```

This is wrapped in a transaction to ensure the `SET LOCAL` applies to all queries within the request. The `companyId` is extracted from the JWT by the `TenantGuard`.

**Critical security note:** The `companyId` must NEVER be accepted from the request body or query parameters. It is ALWAYS extracted from the authenticated JWT token.

## 4. WebSocket Authentication

### 4.1 Connection Handshake

```typescript
// Server-side WebSocket gateway
@WebSocketGateway({ namespace: '/gps' })
export class GpsGateway implements OnGatewayConnection {

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;
    if (!token) {
      client.emit('error', { message: 'Authentication required' });
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub;
      client.data.companyId = payload.companyId;
      client.data.role = payload.role;
      client.data.technicianId = payload.technicianId;

      // Join company room
      client.join(`company:${payload.companyId}`);

      // Join technician room if applicable
      if (payload.technicianId) {
        client.join(`technician:${payload.technicianId}`);
      }
    } catch (error) {
      client.emit('error', { message: 'Invalid token' });
      client.disconnect();
    }
  }
}
```

### 4.2 Token Refresh for Long-Lived Connections

WebSocket connections may outlive the JWT expiry. The client must periodically refresh the token:

```
1. Client monitors token expiry (before actual expiry by 5 minutes)
2. Client calls REST POST /api/auth/refresh to get a new access token
3. Client emits "auth:refresh" event with new token
4. Server validates new token and updates client.data
5. If client fails to refresh: server disconnects after grace period (5 minutes past expiry)
```

### 4.3 Customer Tracking WebSocket

Customer tracking portals connect to the `/tracking` namespace using the tracking token:

```typescript
// Client
const socket = io('wss://api.example.com/tracking', {
  auth: { trackingToken: 'uuid-tracking-token' }
});

// Server validates trackingToken against work_orders table
// No JWT required — tracking token is sufficient
// Client joins room: workorder:{workOrderId}
```

## 5. SMS Templates

All SMS messages are sent via Twilio. Templates support variable interpolation with `{{variable}}` syntax.

### 5.1 Template Definitions

**TECHNICIAN_DISPATCHED**
```
Hi {{customerFirstName}}, your {{serviceType}} appointment with {{companyName}} is confirmed for {{scheduledDate}} between {{scheduledStart}} and {{scheduledEnd}}. Reply STOP to opt out.
```
- Trigger: T1 (UNASSIGNED -> ASSIGNED)
- Variables: customerFirstName, serviceType, companyName, scheduledDate, scheduledStart, scheduledEnd

**TECHNICIAN_EN_ROUTE**
```
{{technicianFirstName}} from {{companyName}} is on the way to your location! Track arrival in real time: {{trackingUrl}} — Estimated arrival: {{etaMinutes}} minutes.
```
- Trigger: T2 (ASSIGNED -> EN_ROUTE)
- Variables: technicianFirstName, companyName, trackingUrl, etaMinutes

**ARRIVING_SOON_15**
```
{{technicianFirstName}} from {{companyName}} will arrive in approximately 15 minutes. Track: {{trackingUrl}}
```
- Trigger: Proximity check (distance < 2km, ETA <= 15min)
- Variables: technicianFirstName, companyName, trackingUrl

**ARRIVING_SOON_5**
```
{{technicianFirstName}} from {{companyName}} is almost there — arriving in about 5 minutes!
```
- Trigger: Proximity check (distance < 500m, ETA <= 5min)
- Variables: technicianFirstName, companyName

**JOB_COMPLETED_SMS**
```
Your {{serviceType}} job with {{companyName}} is complete! You'll receive an invoice shortly at {{customerEmail}}.
```
- Trigger: T5 (IN_PROGRESS -> COMPLETED)
- Variables: serviceType, companyName, customerEmail

**JOB_CANCELLED_SMS**
```
Your {{serviceType}} appointment with {{companyName}} on {{scheduledDate}} has been cancelled. Please contact us at {{companyPhone}} with questions.
```
- Trigger: T9-T13 (any -> CANCELLED)
- Variables: serviceType, companyName, scheduledDate, companyPhone

### 5.2 SMS Configuration

| Parameter | Value |
|-----------|-------|
| Provider | Twilio |
| From number | TWILIO_PHONE_NUMBER env var |
| Character limit | 160 (single segment) |
| Rate limit | 1 SMS per recipient per minute |
| Opt-out handling | Twilio automatic STOP/START processing |
| Failure handling | Log failure, do not retry SMS (to avoid spam) |

### 5.3 SMS Delivery

```typescript
// notification/sms.service.ts
async sendSms(to: string, template: SmsTemplate, variables: Record<string, string>) {
  // 1. Validate phone number format (E.164)
  // 2. Interpolate template variables
  // 3. Check rate limit (1/min/recipient)
  // 4. Send via Twilio client.messages.create()
  // 5. Store Notification record with externalId = Twilio SID
  // 6. On failure: store with failedAt and failureReason
}
```

## 6. Email Templates

Emails are sent via Resend (transactional email service). Templates are rendered server-side using React Email components.

### 6.1 Template Definitions

**WORK_ORDER_CONFIRMATION**
- Subject: "Your {{serviceType}} appointment is confirmed — {{companyName}}"
- Trigger: T1 (UNASSIGNED -> ASSIGNED)
- Content:
  - Company logo and branding
  - Appointment date and time window
  - Service type and description
  - Technician name (if assigned)
  - Address
  - Reschedule/cancel link (magic link to portal)
  - Company contact information

**TECHNICIAN_EN_ROUTE_EMAIL**
- Subject: "Your technician is on the way! — {{companyName}}"
- Trigger: T2 (ASSIGNED -> EN_ROUTE)
- Content:
  - Company logo
  - Technician name and photo
  - Estimated arrival time
  - Prominent "Track Live" button (links to tracking portal)
  - Work order summary

**JOB_COMPLETED_EMAIL**
- Subject: "Service completed — {{companyName}} Invoice #{{invoiceNumber}}"
- Trigger: T5 (IN_PROGRESS -> COMPLETED) + invoice generation
- Content:
  - Company logo
  - Work order summary
  - Line items and totals
  - "View Invoice & Pay" button (links to Stripe hosted page)
  - Thank you message

**INVOICE_SENT_EMAIL**
- Subject: "Invoice #{{invoiceNumber}} from {{companyName}}"
- Trigger: T6 (COMPLETED -> INVOICED)
- Content:
  - Company logo
  - Invoice details (number, date, due date)
  - Line items with prices
  - Total amount due
  - "Pay Now" button (Stripe payment link)
  - Payment terms

**PAYMENT_RECEIPT_EMAIL**
- Subject: "Payment received — Thank you! — {{companyName}}"
- Trigger: T7 (INVOICED -> PAID)
- Content:
  - Company logo
  - Payment confirmation
  - Amount paid
  - Invoice reference
  - "View Receipt" link

**MAGIC_LINK_EMAIL**
- Subject: "Your login link — {{companyName}}"
- Trigger: Customer portal access request
- Content:
  - Company logo
  - "Access Your Portal" button (magic link URL)
  - Link expires in 15 minutes
  - Security notice: "If you didn't request this, ignore this email"

### 6.2 Email Configuration

| Parameter | Value |
|-----------|-------|
| Provider | Resend |
| From address | noreply@{companySlug}.fieldservicedispatch.com |
| Reply-to | Company's configured email |
| HTML rendering | React Email components |
| Plain text fallback | Auto-generated from HTML |
| Unsubscribe | One-click unsubscribe header (CAN-SPAM compliance) |
| Rate limit | 10 emails per recipient per hour |

### 6.3 Email Rendering

```typescript
// notification/email.service.ts
import { render } from '@react-email/render';
import { WorkOrderConfirmationEmail } from './templates/work-order-confirmation';

async sendEmail(to: string, template: EmailTemplate, variables: EmailVariables) {
  // 1. Render React Email component to HTML
  const html = await render(
    createElement(templateComponent, { ...variables, company: companyBranding })
  );

  // 2. Send via Resend
  const { id } = await resend.emails.send({
    from: `${companyName} <noreply@${companySlug}.fieldservicedispatch.com>`,
    to,
    subject: interpolate(template.subject, variables),
    html,
    headers: {
      'List-Unsubscribe': `<${unsubscribeUrl}>`,
    },
  });

  // 3. Store Notification record with externalId = Resend ID
}
```

## 7. Push Notification Events

### 7.1 Web Push Configuration

Push notifications use the Web Push API with VAPID (Voluntary Application Server Identification).

```typescript
// Configuration
const VAPID_KEYS = {
  publicKey: process.env.VAPID_PUBLIC_KEY,   // Base64-encoded
  privateKey: process.env.VAPID_PRIVATE_KEY, // Base64-encoded
  subject: 'mailto:admin@fieldservicedispatch.com',
};
```

### 7.2 Push Subscription Flow

```
1. Technician opens the app for the first time
2. App checks if push is supported: 'serviceWorker' in navigator && 'PushManager' in window
3. App prompts: "Enable notifications to receive job updates?"
4. On accept:
   a. Register service worker
   b. Subscribe to push: registration.pushManager.subscribe({ applicationServerKey, userVisibleOnly: true })
   c. Send subscription to server: POST /api/notifications/push/subscribe { subscription }
   d. Server stores subscription (endpoint, keys) linked to userId
5. On decline: app proceeds without push, falls back to SMS for critical notifications
```

### 7.3 Push Event Types

| Event | Trigger | Title | Body | Action |
|-------|---------|-------|------|--------|
| NEW_ASSIGNMENT | T1 | "New Job Assigned" | "{{serviceType}} at {{address}} — {{scheduledTime}}" | Open work order detail |
| JOB_REASSIGNED | T8 + T1 | "Job Reassigned" | "{{serviceType}} at {{address}} has been reassigned to you" | Open work order detail |
| JOB_CANCELLED | T10-T13 | "Job Cancelled" | "{{serviceType}} at {{address}} has been cancelled" | Open job list |
| SCHEDULE_CHANGE | Work order time updated | "Schedule Updated" | "{{serviceType}} moved to {{newTime}}" | Open job list |
| DISPATCH_MESSAGE | Manual dispatch message | "Message from Dispatch" | "{{messageBody}}" | Open messages |

### 7.4 Push Delivery

```typescript
// notification/push.service.ts
import webPush from 'web-push';

async sendPush(userId: string, event: PushEvent) {
  // 1. Fetch user's push subscriptions from DB
  // 2. For each subscription:
  //    a. Send via webPush.sendNotification(subscription, payload)
  //    b. If endpoint returns 410 (Gone): delete subscription
  //    c. On other errors: log, do not delete
  // 3. Store Notification record
  // 4. If no push subscriptions: fallback to SMS for critical events
}
```

## 8. Audit Logging

### 8.1 Auditable Actions

Every significant action is logged in the AuditLog table (§SRS-2).

| Action | Entity Type | Trigger | Metadata |
|--------|------------|---------|----------|
| `work_order.created` | WorkOrder | POST /api/work-orders | { fields } |
| `work_order.updated` | WorkOrder | PATCH /api/work-orders/:id | { changedFields, oldValues, newValues } |
| `work_order.status_change` | WorkOrder | POST /api/work-orders/:id/transition | { fromStatus, toStatus, technicianId, notes } |
| `work_order.assigned` | WorkOrder | POST /api/work-orders/:id/assign | { technicianId, previousTechnicianId } |
| `work_order.unassigned` | WorkOrder | POST /api/work-orders/:id/unassign | { previousTechnicianId } |
| `work_order.cancelled` | WorkOrder | Cancellation transitions | { reason, cancelledBy } |
| `work_order.photo_added` | WorkOrder | POST /api/work-orders/:id/photos | { photoId, url } |
| `technician.status_change` | Technician | Status update | { fromStatus, toStatus, trigger } |
| `technician.created` | Technician | POST /api/technicians | { fields } |
| `technician.updated` | Technician | PATCH /api/technicians/:id | { changedFields } |
| `customer.created` | Customer | POST /api/customers | { fields (PII redacted) } |
| `customer.updated` | Customer | PATCH /api/customers/:id | { changedFields (PII redacted) } |
| `invoice.created` | Invoice | Auto-generated on completion | { invoiceNumber, amount } |
| `invoice.sent` | Invoice | POST /api/invoices/:id/send | { stripeInvoiceId } |
| `invoice.paid` | Invoice | Stripe webhook | { stripePaymentId, amount } |
| `invoice.voided` | Invoice | POST /api/invoices/:id/void | { reason } |
| `route.optimized` | Route | POST /api/routes/optimize | { technicianId, date, savings } |
| `user.login` | User | POST /api/auth/login | { ipAddress, userAgent } |
| `user.logout` | User | POST /api/auth/logout | {} |
| `user.login_failed` | User | Failed login attempt | { email, ipAddress, reason } |
| `user.created` | User | POST /api/users | { role, email } |
| `company.settings_updated` | Company | PATCH /api/companies/me | { changedSettings } |
| `auto_assign.executed` | WorkOrder | POST /api/work-orders/auto-assign | { assigned: N, unassigned: N, details } |

### 8.2 Audit Log Implementation

```typescript
// common/services/audit.service.ts
@Injectable()
export class AuditService {
  async log(params: {
    companyId: string;
    userId?: string;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, unknown>;
    request?: Request; // For IP and user agent
  }) {
    await this.prisma.auditLog.create({
      data: {
        companyId: params.companyId,
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: params.metadata ?? Prisma.JsonNull,
        ipAddress: params.request?.ip,
        userAgent: params.request?.headers['user-agent'],
      },
    });
  }
}
```

### 8.3 PII in Audit Logs

Audit log metadata must NOT contain raw PII. When logging customer or user changes:
- Email: hash or mask (`j***@example.com`)
- Phone: mask (`***-***-4567`)
- Address: include only city/state, not full address
- Names: include first name only

## 9. Rate Limiting

### 9.1 API Rate Limits

Rate limiting is implemented using the `@nestjs/throttler` module with Redis-backed storage.

| Endpoint Category | Rate Limit | Window | Scope |
|-------------------|-----------|--------|-------|
| Authentication (login, register) | 5 requests | 15 minutes | Per IP |
| Authentication (magic link) | 3 requests | 15 minutes | Per email |
| API read endpoints | 100 requests | 1 minute | Per user |
| API write endpoints | 30 requests | 1 minute | Per user |
| File upload (photos) | 10 requests | 1 minute | Per user |
| Route optimization | 10 requests | 1 minute | Per company |
| Auto-assignment | 5 requests | 1 minute | Per company |
| Stripe webhooks | 100 requests | 1 minute | Per IP |
| Tracking portal (public) | 60 requests | 1 minute | Per IP |
| WebSocket connections | 5 connections | 1 minute | Per IP |
| GPS position events | 12 events | 1 minute | Per technician |

### 9.2 Rate Limit Response

```
HTTP 429 Too Many Requests

Headers:
  Retry-After: 45                    // Seconds until limit resets
  X-RateLimit-Limit: 100            // Max requests in window
  X-RateLimit-Remaining: 0          // Remaining requests
  X-RateLimit-Reset: 1710929160     // Unix timestamp of reset

Body:
{
  "statusCode": 429,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again in 45 seconds."
}
```

### 9.3 Implementation

```typescript
// app.module.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nestjs/throttler/dist/throttler-storage-redis.service';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'short', ttl: 1000, limit: 3 },   // 3 req/sec burst
        { name: 'medium', ttl: 60000, limit: 100 }, // 100 req/min sustained
      ],
      storage: new ThrottlerStorageRedisService(redisClient),
    }),
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
```

## 10. GPS Data Privacy

### 10.1 Working Hours Enforcement (§BRD BR-800)

GPS data is only collected during the technician's scheduled working hours.

```typescript
// gps/gps.guard.ts
function isWithinWorkingHours(technician: Technician, timestamp: Date): boolean {
  const schedule = technician.schedule as WeeklySchedule;
  const dayOfWeek = getDayOfWeek(timestamp, technician.company.timezone);
  const daySchedule = schedule[dayOfWeek];

  if (!daySchedule || !daySchedule.enabled) return false;

  const timeInTz = toTimezone(timestamp, technician.company.timezone);
  const currentMinutes = timeInTz.getHours() * 60 + timeInTz.getMinutes();
  const startMinutes = parseTimeToMinutes(daySchedule.start); // e.g., "08:00" -> 480
  const endMinutes = parseTimeToMinutes(daySchedule.end);     // e.g., "18:00" -> 1080

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}
```

If a GPS position arrives outside working hours, it is silently discarded — not stored, not broadcast.

### 10.2 Customer Visibility Rules

Customers can only see a technician's position when:
1. The work order is in EN_ROUTE or ON_SITE state
2. The tracking token is valid and not expired
3. The technician is assigned to that specific work order

When the work order transitions to IN_PROGRESS, COMPLETED, or any other state, the customer tracking portal stops showing the technician's position and displays a status message instead.

### 10.3 Data Retention (§BRD BR-801)

| Data Type | Retention Period | Purge Method |
|-----------|-----------------|-------------|
| GPS positions (TechnicianPosition) | 90 days (configurable per company) | BullMQ cron job: `purge-gps-positions` at 3 AM UTC daily |
| Audit logs | 1 year | BullMQ cron job: `purge-audit-logs` weekly |
| Tracking tokens | 24 hours after job completion | BullMQ cron job: `expire-tracking-tokens` hourly |
| Magic links | 15 minutes | BullMQ cron job: `expire-magic-links` hourly |
| Refresh tokens | 30 days | Purged on logout; expired tokens cleaned weekly |
| Notifications | 180 days | BullMQ cron job (not yet defined, future) |

### 10.4 Technician Consent

Before GPS tracking begins:
1. Technician is shown a consent notice during onboarding: "This application collects your GPS location during working hours to enable dispatch operations. Location tracking is only active during your scheduled work hours."
2. Technician must accept to proceed (stored as `user.settings.gpsConsentGiven = true`)
3. Consent can be revoked via settings, which disables GPS streaming (but the technician cannot use navigation/dispatch features)

### 10.5 Data Subject Requests

For GDPR/CCPA compliance:
- **Data export:** Admin can export all data for a technician or customer via API
- **Data deletion:** Admin can request deletion of a technician's GPS history
- **Right to know:** Audit logs show what data was accessed and by whom

## 11. Encryption

### 11.1 Encryption at Rest

| Data | Method |
|------|--------|
| Database (PostgreSQL) | Railway provides encryption at rest for managed PostgreSQL |
| PII fields (customer email, phone, address) | Application-level encryption using AES-256-GCM before storage |
| Passwords | bcrypt with 12 salt rounds |
| Refresh tokens (in DB) | SHA-256 hash (token is only returned to client once) |

### 11.2 Encryption in Transit

| Channel | Method |
|---------|--------|
| REST API | HTTPS (TLS 1.2+) enforced by Railway/Vercel |
| WebSocket | WSS (TLS 1.2+) |
| Database connections | SSL required (sslmode=require in connection string) |
| Redis connections | TLS if supported by Railway Redis |

### 11.3 Application-Level PII Encryption

```typescript
// common/crypto/encryption.service.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes

export function encrypt(plaintext: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Format: iv:authTag:ciphertext (all base64)
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
}

export function decrypt(ciphertext: string): string {
  const [ivB64, authTagB64, encryptedB64] = ciphertext.split(':');
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(authTagB64, 'base64');
  const encrypted = Buffer.from(encryptedB64, 'base64');
  const decipher = createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}
```

## 12. CORS Configuration

```typescript
// main.ts
app.enableCors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Required for httpOnly cookies (refresh token)
  maxAge: 86400, // Preflight cache: 24 hours
});
```

## 13. Input Validation

### 13.1 Validation Strategy

All API inputs are validated at two levels:
1. **NestJS pipes:** `class-validator` decorators on DTOs (server-side)
2. **Shared schemas:** Zod schemas in `packages/shared` (used by both frontend and backend)

### 13.2 Common Validation Rules

```typescript
// Example: CreateWorkOrderDto
export class CreateWorkOrderDto {
  @IsString() @IsNotEmpty()
  customerId: string;

  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @IsEnum(Priority) @IsOptional()
  priority?: Priority;

  @IsString() @MaxLength(2000) @IsOptional()
  description?: string;

  @IsString() @IsNotEmpty()
  address: string;

  @IsString() @IsNotEmpty()
  city: string;

  @IsString() @Length(2, 2)
  state: string;

  @IsString() @Matches(/^\d{5}(-\d{4})?$/)
  zipCode: string;

  @IsDateString()
  scheduledStart: string;

  @IsDateString()
  scheduledEnd: string;

  @IsInt() @Min(15) @Max(480)
  estimatedMinutes: number;

  @ValidateNested({ each: true }) @Type(() => CreateLineItemDto)
  lineItems: CreateLineItemDto[];
}
```

### 13.3 SQL Injection Prevention

Prisma ORM uses parameterized queries for all operations. Raw SQL queries (used for PostGIS spatial queries) use `$queryRaw` with tagged templates to ensure parameterization:

```typescript
// Safe: parameterized
const result = await prisma.$queryRaw`
  SELECT id FROM technicians
  WHERE company_id = ${companyId}
  AND ST_Distance(...) < ${maxDistance}
`;

// NEVER: string interpolation in raw queries
// const result = await prisma.$queryRawUnsafe(`... WHERE id = '${userInput}'`);
```

Exception: `SET LOCAL app.current_company_id` uses `$executeRawUnsafe` but the value comes from the verified JWT, never from user input.

## 14. Security Headers

```typescript
// Configured via helmet middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-eval'"], // Required for Next.js dev
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://*.tile.openstreetmap.org", "blob:"],
      connectSrc: ["'self'", "wss:", "https://api.openrouteservice.org", "https://api.stripe.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["https://js.stripe.com"],
      baseUri: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Required for map tiles
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Required for map tiles
}));
```

## 15. OWASP Compliance Checklist

| OWASP Top 10 (2021) | Risk | Mitigation | Status |
|---------------------|------|------------|--------|
| A01: Broken Access Control | High | RLS at database level; RBAC guards; tenant isolation; JWT scoping; tracking tokens with expiry | Specified |
| A02: Cryptographic Failures | Medium | AES-256-GCM for PII; bcrypt for passwords; TLS for transit; secure JWT secret management | Specified |
| A03: Injection | Medium | Prisma parameterized queries; input validation (class-validator + Zod); no raw user input in SQL | Specified |
| A04: Insecure Design | Medium | Threat modeling per feature; state machine with guards; defense in depth (app + DB security) | Specified |
| A05: Security Misconfiguration | Medium | Helmet security headers; CORS whitelist; environment-specific configs; no default credentials | Specified |
| A06: Vulnerable Components | Low | pnpm audit in CI; Dependabot/Renovate for dependency updates; lock file pinning | Planned |
| A07: Authentication Failures | High | JWT with refresh rotation; bcrypt; rate limiting on auth endpoints; account lockout after 5 failures | Specified |
| A08: Data Integrity Failures | Low | Stripe webhook signature verification; CSRF tokens for state-changing operations; immutable audit log | Specified |
| A09: Logging & Monitoring | Medium | Audit log for all state changes; Sentry for errors; structured logging; login failure tracking | Specified |
| A10: SSRF | Low | No user-provided URLs passed to server-side HTTP clients; OpenRouteService URL is hardcoded; file upload validates MIME type | Specified |

## 16. Stripe Webhook Security

```typescript
// invoice/stripe-webhook.controller.ts
@Post('webhooks/stripe')
async handleStripeWebhook(
  @Req() req: RawBodyRequest<Request>,
  @Headers('stripe-signature') signature: string,
) {
  const event = this.stripe.webhooks.constructEvent(
    req.rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET,
  );

  switch (event.type) {
    case 'invoice.paid':
      await this.invoiceService.handlePayment(event.data.object);
      break;
    case 'invoice.payment_failed':
      await this.invoiceService.handlePaymentFailure(event.data.object);
      break;
    case 'invoice.voided':
      await this.invoiceService.handleVoid(event.data.object);
      break;
    default:
      // Log unhandled event types for monitoring
      this.logger.warn(`Unhandled Stripe event: ${event.type}`);
  }

  return { received: true };
}
```

Key security measures:
- Raw body parsing (not JSON parsed) for signature verification
- Stripe signature verification using `STRIPE_WEBHOOK_SECRET`
- Idempotent handling (check if invoice already processed before updating)
- Endpoint is NOT behind JWT auth (Stripe cannot authenticate with JWT)
- Endpoint IS behind rate limiting and Stripe signature verification

## 17. Account Lockout

```
After 5 consecutive failed login attempts for the same email:
  1. Lock the account for 15 minutes
  2. Return same error message as wrong password (no enumeration)
  3. Log the lockout event in audit log
  4. Send email notification to the account owner
  5. After lockout period: reset failure counter on successful login
  6. Admin can manually unlock via user management
```

## 18. Cross-References

- Multi-tenant isolation requirements: §BRD BR-100, BR-101
- GPS privacy requirements: §BRD BR-800, BR-801, BR-802
- Notification requirements: §PRD FR-900, FR-901, FR-902
- WebSocket architecture: §SRS-1 Section 7
- Data model (auth tables, notification table): §SRS-2
- State machine transitions triggering notifications: §SRS-3 Section 3
- UI for customer tracking: §WIREFRAMES

---

*End of Software Requirements Specification — Communications & Security*
