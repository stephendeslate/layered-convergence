# Security Specification

## Overview

Comprehensive security measures applied across all layers of the application.
This specification documents the threat model, security controls, and
mitigation strategies for the Escrow Marketplace.

## Threat Model

### Authentication Threats
- Brute force login attempts — mitigated by rate limiting (5/min on auth)
- ADMIN self-registration — mitigated by @IsIn(ALLOWED_REGISTRATION_ROLES)
- Weak passwords — mitigated by @MinLength(8) validation
- JWT secret exposure — mitigated by no fallback value, fail-fast on missing

### Input Threats
- SQL injection — mitigated by Prisma parameterized queries, zero $executeRawUnsafe
- XSS attacks — mitigated by sanitizeInput(), no dangerouslySetInnerHTML, React escaping
- Request smuggling — mitigated by Helmet security headers
- Oversized payloads — mitigated by @MaxLength on all DTO string fields

### Authorization Threats
- Privilege escalation — mitigated by role-based access control on endpoints
- Cross-tenant access — mitigated by tenantId filtering on all queries
- Unauthorized updates — mitigated by ownership checks on mutations

## Security Controls

### Helmet.js + Content Security Policy
- Applied in main.ts via app.use(helmet(...))
- CSP directives: defaultSrc self, scriptSrc self, styleSrc self + unsafe-inline,
  imgSrc self + data:, frameAncestors none

### Rate Limiting
- Global: 100 requests per 60 seconds via ThrottlerModule
- Auth endpoints: 5 requests per 60 seconds via @Throttle decorator
- ThrottlerGuard registered as APP_GUARD for global enforcement

### CORS Configuration
- Origin restricted to CORS_ORIGIN environment variable
- Credentials enabled for cookie-based auth flows
- Explicit allowed headers: Content-Type, Authorization
- Explicit allowed methods: GET, POST, PUT, DELETE, PATCH

### Input Validation
- ValidationPipe: whitelist true, forbidNonWhitelisted true, transform true
- All DTO string fields: @IsString() + @MaxLength()
- Passwords: @MinLength(8) + @MaxLength(128)
- Emails: @IsEmail() + @MaxLength(255)
- Names/titles: @MaxLength(100), Descriptions: @MaxLength(1000)

### SQL Injection Prevention
- Prisma parameterized queries exclusively
- Zero $executeRawUnsafe usage in entire codebase
- All findFirst calls include justification comments

### Dependency Auditing
- pnpm audit --audit-level=high in CI pipeline

## Cross-References

- Authentication: [auth.md](./auth.md)
- API validation: [api.md](./api.md)
- Infrastructure: [infrastructure.md](./infrastructure.md)
- Testing: [testing.md](./testing.md)

## Verification Tags

<!-- VERIFY: EM-SEC-001 — Helmet with CSP directives -->
<!-- VERIFY: EM-SEC-002 — Rate limiting (global 100/min, auth 5/min) -->
<!-- VERIFY: EM-SEC-003 — CORS restricted to configured origin -->
<!-- VERIFY: EM-SEC-004 — Input validation with MaxLength on all DTO strings -->
<!-- VERIFY: EM-SEC-005 — JWT strategy with no secret fallback -->
<!-- VERIFY: EM-SEC-006 — XSS prevention (sanitizeInput, no dangerouslySetInnerHTML) -->
