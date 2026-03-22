# Security Specification

## Overview

Security is enforced at every layer of the stack: transport (HTTPS/CORS),
application (Helmet, rate limiting, input validation), and data (RLS,
parameterized queries, Decimal precision).

## Threat Model

### T1: Cross-Site Scripting (XSS)
- **Risk:** Injection of malicious scripts via user input
- **Mitigations:** Helmet CSP headers, sanitizeInput utility, React auto-escaping,
  zero dangerouslySetInnerHTML, @MaxLength on all string DTOs

### T2: SQL Injection
- **Risk:** Malicious SQL via user-supplied input
- **Mitigations:** Prisma parameterized queries, zero $executeRawUnsafe,
  input validation via class-validator DTOs

### T3: Brute Force / Credential Stuffing
- **Risk:** Automated login/registration attempts
- **Mitigations:** @nestjs/throttler rate limiting (5 req/min on auth),
  bcrypt with 12 salt rounds, password length requirements

### T4: Cross-Site Request Forgery (CSRF)
- **Risk:** Unauthorized actions via forged requests
- **Mitigations:** CORS origin restriction, credentials: true,
  JWT Bearer authentication (not cookies)

### T5: Clickjacking
- **Risk:** UI embedded in malicious iframe
- **Mitigations:** Helmet X-Frame-Options, CSP frameAncestors: ['none']

### T6: Sensitive Data Exposure
- **Risk:** Logging or exposing passwords, tokens, PII
- **Mitigations:** maskSensitive utility for audit logging,
  password fields excluded from API responses

### T7: Denial of Service
- **Risk:** Resource exhaustion via excessive requests
- **Mitigations:** Global rate limiting (100 req/min), pagination limits
  (MAX_PAGE_SIZE = 100), @MaxLength on all string inputs

## Security Controls

### SC1: Helmet.js + Content Security Policy
- defaultSrc: ['self']
- scriptSrc: ['self']
- styleSrc: ['self', 'unsafe-inline']
- imgSrc: ['self', 'data:']
- frameAncestors: ['none']

### SC2: Rate Limiting
- Global: 100 requests per 60 seconds
- Auth endpoints: 5 requests per 60 seconds
- Enforced via ThrottlerGuard as APP_GUARD

### SC3: CORS Configuration
- Origin restricted to CORS_ORIGIN env var
- Credentials enabled
- Allowed headers: Content-Type, Authorization
- Allowed methods: GET, POST, PUT, DELETE, PATCH

### SC4: Input Validation
- All DTO string fields: @IsString() + @MaxLength()
- Passwords: @MinLength(8) + @MaxLength(128)
- Emails: @IsEmail() + @MaxLength(255)
- Names/titles: @MaxLength(100)
- Descriptions: @MaxLength(1000)

### SC5: Dependency Auditing
- pnpm audit --audit-level=high in CI pipeline
- Automated on every push and pull request

## Verification Tags

<!-- VERIFY: EM-SEC-001 — Helmet with CSP directives -->
<!-- VERIFY: EM-SEC-002 — Rate limiting (global 100/min, auth 5/min) -->
<!-- VERIFY: EM-SEC-003 — CORS restricted to configured origin -->
<!-- VERIFY: EM-SEC-004 — Input validation with MaxLength on all DTO strings -->
<!-- VERIFY: EM-SEC-005 — SQL injection prevention (no executeRawUnsafe) -->
<!-- VERIFY: EM-SEC-006 — XSS prevention (sanitizeInput, no dangerouslySetInnerHTML) -->
