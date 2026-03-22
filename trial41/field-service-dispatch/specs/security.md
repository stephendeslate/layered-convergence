# Security Specification

## Overview

The FSD platform implements defense-in-depth security across all layers.
This document covers authentication, authorization, input validation,
HTTP security headers, rate limiting, and CORS configuration.

See [architecture.md](./architecture.md) for system structure.
See [monitoring.md](./monitoring.md) for error tracking and audit logging.

## Authentication

JWT-based authentication with bcrypt password hashing (salt rounds: 12).
The JwtStrategy extracts tokens from the Authorization header.

<!-- VERIFY: FD-AUTH-MODULE — apps/api/src/auth/auth.module.ts configures JWT and Passport -->
<!-- VERIFY: FD-AUTH-BCRYPT — apps/api/src/auth/auth.service.ts uses BCRYPT_SALT_ROUNDS from shared -->
<!-- VERIFY: FD-JWT-STRATEGY — apps/api/src/auth/jwt.strategy.ts validates JWT tokens -->
<!-- VERIFY: FD-AUTH-CONTROLLER — apps/api/src/auth/auth.controller.ts has register/login/profile -->

## Authorization

Role-based access control with registration restricted to non-ADMIN roles.
The ALLOWED_REGISTRATION_ROLES constant is imported from shared.

<!-- VERIFY: FD-REGISTER-DTO — apps/api/src/auth/dto/register.dto.ts uses @IsIn(ALLOWED_REGISTRATION_ROLES) -->

## Input Validation

All DTO string fields have @IsString() + @MaxLength() decorators.
UUID fields have @MaxLength(36). ValidationPipe configured with:
- whitelist: true
- forbidNonWhitelisted: true
- transform: true

<!-- VERIFY: FD-VALIDATION-PIPE — apps/api/src/main.ts configures ValidationPipe -->

## HTTP Security Headers

Helmet.js with Content Security Policy:
- default-src: 'self'
- script-src: 'self'
- style-src: 'self' 'unsafe-inline'
- img-src: 'self' data:
- frame-ancestors: 'none'

<!-- VERIFY: FD-HELMET-CSP — apps/api/src/main.ts configures Helmet with CSP directives -->

## Rate Limiting

ThrottlerModule configured as APP_GUARD:
- Global: 100 requests per 60 seconds
- Auth endpoints: 5 requests per 60 seconds

<!-- VERIFY: FD-THROTTLER-CONFIG — apps/api/src/app.module.ts registers ThrottlerModule -->
<!-- VERIFY: FD-APP-GUARD-THROTTLER — apps/api/src/app.module.ts registers ThrottlerGuard as APP_GUARD -->

## CORS Configuration

CORS origin from CORS_ORIGIN environment variable (no fallback).
Credentials enabled. Explicit methods and headers.

<!-- VERIFY: FD-CORS-CONFIG — apps/api/src/main.ts configures CORS from env -->

## Environment Variable Validation

Required environment variables validated at startup via shared utility.
Missing variables throw immediately, preventing silent misconfiguration.

<!-- VERIFY: FD-ENV-VALIDATION — packages/shared/src/env-validation.ts validates required vars -->

## Security Tests

<!-- VERIFY: FD-SECURITY-TEST — apps/api/test/security.spec.ts has supertest integration tests -->
