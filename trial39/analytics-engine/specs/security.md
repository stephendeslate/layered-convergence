# Security Specification

**Project:** Analytics Engine
**Prefix:** AE-SEC
**Cross-references:** [Authentication](auth.md), [Infrastructure](infrastructure.md)

---

## Overview

Security is enforced at multiple layers: HTTP headers (Helmet), rate limiting (ThrottlerModule),
input validation (class-validator), CORS restrictions, and database-level RLS.

---

## Requirements

### AE-SEC-01: Input Sanitization
- VERIFY:AE-SEC-01 — sanitizeInput strips HTML tags for XSS prevention
- Applied to user-facing content before rendering
- No dangerouslySetInnerHTML anywhere in the codebase

### AE-SEC-02: Sensitive Data Masking
- VERIFY:AE-SEC-02 — maskSensitive hides PII in log output
- Emails are partially masked (first/last character visible)
- Tokens are partially masked (first/last 4 characters visible)

### AE-SEC-03: Secure ID Generation
- VERIFY:AE-SEC-03 — generateId uses crypto.randomBytes for unpredictable IDs
- No Math.random() for security-sensitive identifiers
- See [Authentication](auth.md) for JWT token generation

### AE-SEC-04: HTTP Security Headers
- VERIFY:AE-SEC-04 — Helmet sets CSP, X-Content-Type-Options, removes X-Powered-By
- CSP directives: default-src 'self', script-src 'self', style-src 'self' 'unsafe-inline'
- img-src 'self' data:, frame-ancestors 'none'
- See [Infrastructure](infrastructure.md) for production deployment headers

### AE-SEC-05: CSS Class Utility
- VERIFY:AE-SEC-05 — cn() utility uses clsx + tailwind-merge (not naive string concatenation)
- Prevents class conflicts and ensures deterministic styling

### AE-SEC-06: Keyboard Accessibility
- VERIFY:AE-SEC-06 — All interactive components support Tab, Enter, Space keyboard navigation
- Disabled elements are skipped in tab order
- Focus indicators use focus-visible for keyboard-only visibility

### AE-SEC-07: Error Boundary Security
- VERIFY:AE-SEC-07 — Error pages use role="alert" and useRef for focus management
- Error messages do not expose stack traces or internal paths
- All route segments have error.tsx boundaries

### AE-SEC-08: CORS and Rate Limiting
- VERIFY:AE-SEC-08 — CORS uses CORS_ORIGIN env (no fallback), ThrottlerModule as APP_GUARD
- Default rate limit: 100 requests per 60 seconds
- Auth endpoints: 5 requests per 60 seconds
- credentials: true, explicit allowedHeaders and methods
- Zero $executeRawUnsafe in entire codebase

---

**SJD Labs, LLC** — Analytics Engine T39
