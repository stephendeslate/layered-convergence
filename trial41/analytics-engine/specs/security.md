# Security Specification

## Overview

The Analytics Engine implements defense-in-depth security with Helmet.js CSP headers,
NestJS ThrottlerModule rate limiting, CORS restrictions, input validation, and
Row Level Security on all database tables.

## Helmet.js Configuration

Content Security Policy directives:
- default-src: 'self'
- script-src: 'self'
- style-src: 'self' 'unsafe-inline'
- img-src: 'self' data:
- frame-ancestors: 'none'

<!-- VERIFY:AE-MAIN-BOOTSTRAP — main.ts configures Helmet, CORS, and ValidationPipe -->

## Rate Limiting

ThrottlerModule is registered as APP_GUARD in AppModule:
- Default: 100 requests per 60 seconds
- Auth endpoints: 5 requests per 60 seconds (via @Throttle decorator)

Health endpoints use @SkipThrottle() to bypass rate limiting.

## CORS Configuration

CORS is configured from CORS_ORIGIN environment variable with no fallback value.
Settings:
- credentials: true
- methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- allowedHeaders: Content-Type, Authorization, X-Correlation-ID

## Input Validation

All DTOs enforce strict validation via class-validator decorators:
- @IsString() + @MaxLength() on ALL string fields (including status enums)
- @MaxLength(36) on UUID fields
- @IsIn(ALLOWED_REGISTRATION_ROLES) excluding ADMIN
- @IsEmail() on email fields

ValidationPipe configuration:
- whitelist: true (strips unknown properties)
- forbidNonWhitelisted: true (rejects unknown properties)
- transform: true (auto-transforms types)

See [authentication.md](./authentication.md) for JWT validation details.

<!-- VERIFY:AE-SHARED-VALIDATION — Shared package exports validation constants (UUID_MAX_LENGTH, NAME_MAX_LENGTH, etc.) -->

## Environment Variable Validation

<!-- VERIFY:AE-ENV-VALIDATION — main.ts validates required env vars at startup -->

Required variables checked at startup:
- DATABASE_URL
- JWT_SECRET
- CORS_ORIGIN

Missing any required variable causes immediate startup failure.

## Row Level Security

All database tables have RLS enabled and forced in the initial migration:
- ENABLE ROW LEVEL SECURITY
- FORCE ROW LEVEL SECURITY

## Prohibited Patterns

The codebase enforces zero usage of:
- `as any` type assertions
- `console.log` in production code
- `$executeRawUnsafe` Prisma methods
- Hardcoded secret fallback values
- `dangerouslySetInnerHTML` in React components

## Test Coverage

<!-- VERIFY:AE-SECURITY-TEST — Security tests use supertest for real HTTP assertions -->

Security integration tests validate:
- Authentication enforcement on all protected endpoints
- ADMIN role rejection in registration
- Unknown field rejection (forbidNonWhitelisted)
- Oversized string field rejection
- Health endpoint public access
- Error response sanitization (no stack traces)
