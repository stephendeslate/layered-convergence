# System Architecture Specification

**Project:** Analytics Engine
**Prefix:** AE-ARCH
**Cross-references:** [Database](database.md), [Performance](performance.md), [Security](security.md)

---

## Overview

The Analytics Engine is a multi-tenant analytics platform built as a Turborepo 2 monorepo.
It consists of three workspace packages: API (NestJS), Web (Next.js), and Shared (utilities).

---

## Requirements

### AE-ARCH-01: Shared Package Exports
- VERIFY:AE-ARCH-01 — packages/shared/src/index.ts exports all types, constants, and utilities
- The shared package provides types, constants, and utilities consumed by both apps
- Must export withTimeout, normalizePageParams, TimeoutError, and all utility functions

### AE-ARCH-02: URL Slug Generation
- VERIFY:AE-ARCH-02 — slugify function converts strings to URL-safe slugs
- Used by frontend for display purposes and backend for tenant slug creation

### AE-ARCH-03: Application Bootstrap
- VERIFY:AE-ARCH-03 — main.ts configures Helmet, CORS, ValidationPipe
- CORS_ORIGIN and JWT_SECRET validated at startup (no fallbacks)
- See [Security](security.md) for CSP directive details

### AE-ARCH-04: Module Registration
- VERIFY:AE-ARCH-04 — AppModule registers ThrottlerGuard as APP_GUARD and ResponseTimeInterceptor as APP_INTERCEPTOR
- ResponseTimeInterceptor MUST be registered via APP_INTERCEPTOR, not main.ts useGlobalInterceptors
- See [Performance](performance.md) for interceptor implementation details

### AE-ARCH-05: Workspace Protocol
- VERIFY:AE-ARCH-05 — Both apps import shared via workspace:* protocol
- apps/api/package.json and apps/web/package.json use workspace:* for @analytics-engine/shared

### AE-ARCH-06: Monorepo Task Pipeline
- VERIFY:AE-ARCH-06 — turbo.json defines build, dev, lint, test, typecheck tasks
- Build tasks depend on ^build for proper dependency ordering

### AE-ARCH-07: Root Package Configuration
- VERIFY:AE-ARCH-07 — Root package.json has packageManager field and turbo in devDependencies
- packageManager: pnpm@9.15.4

### AE-ARCH-08: Multi-Tenant Domain Model
- VERIFY:AE-ARCH-08 — Six Prisma models enforce tenant isolation
- Tenant -> User -> Dashboard -> Report; Tenant -> Pipeline -> PipelineRun
- See [Database](database.md) for schema details

---

**SJD Labs, LLC** — Analytics Engine T39
